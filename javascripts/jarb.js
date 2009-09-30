
// Define global variables in case they are undefined
var JarbClass, $a, $public, $private, $protected, $include, def;

$class = function(name_def, fn, context){
  name = name_def.toString();
    
  if(!context) context = arguments.callee.caller || window;
  if(context._definee) context = context._definee;
  
  var new_class;
  if(context[name]){ // When reopening class
    new_class = context[name];
  } else if(window.JarbClass) { // When defining a first time JarbClass
    return JarbClass.new(name_def, fn, context);
  } else { // When defining JarbClass itself
    new_class = new Function();
  }
  
  new_class.name = name;
  
  if(!fn._definee) fn._definee = new_class;
  
  $class.initialize_class(new_class, fn);
  
  context[name] = new_class;
  return context[name];
}

$class._debug = true;


$class.initialize_class = function(new_class, fn){
  $class.stash_global_values("$a", "$public", "$private", "$protected", "$include", "def", "$class._access");
  
  $class._access = "public";
  $a = new_class.prototype;
  $public = function(){$class._access = "public"}
  $protected = function(){$class._access = "protected"}
  $private = function(){$class._access = "private"}
  $include = function(module){ new_class.include(module); }
  def = function(def_name, def_fn){ $class.add_method.call($a, def_name, def_fn, {access: $class.curr_access()}); }
  new_class.def = function(def_name, def_fn){ $class.add_method.call(new_class, def_name, def_fn, {access: $class.curr_access()}); }
  
  fn.apply(new_class); // Initializes class
  
  new_class.def = undefined;
  $class.unstash_global_values();
}

$class.curr_access = function(){
  return $class._access;
}

$class.clone = function(obj){
  if(!obj) obj = this;
  if(typeof obj == Array || obj.constructor == Array) return obj.concat();
  if(typeof obj == Object || obj.constructor == Object) {
    var new_obj = {};
    for(var i in obj) new_obj[i] = obj[i];
    return new_obj;
  }
  return obj;
}

// Using an array allows for embedded class definitions
$class._stashed_global_values = [];

$class.stash_global_values = function(){
  var stashed_values = {};
  for(var i=0; i<arguments.length; i++){
    var var_name = arguments[i];
    stashed_values[var_name] = eval(var_name);
  }
  $class._stashed_global_values.unshift(stashed_values);
}

$class.unstash_global_values = function(){
  var stashed_values = $class._stashed_global_values.shift();
  for(var var_name in stashed_values){
    eval(var_name+" = stashed_values[var_name]");
  }
}

$class.add_method = function(name, func, options){
  var by_ref = false;
  if((!func || func.constructor != Function) && !options){
    options = func || {};
    by_ref = true;
    func = new Function();
  }
  if(!options) options = {}
  var access = options.access || func.access || "public";
  var owner = options.owner || func.owner || this;
  
  var new_func = function(){
    var fn = $class.get_method.call(this, name);
    if(!fn) throw "The method name '"+name+"' does not exist or could not be resolved.";
    if($class._debug) console.log(name+": "+this.id);
    
    var this_fn = arguments.callee;
    var context = arguments.callee.caller.arguments.callee.caller || arguments.callee.caller || window;
    if(!context.owner && (this_fn.access == "private" || this_fn.access == "protected")) {
      throw "Attempted to call "+this_fn.access+" method '"+this_fn.name+"' from "+context;
    } else if(this_fn.access == "private" && context.owner != this && context.owner != this.builder()){
      throw "Attempted to call "+this_fn.access+" method '"+this_fn.name+"' from "+context;
    } else if(this_fn.access == "protected" && context.owner != this && context.owner != this.builder() && ( !this.prototype && !context.owner.is_a(this.class()) || context.owner.is_a(this))){//!context.owner.is_a(this) && !context.owner.class().is_a(this)){
      throw "Attempted to call "+this_fn.access+" method '"+this_fn.name+"' from "+context;
    }
    return fn.apply(this, arguments);
  }
  
  if(!func.access) func.access = access;
  if(!func.owner) func.owner = owner;
  func.name = name;
  
  this[name] = new_func;
  this[name].name = name;
  this[name].access = access;
  this[name].owner = this;
  
  if(!by_ref) this._methods[name] = func;
  
  var child_classes = this._child_classes || this.class()._child_classes;
  $class.bulk_add_method(child_classes, name, {access: access});
  if(JarbClass && this.class() != JarbClass && this != JarbClass.prototype){
    $class.bulk_add_method(this.class()._child_extends, name, {access: access});
  }
}

$class.bulk_add_method = function(objects, fn_name, options){
  if(!objects) return;
  for(var i=0; i<objects.length; i++){
    if(!objects[i][fn_name]) objects[i].add_method(fn_name, options);
  }
}

$class.get_method = function(fn_name, inherited_only){
  if(!inherited_only && this._methods[fn_name]) return this._methods[fn_name];
  var includes = this._extends;
  for(var i=0; i<includes.length; i++){
    var method = includes[i].prototype.get_method(fn_name);
    if(method) return method;
  }
  if(this.builder() != this) return this.builder().get_method(fn_name);
}

$class.make_id = function(prepend){
  var max = 10000;
  var min = 0;
  return prepend+":"+(Math.floor(Math.random() * (max - min + 1)) + min) + "-" + (new Date()).getTime();
}

$class.inheritance_def = function(name, parent){
  this.parent = parent;
  this.name = name;
  this.toString = function(){
    return this.name;
  }
}

String.prototype.extends = String.prototype['<'] = function(parent){
  return (new $class.inheritance_def(this, parent));
}//{$parent_class = parent; return this}


$class("JarbClass", function(){
  
  // Class variable definitions:
  this.id = "JarbClass";
  this._methods = {};
  this._child_classes = [];
  this._extends = [];
  this._child_extends = [];
  
  
  // Instance variable definitions:
  $a._class = this;
  $a._methods = {};
  $a._extends = [];
  
  // Class method definitions:
  
  this.def("class", function(){
    return JarbClass || this;
  });
  
  this.def("class_name", function(){
    return this.class().name;
  });
  
  this.def("builder", function(){
    return (this._builder || this.superclass());
  });
  
  this.def("is_a", function(class_obj){
    if(this.class() == class_obj) return true;
    var includes = this._extends;
    for(var i=0; i<includes.length; i++){
      if(includes[i].prototype.is_a(class_obj)) return true;
    }
    if(this.superclass() != this) return this.superclass().is_a(class_obj);
    return false;
  });
  
  this.def("new", function(name, fn, context){
    var parent_class = name.parent || this;
    name = name.toString();
    
    if(!context) context = arguments.callee.caller || window;
    if(!context[name]) context[name] = new Function();
    if(!fn) fn = new Function();
    
    parent_class.make_parent_of(context[name]);
    
    context[name].id = $class.make_id(this.id);
    context[name].prototype._class = context[name];
    context[name].prototype.id = name+":prototype";
    
    context[name].add_method("new", function(){
      var obj = new this();
      for(var m in this.prototype) {
        obj[m] = $class.clone(this.prototype[m]);
      }
      obj.id = $class.make_id(obj.class_name(this.name));
      obj._builder = this.prototype;
      obj._extends = [];
      
      if(obj.initialize) obj.initialize.apply(obj, arguments);
      return obj;
    });
    
    return $class(name, fn, context);
  });
  
  this.def("methods", function(access, exclude){
    var all_methods = [];
    if(!exclude) exclude = [];
    
    for(var m in this._methods){
      if(exclude.indexOf(m) > -1) continue;
      if(access && this.get_method(m).access == access || !access){
        all_methods.push(m);
        exclude.push(m);
      }
    }
    var includes = this._extends;
    for(var i=0; i<includes.length; i++){
      all_methods = all_methods.concat(includes[i].prototype.methods(access, exclude));
    }
    if(this.builder() != this) all_methods = all_methods.concat(this.builder().methods(access, exclude));
    
    return all_methods;
  });
  
  this.def("get_method", function(){
    return $class.get_method.apply(this, arguments);
  });
  
  this.def("public_methods", function(){
    return this.methods("public");
  });
  
  this.def("protected_methods", function(){
    return this.methods("protected");
  });
  
  this.def("private_methods", function(){
    return this.methods("private");
  });
  
  this.def("instance_methods", function(access){
    return this.prototype.methods(access);
  });
  
  this.def("public_instance_methods", function(){
    return this.prototype.methods("public");
  });
  
  this.def("protected_instance_methods", function(){
    return this.prototype.methods("protected");
  });
  
  this.def("private_instance_methods", function(){
    return this.prototype.methods("private");
  });
  
  this.def("superclass", function(){
    return (this._superclass || this.prototype.constructor);
  });
  
  this.def("child_classes", function(){
    return this._child_classes;
  });
  
  this.def("include", function(module){
    return this.prototype.extend(module);
  });
  
  this.def("included", function(module){
    return this.prototype.extenders(module);
  });
  
  this.def("extend", function(module){
    if(this.extenders(module) || this.is_a(module)) return false;
    if(!this.is_class() && module.prototype.is_a(this.class()) || module.is_a(this))
      throw "ArgumentError: cyclic include detected";
    var extender_methods = module.instance_methods();
    for(var i=0; i<extender_methods.length; i++){
      var m = extender_methods[i];
      if(!this[m]) this.add_method(m, {access: module.prototype[m].access});
    }
    module._child_extends.push(this);
    this._extends.unshift(module);
    return true;
  });
  
  this.def("extenders", function(module){
    if(module) return (this._extends.indexOf(module) > -1);
    var extender_names = [];
    for(var i=0; i<this._extends.length; i++) extender_names.push(this._extends[i].name);
    return extender_names;
  });
  
  
  $private();
  
  this.def("make_parent_of", function(subclass){
    if(subclass.prototype.constructor != subclass)
      throw subclass.name+" already inherits from " + subclass.superclass().name;
    for(var m in this) subclass[m] = $class.clone(this[m]);
    for(var i in this._methods) $class.add_method.call(subclass, i, {access: this._methods[i].access});
    
    subclass.prototype = new this();
    for(var m in this.prototype) subclass.prototype[m] = $class.clone(this.prototype[m]);
    this._child_classes.push(subclass);
    subclass._superclass = this;
  });
  
  this.def("super", function(){
    var context = arguments.callee.caller.arguments.callee.caller;
    var args = arguments.length > 0 ? arguments : context.arguments;
    var m = this.get_method(context.name, true);
    return m.apply(this, args);
  });
  
  $public();
  
  this.def("send", function(){
    var args = Array.prototype.slice.call(arguments);
    var fn_name = args.shift();
    this[fn_name].apply(this, args);
  });
  
  this.def("add_method", function(){
    $class.add_method.apply(this, arguments);
    return this.methods();
  });
  
  this.def("add_instance_method", function(){
    $class.add_method.apply(this.prototype, arguments);
    return this.prototype.methods();
  });

  this.def("is_class", function(){
    if(this.prototype && this.class() == JarbClass) return true;
    return false;
  });
  
  this.def("is_instance", function(){
    if(!this.prototype && this._builder) return true;
    return false;
  });
  
  
  // Instance method definitions:
  
  def("class", function(){
    return this._class;
  });
  
  def("superclass", function(){
    return this.class().superclass().prototype;
  });
  
  
  // The following methods are the same for both the class and the instances:
  
  var mfc = [];
  mfc = mfc.concat(["add_method", "builder", "class_name", "extend", "extenders"]);
  mfc = mfc.concat(["get_method", "methods", "public_methods", "protected_methods"]);
  mfc = mfc.concat(["private_methods", "super", "send", "is_a", "is_class", "is_instance"]);
  var methods_from_class = mfc;
  
  for(var i=0; i<methods_from_class.length; i++){
    $class.add_method.call($a, methods_from_class[i], this.get_method(methods_from_class[i]), {owner: $a});
  }
  
});
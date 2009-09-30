document.onkeypress = function(e){
  var pressedKey;
   if (document.all) { e = window.event; }
   pressedKey = e.keyCode;
   pressedCharacter = String.fromCharCode(pressedKey);
   if(pressedKey == 38){
     history_previous();
   } else if(pressedKey == 40){
     history_next();
   }
   return true;
   //alert(' Character = ' + pressedCharacter + ' [Decimal value = ' + pressedKey + ']');
}

update_display = function(content, entry){
  var display = document.getElementById("display");
  display.innerHTML = display.innerHTML + "<div class='"+entry+"'>"+content+"</div>";
  display.scrollTop = display.scrollHeight;
}

run_code = function(code){
  update_display(code, "entry");
  try{
    var content = eval(code);
    if(content && content.constructor == String) content = "\""+content+"\"";
    update_display(content, "eval");
  }catch(err){
    var message = err.name+": "+err.message;
    update_display(message, "error");
  }
}

var cmd;
init_cmd = function(){
  if(!cmd){
    cmd = document.getElementById("cmd");
    if(!cmd) return;
    cmd.max_history = 500;
    cmd.history = [];
    cmd.index = -1;
  }
}

submit_form = function(){
  if(!cmd) init_cmd();
  if(cmd.value == "") return;
  if(cmd.history.length >= cmd.max_history) cmd.history.pop();
  cmd.history.unshift(cmd.value);
  run_code(cmd.value);
  cmd.value = "";
  cmd.index = -1;
}

history_previous = function(){
  if(!cmd) init_cmd();
  cmd.index++;
  if(cmd.index >= cmd.history.length) cmd.index = cmd.history.length - 1;
  cmd.value = cmd.history[cmd.index];
}

history_next = function(){
  if(!cmd) init_cmd();
  cmd.index--;
  if(cmd.index < -1) cmd.index = -1;
  cmd.value = (cmd.history[cmd.index] || "");
}

var debug_method = 'console.log("METHOD CALLED: "+(this.name || this.id)+":"+arguments.callee.name)';

$class("Item", function(){
  this.def("thing", new Function(debug_method));
  
  def("something_else", new Function(debug_method));
});


$class("Resource", function(){
  
  $include(Item);
  
  $class("ResultSet", function(){
    
    this.def("listings", new Function(debug_method));
    
    $private();
    
    this.def("class_private", new Function(debug_method));
    
    def("test_private", new Function(debug_method));
    
  });
  
  this.def("find", new Function(debug_method));
  
  
  def("initialize", function(){
    if(arguments.length > 0) console.log("Arguments: "+Array.prototype.slice.call(arguments));
  });
  
  
  def("test", function(){
    this.run_test();
  });
  
  
  $private();
  
  def("priv_method",  new Function(debug_method));
  
});


$class("Business"['<'](Resource), function(){
  
  this.def("find", function(){
    this.super();
    console.log("find from Business");
  });
  
  def("run_test", function(){
    console.log("ran tests from Business");
  });
  
  def("test", function(){
    console.log("test from Business");
    this.super();
  });
  
});


$class("Resource", function(){
  
  def("run_test", function(){
    console.log("ran tests from Resource");
  });
  
});
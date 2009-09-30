= JarbClass

* http://yaksnrainbows.com

== Description

An attempt at creating a Ruby-like javascript class structure. Supports the following features:
 - Class reopening
 - Embedding classes / Namespacing
 - Inheritance
 - Class inclusion and object extending
 - Public, protected, and private method definition.

== Examples
    
    
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
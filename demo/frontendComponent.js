/**
 * H-Ubu demo.
 * This is a simple frontend component.
 * @author clement
 */

/**
 * The component function creation.
 * It's a function to use function var scoping.
 * @return the component itself
 */
var frontendComponent = function() {
   
   //*****************************//
   // Private members and methods //
   //*****************************//
   
   /**
    * The Hub.
    */
   var hub = null;
   
   /**
    * The login button id
    */
   var loginId = null;
   
   /**
    * The logout button id
    */
   var logoutId = null;
   
   /**
    * The status message id
    */
   var statusId = null;
   
   /**
    * The backend component 
    */
   var backend = null;
   
   /**
    * My own component object
    */
   var component = null;
   
   function match(event) {
       return (event.loggedIn != null);
   }
   
   function callback(event) {
       updateStatus(event.loggedIn);
   }
   
   function updateStatus(logged) {
       if (logged) {
               $(statusId).html('We are logged in').css('color', 'green');
       } else {
               $(statusId).html('We are not logged in').css('color', 'red');
       }
   }
   
   return {
       
       //*********************//
       // Component Interface //
       //*********************//
       
       /**
        * Method returning the component <b>unique</b>
        * name. Using a fully qualified name is encouraged.
        * @return the component unique name
        */
       getComponentName : function() {
           return 'de_akquinet_demo_frontend';
       },
       
       /**
        * Configure method. This method is called when the
        * component is registered on the hub.
        * @param theHub the hub
        * @param configuration the configuration
        */
       configure : function(theHub, configuration) {
           hub = theHub;
           loginId = configuration.loginId;
           logoutId = configuration.logoutId;
           statusId = configuration.statusId;        
       },
       
       /**
        * The Start function
        * This method is called when the hub starts or just
        * after configure is the hub is already started. 
        */
       start: function() {
           component = this;
           // The first things to do is to get the backend component and ask if we're
           // logged in
           
           // Invoke a public method on backend. Backend was already injected
           var state = backend.isLoggedIn();
           
           updateStatus(state);
           
           // Then, we register a listener
           hub.registerListener(this, match, callback);
           
           // Finally we register click event
           $(loginId).click(function() {
               backend.login('bla');
           });
           
           $(logoutId).click(function() {
               backend.logout();
           });
       },
       
       /**
        * The Stop method is called when the hub stops or
        * just after the component removal if the hub is 
        * not stopped. No events can be send in this method.
        */
       stop: function() {
           
       },
       
       /**
        * This method is used to inject the backend component.
        * @param {Object} cmp the component to inject
        */
       bind: function(cmp) {
           backend = cmp;
       }
   } 
}

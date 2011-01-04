/**
 * H-Ubu demo.
 * This is a simple backend component.
 * @author clement
 */

/**
 * The component function creation.
 * It's a function to use function var scoping.
 * This component simulate a logging mechanism.
 * @return the component itself
 */
var backendComponent = function() {
   
   //*****************************//
   // Private members and methods //
   //*****************************//
   
   /**
    * The Hub.
    */
   var hub = null;
   
   /**
    * Is logged in ?
    */
   var isLoggedIn = false;
   
   /**
    * User name
    */
   var user = null;
   
   /**
    * My own component.
    */
   var component = null;
   
   /**
    * This method is called 2 seconds after the login request.
    * It's use the hub to inform that the login was successful.
    */
   function loggedIn(name) {
       isLoggedIn = true;
       user = name;
       hub.publish(component, "/user/login", {loggedIn : true});
   }

   function loggedOut() {
       isLoggedIn = false;
       user = null;
       hub.publish(component, "/user/login", {loggedIn : false});
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
           return 'de_akquinet_demo_backend';
       },
       
       /**
        * Configure method. This method is called when the
        * component is registered on the hub.
        * @param theHub the hub
        */
       configure : function(theHub) {
           hub = theHub;
           component = this;        
       },
       
       /**
        * The Start function
        * This method is called when the hub starts or just
        * after configure is the hub is already started. 
        */
       start: function() {
       },
       
       /**
        * The Stop method is called when the hub stops or
        * just after the component removal if the hub is 
        * not stopped. No events can be send in this method.
        */
       stop: function() {
           
       },
       
       //*******************//
       // Public Interface //
       //******************//
       
       /**
        * Checks if the user is logged in.
        */
       isLoggedIn : function() {
           return isLoggedIn;
       },
       
       /**
        * Get the logged user.
        */
       getUser : function() {
           return user;
       },
       
       /**
        * Ask to log in.
        * This method simulates a async call.
        * And so returns immediately.
        * @param {String} name
        */
       login: function(name) {
           setTimeout(loggedIn, 2000, name);
           return;
       },
       
       /**
        * Ask to logout in.
        * This method simulates a async call.
        * And so returns immediately.
        */
       logout: function() {
           setTimeout(loggedOut, 1000);
           return;
       },
   } 
}

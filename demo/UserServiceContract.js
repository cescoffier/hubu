/**
 * User Service Contract definition.
 * The implementations are empty
 * like a Java interface
 */
var UserServiceContract = {
    /**
     * Checks if the user is logged in.
     */
    isLoggedIn : function() { },
    
    /**
     * Get the logged user.
     */
    getUser : function() { },
    
    /**
     * Ask to log in.
     * This method simulates a async call.
     * And so returns immediately.
     * @param {String} name
     */
    login: function(name) { },
    
    /**
     * Ask to logout in.
     * This method simulates a async call.
     * And so returns immediately.
     */
    logout: function() { }
}
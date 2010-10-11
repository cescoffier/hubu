/**
 * This file illustrates how to test components.
 */
function testBackendComponent() {
    module("Test Backend Component");
    
    /**
     * Simple synchronous methods
     */
    test("Test Login", function() {
        // It's always good to reset the hub
        hub.reset();
        
        // Register the component
        // We store the component to ease the access.
        var backend = backendComponent();
        hub
            .registerComponent(backend)
            .start();
        
        // Initial checks...
        // Check assertions...
        equals(false, backend.isLoggedIn(), "check isLoggedIn at initialization");
        equals(null, backend.getUser(), "check getUserName at initialization");
        
        
    });
    
    /**
     * Asynchronous test to check the login.
     * The idea is to configure a collector, receiving the
     * async event, and checking the state afterwards.
     * To achieve that, we stop the test and restart it when everything
     * is done.
     */
    test("Test login", function() {
        // It's always good to reset the hub
        hub.reset();
        
        // Register the component
        var backend = backendComponent();
        
        // Define a simple component collecting events
        // And checking that everything is correct
        var collector = {
            getComponentName: function() { return 'collector'},
            start : function() {
                hub.registerListener(this, 
                function() {
                    return true; // Accept all events
                },
                function(ev) {
                    // We do some check...
                    
                    lastEvent = ev;
                    // If we receive the event,
                    // we check it
                    ok(ev.loggedIn, "We're logged in");
                    
                    // Check the state
                    // We can now check the results
                    equals(true, backend.isLoggedIn());
                    equals('bla', backend.getUser());
                    
                    // and we restart the test
                    start();
                }) 
            },
            stop : function() {},
            configure : function() {},
            lastEvent : null
        }
        
        hub
            .registerComponent(backend)
            .registerComponent(collector)
            .start();
            
        backend.login('bla'); // Async task.
            
        // Now, we stop the test and set a timeout
        // If the start is not called when the time is reached, the test fails.
        stop(3000); // Three seconds   
    });
    
    /**
     * Last test, more complex checking the login - logout sequence.
     * We immediately stop the tests but we don't specify a timeout.
     * We also pass the number of assertions we have. If this number is not reached
     * when the test restarts, the test fails.
     */
    test("Test logout", 6, function() {
        stop();    
        
        // It's always good to reset the hub
        hub.reset();
        
        // Register the component
        var backend = backendComponent();
        
        // Define a simple component collecting events
        // And checking that everything is correct
        var collector = {
            getComponentName: function() { return 'collector'},
            start : function() {
                // This listener checks loggin
                hub.registerListener(this, 
                function(ev) {
                    console.log("Match login : " + ev.loggedIn);
                    return ev.loggedIn;
                },
                function(ev) {
                    // We're checking the login event.
                    console.log("Log in event");
                    lastEvent = ev;
                    // If we receive the event,
                    // we check it
                    ok(ev.loggedIn, "We're logged in");
                    
                    // Check the state
                    // We can now check the results
                    equals(true, backend.isLoggedIn());
                    equals('bla', backend.getUser());
                    
                    // We now call logout
                    backend.logout();
                });
                
                // This listener checks logout
                hub.registerListener(this, 
                function(ev) {
                    console.log("Match logout : " + ev.loggedIn);
                    return ev.loggedIn != null  &&
                        ! ev.loggedIn;
                },
                function(ev) {
                    console.log("Logout in event");
                    lastEvent = ev;
                    // If we receive the event,
                    // we check it
                    ok(!ev.loggedIn, "We're logged out");
                    
                    // Check the state
                    // We can now check the results
                    equals(false, backend.isLoggedIn());
                    equals(null, backend.getUser());
                    
                });
            },
            stop : function() {},
            configure : function() {},
            lastEvent : null
        }
        
        hub
            .registerComponent(backend)
            .registerComponent(collector)
            .start();
            
        backend.login('bla'); // Async task.
                    
        // We can register a time out, and then call the start function.
        setTimeout(function() {  
            // We all assertions are not OK and the number of assertions is not
            // 6, the test fails.
            start();  
        }, 6000);    
    });
     
}


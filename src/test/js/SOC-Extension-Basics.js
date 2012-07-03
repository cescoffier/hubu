/*
 * Copyright 2010 akquinet
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe("H-UBU Service Extension Tests - Basics", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should not exposed services on startup", function() {
        hub.start(); // The hub needs to be started before accessing it.
        var refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0)
    })

    it("should support service registration, lookup and unregistration", function() {
        var contract = {
            hello: function() {}
        }

        var component = {
            hello : function() {
                return "hello"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello" }
        }

        hub
            .registerComponent(component)
            .start();

        var refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0);

        // Register the service
        var reg = hub.registerService(component, contract);
        expect(reg.isRegistered()).toBe(true);
        expect(reg.getProperties()["service.contract"]).toBe(contract);
        expect(reg.getProperties()["service.publisher"]).toBe(component);

        // Bind and Use
        refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(1);

        refs = hub.getServiceReferences(contract, null);
        expect(refs.length).toBe(1);
        expect(refs[0].getContract()).toBe(contract);
        expect(hub.getService(component, refs[0]).hello()).toBe("hello");

        // Unregister
        hub.unregisterService(reg);
        refs = hub.getServiceReferences(contract, null);
        expect(refs.length).toBe(0);
    });

    it("should support service selection", function() {
        var contract = {
            hello: function() {}
        }

        var component1 = {
            hello : function() {
                return "hello"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello" }
        }

        var component2 = {
            hello : function() {
                return "bonjour"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello-fr" }
        }

        hub
            .registerComponent(component1)
            .registerComponent(component2)
            .start();

        var refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0);

        // Register the service
        var reg = hub.registerService(component1, contract, {lg : "en"});
        expect(reg.isRegistered()).toBe(true);
        expect(reg.getProperties()["service.contract"]).toBe(contract);
        expect(reg.getProperties()["service.publisher"]).toBe(component1);
        expect(reg.getProperties()["lg"]).toBe("en");

        var reg2 = hub.registerService(component2, contract, {lg : "fr"});
        expect(reg2.isRegistered()).toBe(true);
        expect(reg2.getProperties()["service.contract"]).toBe(contract);
        expect(reg2.getProperties()["service.publisher"]).toBe(component2);
        expect(reg2.getProperties()["lg"]).toBe("fr");

        // Bind and Use
        refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(2);

        refs = hub.getServiceReferences(contract, null);
        expect(refs.length).toBe(2);

        refs = hub.getServiceReferences(contract, function(ref) {
            return ref.getProperty("lg") === "fr";
        });
        expect(refs.length).toBe(1);
        expect(hub.getService(component2, refs[0]).hello()).toBe("bonjour");

        // Unregister
        hub.unregisterService(reg);
        hub.unregisterService(reg2);
        refs = hub.getServiceReferences(contract, null);
        expect(refs.length).toBe(0);

        // Unregister again, this should raises an exception
        try {
            hub.unregisterService(reg);
            this.fail("The unregistration should failed, as the registration is invalid")
        } catch (exception) {
            // OK
        }
    });

    it("should support service selection by contract / property and both", function() {
        var contract = {
            hello: function() {}
        }

        var contract2 = {
            doSomething: function() {}
        }

        var component1 = {
            hello : function() {
                return "hello"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello" }
        }

        var component2 = {
            hello : function() {
                return "bonjour"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello-fr" }
        }

        var component3 = {
            doSomething : function() {
                return "yes sire"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "component-3" }
        }

        hub
            .registerComponent(component1)
            .registerComponent(component2)
            .registerComponent(component3)
            .start();

        var refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0);

        var reg = hub.registerService(component1, contract, {lg : "en"});
        expect(reg.isRegistered()).toBe(true);
        expect(reg.getProperties()["service.contract"]).toBe(contract);
        expect(reg.getProperties()["service.publisher"]).toBe(component1);
        expect(reg.getProperties()["lg"]).toBe("en");

        var reg2 = hub.registerService(component2, contract, {lg : "fr"});
        expect(reg2.isRegistered()).toBe(true);
        expect(reg2.getProperties()["service.contract"]).toBe(contract);
        expect(reg2.getProperties()["service.publisher"]).toBe(component2);
        expect(reg2.getProperties()["lg"]).toBe("fr");

        var reg3 = hub.registerService(component3, contract2, {lg : "en"});
        expect(reg3.isRegistered()).toBe(true);

        // All services
        refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(3);

        // By contract
        refs = hub.getServiceReferences(contract, null);
        expect(refs.length).toBe(2);
        refs = hub.getServiceReferences(contract2, null);
        expect(refs.length).toBe(1);

        // By property
        refs = hub.getServiceReferences(null, function(ref) {
            return ref.getProperty("lg") === "en"
        });
        expect(refs.length).toBe(2);

        // By property and contract
        refs = hub.getServiceReferences(contract2, function(ref) {
            return ref.getProperty("lg") === "en"
        });
        expect(refs.length).toBe(1)

        // Unregister
        hub.unregisterService(reg);
        hub.unregisterService(reg2);
        hub.unregisterService(reg3);
        refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0);
    });


    it("should support service listeners", function() {
        var contract = {
            hello: function() {}
        }

        var contract2 = {
            doSomething: function() {}
        }

        var component1 = {
            hello : function() {
                return "hello"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello" }
        }

        var component2 = {
            hello : function() {
                return "bonjour"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello-fr" }
        }

        var component3 = {
            doSomething : function() {
                return "yes sire"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "component-3" }
        }

        var listenAllContractService = {
            bindCount: 0,
            unbindCount : 0,
            contract : contract,
            // no filter
            listener : function(event) {
                if (event.getType() === SOC.ServiceEvent.REGISTERED) {
                    listenAllContractService.bindCount = listenAllContractService.bindCount +1;
                } else if (event.getType() === SOC.ServiceEvent.UNREGISTERING) {
                    listenAllContractService.unbindCount = listenAllContractService.unbindCount +1;
                }
            }
        }

        var listenFrContractService = {
            bindCount: 0,
            unbindCount : 0,
            contract : contract,
            filter : function(ref) {
                return ref.getProperty("lg") === "fr";
            },
            listener : function(event) {
                if (event.getType() === SOC.ServiceEvent.REGISTERED) {
                    listenFrContractService.bindCount = listenFrContractService.bindCount +1;
                } else if (event.getType() === SOC.ServiceEvent.UNREGISTERING) {
                    listenFrContractService.unbindCount = listenFrContractService.unbindCount +1;
                }
            }
        }

        hub
            .registerComponent(component1)
            .registerComponent(component2)
            .registerComponent(component3)
            .start();

        var refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0);

        // Register the listeners
        hub.registerServiceListener(listenAllContractService)
        hub.registerServiceListener(listenFrContractService)

        var reg = hub.registerService(component1, contract, {lg : "en"});
        expect(reg.isRegistered()).toBe(true);

        // Check listeners
        expect(listenAllContractService.bindCount).toBe(1)
        expect(listenFrContractService.bindCount).toBe(0)


        var reg2 = hub.registerService(component2, contract, {lg : "fr"});
        expect(reg2.isRegistered()).toBe(true);

        // Check listeners
        expect(listenAllContractService.bindCount).toBe(2)
        expect(listenFrContractService.bindCount).toBe(1)


        var reg3 = hub.registerService(component3, contract2, {lg : "en"});
        expect(reg3.isRegistered()).toBe(true);
        // Check listeners
        expect(listenAllContractService.bindCount).toBe(2)
        expect(listenFrContractService.bindCount).toBe(1)

        // Unregister
        hub.unregisterService(reg);

        // Check listeners
        expect(listenAllContractService.unbindCount).toBe(1)
        expect(listenFrContractService.unbindCount).toBe(0)

        hub.unregisterService(reg2);

        // Check listeners
        expect(listenAllContractService.unbindCount).toBe(2)
        expect(listenFrContractService.unbindCount).toBe(1)

        hub.unregisterService(reg3);

        // Check listeners
        expect(listenAllContractService.unbindCount).toBe(2)
        expect(listenFrContractService.unbindCount).toBe(1)


        refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0);
    });

    it("Should support service listener registration and unregistration", function() {
        var contract = {
            hello: function() {}
        }

        var contract2 = {
            doSomething: function() {}
        }

        var component1 = {
            hello : function() {
                return "hello"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello" }
        }

        var component2 = {
            hello : function() {
                return "bonjour"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello-fr" }
        }

        var component3 = {
            doSomething : function() {
                return "yes sire"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "component-3" }
        }

        var listenAllContractService = {
            bindCount: 0,
            unbindCount : 0,
            contract : contract,
            // no filter
            listener : function(event) {
                if (event.getType() === SOC.ServiceEvent.REGISTERED) {
                    listenAllContractService.bindCount = listenAllContractService.bindCount +1;
                } else if (event.getType() === SOC.ServiceEvent.UNREGISTERING) {
                    listenAllContractService.unbindCount = listenAllContractService.unbindCount +1;
                }
            }
        }

        var listenFrContractService = {
            bindCount: 0,
            unbindCount : 0,
            contract : contract,
            filter : function(ref) {
                return ref.getProperty("lg") === "fr";
            },
            listener : function(event) {
                if (event.getType() === SOC.ServiceEvent.REGISTERED) {
                    listenFrContractService.bindCount = listenFrContractService.bindCount +1;
                } else if (event.getType() === SOC.ServiceEvent.UNREGISTERING) {
                    listenFrContractService.unbindCount = listenFrContractService.unbindCount +1;
                }
            }
        }

        hub
            .registerComponent(component1)
            .registerComponent(component2)
            .registerComponent(component3)
            .start();

        var refs = hub.getServiceReferences(null, null);
        expect(refs.length).toBe(0);

        // Register the listeners
        hub.registerServiceListener(listenAllContractService)
        hub.registerServiceListener(listenFrContractService)

        var reg = hub.registerService(component1, contract, {lg : "en"});
        expect(reg.isRegistered()).toBe(true);

        // Check listeners
        expect(listenAllContractService.bindCount).toBe(1)
        expect(listenFrContractService.bindCount).toBe(0)


        var reg2 = hub.registerService(component2, contract, {lg : "fr"});
        expect(reg2.isRegistered()).toBe(true);

        // Check listeners
        expect(listenAllContractService.bindCount).toBe(2)
        expect(listenFrContractService.bindCount).toBe(1)


        var reg3 = hub.registerService(component3, contract2, {lg : "en"});
        expect(reg3.isRegistered()).toBe(true);
        // Check listeners
        expect(listenAllContractService.bindCount).toBe(2)
        expect(listenFrContractService.bindCount).toBe(1)

        // Unregister the listenFrContractService
        hub.unregisterServiceListener(listenFrContractService);

        // Unregister
        hub.unregisterService(reg);

        // Check listeners
        expect(listenAllContractService.unbindCount).toBe(1);
        expect(listenFrContractService.unbindCount).toBe(0);

        hub.unregisterService(reg2);

        // Check listeners
        expect(listenAllContractService.unbindCount).toBe(2);
        expect(listenFrContractService.unbindCount).toBe(0); // Unregistered

        // Re-register the service.
        var reg = hub.registerService(component1, contract, {lg : "en"});
        expect(listenAllContractService.bindCount).toBe(3);
        expect(listenFrContractService.bindCount).toBe(1);
    });

    it("Should unregister all services when a component is stopped", function() {
        var contract = {
            hello: function() {}
        }
        var component1 = {
            hello : function() {
                return "hello"
            },
            start : function() {
                this.hub.registerService(this, contract);
            },
            stop : function() {},
            configure : function(hub) {
                this.hub = hub;
            },
            getComponentName : function() { return "hello" }
        }

        var reg = hub.registerComponent(component1);
        hub.start();

        var refs = hub.getServiceReferences(contract, null);
        expect(refs.length).toBe(1);
        expect(refs[0].getContract()).toBe(contract);
        expect(hub.getService(component1, refs[0]).hello()).toBe("hello");

        console.log("Component 1 unregistered");
        hub.unregisterComponent(component1);

        refs = hub.getServiceReferences(contract, null);
        expect(refs.length).toBe(0);

        try {
            reg.register();
            this.fail("The service registration is not valid anymore.")
        } catch (e) {
            // OK.
        }

    });

});
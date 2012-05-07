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

describe("Service Mechanism Test Suite", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should be able to register a service, retrieve it, unregister it", function() {
        var contract = {
            getName: function() {}
        };

        var component = {
            hub : null,
            reg : null,
            getComponentName: function() {
                return 'source';
            },
            start: function() {
                this.reg = this.hub.registerService(contract, component)
            },
            stop: function() { },
            configure: function(hub) {
                this.hub = hub;
            },
            getName: function() {
                return "my name";
            },
            unreg: function() {
                this.hub.unregisterService(this.reg);
            }
        };


        try {
            hub
                .registerComponent(component)
                .start();
            // Check the binding
            expect(hub.getService(contract).getName()).toBe("my name");

            //Unregister the service.
            hub.getService(contract).unreg();

            expect(hub.getService(contract)).toBeNull();

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    });

    it("should unregister all services on unregistration", function() {
        var contract = {
            getName: function() {}
        };

        var component = {
            hub : null,
            reg : null,
            getComponentName: function() {
                return 'source';
            },
            start: function() {
                reg = this.hub.registerService(contract, component)
            },
            stop: function() { },
            configure: function(hub) {
                this.hub = hub;
            },
            getName: function() {
                return "my name";
            }
        };


        try {
            hub
                .registerComponent(component)
                .start();
            // Check the binding
            expect(hub.getService(contract).getName()).toBe("my name");

            //Unregister the service.
            hub.unregisterComponent(component);

            expect(hub.getService(contract)).toBeNull();

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    });

    it("should return null when a service is not found", function() {
        var contract = {
            getName: function() {}
        };

        try {
            hub
                .start();
            // Check the binding
            expect(hub.getService(contract)).toBeNull();
            expect(hub.getServices(contract).length).toBe(0);
            expect(hub.getServiceForReference(null)).toBeNull();
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    });

    it ("should notify listeners when a service arrives and leaves", function() {
        var contract = {
            getName: function() {}
        };

        var component = {
            getComponentName: function() {
                return 'source';
            },
            start: function() {
                reg = this.hub.registerService(contract, component)
            },
            stop: function() { },
            configure: function(hub) {
                this.hub = hub;
            },
            getName: function() {
                return "my name";
            }
        }

        var listener = {
            events : [],
            serviceChanged : function(event) {
                this.events.push(event)
            },
            matches : function() {
                return true;
            }
        }

        try {
            hub.registerComponent(component)
                .registerServiceListener(listener)
                .start();

            expect(listener.events.length).toBe(1);
            expect(listener.events[0].reference.getService()).toBe(component);
            expect(listener.events[0].type).toBe(DE_AKQUINET.ServiceEventType.REGISTERED);

            hub.unregisterComponent(component);

            expect(listener.events.length).toBe(2);
            expect(listener.events[1].type).toBe(DE_AKQUINET.ServiceEventType.UNREGISTERING);

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    });

    it ("should notify listeners when filters match", function() {
        var contract = {
            getName: function() {}
        };

        var component = function() {
            return {
                v : "",
                getComponentName: function() {
                    return 'source';
                },
                start: function() {
                    this.reg = this.hub.registerService(contract, this, {
                        prop : this.v
                    });
                },
                stop: function() { },
                configure: function(hub, conf) {
                    this.hub = hub;
                    this.v = conf["v"];
                },
                getName: function() {
                    return this.v;
                }
            }
        };

        var listener = {
            events : [],
            serviceChanged : function(event) {
                console.dir(event);
                this.events.push(event)
            },
            matches : function(ref) {
                console.log("match : "  + ref.getProperty("prop") + " ? " +  (ref.getProperty("prop") == "good"));
                return ref.getProperty("prop") == "good";
            }
        }

        try {
            var cmp1 = new component();
            var cmp2 = new component();
            hub.registerComponent(cmp1, {
                "component_name": "bad",
                "v" : "bad"
                })
                .registerComponent(cmp2, {
                    "component_name": "good",
                    "v" : "good"
                })
                .registerServiceListener(listener)
                .start();

            expect(listener.events.length).toBe(1);
            expect(listener.events[0].reference.getService().getName()).toBe("good");
            expect(listener.events[0].type).toBe(DE_AKQUINET.ServiceEventType.REGISTERED);

            hub.unregisterComponent(cmp1);

            expect(listener.events.length).toBe(1);

            console.log("component on un-registration");
            hub.unregisterComponent(cmp2);
            console.log("after");

            expect(listener.events.length).toBe(2);
//            expect(listener.events[1].type).toBe(DE_AKQUINET.ServiceEventType.UNREGISTERING);

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    });

    it("should allow component to register services", function() {
        var contract = {
            getName: function() {}
        };

        var component = {
            reg : null,
            getComponentName: function() {
                return 'source';
            },
            start: function() {
            },
            stop: function() { },
            configure: function(hub) {
                this.provides({
                    contract : contract
                });
            },
            getName: function() {
                return "my name";
            }
        }

        try {
            hub
                .registerComponent(component)
                .start();
            // Check the binding
            expect(hub.getService(contract).getName()).toBe("my name");
            //Unregister the service.
            hub.unregisterComponent(component);

            expect(hub.getService(contract)).toBeNull();

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    });
});
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

describe("Direct Binding Test Suite", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should support binding using a function pointer", function() {
        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };
        var dest = {
            component : null,
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            bind : function(cmp) {
                this.component = cmp;
            }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: source,
                    to: dest,
                    into: dest.bind
                })
                .start();
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);

            // Check the binding
            expect(dest.component).toBe(source);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    })

    it("should support binding with a method name", function() {
        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };
        var dest = {
            component : null,
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            bind : function(cmp) {
                this.component = cmp;
            }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: source,
                    to: dest,
                    into: 'bind'
                })
                .start();
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);

            // Check the binding
            expect(dest.component).toBe(source);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    })

    it("should support binding using an existing field (member)", function() {
        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };
        var dest = {
            component : null,
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: source,
                    to: dest,
                    into: 'component'
                })
                .start();
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);

            // Check the binding
            expect(dest.component).toBe(source);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    })

    it("should support binding into a non-existing field (member)", function() {
        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };
        var dest = {
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: source,
                    to: dest,
                    into: 'component'
                })
                .start();
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);

            // Check the binding
            expect(dest.component).toBe(source);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    })

    it("should support binding using a string indicating the placeholder", function() {
        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };
        var dest = {
            component : null,
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            bind : function(cmp) {
                this.component = cmp;
            }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: 'source',
                    to: 'destination',
                    into: dest.bind
                })
                .start();
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);

            // Check the binding
            expect(dest.component).toBe(source);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    })

    it("should detect binding using a missing component as destination", function() {
        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };


        try {
            hub
                .registerComponent(source)
                .bind({
                    component: 'source',
                    to: 'missing',
                    into: 'bind'
                })
                .start();
            this.fail("unexpected accepted binding");
        } catch (e) {
            // OK
        }
    })

    it("should detect binding using a missing component as source", function() {
        var dest = {
            getComponentName: function() {
                return 'dest';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };


        try {
            hub
                .registerComponent(dest)
                .bind({
                    component: 'missing',
                    to: 'dest',
                    into: 'bind'
                })
                .start();
            this.fail("unexpected accepted binding");
        } catch (e) {
            // OK
        }
    })

    it("should support contract-based binding with default proxy", function() {
        // Contract definition
        var contract = {
            hello : function() { },
            sayHelloTo : function(name) { }
        }

        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            // Contract implementation
            hello: function() { },
            sayHelloTo : function(name) { this.name = name },
            name: null
        };
        var dest = {
            component : null,
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            bind : function(cmp) {
                this.component = cmp;
            },
            invoke: function() {
                this.component.sayHelloTo("me");
            }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: 'source',
                    to: 'destination',
                    into: dest.bind,
                    contract: contract
                })
                .start();
            var cmps = hub.getComponents();

            // Check the binding
            // ATTENTION __proxy__ is an implementation detail
            expect(dest.component.__proxy__).toBe(source);

            // Check contract compliance
            dest.invoke();
            expect(source.name).toBe("me");

        } catch (e) {
            this.fail(e);
        }
    })

    it("should support contract-based binding with proxy", function() {
        // Contract definition
        var contract = {
            hello : function() { },
            sayHelloTo : function(name) { }
        }

        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            // Contract implementation
            hello: function() { },
            sayHelloTo : function(name) { this.name = name },
            name: null
        };
        var dest = {
            component : null,
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            bind : function(cmp) {
                this.component = cmp;
            },
            invoke: function() {
                this.component.sayHelloTo("me");
            }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: 'source',
                    to: 'destination',
                    into: dest.bind,
                    contract: contract,
                    proxy : true
                })
                .start();
            var cmps = hub.getComponents();

            // Check the binding
            // ATTENTION __proxy__ is an implementation detail
            expect(dest.component.__proxy__).toBe(source);

            // Check contract compliance
            dest.invoke();
            expect(source.name).toBe("me");

        } catch (e) {
            this.fail(e);
        }
    })

    it("should support contract-based binding without proxy", function() {
        // Contract definition
        var contract = {
            hello : function() { },
            sayHelloTo : function(name) { }
        }

        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            // Contract implementation
            hello: function() { },
            sayHelloTo : function(name) { this.name = name },
            name: null
        };
        var dest = {
            component : null,
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            bind : function(cmp) {
                this.component = cmp;
            },
            invoke: function() {
                this.component.sayHelloTo("me");
            }
        };

        try {
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: 'source',
                    to: 'destination',
                    into: dest.bind,
                    contract: contract,
                    proxy : false
                })
                .start();
            var cmps = hub.getComponents();

            // Check the binding
            // ATTENTION __proxy__ is an implementation detail
            // No proxy.
            expect(dest.component.__proxy__).toBeUndefined();
            expect(dest.component).toBe(source);

            // Check contract compliance
            dest.invoke();
            expect(source.name).toBe("me");

        } catch (e) {
            this.fail(e);
        }
    })

    it("should detect bindings with a non-implemented contract", function() {
        // Contract definition
        var contract = {
            hello : function() { },
            sayHelloTo : function(name) { }
        }

        var source = {
            getComponentName: function() {
                return 'source';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { },
            // Contract implementation, hello is missing.
            sayHelloTo : function(name) { this.name = name },
            name: null
        };

        var destination = {
            getComponentName: function() {
                return 'destination';
            },
            start: function() { },
            stop: function() { },
            configure: function(hub) { }
        };


        try {
            hub
                .registerComponent(destination)
                .registerComponent(source)
                .bind({
                    component: 'source',
                    to: 'destination',
                    into: 'bind',
                    contract: contract
                })
                .start();
            this.fail("unexpected accepted binding");
        } catch (e) {
            // ok(true, "binding rejected as expected : " + e);
        }
    })
});
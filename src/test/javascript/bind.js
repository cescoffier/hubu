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

load(basePath + "hubu.js");

function testBindUsingFunctionPointer() {
        hub.reset();
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
            assertEquals(2, cmps.length);

            // Check the binding
            assertEquals(dest.component, source);
        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e);
        }
    }

function testBindWithFunctionName() {
        hub.reset();
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
            assertEquals(2, cmps.length);

            // Check the binding
            assertEquals(dest.component, source);
        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e);
        }
    }

function testBindUsingExistingMember() {
        hub.reset();
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
            assertEquals(2, cmps.length);

            // Check the binding
            assertEquals(dest.component, source);
        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e);
        }
    }

function testBindUsingNonExistingMember() {
        hub.reset();
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
            configure: function(hub) { },
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
            assertEquals(2, cmps.length);

            // Check the binding
            assertEquals(dest.component, source);
        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e);
        }
    }

function testBindLookupUsingString() {
        hub.reset();
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
            assertEquals(2, cmps.length);

            // Check the binding
            assertEquals(dest.component, source);
        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e);
        }
    }

function testMissingComponent() {
        hub.reset();
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
                    to: 'destination',
                    into: 'bind'
                })
                .start();
            fail("unexpected accepted binding");
        } catch (e) {
        	// OK
        }
    }

function testBindFromMissingComponent() {
        hub.reset();
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
                .bind({
                    component: 'source',
                    to: 'destination',
                    into: 'bind'
                })
                .start();
            fail("unexpected accepted binding");
        } catch (e) {
        	// OK
        }
    }


function testBindWithValidContractWithoutProxy() {
        hub.reset();
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
            assertEquals(2, cmps.length);

            // Check the binding
			// ATTENTION __proxy__ is an implementation detail
            assertEquals(dest.component.__proxy__, source);

			// Check contract compliance
			dest.invoke();
			assertEquals(source.name, "me");

        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e);
        }
    }

function testBindWithValidContractAndProxy() {
        hub.reset();
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
            assertEquals(2, cmps.length);

            // Check the binding
			// ATTENTION __proxy__ is an implementation detail
            assertEquals(dest.component.__proxy__, source);

			// Check contract compliance
			dest.invoke();
			assertEquals(source.name, "me");

        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e);
        }
    }

function testBindWithValidContractWithProxyDisabled()  {
        hub.reset();
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
        	warn("plop");
            hub
                .registerComponent(source)
                .registerComponent(dest)
                .bind({
                    component: 'source',
                    to: 'destination',
                    into: dest.bind,
					contract: contract,
					proxy: false
                })
                .start();
            warn("started");
            var cmps = hub.getComponents();
            assertEquals(2, cmps.length);
            info("plop", "here");
            // Check the binding
            assertEquals(dest.component, source);

			// Check contract compliance
			dest.invoke();
			assertEquals(source.name, "me");

        } catch (e) {
            console.log(e);
            fail("Unexpected error " + e.message);
        }
    }

function testBindWithInvalidContract() {
        hub.reset();

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
            fail("unexpected accepted binding");
        } catch (e) {
            // ok(true, "binding rejected as expected : " + e);
        }
    }




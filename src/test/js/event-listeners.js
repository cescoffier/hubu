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

describe("Event Mechanism Test Suite", function () {

    afterEach(function () {
        hub.reset();
    });

    it ("should reject invalid event listeners", function() {
        var cmp = {
            getComponentName:function () {
                return 'foo';
            }
        };

        // Everything null
        try {
            hub.registerListener(null, null, null);
            this.fail();
        } catch (e) {
            jasmine.log(e);
        }

        // Component null
        try {
            hub.registerListener(null, function () {
            }, function () {
            });
            this.fail()
        } catch (e) {
            jasmine.log(e);
        }

        // Callback null
        try {
            hub.registerListener({}, null, function () {
            });
            this.fail();
        } catch (e) {
            jasmine.log(e);
        }

        // Match null
        try {
            hub.registerListener({}, function () {
            });
            this.fail();
        } catch (e) {
            jasmine.log(e);
        }

        // Not registered component
        try {
            hub.registerListener({}, function () {
            }, function () {
            });
            this.fail();
        } catch (e) {
            jasmine.log(e);
        }

        // Valid registration
        var cmp = {
            call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);

            expect(hub.getComponent('foo')).toBe(cmp);
            hub.registerListener(cmp, function () {
            }, function () { });

            var listeners = hub.getListeners();
            expect(listeners.length).toBe(1);
            expect(listeners[0].component).toBe(cmp);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should support registration and un-registration of event listener using the component object", function() {
        var cmp = {
            call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);
            expect(hub.getComponent('foo')).toBe(cmp);

            hub.registerListener(cmp, function () {
            }, function () {
            });
            hub.registerListener(cmp, function () {
            }, function () {
            });

            var listeners = hub.getListeners();
            expect(listeners.length).toBe(2);
            expect(listeners[0].component).toBe(cmp);
            expect(listeners[1].component).toBe(cmp);

            // Unregistration
            hub.unregisterListener(cmp);

            expect(listeners.length).toBe(0);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject " + e);
        }
    })

    it("should support registration and un-registration of event listener using the component name", function() {
        var cmp = {
            call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);
            var cmps = hub.getComponents();
            expect(hub.getComponent('foo')).toBe(cmp);

            hub.registerListener(cmp, function () {
            }, function () {
            });
            hub.registerListener(cmp, function () {
            }, function () {
            });

            var listeners = hub.getListeners();
            expect(listeners.length).toBe(2);
            expect(listeners[0].component).toBe(cmp);
            expect(listeners[1].component).toBe(cmp);

            // Unregistration
            hub.unregisterListener('foo');

            expect(listeners.length).toBe(0);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject " + e);
        }
    })

    it("should support event listener un-registration using an invalid/missing component name", function() {
        var cmp = {
            call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);
            var cmps = hub.getComponents();
            expect(hub.getComponent('foo')).toBe(cmp);

            hub.registerListener(cmp, function () {
            }, function () {
            });
            hub.registerListener(cmp, function () {
            }, function () {
            });

            var listeners = hub.getListeners();
            expect(listeners.length).toBe(2);
            expect(listeners[0].component).toBe(cmp);
            expect(listeners[1].component).toBe(cmp);

            // Un-registration
            hub.unregisterListener('does not exist');

            expect(listeners.length).toBe(2);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject " + e);
        }
    })

    it("should support event listener registration with several components", function() {
        var cmp = {
            call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        var cmp2 = {
            call:0,
            getComponentName:function () {
                return 'bar';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);
            hub.registerComponent(cmp2);
            var cmps = hub.getComponents();

            hub.registerListener(cmp, function () {
            }, function () {
            });
            hub.registerListener(cmp, function () {
            }, function () {
            });
            hub.registerListener(cmp2, function () {
            }, function () {
            });

            var listeners = hub.getListeners();
            expect(listeners.length).toBe(3);

            // Unregistration
            hub.unregisterListener('foo');
            expect(listeners.length).toBe(1);

            hub.unregisterListener(cmp2);
            expect(listeners.length).toBe(0);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject " + e);
        }
    })

    it("should support event listener registration with several components and callbacks", function() {
        var cmp = {
            call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        var cmp2 = {
            call:0,
            getComponentName:function () {
                return 'bar';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        var cb1 = function () {

        }

        var cb2 = function () {

        }

        var cb3 = function () {

        }

        try {
            hub.registerComponent(cmp);
            hub.registerComponent(cmp2);
            var cmps = hub.getComponents();

            hub.registerListener(cmp, function () {
            }, cb1);
            hub.registerListener(cmp, function () {
            }, cb2);
            hub.registerListener(cmp2, function () {
            }, cb3);

            var listeners = hub.getListeners();
            expect(listeners.length).toBe(3);

            // Unregistration
            hub.unregisterListener('foo', cb2);
            expect(hub.getListeners().length).toBe(2);
            hub.unregisterListener(cmp2, cb3);
            expect(hub.getListeners().length).toBe(1);
            hub.unregisterListener(cmp);
            expect(hub.getListeners().length).toBe(0);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject " + e);
        }
    })

});
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

describe("Component Mechanism Test Suite", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should be empty", function () {
        var cmps = hub.getComponents();
        expect(cmps.length).toBe(0);
    });

    it("should not find undeclared component", function () {
        var cmp = hub.getComponent('foo');
        expect(cmp).toBeNull();

        cmp = hub.getComponent('');
        expect(cmp).toBeNull();

        cmp = hub.getComponent();
        expect(cmp).toBeNull();
    });

    it("should reject invalid component", function () {
        var cmp = {
            getComponentName:function () {
                return 'foo';
            }
        };

        try {
            hub.registerComponent(cmp);
            fail("Unexpected registration");
        } catch (e) {
            // OK
        }
    })

    it("should accept this component", function () {
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
            expect(cmps.length).toBe(1)
            expect(cmp).toBe(hub.getComponent('foo'));

            // Check that configure was called
            expect(cmp.call, 1);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("Should call configure with the right configuration", function () {
        var cmp = {
            conf:{},
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub, configuration) {
                this.conf = configuration;
                this.conf.hub = hub;
            }
        };

        try {
            hub.registerComponent(cmp, {
                foo:'bar'
            });
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(1);
            expect(cmp).toBe(hub.getComponent('foo'));

            // Check the configuration
            expect(cmp.conf.foo).toBe('bar');
            expect(cmp.conf.hub).toBe(hub);

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should apply the name included in the configuration", function () {
        var cmp = {
            conf:{},
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
            },
            configure:function (hub, configuration) {
                this.conf = configuration;
                this.conf.hub = hub;
            }
        };

        try {
            hub.registerComponent(cmp, {
                foo:'bar',
                component_name:'mycomponent'
            });
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(1);
            expect(hub.getComponent('mycomponent')).toBe(cmp);
            expect(hub.getComponent('foo')).toBeNull();

            // Check the configuration
            expect(cmp.conf.foo).toBe('bar');
            expect(cmp.conf.hub).toBe(hub);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should not accept a component declared twice", function () {
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
            expect(cmps.length).toBe(1);
            expect(cmp).toBe(hub.getComponent('foo'));
            expect(cmp.call).toBe(1);

            hub.registerComponent(cmp);
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(1);
            expect(cmp).toBe(hub.getComponent('foo'));
            expect(cmp.call).toBe(1);

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should support removing component using the component object", function () {
        var cmp = {
            call:0,
            stop_call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
                this.stop_call++
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(1);
            expect(cmp).toBe(hub.getComponent('foo'));
            expect(cmp.call).toBe(1);

            hub.unregisterComponent(cmp);
            expect(cmps.length).toBe(0);
            expect(hub.getComponent('foo')).toBeNull();
            expect(cmp.stop_call).toBe(1); // Check that stop was called.
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should support removing component using the component name", function () {
        var cmp = {
            call:0,
            stop_call:0,
            getComponentName:function () {
                return 'foo';
            },
            start:function () {
            },
            stop:function () {
                this.stop_call++
            },
            configure:function (hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(1);
            expect(cmp).toBe(hub.getComponent('foo'));
            expect(cmp.call).toBe(1);

            hub.unregisterComponent('foo');
            expect(cmps.length).toBe(0);
            expect(hub.getComponent('foo')).toBeNull();
            expect(cmp.stop_call).toBe(1); // Check that stop was called.
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should accept several components", function() {
        var cmp = {
            call : 0,
            getComponentName : function() {
                return 'foo';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.call = this.call + 1;
            }
        };

        var cmp2 = {
            call : 0,
            getComponentName : function() {
                return 'bar';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp);
            hub.registerComponent(cmp2);

            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);
            expect(hub.getComponent('foo')).toBe(cmp);
            expect(hub.getComponent('bar')).toBe(cmp2);
            expect(cmp.call).toBe(1);
            expect(cmp2.call).toBe(1);

            hub.unregisterComponent('foo');
            expect(cmps.length).toBe(1);
            expect(hub.getComponent('foo')).toBeNull();
            expect(hub.getComponent('bar')).toBe(cmp2);

            hub.unregisterComponent('bar');
            expect(cmps.length).toBe(0);
            expect(hub.getComponent('foo')).toBeNull();
            expect(hub.getComponent('bar')).toBeNull();
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should support code 'chains'", function() {
        var cmp = {
            call : 0,
            getComponentName : function() {
                return 'foo';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.call = this.call + 1;
            }
        };

        var cmp2 = {
            call : 0,
            getComponentName : function() {
                return 'bar';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub
                .registerComponent(cmp)
                .registerComponent(cmp2);

            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);
            expect(hub.getComponent('foo')).toBe(cmp);
            expect(hub.getComponent('bar')).toBe(cmp2);
            expect(cmp.call).toBe(1);
            expect(cmp2.call).toBe(1);

            hub
                .unregisterComponent('foo')
                .unregisterComponent('bar');
            expect(cmps.length).toBe(0);
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })

    it("should support start-stop cycle", function() {
        var cmp = {
            call : 0,
            getComponentName : function() {
                return 'foo';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.call = this.call + 1;
            }
        };

        var cmp2 = {
            call : 0,
            getComponentName : function() {
                return 'bar';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.call = this.call + 1;
            }
        };

        try {
            hub.registerComponent(cmp).registerComponent(cmp2);

            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);
            expect(hub.getComponent('foo')).toBe(cmp);
            expect(hub.getComponent('bar')).toBe(cmp2);
            expect(cmp.call).toBe(1);
            expect(cmp2.call).toBe(1);

            hub.start();
            hub.stop();

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    })
});


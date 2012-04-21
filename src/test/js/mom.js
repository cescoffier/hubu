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

describe("Message-oriented middleware Test Suite", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should support topic filters using regex ", function() {
        var sender = {
            hub : null,
            getComponentName : function() {
                return 'sender';
            },
            start : function() {
                hub.publish(this, "foo/bar", {
                    data : "boo",
                    complex : { foo : "bar", bar : "baz", baz : ["foo", "bar"] }
                });
            },
            stop : function() {
            },
            configure : function(hub) {
                this.hub = hub;
            }
        };

        var receiver = {
            hub : null,
            received : null,
            self : null,
            getComponentName : function() {
                return 'receiver';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.hub = hub;
                hub.subscribe(this, "foo/(.)*?", this.receive);
            },
            receive : function(ev) {
                jasmine.log("Receive called !");
                this.received = ev;
            }
        };

        try {
            // Must register the receiver first.
            hub.registerComponent(receiver);
            hub.registerComponent(sender);
            var cmps = hub.getComponents();

            hub.start();
            // Event are then sent.

            var event = receiver.received;
            expect(event).toBeDefined();
            expect(event.source).toBe(sender);
            expect(event.data).toBe('boo');
            expect(event.complex.baz[0]).toBe('foo');

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected exception "  + e);
        }
    })

    it("should support event filters", function() {
        var sender = {
            hub : null,
            getComponentName : function() {
                return 'sender';
            },
            start : function() {
                hub.publish(this, "foo/bar", {
                    data : "boo",
                    complex : { foo : "bar", bar : "baz", baz : ["foo", "bar"] }
                });
            },
            stop : function() {
            },
            configure : function(hub) {
                this.hub = hub;
            }
        };

        var receiver = {
            hub : null,
            received : null,
            self : null,
            getComponentName : function() {
                return 'receiver';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.hub = hub;
                hub.subscribe(this, "foo/(.)*?", this.receive, function(event) {
                    return event.data === "boo";
                });
            },
            receive : function(ev) {
                this.received = ev;
            }
        };

        var receiver2 = {
            hub : null,
            received : null,
            self : null,
            getComponentName : function() {
                return 'receiver2';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.hub = hub;
                hub.subscribe(this, "foo/(.)*?", this.receive, function(event) {
                    return event.data === "baboo";
                });
            },
            receive : function(ev) {
                console.log("Receive called !");
                this.received = ev;
            }
        };

        try {
            // Must register the receiver first.
            hub.registerComponent(receiver);
            hub.registerComponent(receiver2);
            hub.registerComponent(sender);
            var cmps = hub.getComponents();

            hub.start();
            // Event are then sent.

            var event = receiver.received;
            expect(event).toBeDefined();
            expect(event.source).toBe(sender);
            expect(event.data).toBe('boo');
            expect(event.complex.baz[0]).toBe('foo');


            var event2 = receiver2.received;
            expect(event2).toBeNull();
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected exception " + e);
        }
    })
});
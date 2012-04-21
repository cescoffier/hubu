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

    it("should send and receive events", function() {
        var sender = {
            hub : null,
            getComponentName : function() {
                return 'sender';
            },
            start : function() {
                hub.sendEvent(this, {
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
                hub.registerListener(this, this.match, this.receive);
            },
            match : function(ev) {
                jasmine.log("Match called !");
                return true; // Accept all events
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
            expect(cmps.length).toBe(2);

            hub.start();
            // Event are then sent.

            var event = receiver.received;
            expect(event).toBeDefined();
            expect(event.source).toBe(sender);
            expect(event.data).toBe('boo');
            expect(event.complex.baz[0]).toBe('foo');
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected exception " + e);
        }
    })

    it("should support event-based conversations", function() {
        var sender = {
            hub : null,
            received : null,
            getComponentName : function() {
                return 'sender';
            },
            start : function() {
                hub.registerListener(this, this.match, this.receive);
                hub.sendEvent(this, {
                    game : "ping"
                });
            },
            stop : function() {
            },
            configure : function(hub) {
                this.hub = hub;
            },
            match : function(ev) {
                return ev.game;
            },
            receive : function(ev) {
                jasmine.log("Sender received " + ev.game);
                this.received = ev;
            }

        };

        var receiver = {
            hub : null,
            received : null,
            getComponentName : function() {
                return 'receiver';
            },
            start : function() {
            },
            stop : function() {
            },
            configure : function(hub) {
                this.hub = hub;
                hub.registerListener(this, this.match, this.receive);
            },
            match : function(ev) {
                return ev.game;
            },
            receive : function(ev) {
                jasmine.log("Receiver received " + ev.game);
                this.received = ev;
                hub.sendEvent(this, {
                    game : "pong"
                });
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
            expect(event.source.getComponentName()).toBe('sender');
            expect(event.game).toBe('ping');

            event = sender.received;
            expect(event).toBeDefined();
            expect(event.source.getComponentName()).toBe('receiver');
            expect(event.game).toBe('pong');

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected exception " + e);
        }
    })

    it("should send events even if there are not receivers", function() {
        var sender = {
            hub : null,
            sent : false,
            getComponentName : function() {
                return 'sender';
            },
            start : function() {
                this.sent = hub.sendEvent(this, {
                    data : "boo"
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
                jasmine.log("Configure the listener");
                this.hub = hub;
                hub.registerListener(this, this.match, this.receive);
            },
            match : function(ev) {
                jasmine.log("Match called !");
                return true; // Accept all events
            },
            receive : function(ev) {
                jasmine.log("Receive called !");
                this.received = ev;
            }
        };

        try {
            // Register only the sender.
            hub.registerComponent(sender);
            var cmps = hub.getComponents();

            hub.start();
            // Event are then sent.

            // But the method return false because there are no receivers.
            expect(sender.sent).toBeFalsy();

            // Register the receiver
            hub.registerComponent(receiver);

            sender.start(); // Re-launch the event

            expect(sender.sent).toBeTruthy();
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected exception");
        }
    })

});
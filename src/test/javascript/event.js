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

function testSendingAndReception() {
  hub.reset();

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
      console.log("Match called !");
      return true; // Accept all events
    },
    receive : function(ev) {
      console.log("Receive called !");
      this.received = ev;
    }
  };

  try {
    // Must register the receiver first.
    hub.registerComponent(receiver);
    hub.registerComponent(sender);
    var cmps = hub.getComponents();
    assertEquals(2, cmps.length);

    hub.start();
    // Event are then sent.

    var event = receiver.received;
    assertNotNull(event);
    assertEquals(sender, event.source);
    assertEquals('boo', event.data);
    assertEquals('foo', event.complex.baz[0]);
  } catch (e) {
    console.log(e);
    fail("Unexpected exception");
  }

}

function testSmallConversation() {
  hub.reset();

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
      console.log("Sender received " + ev.game);
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
      console.log("Receiver received " + ev.game);
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
    assertEquals(2, cmps.length);

    hub.start();
    // Event are then sent.

    var event = receiver.received;
    assertNotNull(event);
    assertEquals('sender', event.source.getComponentName());
    assertEquals('ping', event.game);

    event = sender.received;
    assertNotNull(event);
    assertEquals('receiver', event.source.getComponentName());
    assertEquals('pong', event.game);
  } catch (e) {
    console.log(e);
    // fail("Unexpected exception");
    throw e;
  }

}

function testSendingWOReception() {
  hub.reset();

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
      console.log("Configure the listener");
      this.hub = hub;
      hub.registerListener(this, this.match, this.receive);
    },
    match : function(ev) {
      console.log("Match called !");
      return true; // Accept all events
    },
    receive : function(ev) {
      console.log("Receive called !");
      this.received = ev;
    }
  };

  try {
    // Register only the sender.
    hub.registerComponent(sender);
    var cmps = hub.getComponents();
    assertEquals(1, cmps.length);

    hub.start();
    // Event are then sent.

    assertTrue(!sender.sent);

    // Register the receiver
    hub.registerComponent(receiver);
    assertEquals(2, cmps.length);

    sender.start(); // Re-launch the event

    assertTrue(sender.sent);
  } catch (e) {
    console.log(e);
    fail("Unexpected exception");
  }

}

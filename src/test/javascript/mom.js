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
      hub.subscribe(this, "foo/bar", this.receive);
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
      hub.subscribe(this, "foo/bar/sender", this.receive);
      hub.publish(this, "foo/bar/receiver", {
        game : "ping"
      });
    },
    stop : function() {
    },
    configure : function(hub) {
      this.hub = hub;
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
      hub.subscribe(this, "foo/bar/receiver", this.receive);
    },
    match : function(ev) {
      return ev.game;
    },
    receive : function(ev) {
      console.log("Receiver received " + ev.game);
      this.received = ev;
      hub.publish(this, "foo/bar/sender", {
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
      this.sent = hub.publish(this, "foo/bar", {
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
      hub.subscribe(this, "foo/bar", this.receive);
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

function testRegex() {
	  hub.reset();

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

function testFilter() {
	  hub.reset();

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
	      console.log("Receive called !");
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
	    assertEquals(3, cmps.length);

	    hub.start();
	    // Event are then sent.

	    var event = receiver.received;
	    assertNotNull(event);
	    assertEquals(sender, event.source);
	    assertEquals('boo', event.data);
	    assertEquals('foo', event.complex.baz[0]);

	    var event2 = receiver2.received;
	    assertNull(event2);
	  } catch (e) {
	    console.log(e);
	    fail("Unexpected exception");
	  }

	}

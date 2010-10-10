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

function testRegistrationOFAListenerForAnInvalidListener() {
	hub.reset();
	var cmp = {
		getComponentName : function() {
			return 'foo';
		}
	};

	// Everything null
	try {
		hub.registerListener(null, null, null);
		fail();
	} catch (e) {
		console.log(e);
	}

	// Component null
	try {
		hub.registerListener(null, function() {
		}, function() {
		});
		fail()
	} catch (e) {
		console.log(e);
	}

	// Callback null
	try {
		hub.registerListener({}, null, function() {
		});
		fail()
	} catch (e) {
		console.log(e);
	}

	// Match null
	try {
		hub.registerListener({}, function() {
		});
		fail();
	} catch (e) {
		console.log(e);
	}

	// Not registered component
	try {
		hub.registerListener({}, function() {
		}, function() {
		});
		fail();
	} catch (e) {
		console.log(e);
	}

	// Valid registration
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

	try {
		hub.registerComponent(cmp);
		var cmps = hub.getComponents();
		assertEquals(1, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));

		hub.registerListener(cmp, function() {
		}, function() {
		});

		var listeners = hub.getListeners();
		assertEquals(1, listeners.length);
		assertEquals(cmp, listeners[0].component);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}

}

function testRegistrationAndUnregistrationByComponent() {
	hub.reset();

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

	try {
		hub.registerComponent(cmp);
		var cmps = hub.getComponents();
		assertEquals(1, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));

		hub.registerListener(cmp, function() {
		}, function() {
		});
		hub.registerListener(cmp, function() {
		}, function() {
		});

		var listeners = hub.getListeners();
		assertEquals(2, listeners.length);
		assertEquals(cmp, listeners[0].component);
		assertEquals(cmp, listeners[1].component);

		// Unregistration
		hub.unregisterListener(cmp);

		assertEquals(0, listeners.length);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testListenerRegistrationAndUnregistrationByComponentName() {
	hub.reset();

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

	try {
		hub.registerComponent(cmp);
		var cmps = hub.getComponents();
		assertEquals(1, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));

		hub.registerListener(cmp, function() {
		}, function() {
		});
		hub.registerListener(cmp, function() {
		}, function() {
		});

		var listeners = hub.getListeners();
		assertEquals(2, listeners.length);
		assertEquals(cmp, listeners[0].component);
		assertEquals(cmp, listeners[1].component);

		// Unregistration
		hub.unregisterListener('foo');

		assertEquals(0, listeners.length);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testListenerRegistrationWithBadName() {
	hub.reset();

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

	try {
		hub.registerComponent(cmp);
		var cmps = hub.getComponents();
		assertEquals(1, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));

		hub.registerListener(cmp, function() {
		}, function() {
		});
		hub.registerListener(cmp, function() {
		}, function() {
		});

		var listeners = hub.getListeners();
		assertEquals(2, listeners.length);
		assertEquals(cmp, listeners[0].component);
		assertEquals(cmp, listeners[1].component);

		// Unregistration
		hub.unregisterListener('xxx');

		assertEquals(2, listeners.length);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testListenerRegWithTwoComponents() {
	hub.reset();

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
		assertEquals(2, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));
		assertEquals(cmp2, hub.getComponent('bar'));

		hub.registerListener(cmp, function() {
		}, function() {
		});
		hub.registerListener(cmp, function() {
		}, function() {
		});
		hub.registerListener(cmp2, function() {
		}, function() {
		});

		var listeners = hub.getListeners();
		assertEquals(3, listeners.length);

		// Unregistration
		hub.unregisterListener('foo');
		assertEquals(1, listeners.length);

		hub.unregisterListener(cmp2);
		assertEquals(0, listeners.length);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testREgistrationWith2CmpsAndSpecificCallbacks() {
	hub.reset();

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

	var cb1 = function() {

	}

	var cb2 = function() {

	}

	var cb3 = function() {

	}

	try {
		hub.registerComponent(cmp);
		hub.registerComponent(cmp2);
		var cmps = hub.getComponents();
		assertEquals(2, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));
		assertEquals(cmp2, hub.getComponent('bar'));

		hub.registerListener(cmp, function() {
		}, cb1);
		hub.registerListener(cmp, function() {
		}, cb2);
		hub.registerListener(cmp2, function() {
		}, cb3);

		var listeners = hub.getListeners();
		assertEquals(3, listeners.length);

		// Unregistration
		hub.unregisterListener('foo', cb2);
		assertEquals(2, listeners.length);
		hub.unregisterListener(cmp2, cb3);
		assertEquals(1, listeners.length);
		hub.unregisterListener(cmp);
		assertEquals(0, listeners.length);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

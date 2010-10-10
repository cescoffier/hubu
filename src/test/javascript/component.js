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

function testEmptyHub() {
	hub.reset();
	var cmps = hub.getComponents();
	assertEquals(0, cmps.length);
}

function testGetMissingComponent() {
	hub.reset();
	var cmp = hub.getComponent('foo');
	assertEquals(null, cmp);

	cmp = hub.getComponent('');
	assertEquals(null, cmp);

	cmp = hub.getComponent();
	assertEquals(null, cmp);
}

function testInvalidComponent() {
	hub.reset();
	var cmp = {
		getComponentName : function() {
			return 'foo';
		}
	};

	try {
		hub.registerComponent(cmp);
		fail("Unexpected registration");
	} catch (e) {
		console.log(e);
	}
}

function testAComponent() {
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

		// Check that configure was called
		assertEquals(1, cmp.call);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testComponentWithConfiguration() {
	hub.reset();
	var cmp = {
		conf : {},
		getComponentName : function() {
			return 'foo';
		},
		start : function() {
		},
		stop : function() {
		},
		configure : function(hub, configuration) {
			this.conf = configuration;
			this.conf.hub = hub;
		}
	};

	try {
		hub.registerComponent(cmp, {
			foo : 'bar'
		});
		var cmps = hub.getComponents();
		assertEquals(1, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));

		// Check the configuration
		assertEquals('bar', cmp.conf.foo);
		assertEquals(hub, cmp.conf.hub);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testComponentConfigurationWithNameReconfiguration() {
	hub.reset();
	var cmp = {
		conf : {},
		getComponentName : function() {
			return 'foo';
		},
		start : function() {
		},
		stop : function() {
		},
		configure : function(hub, configuration) {
			this.conf = configuration;
			this.conf.hub = hub;
		}
	};

	try {
		hub.registerComponent(cmp, {
			foo : 'bar',
			component_name : 'mycomponent'
		});
		var cmps = hub.getComponents();
		assertEquals(1, cmps.length);
		assertEquals(cmp, hub.getComponent('mycomponent'));
		assertEquals(null, hub.getComponent('foo'))

		// Check the configuration
		assertEquals('bar', cmp.conf.foo);
		assertEquals(hub, cmp.conf.hub);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testAComponentTwice() {
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
		assertEquals(1, cmp.call);

		hub.registerComponent(cmp);
		var cmps = hub.getComponents();
		assertEquals(1, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));
		assertEquals(1, cmp.call);

	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testRemoveUsingComponent() {
	hub.reset();
	var cmp = {
		call : 0,
		stop_call : 0,
		getComponentName : function() {
			return 'foo';
		},
		start : function() {
		},
		stop : function() {
			this.stop_call++
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
		assertEquals(1, cmp.call);

		hub.unregisterComponent(cmp);
		assertEquals(0, cmps.length);
		assertEquals(null, hub.getComponent('foo'));
		assertEquals(1, cmp.stop_call); // Check that stop was called.
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function removeUsingComponentName() {
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
		assertEquals(1, cmp.call);

		hub.unregisterComponent('foo');
		assertEquals(0, cmps.length);
		assertEquals(null, hub.getComponent('foo'));
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testTwoRegistrations() {
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
		assertEquals(1, cmp.call);
		assertEquals(1, cmp2.call);

		hub.unregisterComponent('foo');
		assertEquals(1, cmps.length);
		assertEquals(null, hub.getComponent('foo'));
		assertEquals(cmp2, hub.getComponent('bar'));

		hub.unregisterComponent('bar');
		assertEquals(0, cmps.length);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testRegistrationChaining() {
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
		hub.registerComponent(cmp).registerComponent(cmp2);

		var cmps = hub.getComponents();
		assertEquals(2, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));
		assertEquals(cmp2, hub.getComponent('bar'));
		assertEquals(1, cmp.call);
		assertEquals(1, cmp2.call);

		hub.unregisterComponent('foo').unregisterComponent('bar');

		assertEquals(0, cmps.length);
	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}

function testStartStop() {
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
		hub.registerComponent(cmp).registerComponent(cmp2);

		var cmps = hub.getComponents();
		assertEquals(2, cmps.length);
		assertEquals(cmp, hub.getComponent('foo'));
		assertEquals(cmp2, hub.getComponent('bar'));
		assertEquals(1, cmp.call);
		assertEquals(1, cmp2.call);

		hub.start();
		hub.stop();

	} catch (e) {
		console.log(e);
		fail("Unexpected component reject");
	}
}
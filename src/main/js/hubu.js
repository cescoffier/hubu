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

/**
 * @fileOverview H-Ubu is a simple component framework for Javascript.
 * Components are object that must have the following methods:
 * start()
 * stop()
 * configure(hub, configuration) : hub is the current hub, configuration
 * is an optional configuration
 * getComponentName() -> String
 * @author Clement Escoffier
 * @version ${project.version}
 */

/**
 * DE_AKQUINET package declaration.
 * This declaration makes sure to not erase the
 * current declaration. If the package does not
 * exist an empty object is created.
 * @default {}
 */
var DE_AKQUINET = DE_AKQUINET || {};


/**
 * H-Ubu module.
 * This module defines the H-UBU framework.
 * @return hubu
 * @namespace
 */
DE_AKQUINET.hubu = function() {

    /**
     * The component plugged to the hub.
     * @private
     */
    var components = [],

    /**
     * The registered listeners
     * @private
     */
    listeners = [],

    /**
     * Is the hub started.
     * @private
     */
    started = false;

    /**
     * Checks if the given component implements the
     * 'component' protocol (i.e.e interface).
     * @param {DE_AKQUINET.AbstractComponent} component the component to check
     * @return true if this is a valid component,
     * false otherwise.
     * @private
     */
    function checkComponent(component) {
        // if component is null, return false
        if (! component) {
            return false;
        }

        return DE_AKQUINET.utils
            .isObjectConformToContract(component,
                new DE_AKQUINET.AbstractComponent());
    }


    /**
     * Processes the given event sent by the given component.
     * This methods checks who is interested by the event by
     * calling the match method, then the callback method is
     * called.
     * The event is extended with the 'source' property indicating
     * the component sending the event.
     * @param {Object} event
     * @param {DE_AKQUINET.AbstractComponent} component
     * @return true if the event was consume by at least one
     * component, false otherwise.
     * @private
     */
    function processEvent(component, event) {
        if (! event || ! component) {
            return false;
        }

        var sent = false,
            i = 0,
            listener = null,
            ev = null;

        for (i = 0; i <listeners.length; i++) {
            listener = listeners[i];
            // Skip the sender if we're the sender
            if (listener.component !== component) {
                // Check match method
                // We clone the event to avoid modification impact
                ev = DE_AKQUINET.utils.clone(event);
                ev.source = component;

                if (listener.match.apply(listener.component, [ev])) {
                    listener.callback.apply(listener.component, [ev]);
                    sent = true;
                }
            }
        }

        return sent;
    }

    /**
     * Public hub interface
     * @scope DE_AKQUINET.hubu
     */
    return {

        /**
         * Gets all plugged components.
         * Do not modified the result !
         * @return the list of plugged components.
         */
        getComponents : function() {
            return components;
        },

        /**
         * Looks for one specific component plugged to the hub.
         * This lookup is based on the component 'getComponentName'
         * method.
         * @param {String} name the component name
         * @return the component with the matching name or 'null'
         * if the component is not plugged.
         */
        getComponent : function(name) {
            // If name is null, return null
            if (! name) {
                return null;
            }

            var i = 0,
                cmp = null,
                fc = null,
                n = null;

            for (i = 0; i < components.length; i++) {
                cmp = components[i];
                // Check that we have the getComponentName function
                fc = cmp.getComponentName;
                if (DE_AKQUINET.utils.isFunction(fc)) {
                    n = fc.apply(cmp, []); // Invoke the method.
                    if (name === n) {
                        // Only on match, just return.
                        return cmp;
                    }
                }
            }
            // Not found
            return null;
        },

        /**
         * Registers a new component on the hub.
         * If the component already exists, the registration is ignored. The lookup
         * is based on the 'getComponentName' method.
         * This method allows to configure the component.Once successfully registered,
         * the hub call the 'configure' method on the component passing a reference
         * on the hub and the configuration to the component.
         * If component is null, the method throws an exception.
         * @param {DE_AKQUINET.AbstractComponent} component the component to register
         * @param {Object} configuration the component configuration (optional).
         * If the configuration contain the 'component_name' key, the component
         * takes this name.
         * @return the current hub
         */
        registerComponent : function(component, configuration) {
            if (!component) {
                throw "Cannot register component - component is null";
            }

            // Check the validity of the component.
            if (! checkComponent(component)) {
                if (component.getComponentName) {
                    throw component.getComponentName() + " is not a valid component";
                } else {
                    throw component + " is not a valid component";
                }
            }

            // First check that we don't have already this component
            // We can call getComponentName as we have check the component
            if (this.getComponent(component.getComponentName())) {
                // If the component is already plugged, we return immediately
                return this;
            }

            // Add the component at the end of the list.

           (this.getComponents()).push(component);

           // Manage component_name
           if (configuration && configuration.component_name) {
               // Set a field containing the name
               component.__name__ = configuration.component_name;
               // Replace the method.
               component.getComponentName = function() {
                   return this.__name__;
               };
           }

            // Inject the hub.
            if (component.__hub__ === undefined  && component.hub === undefined) {
                component.__hub__ = this;
                component.hub = function() {
                    return this.__hub__;
                }
            }

           // Call configure on the component
           // We pass the current hub
           component.configure(this, configuration);

           // If we're already started, call start
           if (started) {
               component.start();
           }

           // Return the current hub
           return this;
        },

        /**
         * Unregisters the given component.
         * If the component is not plugged to the hub, this method does nothing.
         * @param {Object} component either the component object ({DE_AKQUINET.AbstractComponent})
         * or the component name {String}
         * @return the current hub.
         */
        unregisterComponent : function(component) {
            // Check parameter
            var cmp, idx;

            // If component is null, return immediately
            if (! component) {
                return this;
            }


            if (typeof component === "string") {
               cmp = this.getComponent(component);
               // If the component is not plugged,
               // Exit immediately
               if (! cmp) {
                   return this;
               }
            } else {
                if (! checkComponent(component)) {
                    throw component + " is not a valid component";
                } else {
                    cmp = component;
                }
            }

            // Iterate on the components array to find the component to
            // unregister.
            idx = DE_AKQUINET.utils.indexOf(components, cmp); // Find the index
            if (idx !== -1) { // Remove it if really found
                // Unregister all services.
                DE_AKQUINET.hubu.registry.unregisterAllServicesFromComponent(cmp);

                // Call stop on the component
                cmp.stop();
                this.unregisterListener(cmp);
                components.splice(idx, 1);
            }

            return this;
        },

        /**
         * Starts the hub.
         * This method calls start on all plugged components.
         * This method does nothing is the hub is already started.
         * @return the hub
         */
        start : function() {
            var i = 0;

            if (started) {
                return this;
            }
            started = true;
            for (i = 0; i < components.length; i++) {
                // Only valid component can be plugged
                // So we can call start directly.
                components[i].start();
            }
            return this;
        },

        /**
         * Stops the hub.
         * This method calls stop on all plugged components.
         * If the hub is not started, this methods does nothing.
         * @return the hub
         */
        stop : function() {
            var i;
            if (! started ) {
                return this;
            }
            started = false;
            for (i = 0; i < components.length; i++) {
                // Only valid component can be plugged
                // So we can call stop directly.
                components[i].stop();
            }
            return this;
        },

        /**
         * Binds a component to another component.
         * @param {Object} binding this object describes the binding.
         * It contains:
         * <ul>
         * <li>component : the component to inject ({String} or {DE_AKQUINET.AbstractComponent} object)</li>
         * <li>to : the component receiving the 'component' ({String} or {Component}DE_AKQUINET.AbstractComponent} object)</li>
         * <li>into : where the component is injected, it can be either a function (called on 'to' with 'component' as parameter),
         * or a {String}. In this latter case,'to'.'into' is injected. If it's a function the function is called, if it's an object
         * it is just injected (assigned).</li>
         * <li>contract</li> : The binding contract (i.e. interface) (optional). The contract is a simple object defining the methods
         * that the destination can invoke on the source. If the source is not conform to the contract, the binding is rejected. The
         * contract is a kind of interface. By default a proxy implementing the contract is injected enforcing the contract-based
         * interaction. However, you can disable the proxy by setting <tt>proxy:false</tt></li>
         * <li>proxy</li> : boolean indicating if proxies are enabled or disabled. By default they are enabled if <tt>contract</tt> is
         * set, however, setting proxy to false enables the injection of a direct reference.
         * @return the current hub
         */
        bind : function(binding) {
            // First check that all parameters are here
            if (! binding.component  || ! binding.to || ! binding.into) {
                throw "Cannot bind components - component, to and into must be defined";
            }


            var component,  // the first component
                to, // the computed destination
                injector; // the injection placeholder

            // Get the first component object
            // Two cases, either component is a String, or an Object
            if (typeof binding.component === "string") {
               component = this.getComponent(binding.component);
               // If the component is not plugged, i.e. lookup failed
               if (! component) {
                   throw "Cannot bind components - 'component' is not plugged to the hub";
               }
            } else { // It's a component
                if (! checkComponent(binding.component)) {
                    throw binding.component + " is not a valid component";
                } else {
                    component = binding.component;
                }
            }

            if (binding.contract) {
                // A contract is set, check that the component is confform to the contract
                // We cannot do this checking before because the component was unknown
                if (! DE_AKQUINET.utils.isObjectConformToContract(component, binding.contract)) {
                    throw "Cannot bind components - 'component' is not conform to the contract";
                } else {
                  // Do we have to create a proxy ?
                  if (binding.proxy === undefined  || binding.proxy) {
                    // Create the proxy
                    component = DE_AKQUINET.utils.createProxyForContract(binding.contract, component);
                  } // else {
                        // Direct injection
                        // component = component so nothing to do.
                    // }
                }
            }

            // Get the second component (to)
            // Two cases, either component is a String, or an Object
            if (typeof binding.to === "string") {
               to = this.getComponent(binding.to);
               // If the component is not plugged,
               if (! to) {
                   throw "Cannot bind components - 'to' is not plugged to the hub";
               }
            } else { // It's a component
                if (! checkComponent(binding.to)) {
                    throw binding.to + " is not a valid component";
                } else {
                    to = binding.to;
                }
            }

            // Detect injection mechanism
            // First case, into is a function
            if (DE_AKQUINET.utils.isFunction(binding.into)) {
                // We call the function on the 'to' object
                // We pass 'component' as parameter
                binding.into.apply(to, [component]);
            } else if (typeof binding.into === "string") {
                // Lookup the member
                injector = to[binding.into];
                if (! injector) {
                    // Just create the member and inject it
                    to[binding.into] = component;
                } else {
                    // injector already exist
                    // if it's a function call the function otherwise
                    // assign the value
                    if (DE_AKQUINET.utils.isFunction(injector)) {
                        injector.apply(to, [component]);
                    } else {
                        to[binding.into] = component;
                    }
                }
            } else {
                // Unsupported case
                throw ("Cannot bind components = 'into' must be either a function or a string");
            }

            return this;
        },

        /**
         * Gets listeners.
         * Do not modified the result !
         * @return the list of registered listeners.
         */
        getListeners : function() {
            return listeners;
        },

        /**
         * Registers a listener.
         * @param {DE_AKQUINET.AbstractComponent} component : the
         * component registering the listener
         * @param {Function} match : the method called to check if the event
         * matches. This method must returns true or false.
         * @param {Function} callback : the callback method to invoke when
         * a matching event is sent
         */
        registerListener : function(component, match, callback) {
          // Nothing can be null
          if (! component || ! callback || ! match) {
              throw "Cannot register the listener - all parameters must be defined";
          }

          // check that the component is plugged to the hub
          // we don't have to check if the component is valid, because
          // only valid components can be plugged to the hub.
          var idx = DE_AKQUINET.utils.indexOf(components, component);
          if (idx == -1) {
              throw "Cannot register the listener - The component is not plugged to the hub";
          }

          // Add the lister to the listener list:
          // Create the object
          var listener = {
              'component': component,
              'callback' : callback,
              'match' : match
          };
          // Add the object at the end of the listener array
          listeners.push(listener);
          return this;
        },

        /**
         * Registers a configurable listener.
         * @param {DE_AKQUINET.AbstractComponent} component : the component
         * registering the listener
         * @param {Object} conf : the configuration object. This object must
         * at least contain 'match' (match function) and 'callback' (the callback)
         */
        registerConfigurableListener : function(component, conf) {
          // Nothing can be null
          if (! component || ! conf || ! conf.match  || ! conf.callback) {
              throw "Cannot register the listener - all parameters must be defined";
          }

          // check that the component is plugged to the hub
          // we don't have to check if the component is valid, because
          // only valid components can be plugged to the hub.
          var idx = DE_AKQUINET.utils.indexOf(components, component);
          if (idx == -1) {
              throw "Cannot register the listener - The component is not plugged to the hub";
          }

          // Add the lister to the listener list:
          // Create the object
          var listener = {
              'component': component,
              'callback' : conf.callback,
              'match' : conf.match
          };
          // Add the object at the end of the listener array
          listeners.push(listener);

          return this;
        },

        /**
         * Unregisters listeners for the given component.
         * According to the arguments, several cases
         * can happen:
         * 'component' can be either a String of a Component.
         * In case of the string, we look up for the component using
         * 'getComponentName'.
         * If 'callback' is defined, only the listener matching component
         * and callback will be unregistered. Otherwise all listeners of the
         * component will be unregistered.
         * If 'component' is null, this methods does nothing.
         * @param {DE_AKQUINET.AbstractComponent} component the component
         * @param {Function} callback the callback function (optional)
         * @return the current hub
         *
         */
        unregisterListener : function(component, callback) {
            // Check that we have at least a correct component
            if (! component) {
                return this;
            }

            var cmp; // The computed component
            // Two cases, either component is a String, or an Object
            if (typeof component === "string") {
               cmp = this.getComponent(component);
               // If the component is not plugged,
               // Exit immediately
               if (! cmp) {
                   return this;
               }
            } else { // It's a component
                if (! checkComponent(component)) {
                    throw component + " is not a valid component";
                } else {
                    cmp = component;
                }
            }

            // So, here cmp is the component.
            var toRemove = [];
            var i; // Loop index;
            var listener;
            if (callback) {
                // Must lookup component and callback
                for (i = 0; i < listeners.length; i++) {
                    listener = listeners[i];
                    if (listener.component == cmp  && listener.callback == callback) {
                        // Match
                        toRemove.push(listener);
                    }
                }
            } else {
                for (i = 0; i < listeners.length; i++) {
                    listener = listeners[i];
                    if (listener.component == cmp) {
                        // Match
                        toRemove.push(listener);
                    }
                }
            }

            // We must remove all listeners contained in toRemove
            for (i = 0; i < toRemove.length; i++) {
                var idx = DE_AKQUINET.utils.indexOf(listeners, toRemove[i]); // Find the index
                if (idx != -1) { // Remove it if really found, that should always be the case.
                    listeners.splice(idx, 1);
                }
            }
        },

        /**
         * Sends an event inside the hub.
         * If component or event is null, the method
         * does nothing. If not, the event processed
         * and sent to all matching listeners.
         * @param {DE_AKQUINET.AbstractComponent} component
         * the component sending the event
         * @param {Object} event the event
         * @return true if the event was delivered to at least
         * one component, false otherwise
         */
        sendEvent : function(component, event) {
            if (! component || ! event) {
                return false;
            }

            return processEvent(component, event);
        },

		/**
         * Subscribes to a specific topic.
         * @param {DE_AKQUINET.AbstractComponent} component : the
         * component registering the listener
         * @param {String} topic : the topic (Regexp)
         * @param {Function} callback : the callback method to invoke when
         * a matching event is sent
         * @param {Function} filter : optional method to filter received events.
         */
		subscribe : function(component, topic, callback, filter) {
			if (! component || ! topic || ! callback) {
				return this;
			}

			var match;
			var regex = new RegExp(topic);
			if (!filter  || !DE_AKQUINET.utils.isFunction(filter)) {
				match = function(event) {
					return regex.test(event.topic);
				};
			} else {
				match = function(event) {
					return regex.test(event.topic)  && filter(event);
				};
			}

			this.registerConfigurableListener(component, {
				'match' : match,
				'callback' : callback,
				'topic' : topic // Useless but just for information
			});

			return this;

		},

		/**
		 * Unsubscribes the subscriber.
		 * @param {Object} component the component
		 * @param {Function} callback the registered callback
		 */
		unsubscribe : function(component, callback) {
			return this.unregisterListener(component, callback);
		},

		/**
         * Publishes an event to a specific topic.
         * If component, topic or event is null, the method
         * does nothing. If not, the event is processed
         * and sent to all matching listeners.
         * @param {DE_AKQUINET.AbstractComponent} component
         * the component sending the event
         * @param {String} topic the topic
         * @param {Object} event the event
         * @return true if the event was delivered to at least
         * one component, false otherwise
         */
		publish : function(component, topic, event) {
			if (! component || ! topic || ! event) {
				return false;
			}
			event.topic = topic;
			return this.sendEvent(component, event);
		},

        /**
         * For testing purpose only !
         * Resets the hub.
         */
        reset: function() {
            this.stop();
            components = [];
            listeners = [];
            if (DE_AKQUINET.hubu.registry != undefined) {
                DE_AKQUINET.hubu.registry.services = [];
                DE_AKQUINET.hubu.registry.nextid = -1;
            }
            return this;
        },

        registerService : function(contract, component, properties) {
            return DE_AKQUINET.hubu.registry.registerService(contract, component, properties);
        },

        getServiceReference : function(contract) {
            var services = DE_AKQUINET.hubu.registry.getServiceReferencesByContract(contract);
            if (services != null  && services.length > 0) {
                return services[0];
            }
            return null;
        },

        getServiceReferences : function(contract) {
            return DE_AKQUINET.hubu.registry.getServiceReferencesByContract(contract);
        },

        getService: function(contract) {
            var refs = this.getServiceReference(contract);
            if (refs !== null) {
                return this.getServiceForReference(refs);
            }
            return null;
        },

        getServices: function(contract) {
            var objects = [],
                refs = this.getServiceReferences(contract),
                i = 0;

            if (refs !== null) {
                for (; i < refs.length; i++) {
                    objects.push(this.getServiceForReference(refs[0]));
                }
            }
            return objects;
        },

        getServiceForReference : function(reference) {
            return reference.component;
        },

        unregisterService : function(reg) {
            DE_AKQUINET.hubu.registry.unregisterService(reg);
        }
    };
} ();



/**
 * Hub alias.
 * This is the main access to the H-Ubu framework.
 */
hub = DE_AKQUINET.hubu;



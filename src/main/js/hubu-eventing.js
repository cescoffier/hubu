(function(hub) {
    this.hub = hub;

    /**
     * The registered listeners
     * @private
     */
    this.listeners = [];

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
    this.processEvent = function(component, event) {
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

    // Populate the hub.

    /**
     * Gets listeners.
     * Do not modified the result !
     * @return the list of registered listeners.
     */
    this.hub.getListeners = function() {
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
        this.hub.registerListener = function(component, match, callback) {
            // Nothing can be null
            if (! component || ! callback || ! match) {
                throw "Cannot register the listener - all parameters must be defined";
            }

            // check that the component is plugged to the hub
            // we don't have to check if the component is valid, because
            // only valid components can be plugged to the hub.
            var idx = DE_AKQUINET.utils.indexOf(hub.getComponents(), component);
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
        this.hub.registerConfigurableListener = function(component, conf) {
            // Nothing can be null
            if (! component || ! conf || ! conf.match  || ! conf.callback) {
                throw "Cannot register the listener - all parameters must be defined";
            }

            // check that the component is plugged to the hub
            // we don't have to check if the component is valid, because
            // only valid components can be plugged to the hub.
            var idx = DE_AKQUINET.utils.indexOf(hub.getComponents(), component);
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
        this.hub.unregisterListener = function(component, callback) {
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
                if (! DE_AKQUINET.utils.isComponent(component)) {
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
        this.hub.sendEvent = function(component, event) {
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
        this.hub.subscribe = function(component, topic, callback, filter) {
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

            hub.registerConfigurableListener(component, {
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
     hub.unsubscribe = function(component, callback) {
            return hub.unregisterListener(component, callback);
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
        this.hub.publish = function(component, topic, event) {
            if (! component || ! topic || ! event) {
                return false;
            }
            event.topic = topic;
            return hub.sendEvent(component, event);
        }


})(DE_AKQUINET.hubu);

console.dir(DE_AKQUINET.hubu);
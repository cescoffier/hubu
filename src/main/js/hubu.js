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
 * Extensions objects storing the h-ubu extensions.
 * @default {}
 */
DE_AKQUINET.extensions = DE_AKQUINET.extensions || {};

/**
 * H-Ubu module.
 * This module defines the H-UBU framework.
 * @return hubu
 * @namespace
 */
DE_AKQUINET.hubu = function() {

    /**
     * The component plugged to the hub.
     * @type {Array}
     * @private
     */
    var components = [],

    /**
     * Is the hub started.
     * @private
     */
    started = false;


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

            for (; i < components.length; i++) {
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
            var ext; // Extension.

            if (!component) {
                throw "Cannot register component - component is null";
            }

            // Check the validity of the component.
            if (! DE_AKQUINET.utils.isComponent(component)) {
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

            // Notify extensions
            for (ext in DE_AKQUINET.extensions) {
                DE_AKQUINET.utils.invoke(DE_AKQUINET.extensions[ext], "registerComponent", [component]);
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
            var cmp, idx, ext;

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
                if (! DE_AKQUINET.utils.isComponent(component)) {
                    throw component + " is not a valid component";
                } else {
                    cmp = component;
                }
            }

            // Iterate on the components array to find the component to
            // unregister.
            idx = DE_AKQUINET.utils.indexOf(components, cmp); // Find the index
            if (idx !== -1) { // Remove it if really found

                // Notify all extensions
                for (ext in DE_AKQUINET.extensions) {
                    DE_AKQUINET.utils.invoke(DE_AKQUINET.extensions[ext], "unregisterComponent", [cmp]);
                }
                // Call stop on the component
                cmp.stop();
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
         * For testing purpose only !
         * Resets the hub.
         */
        reset: function() {
            var ext = null, i = 0;

            this.stop();

            for (ext in DE_AKQUINET.extensions) {
                DE_AKQUINET.utils.invoke(DE_AKQUINET.extensions[ext], "reset", []);
            }

            components = [];

            return this;
        }
    };
} ();

/**
 * Defines component states.
 * @type {Object}
 */
DE_AKQUINET.ComponentState = {
    STOPPED: 0,
    INVALID : 1 ,
    VALID : 2
}

/**
 * Hub alias.
 * This is the main access to the H-Ubu framework.
 */
hub = DE_AKQUINET.hubu;



/**
 * Hubu Binding extension
 * This extension allows to bind components together.
 * It is recommended to use <tt>topics</tt>.
 * @constructor
 * @class
 */
DE_AKQUINET.binding = function (hubu) {
    /**
    * The given hub.
    * @private
    * @memberOf HubuBindingExtension
    */
    var hub = hubu;

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
     * @methodOf DE_AKQUINET.hubu
     */
    hub.bind = function(binding) {
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
            if (! DE_AKQUINET.utils.isComponent(binding.component)) {
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
            if (! DE_AKQUINET.utils.isComponent(binding.to)) {
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
    }

    return {
        // Nothing to implement here.
    }


};

DE_AKQUINET.extensions.binding =  new DE_AKQUINET.binding(DE_AKQUINET.hubu);
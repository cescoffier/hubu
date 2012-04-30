/**
 * DE_AKQUINET package declaration.
 * This declaration makes sure to not erase the
 * current declaration. If the package does not
 * exist an empty object is created.
 * @default {}
 */
var DE_AKQUINET = DE_AKQUINET || {};

/**
 * DE_AKQUINET.utils namespace.
 * This namespace is just an object containing
 * utilities methods (static). If the namespace is
 * already defined, we keep the namespace.
 * @default {}
 * @namespace
 */
DE_AKQUINET.utils =  DE_AKQUINET.utils || { };

/**
 * Checks that the given object is conform to the given contract
 * The contract is a javascript object.
 * The conformity is computed as follow:
 * <code>
 * O is conform to C if and only if for all i in C where C[i] != null
 * O[i] != null && typeof(C[i]) = typeOf(O[i])
 * </code>
 * This is an implementation of 'Chi':
 * <code>Metamodel <- chi <- Model -> mu -> System</code>
 * where chi is : isObjectConformToContract and mu is representationOf.
 * @param object the object to check
 * @param contract the contract
 * @return true if the object is conform with the given contract, false
 * otherwise.
 */
DE_AKQUINET.utils.isObjectConformToContract = function(object, contract) {
    // For all 'properties' from contract, check that the object
    // has an equivalent property
    var i;
    for (i in contract) {
        // We need to check that the property is defined.
        if (object[i] === undefined) {
            DE_AKQUINET.utils.warn("Object not conform to contract - property " + i + " missing");
            return false;
        } else {
            // Check type
            if (typeof(contract[i]) != typeof (object[i])) {
                DE_AKQUINET.utils.warn("Object not conform to contract - property " + i +
                    " has a type mismatch: " + typeof(contract[i]) + " != " + typeof (object[i]));
                return false;
            }
        }
    }
    return true;
};

/**
 * Logs a message.
 * The message is propagated to the console object is this console object
 * is defined.
 * @param {String} message the message to log
 */
DE_AKQUINET.utils.log = function(message){
    if (console !== undefined && console.error !== undefined) {
        console.log(message);
    }
};

/**
 * Logs a message using <code>console.error</code>.
 * The message is propagated to the console object is this console object
 * is defined.
 * @param {String} message the message to log
 */
DE_AKQUINET.utils.error = function(message){
    if (console !== undefined  && console.error !== undefined) {
        console.error(message);
    }
};

/**
 * Logs a message using <code>console.warn</code>.
 * The message is propagated to the console object is this console object
 * is defined.
 * @param {String} message the message to log
 */
DE_AKQUINET.utils.warn = function(message){
    if (console !== undefined && console.warn !== undefined) {
        console.warn(message);
    }
};

/**
 * Utility method to check if the given object
 * is a function. This code comes from JQuery.
 * @param {Object} obj the object to test
 * @returns true if the given object is a function
 */
DE_AKQUINET.utils.isFunction = function(obj) {
    // We need to specify the exact function
    // because toString can be overriden by browser.
    return Object.prototype.toString.call(obj) === "[object Function]";
};

/**
 * Clones the given object. This create a deep copy of the
 * given object.
 * @param {Object} object the object to clone
 * @return the cloned object
 */
DE_AKQUINET.utils.clone = function(object) {
    var i, // index
        toStr = Object.prototype.toString, // toString method
        astr = "[object Array]", // The toString returned value for an array.
        newObj = (toStr.call(object[i] === astr) ? [] : {});
    for (i in object) {
        if (object.hasOwnProperty(i)) {
            if (typeof object[i] === "object") {
                newObj[i] = DE_AKQUINET.utils.clone(object[i]);
            } else {
                newObj[i] = object[i];
            }
        }
    }
    return newObj;
};

/**
 * Creates a proxy hiding the given object. The proxy
 * implements the contract (and only the contract).
 * @param {Object} contract the contract
 * @param {Object} object the object to proxy
 * @return the proxy
 */
DE_AKQUINET.utils.createProxyForContract = function(contract, object) {
    var proxy = {},
        i;

    // We inject the proxied objects
    proxy.__proxy__ = object;

    for (i in contract) {
        if (this.isFunction(contract[i])) {
            // To call the correct method, we create a new anonymous function
            // applying the arguments on the function itself
            // We use apply to pass all arguments, and set the target
            // The resulting method is stored using the method name in the
            // proxy object
            proxy[i] = DE_AKQUINET.utils.bind(object, object[i]);
        } else {
            // Everything else is just referenced.
            proxy[i] = object[i];
        }
    }

    return proxy;
};

/**
 * Creates a function object calling the
 * method m on the object o with the correct parameters.
 * @param {Object} o the object
 * @param {Object} m the method
 * @return {Function} the function calling <code>o.m(arguments)</code>
 */
DE_AKQUINET.utils.bind = function(o, m) {
    return function() {
        return m.apply(o, [].slice.call(arguments));
    };
};

/**
 * indexOf function.
 * This method delegates on Array.indexOf if
 * it exists. If not (IE), it just implements
 * its own indexof.
 * @param {Object} array the array
 * @param {Object} obj the object
 * @return the index of the object 'obj' in the array or
 * -1 if not found.
 */
DE_AKQUINET.utils.indexOf = function(array, obj) {
    var i;
    if (Array.indexOf) {
        // We just delegate hoping some native code (optimization)
        return array.indexOf(obj);
    } else {
        // Simple lookup
        for(i = 0; i < array.length; i++){
            if(array[i] == obj){
                return i;
            }
        }
        return -1;
    }
};

/**
 * Loads a javascript script dynamically.
 * This method requires the DOM, so cannot be used
 * in a browser-less environment.
 * This method does not check if the script was already
 * loaded.
 * @param {String} the url of the script
 * @return true if the script was loaded correctly,
 * false otherwise
 */
DE_AKQUINET.utils.loadScript = function(url) {
    if (typeof document === "undefined") {
        return false;
    }
    var fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", url);
    document.getElementsByTagName("head")[0]
        .appendChild(fileref);
    return true;
};
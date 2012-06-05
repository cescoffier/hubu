/**
 * Represents the different type of service events
 * @type {Object}
 */
DE_AKQUINET.ServiceEventType = {
    // TODO Support service modification
    REGISTERED : 1,
    //MODIFIED : 2,
    UNREGISTERING : 4
    //MODIFIED_ENDMATCH : 8
}

/**
 * Hubu Service extension.
 * This extension manages the service bindings between components.
 * @class
 * @constructor
 */
DE_AKQUINET.service = function (hub) {
    /**
     * The list of services (service registration).
     * @type {Array} of Service Registration.
     */
    var services = [];

    /**
     * The list of listeners.
     * @type {Array} of Service Listener
     */
    var listeners = [];
    /**
     * The id counter.
     */
    var nextid = 0;

    /**
     * Creates a service registration
     * @param details the details of the registration. It must contains <tt>id</tt>, <tt>contract</tt>, <tt>component</tt>,
     * <tt>hub</tt>, <tt>properties</tt>.
     * @constructor
     * @private
     */
    var ServiceRegistration = function (details) {
        this.id = details.id;
        this.contract = details.contract;
        this.component = details.component;
        this.registered = true;
        this.hub = details.hub;
        this.properties = details.properties;

        if (this.properties === undefined || this.properties === null) {
            this.properties = {}
        } else {
            this.properties = details.properties;
        }

        this.properties.id = details.id;
        this.properties.service = details.service;

        // Validate
        if (this.id === null || this.component === null || this.contract === null || this.hub === null) {
            throw {
                'error':'invalid service registration',
                'id':details.id,
                'component':this.component,
                'registered':this.registered,
                'hub':this.hub,
                'contract':this.contract
            }
        }

        this.reference = new ServiceReference(this);

        this.getReference = function() {
            return this.reference;
        }

        this.unregister = function () {
            this.registered = false;
            hub.unregisterService(this);
        }

        this.getProps = function () {
            return this.properties;
        }
    };

    /**
     * Creates a service reference.
     * @param reg the attached service registration.
     * @constructor
     * @private
     */
    var ServiceReference = function (reg) {
        this.registration = reg

        this._validate = function() {
            if (reg === null  || reg === undefined) {
                throw {
                    "message": "No registration for this service reference"
                }
            }

            if (! reg.registered) {
                throw {
                    "message": "The service is unregistered"
                }
            }
        }

        this.getService = function() {
            this._validate();
            return reg.component;
        }

        this.getProps = function () {
            this._validate();
            return this.registration.getProps();
        }

        this.getProperty = function(name) {
            this._validate;
            return this.registration.getProps()[name];
        }
    };

    /**
     * Service Events.
     * @param ref the service reference
     * @param type {DE_AKQUINET.ServiceEventType} the type of event
     * @constructor
     */
    var ServiceEvent = function (ref, type) {
        this.reference = ref;
        this.type = type;
    }

    var notifyServiceArrival = function(reg) {
        var index = 0;
        for (; index < listeners.length; index++) {
            if (listeners[index].matches(reg.getReference())) {
                listeners[index].serviceChanged(new ServiceEvent(reg.getReference(),
                    DE_AKQUINET.ServiceEventType.REGISTERED));
            }
        }
    }

    var notifyServiceDeparture = function(reg) {
        var index = 0;
        for (; index < listeners.length; index++) {
            if (listeners[index].matches(reg.getReference())  && reg.registered) {
                listeners[index].serviceChanged(new ServiceEvent(reg.getReference(),
                    DE_AKQUINET.ServiceEventType.UNREGISTERING));
            }
        }
    }

    /**
     * Creates a service registration
     * @param details the details of the registration. It must contains <tt>id</tt>, <tt>contract</tt>, <tt>component</tt>,
     * <tt>hub</tt>, <tt>properties</tt>.
     * @constructor
     * @private
     */
    var ServiceDependency = function (details) {
        this.contract = details.contract;
        this.component = details.component;
        this.hub = details.hub;
        this.filter = details.filter  || null;
        this.optional = details.optional || false;
        this.aggregate = details.aggregate  || false;
        this.field = details.field  || null;
        this.bind = details.bind  || null;
        this.unbind = details.unbind || null;
        this.proxy = details.proxy || true;

        // Validation
        if (this.contract === undefined || this.contract === null) {
            throw {
                message: 'invalid service dependency, contract missing',
                contract: this.contract
            }
        }

        if (this.component === undefined || this.component === null) {
            throw {
                message: 'invalid service dependency, component missing',
                component: this.component
            }
        }

        if (this.field === null  && this.bind === null) {
            throw {
                message: 'invalid service dependency, no injector define, either field or bind must be set',
                contract: this.contract,
                field : this.field,
                bind : this.bind,
                unbind : this.unbind
            }
        }

        this.onServiceDeparture = function(details) {

        }

        this.onServiceArrival = function(details) {
            if (this.aggregate) {
                this.inject(details);
            }
        }

        this.inject = function(options) {

        }

        //this.hub.registerServiceListener(this, this.contract, this.filter);


    };

    hub.registerService = function (service, component, properties) {
        // Increment the service.id
        var id = nextid,
            reg;

        nextid = nextid + 1;

        reg = {
            'contract':service,
            'component':component,
            'id':id,
            'properties':properties,
            'hub':this
        };

        reg = new ServiceRegistration(reg);
        services.push(reg);
        notifyServiceArrival(reg);
        return reg;
    };

    hub.unregisterService = function (reg) {
        var index = findServiceIndexById(reg.id),
            removedService = null,
            i = 0;

        if (index !== -1) {
            removedService = services.splice(index, 1);
            // Call unregister on all service registrations.
            for (; i < removedService.length; i++) {
                notifyServiceDeparture(reg);
                removedService[i].unregister();
            }
        }

        return removedService;
    };


    var unregisterAllServicesFromComponent = function (component) {
        var removedService = null,
            i = 0,
            indexes = [];

        for (; i < services.length; i++) {
            if (services[i].component === component) {
                indexes.push(i);
                notifyServiceDeparture(services[i]);
                services[i].unregister();
            }
        }

        return removedService;
    };

    /**
     * Finds all registered services with a matching contract.
     * @param contract the service contract
     * @return {Array} of Service Reference, empty if no services are found.
     * @methodOf DE_AKQUINET.hubu
     */
    hub.findServices = function (contract) {
        var svc = [];
        var i = 0;
        for (; i < services.length; i++) {
            if (services[i].contract === contract) {
                svc.push(services[i].getReference());
            }
        }
        return svc;
    };

    /**
     * Find a registered service with a matching contract.
     * @param contract the service contract
     * @return the Service Reference or <code>null</code> if not found.
     * @methodOf DE_AKQUINET.hubu
     */
    hub.findService = function (contract) {
        var i = 0;
        for (; i < services.length; i++) {
            if (services[i].contract === contract) {
                return services[i].getReference();
            }
        }
        return null;
    };

    /**
     * Gets the service registration index using the given id.
     * @param id the id
     * @return {Number} the service registration index in the <tt>services</tt> list. <code>-1</code> if not found.
     */
    var findServiceIndexById = function (id) {
        var i = 0;
        for (; i < services.length; i++) {
            if (services[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    hub.getService = function (contract) {
        var ref = hub.findService(contract);
        if (ref !== null) {
            return this.getServiceForReference(ref);
        }
        return null;
    };

    hub.getServices = function (contract) {
        var objects = [],
            refs = this.findService(contract),
            i = 0;

        if (refs !== null) {
            for (; i < refs.length; i++) {
                objects.push(this.getServiceForReference(refs[0]));
            }
        }
        return objects;
    };

    hub.registerServiceListener = function(listener) {
        listeners.push(listener);
        return this;
    }

    hub.unregisterServiceListener = function(listener) {
        HUBU.UTILS.removeElementFromArray(listeners, listener);
        return this;
    }

    hub.getServiceForReference = function (reference) {
        if (reference === null) {
            return null;
        }
        return reference.getService();
    };

    var reset = function() {
        nextid = 0;
        services = [];
        listeners = [];
    };

    var registerComponent = function (cmp) {
        // Populate the component - provides
        HUBU.UTILS.defineFunctionIfNotExist(cmp, "provides", function(options) {
            this.__hub__.registerService(options.contract, this, options.props);
        });

        HUBU.UTILS.defineFunctionIfNotExist(cmp, "requires", function(options) {
            this.__hub__.registerService(contract, this, props);
        });

    };

    var unregisterComponent = function (cmp) {
        unregisterAllServicesFromComponent(cmp);
    }

    // Public section
    return {
        reset: reset,
        registerComponent: registerComponent,
        unregisterComponent: unregisterComponent
    }
};

DE_AKQUINET.extensions.service =  new DE_AKQUINET.service(DE_AKQUINET.hubu);

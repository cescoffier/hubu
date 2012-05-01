/**
 * Hubu Service extension.
 * This extension manages the service bindings between components.
 * @class
 * @constructor
 */
DE_AKQUINET.service = function (hub) {
    /**
     * The list of services (service registration).
     */
    var services = [];
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

        this.unregister = function () {
            this.registered = false;
            hub.unregisterService(this);
        }

        this.getProps = function () {
            return this.properties;
        }
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
            'hub':this,
            'id':id
        };

        services.push(new ServiceRegistration(reg));
        //notify();
        return reg;
    };

    hub.unregisterService = function (reg) {
        var index = findServiceIndexById(reg.id),
            removedService = null;

        if (index !== -1) {
            removedService = services.splice(index, 1);
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
            }
        }

        for (i = indexes.length; i > 0; i--) {
            services.splice(indexes[i], 1);
        }

        return removedService;
    };

    hub.findServices = function (contract) {
        var svc = [];
        var i = 0;
        for (; i < services.length; i++) {
            if (services[i].contract === contract) {
                svc.push(services[i]);
            }
        }
        return svc;
    };

    hub.findService = function (contract) {
        var i = 0;
        for (; i < services.length; i++) {
            if (services[i].contract === contract) {
                return services[i];
            }
        }
        return null;
    };

    var findServiceById = function (id) {
        var i = 0;
        for (; i < services.length; i++) {
            if (services[i].id === id) {
                return services[i];
            }
        }
        return null;
    };

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

    hub.getServiceForReference = function (reference) {
        return reference.component;
    };

    // Public section
    return {
        reset:function () {
            nextid = 0;
            services = [];
        },

        unregisterComponent:function (cmp) {
            unregisterAllServicesFromComponent(cmp);
        }
    }
};

DE_AKQUINET.extensions.service =  new DE_AKQUINET.service(DE_AKQUINET.hubu);

DE_AKQUINET.hubu.registry = {

    services: [],
    nextid: 0,

    ServiceRegistration: function(details) {
        this.id = details.id;
        this.contract = details.contract;
        this.component = details.component;
        this.registered = true;
        this.hub = details.hub;
        this.properties = details.properties;

        if (this.properties === undefined  || this.properties === null) {
            this.properties = {}
        } else {
            this.properties = details.properties;
        }

        this.properties.id = details.id;
        this.properties.service = details.service;

        // Validate
        if (this.id === null || this.component === null  || this.contract === null || this.hub  === null) {
            throw {
                'error': 'invalid service registration',
                'id': details.id,
                'component': this.component,
                'registered': this.registered,
                'hub' : this.hub,
                'contract' : this.contract
            }
        }

        this.unregister = function() {
            this.registered = false;
            hub.unregisterService(this);
        }

        this.getProperties = function() {
            return this.properties;
        }
    },

    registerService: function(service, component, properties) {
        // Increment the service.id
        var id = this.currentid,
            props = null,
            reg = null;

        this.nextid = this.nextid + 1;

        reg = {
            'contract': service,
            'component': component,
            'id': id,
            'properties' : properties,
            'hub' : this,
            'id' : id
        };

        this.services.push(new this.ServiceRegistration(reg));
        this.notify();
        return reg;
    },

    unregisterService: function(reg) {
        var index = this.findServiceIndexById(reg.id),
            removedService = null;

        if (index !== -1) {
            removedService = this.services.splice(index, 1);
        }

        return removedService;
    },

    notify : function(reg) {

    },

    unregisterAllServicesFromComponent: function(component) {
        var removedService = null,
            i = 0,
            indexes = [];

        for (; i < this.services.length; i++) {
            if (this.services[i].component === component) {
                indexes.push(i);
            }
        }

        for (i = indexes.length; i > 0; i--) {
            this.services.splice(indexes[i], 1);
        }

        return removedService;
    },

    getServiceReferencesByContract: function(service) {
        var svc = [];
        var i = 0;
        for (; i < this.services.length; i++) {
            if (this.services[i].contract === service) {
                svc.push(this.services[i]);
            }
        }
        return svc;
    },

    findServiceById: function(id) {
        var i = 0;
        for (; i < this.services.length; i++) {
            if (this.services[i].id === id) {
                return this.service[i];
            }
        }
        return null;
    },

    findServiceIndexById: function(id) {
        var i = 0;
        for (; i < this.services.length; i++) {
            if (this.services[i].id === id) {
                return i;
            }
        }
        return -1;
    }

}
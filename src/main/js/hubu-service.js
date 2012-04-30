/**
 * DE_AKQUINET package declaration.
 * This declaration makes sure to not erase the
 * current declaration. If the package does not
 * exist an empty object is created.
 * @default {}
 */
var DE_AKQUINET = DE_AKQUINET || {};

DE_AKQUINET.hubu = DE_AKQUINET.hubu  || {};

DE_AKQUINET.hubu.registry = {

    services: [],
    nextid: 0,


    registerService: function(service, component, properties) {
        // Increment the service.id
        var id = this.currentid,
            props = null,
            reg = null;

        this.nextid = this.nextid + 1;

        if (properties === undefined  || properties === null) {
            props = {}
        } else {
            props = properties;
        }

        props.id = id;
        props.service = service;

        reg = {
            'contract': service,
            'component': component,
            'id': id,
            'properties' : props
        };

        this.services.push(reg);

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
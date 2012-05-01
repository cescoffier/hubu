describe("Container test suite", function() {
    afterEach(function () {
        hub.reset();
    });

    it("should have the hub injected", function() {
        var cmp = {
            getComponentName: function() {
                return "test"
            },

            start: function() {},
            stop: function() {},
            configure: function() {}
        }

        hub.registerComponent(cmp);
        hub.start();

        expect(cmp.__hub__).toBe(hub);
        expect(cmp.hub()).toBe(hub);
    });

    it("should have the getComponentName injected", function() {
        var cmp = {
            getComponentName: function() {
                return "bad"
            },

            start: function() {},
            stop: function() {},
            configure: function() {}
        }

        hub.registerComponent(cmp, {'component_name': 'good'});
        hub.start();

        expect(cmp.getComponentName()).toBe('good');
    });

});
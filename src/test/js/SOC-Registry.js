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

describe("H-UBU Service Registry Tests", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should not exposed services on startup", function() {
        var registry = new SOC.ServiceRegistry(hub);
        var refs = registry.getServiceReferences(null, null);
        expect(refs.length).toBe(0)
    })

    it("should support service registration, lookup and unregistration", function() {
        var contract = {
            hello: function() {}
        }

        var component = {
            hello : function() {
                return "hello"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello" }
        }

        var registry = new SOC.ServiceRegistry(hub);
        var refs = registry.getServiceReferences(null, null);
        expect(refs.length).toBe(0);

        // Register the service
        var reg = registry.registerService(component, contract);
        expect(reg.isRegistered()).toBe(true);
        expect(reg.getProperties()["service.contract"]).toBe(contract);
        expect(reg.getProperties()["service.publisher"]).toBe(component);

        // Bind and Use
        refs = registry.getServiceReferences(null, null);
        expect(refs.length).toBe(1);

        refs = registry.getServiceReferences(contract, null);
        expect(refs.length).toBe(1);
        expect(refs[0].getContract()).toBe(contract);
        expect(registry.getService(component, refs[0]).hello()).toBe("hello");

        // Unregister
        registry.unregisterService(reg);
        refs = registry.getServiceReferences(contract, null);
        expect(refs.length).toBe(0);
    });

    it("should support service selection", function() {
        var contract = {
            hello: function() {}
        }

        var component1 = {
            hello : function() {
                return "hello"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello" }
        }

        var component2 = {
            hello : function() {
                return "bonjour"
            },
            start : function() {},
            stop : function() {},
            configure : function() {},
            getComponentName : function() { return "hello-fr" }
        }

        var registry = new SOC.ServiceRegistry(hub);
        var refs = registry.getServiceReferences(null, null);
        expect(refs.length).toBe(0);

        // Register the service
        var reg = registry.registerService(component1, contract, {lg : "en"});
        expect(reg.isRegistered()).toBe(true);
        expect(reg.getProperties()["service.contract"]).toBe(contract);
        expect(reg.getProperties()["service.publisher"]).toBe(component1);
        expect(reg.getProperties()["lg"]).toBe("en");

        var reg2 = registry.registerService(component2, contract, {lg : "fr"});
        expect(reg2.isRegistered()).toBe(true);
        expect(reg2.getProperties()["service.contract"]).toBe(contract);
        expect(reg2.getProperties()["service.publisher"]).toBe(component2);
        expect(reg2.getProperties()["lg"]).toBe("fr");

        // Bind and Use
        refs = registry.getServiceReferences(null, null);
        expect(refs.length).toBe(2);

        refs = registry.getServiceReferences(contract, null);
        expect(refs.length).toBe(2);

        refs = registry.getServiceReferences(contract, function(ref) {
            return ref.getProperty("lg") === "fr";
        });
        expect(refs.length).toBe(1);
        expect(registry.getService(component2, refs[0]).hello()).toBe("bonjour");

        // Unregister
        registry.unregisterService(reg);
        registry.unregisterService(reg2);
        refs = registry.getServiceReferences(contract, null);
        expect(refs.length).toBe(0);

        // Unregister again, this should raises an exception
        try {
            registry.unregisterService(reg);
            this.fail("The unregistration should failed, as the registration is invalid")
        } catch (exception) {
            // OK
        }



    });





});
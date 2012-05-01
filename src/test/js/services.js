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

describe("Service Mechanism Test Suite", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should be able to register a service, retrieve it, unregister it", function() {
        var contract = {
            getName: function() {}
        };

        var component = {
            hub : null,
            reg : null,
            getComponentName: function() {
                return 'source';
            },
            start: function() {
                this.reg = this.hub.registerService(contract, component)
            },
            stop: function() { },
            configure: function(hub) {
                this.hub = hub;
            },
            getName: function() {
                return "my name";
            },
            unreg: function() {
                this.hub.unregisterService(this.reg);
            }
        };


        try {
            hub
                .registerComponent(component)
                .start();
            // Check the binding
            expect(hub.getService(contract).getName()).toBe("my name");

            //Unregister the service.
            hub.getService(contract).unreg();

            expect(hub.getService(contract)).toBeNull();

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    })


    it("should unregister all services on unregistration", function() {
        var contract = {
            getName: function() {}
        };

        var component = {
            hub : null,
            reg : null,
            getComponentName: function() {
                return 'source';
            },
            start: function() {
                reg = this.hub.registerService(contract, component)
            },
            stop: function() { },
            configure: function(hub) {
                this.hub = hub;
            },
            getName: function() {
                return "my name";
            }
        };


        try {
            hub
                .registerComponent(component)
                .start();
            // Check the binding
            expect(hub.getService(contract).getName()).toBe("my name");

            //Unregister the service.
            hub.unregisterComponent(component);

            expect(hub.getService(contract)).toBeNull();

        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected error " + e);
        }
    })
});
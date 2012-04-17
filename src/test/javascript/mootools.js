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

load(basePath + "hubu.js");
load("src/test/resources/mootools-core-1.4.5-full-nocompat.js");

function testMooToolsComponent() {
    hub.reset();
    var Barn = new Class({

        call : 0,

        initialize: function() {

        },

        getComponentName : function() {
            return 'Barn';
        },

        start : function() {
        },

        stop : function() {
        },

        configure : function(hub) {
            this.call = this.call + 1;
        },

        getFowl: function(){
            return this.fowl;
        },

        setFowl: function(name){
            this.fowl = name;
            return this;
        }

    });
    var myBarn = new Barn();

    try {
        hub.registerComponent(myBarn);
        var cmps = hub.getComponents();
        assertEquals(1, cmps.length);
        assertEquals(myBarn, hub.getComponent('Barn'));

        // Check that configure was called
        assertEquals(1, myBarn.call);
        hub.getComponent("Barn").setFowl("Clement");
        assertEquals("Clement", hub.getComponent("Barn").getFowl());
    } catch (e) {
        console.log(e);
        fail("Unexpected component reject");
    }
}

function testMooToolsComponentBindings() {
    hub.reset();
    var Ted = new Class({

        call : 0,
        friend : null, // Injected

        initialize: function() {

        },

        getComponentName : function() {
            return 'Ted';
        },

        start : function() {
        },

        stop : function() {
        },

        configure : function(hub) {
            this.call = this.call + 1;
        },

        getFriend: function(){
            return this.friend;
        }

    });

    var Marshall = new Class({

        call : 0,

        initialize: function() {

        },

        getComponentName : function() {
            return 'Marshall';
        },

        start : function() {
        },

        stop : function() {
        },

        configure : function(hub) {
            this.call = this.call + 1;
        },

        getName: function(){
            return "Marshall";
        }

    });

    var ted = new Ted();
    var marshall = new Marshall();

    try {
        hub.registerComponent(ted)
            .registerComponent(marshall)
            .bind({
                component: marshall,
                to: ted,
                into: "friend"
            });

        var cmps = hub.getComponents();
        assertEquals(2, cmps.length);

        assertEquals("Marshall", hub.getComponent("Ted").getFriend().getName());

    } catch (e) {
        console.log(e);
        fail("Unexpected component reject");
    }
}
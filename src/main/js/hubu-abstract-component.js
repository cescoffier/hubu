/**
 * DE_AKQUINET package declaration.
 * This declaration makes sure to not erase the
 * current declaration. If the package does not
 * exist an empty object is created.
 * @default {}
 */
var DE_AKQUINET = DE_AKQUINET || {};


/**
 * Creates an abstract component. This method is not intended to be used,
 * and is just here for documentation purpose. Indeed, the returned object
 * contains the four required methods that <bold>all</bold> component must
 * have. Any Javascript object with those 4 methods can be cosidered as a
 * valid component.
 * The four required methods are:
 *<ul>
 * <li><code>getComponentName()<code> : return the default component name</li>
 * <li><code>configurate(hub, [configuration])</code> : configures the component</li>
 * <li><code>start()</code> / <code>stop()</code> : called when the component is started / stopped</li>
 * </ul>
 * Returned objects do not intend to be used, they are just mock / empty instances.
 * @constructor
 */
DE_AKQUINET.AbstractComponent = function() {

    /**
     * Gets the component name.
     * If an 'id' is given in the hub configuration, this method is replaced.
     * @return the component name
     * @public
     */
    this.getComponentName = function() {
        throw "AbstractComponent is an abstract class";
    };

    /**
     * Configures the component.
     * This method is called by the hub when the component starts or
     * when the component is plugged when the hub is already started.
     * @param hub the hub
     * @param configuration optional parameter used to pass the compoment
     * configuration. The configuration object is a simple map <code>
     * key/value</code>.
     * @public
     */
    this.configure = function(hub, configuration) {
        throw "AbstractComponent is an abstract class";
    };

    /**
     * Starts the component.
     * This method is called by the hub when the hub starts or
     * when the component is plugged when the hub is already started.
     * This methods is always called after the configure method.
     * Once called the component can send events and used bound
     * components.
     */
    this.start = function() {
        throw "AbstractComponent is an abstract class";
    };

    /**
     * Stop the component.
     * This method is called by the hub when the hub is stopped or
     * when the component is unplugged.
     * This methods is always called after the start method.
     * Once called, the component must not send events or
     * access bound components.
     */
    this.stop = function() {
        throw "AbstractComponent is an abstract class";
    };

};
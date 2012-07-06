###
# Hub Class
###


###
# The Hub Class.
###
HUBU.Hub = class Hub
  ###
  # The component plugged to the hub.
  # @type {Array}
  # @private
  ###
  _components : null

  ###
  # Is the hub started.
  # @private
  ###
  _started : false

  ###
  # The list of extensions plugged on this hub.
  # The extensions are created on the first hub access (either `start` or `registerComponent`)
  ###
  _extensions : null

  constructor: ->
    @_components = []
    @_started = false
    @_extensions = null

  _initialize: ->
    @_extensions = []
    for name,ext of getHubuExtensions()
      #HUBU.logger.info("Initializing new hub with the " + name + " extension")
      @_extensions.push(new ext(@))


  ###
  # Gets all plugged components.
  # *Do not modified the result !*
  # @return the list of plugged components.
  ###
  getComponents: -> return @_components

  ###
  # Looks for one specific component plugged to the hub.
  # This lookup is based on the component 'getComponentName' method.
  # @param {String} name the component name
  # @return the component with the matching name or `null` if the component is not plugged.
  ###
  getComponent : (name) ->
    # If name is null, return null
    if ! name?
      return null

    for cmp in @_components
      # Check that we have the getComponentName function
      fc = cmp.getComponentName;
      if fc? and HUBU.UTILS.isFunction(fc)
        n = fc.apply(cmp, []); # Invoke the method.
        if n is name
          # Only one match, just return.
          return cmp

    # Not found.
    return null

  ###
  # Registers a new component on the hub.
  # If the component already exists, the registration is ignored. The lookup is based on the `getComponentName` method.
  # This method allows to configure the component.Once successfully registered, the hub call the 'configure' method on
  # the component passing a reference on the hub and the configuration to the component.
  # If component is `null`, the method throws an exception.
  # @param {DE_AKQUINET.AbstractComponent} component the component to register
  # @param {Object} configuration the component configuration (optional).
  # If the configuration contain the 'component_name' key, the component takes this name.
  # @return the current hub
  ###
  registerComponent : (component, configuration) ->
    ### Validation ###
    if !component?
      throw new Exception("Cannot register component - component is null")

    # Check the validity of the component.
    if ! HUBU.UTILS.isComponent(component)
      if (component.getComponentName)
        throw new Exception(component.getComponentName() + " is not a valid component")
      else
        throw new Exception(component + " is not a valid component")
    ### End of Validation ###


    # Initialize the hub if not done already
    @_initialize() unless @_extensions isnt null

    # First check that we don't have already this component
    # We can call getComponentName as we have check the component
    if @getComponent(component.getComponentName())?
      # If the component is already plugged, we return immediately
      HUBU.logger.info("Component " + component.getComponentName() + " already registered")
      return @ # Return the hub.

    # Add the component at the end of the list.
    @_components.push(component)

    # Manage component_name
    if (configuration? && configuration.component_name?)
      # Set a field containing the name
      component["__name__"] = configuration.component_name
      # Replace the method.
      component.getComponentName = -> return this["__name__"]

    # Inject the hub.
    if (not component.__hub__? and not component.hub?)
      component.__hub__ = @;
      component.hub = -> return this.__hub__

    HUBU.logger.debug("Registering component " + component.getComponentName())
    # Notify extensions
    for ext in @_extensions
      HUBU.UTILS.invoke(ext, "registerComponent", [component])

    # Call configure on the component, we pass the current hub
    HUBU.logger.debug("Configuring component " + component.getComponentName())
    component.configure(this, configuration)

    # If we're already started, call start

    if @_started
      HUBU.logger.debug("Starting component " + component.getComponentName())
      component.start()

    HUBU.logger.debug("Component " + component.getComponentName() + " registered")
    # Return the current hub
    return @

  ###
  # Unregisters the given component.
  # If the component is not plugged to the hub, this method does nothing.
  # @param {Object} component either the component object ({DE_AKQUINET.AbstractComponent})
  # or the component name {String}
  # @return the current hub.
  ###
  unregisterComponent : (component) ->
    #### Validation ###
    # If component is null, return immediately
    if not component?
      return @;

    cmp = null
    if HUBU.UTILS.typeOf(component) is "string"
      cmp = this.getComponent(component);
      # If the component is not plugged, exit immediately
      if not cmp? then return @
    else
      if not HUBU.UTILS.isComponent(component)
        throw new Exception("Cannot unregister component, it's not a valid component").add("component", component)
      else cmp = component

    # Initialize the hub if not done already
    @_initialize() unless @_extensions isnt null

    # Iterate on the components array to find the component to unregister.
    idx = HUBU.UTILS.indexOf(@_components, cmp); # Find the index
    if idx isnt -1
      # Remove it if really found
      # Notify all extensions
      for ext in @_extensions
        HUBU.UTILS.invoke(ext, "unregisterComponent", [cmp]);
      # Call stop on the component
      cmp.stop();
      @_components.splice(idx, 1);
    else
      HUBU.logger.info("Component " + cmp.getComponentName() + " not unregistered - not on the hub")
    return @

  ###
  # Starts the hub.
  # This method calls start on all plugged components.
  # This method does nothing is the hub is already started.
  # @return the hub
  ###
  start : ->
    if @_started then return @

    # Initialize the hub if not done already
    @_initialize() unless @_extensions isnt null

    @_started = true;
    for cmp in @_components
      # Only valid component can be plugged, so we can call start directly.
      cmp.start()

    return @

  ###
  # Stops the hub.
  # This method calls stop on all plugged components.
  # If the hub is not started, this methods does nothing.
  # @return the hub
  ###
  stop : ->
    if not @_started then return @

    @_started = false;
    for cmp in @_components
      # Only valid component can be plugged, so we can call stop directly.
      cmp.stop()

    return @

  ###
  # Resets the hub.
  # You this method to rest the hub state (no components, no extensions...)
  # You can also create a new `hub` too.
  ###
  reset: ->
    @.stop()

    @_initialize() unless @_extensions isnt null

    for ext in @_extensions
      HUBU.UTILS.invoke(ext, "reset", []);

    @_components = []
    @_extensions = null

    return @

### End of th Hub Class ###

### Create the main Global hub, and the `hub` alias ###
getGlobal().hub = new HUBU.Hub()

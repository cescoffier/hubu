
###
# Hubu Eventing Extension
# This extension manages the event communications between components.
# It is recommended to use `topics` instead of direct events.
###

###
# Detects whether we exports on the Commons.js `exports` object or on `this` (so the Browser `window` object).
###
global = exports ? this

global.HUBU = global.HUBU ? {}
global.HUBU.EXTENSIONS = global.HUBU.EXTENSIONS ? {}

global.HUBU.Eventing = class Eventing
  _hub : null
  _listeners : null

  constructor : (hubu) ->
    @_hub  = hubu
    # The list of registered listeners.
    @_listeners = []

    # Populate the hub object

    ###
    # Gets the registered event listeners.
    # *Do not modified the result !*
    # @return the list of registered listeners.
    ###
    @_hub.getListeners = -> return DE_AKQUINET.extensions.eventing._listeners

    ###
    # Registers an event listener.
    # This method can take either 2 or 3 arguments. The first one is *always* the component, so two signatures are possible:
    #
    # * `registerListener(component, match, callback)` where `match` is the matching function and `callback` is the
    # reception callback.
    # * `registerListener(component, conf)` where `conf` is an object containing `match` and `callback` specifying
    # respectively the event matching method and the reception callback.
    #
    # @param {DE_AKQUINET.AbstractComponent} component : the component registering the listener
    # @param {Function} match : the method called to check if the event matches. This method must returns true or false.
    # @param {Function} callback : the callback method to invoke when a matching event is sent
    # @return the hub
    ###
    @_hub.registerListener = (component, conf...) ->
      if (conf.length >= 2)
        DE_AKQUINET.extensions.eventing.registerListener(component, conf[0], conf[1]); return this
      else
        DE_AKQUINET.extensions.eventing.registerListener(component, conf[1]); return this

    ###
    # *Deprecated method*, use `registerListener` instead.
    ###
    @_hub.registerConfigurableListener = (component, conf) ->
      HUBU.logger.warn("registerConfigurableListener is a deprecated method and may disappear at any time, use registerListener instead")
      DE_AKQUINET.extensions.eventing.registerListener(component, conf); return this

    ###
    # Unregisters listeners for the given component. According to the arguments, several cases occur:
    # `component` can be either a String of a Component. In case of the string, we look up for the component using
    # `getComponentName`.
    # If `callback` is defined, only the listener matching component and callback will be unregistered. Otherwise all
    # listeners of the component will be unregistered.
    # If `component` is `null`, this methods does nothing.
    # @param {DE_AKQUINET.AbstractComponent} component the component
    # @param {Function} callback the callback function (optional)
    # @return the current hub
    ###
    @_hub.unregisterListener = (component, callback) ->
      DE_AKQUINET.extensions.eventing.unregisterListener(component, callback); return this

    ###
    # Sends an event inside the hub. If component or event is null, the method does nothing. If not, the event processed
    # and sent to all matching listeners.
    # @param {DE_AKQUINET.AbstractComponent} component the component sending the event
    # @param {Object} event the event
    # @return true if the event was delivered to at least one component, false otherwise
    # @methodOf DE_AKQUINET.hubu
    ###
    @_hub.sendEvent = (component, event) ->
      return DE_AKQUINET.extensions.eventing.sendEvent(component, event)

    ###
    # Subscribes to a specific topic.
    # @param {DE_AKQUINET.AbstractComponent} component : the component registering the listener
    # @param {String} topic : the topic (Regexp)
    # @param {Function} callback : the callback method to invoke when a matching event is sent
    # @param {Function} filter : optional method to filter received events.
    # @return the current hub
    # @methodOf DE_AKQUINET.hubu
    ###
    @_hub.subscribe = (component, topic, callback, filter) ->
      DE_AKQUINET.extensions.eventing.subscribe(component, topic, callback, filter); return this

    ###
    # Unsubscribes the subscriber.
    # @param {Object} component the component
    # @param {Function} callback the registered callback
    # @methodOf DE_AKQUINET.hubu
    # @return the current hub
    ###
    @_hub.unsubscribe = (component, callback) ->
      DE_AKQUINET.extensions.eventing.unsubscribe(component, callback); return this

    ###
    # Publishes an event to a specific topic. If component, topic or event is null, the method does nothing. If not,
    # the event is processed and sent to all matching listeners.
    # @param {DE_AKQUINET.AbstractComponent} component the component sending the event
    # @param {String} topic the topic
    # @param {Object} event the event
    # @return true if the event was delivered to at least one component, false otherwise
    # @methodOf DE_AKQUINET.hubu
    ###
    @_hub.publish = (component, callback, event) ->
      DE_AKQUINET.extensions.eventing.publish(component, callback, event); return this

  ### End of constructor  ###

  ###
  # Processes the given event sent by the given component. This methods checks who is interested by the event by
  # calling the match method, then the callback method is called.
  # The event is extended with the 'source' property indicating the component sending the event.
  # @param {Object} event
  # @param {AbstractComponent} component
  # @return true if the event was consumed by at least one component, false otherwise.
  ###
  _processEvent : (component, event) ->
    if (not event? || not component?)
      HUBU.logger.warn("Can't process event - component or event not defined")
      return false

    sent = false

    # We exclude from the list the the given listener.
    for listener in @_listeners when listener.component isnt component
      # Create a clone of the event, and set the source
      ev = HUBU.UTILS.clone(event)
      ev.source = component
      # We don't have to check the existence of the match function, it's done during registration
      if listener.match.apply(listener.component, [ev])
        listener.callback.apply(listener.component, [ev])
        sent = true

    return sent


  registerListener : (component, others...) ->
    match = null
    callback = null
    switch others.length
      when 2
        match = others[0]
        callback = others[1]
      when 1
        match = others[0].match
        callback = others[0].callback

    # Validation
    if (! component?  || ! match? || ! callback?)
      throw new Exception("Cannot register event listener, component or match or callback is/are not defined")
      .add("component", component)
      .add("match", match)
      .add("callback", callback)

    # Check that the component is currently plugged on the hub
    if ! HUBU.UTILS.isComponentPlugged(component, @_hub)
      throw new Exception("Cannot register event listener, the component is not plugged on the hub")

    listener = {
      "component": component,
      "callback": callback,
      "match": match
    }

    @_listeners.push(listener)

  unregisterListener : (component, callback) ->
    if not component?
      HUBU.logger.warn("Cannot unregister listener - component not defined")
      return false;

    cmp = @getComponent(component)
    if not cmp?
      HUBU.logger.warn("Cannot unregister listener - component not plugged on the hub")
      return false;

    toRemove = [] # Collect the listeners to remove
    if (callback?)
      # Must lookip component and callback
      for listener in @_listeners when listener.component is cmp and listener.callback is callback
        toRemove.push(listener)
    else
      for listener in @_listeners when listener.component is cmp
        toRemove.push(listener)

    # Remove collected elements
    for listener in toRemove
      @_listeners = HUBU.UTILS.removeElementFromArray(@_listeners, listener)

  ###
  # Helper method retriving a component object from the given argument.
  # If the argument is a String, it performs a lookup by name
  # If the argument is a component object, it just checks the conformity
  ###
  getComponent : (obj) ->
    if HUBU.UTILS.typeOf(obj) is "string"
      return @_hub.getComponent(obj)

    if HUBU.UTILS.isComponent(obj) then return obj

    return null

  sendEvent : (component, event) ->
    if not component? || not event?
      HUBU.logger.warn("Cannot send event, component or/and event are undefined"); return;

    return @_processEvent(component, event)

  subscribe : (component, topic, callback, filter) ->
    if (not component?  or not topic? or not callback?)
      HUBU.logger.warn("Cannot subscribe to topic, component or/and topic and/or callback are undefined"); return;

    regex = new RegExp(topic)
    match = null

    if not filter? or not HUBU.UTILS.isFunction(filter)
      match = (event) -> return regex.test(event.topic)
    else
      match = (event) -> return (regex.test(event.topic) and filter(event))

    @registerListener(component, match, callback)

  unsubscribe : (component, callback) ->
    return @unregisterListener(component, callback)

  publish: (component, topic, event) ->
    if not component? or not topic? or not event?
      HUBU.logger.info("Cannot publish event - component and/or topic and/or event are missing"); return false

    event.topic = topic
    return @sendEvent(component, event)

  reset: -> @_listeners = []

  unregisterComponent : (cmp) -> @unregisterListener(cmp)

### End of the Eventing class  ###

# Declare the extension
DE_AKQUINET.extensions.eventing =  new Eventing(DE_AKQUINET.hubu)

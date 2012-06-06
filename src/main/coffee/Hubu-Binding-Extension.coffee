###
# Hubu Binding Extension
# This extension allows to bind components together using direct binding declaration
###

###
# Detects whether we exports on the Commons.js `exports` object or on `this` (so the Browser `window` object).
###
global = exports ? this

###
# Create the object hierarchy: `HUBU` and `HUBU.UTILS`.
###
global.HUBU = global.HUBU ? {}
global.HUBU.EXTENSIONS = global.HUBU.EXTENSIONS ? {}

global.HUBU.Binding = class Binding
  _hub : null

  constructor : (hubu) ->
    @_hub  = hubu
    ### Injection  of the bind method ###
    @_hub.bind = (binding) ->
      # We use the global reference on the binding extension
      DE_AKQUINET.extensions.binding.bind(binding)
      return this
  # End constructor

  ###
  # Helper method retriving a component object from the given argument.
  # If the argument is a String, it performs a lookup by name
  # If the argument is a component object, it just checks the conformity
  ###
  getComponent : (obj) ->
    component = null # The component object.
    if HUBU.UTILS.typeOf(obj) is "[object String]"
      return @_hub.getComponent(obj)

    if HUBU.UTILS.isComponent(obj) then return obj

    return null

  getInjectedObject : (binding, component) ->
    # Determine what we need to inject : a direct reference of a proxy.
    if binding.contract?
      # A contract is set, check that the component is confirm to the contract
      # We cannot do this checking before, because the component was unkown.
      if not HUBU.UTILS.isObjectConformToContract(component, binding.contract)
        throw new Exception("Cannot bind components, the component is not conform to contract")
        .add("component", component.getComponentName())
        .add("contract", binding.contract)
      else
        if not binding.proxy? or binding.proxy
          # Create the proxy
          return HUBU.UTILS.createProxyForContract(binding.contract, component);
    # In all other cases, we do nothing.
    return component

  bind : (binding) ->
    if (not binding? || not binding?.to  || not binding?.component  || not binding?.into)
      throw new Exception "Cannot bind components - component, to and into must be defined"

    component = @getComponent(binding.component)
    if not component?
      throw new Exception("Cannot bind components - 'component' is invalid").add("component", binding.component)

    to = @getComponent(binding.to)
    if not to?
      throw new Exception("Cannot bind components - 'to' is invalid").add("component", binding.to)

    component = @getInjectedObject(binding, component)

    # Determine the injection method
    switch HUBU.UTILS.typeOf(binding.into)
      # Call the bind function
      when "[object Function]" then binding.into.apply(to, [component])
      when "[object String]"
        # It can be the name of a function or a (scalar) field
        # If `[to[binding.into]` does not exist, inject it:
        if not to[binding.into]? then to[binding.into] = component
        # If `[to[binding.into]` is a function invoke it:
        else if HUBU.UTILS.isFunction(to[binding.into]) then to[binding.into].apply(to, [component])
        # If `[to[binding.into]` is a member, assign it:
        else to[binding.into] = component
      else
        # Unsupported injection type
        throw new Exception("Cannot bind components = 'into' must be either a function or a string")
          .add("into", binding.into)

  # End of the bind method.

# Declare the extension
DE_AKQUINET.extensions.binding =  new Binding(DE_AKQUINET.hubu);





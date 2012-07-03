
###
# Hubu Service-Orientation Extension
###

HUBU.ServiceOrientation = class ServiceOrientation
  _hub : null
  _registry : null

  constructor : (hubu) ->
    @_hub  = hubu
    @_registry = new SOC.ServiceRegistry(@_hub)
    registry = @_registry # Just created a vairable put in the closure of the hub function.

    # Populate the hub object
    @_hub.registerService = (component, contract, properties) -> return registry.registerService(component, contract, properties)
    @_hub.unregisterService = (registration) -> return registry.unregisterService(registration)
    @_hub.getServiceReferences = (contract, filter) -> return registry.getServiceReferences(contract, filter)
    @_hub.getServiceReference = (contract, filter) ->
      refs = registry.getServiceReferences(contract, filter)
      if refs.length isnt 0 then return refs[0]
      return null
    @_hub.getService = (component, reference) -> return registry.getService(component, reference)
    @_hub.registerServiceListener = (listenerConfiguration) -> return registry.registerServiceListener(listenerConfiguration)
    @_hub.unregisterServiceListener = (listenerConfiguration) -> return registry.unregisterServiceListener(listenerConfiguration)
  ### End of constructor  ###

  ###
  # The given component is unregistered from the hub. We needs to unregisters all services.
  ###
  unregisterComponent : (cmp) -> @_registry.unregisterServices(cmp)

### End of the Service Orientation Extension class  ###

# Declare the extension
getHubuExtensions().service =  ServiceOrientation

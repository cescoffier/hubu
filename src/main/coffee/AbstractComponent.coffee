###
# Abstract Component class
###

###
# Abstract Component class.
# This used is not intended to be used directly, and is just here for documentation purpose.
# Indeed, the returned object contains the four required methods that <bold>all</bold> component must
# have. Any Javascript object with those 4 methods can be cosidered as a valid component.
# The four required methods are:
#
# * `getComponentName()` : return the default component name
# * `configurate(hub, [configuration])` : configures the component
# * `start()` / `stop()` : called when the component is started / stopped
# 
# Returned objects do not intend to be used, they are just mock / empty instances.
###
HUBU.AbstractComponent = class AbstractComponent

  ###
  # Configures the component.
  # This method is called by the hub when the component starts or
  # when the component is plugged when the hub is already started.
  # @param hub the hub
  # @param configuration optional parameter used to pass the component configuration. The configuration object is
  # a simple key/value map.
  # @public
  ###
  configure : (hub, configuration) -> throw "AbstractComponent is an abstract class";

  ###
  # Starts the component.
  # This method is called by the hub when the hub starts or when the component is plugged when the hub is already started.
  # This methods is always called after the `configure` method.
  # Once called the component can send events and used bound components.
  ###
  start : () -> throw "AbstractComponent is an abstract class";

  ###
  # Stops the component.
  # This method is called by the hub when the hub is stopped or when the component is unplugged.
  # This methods is always called after the `start` method.
  # Once called, the component must not send events or access bound components.
  ###
  stop : () -> throw "AbstractComponent is an abstract class";

  ###
  # Gets the component name.
  # If an 'id' is given in the hub configuration, this method is replaced.
  # @return the component name
  # @public
  ###
  getComponentName : () -> throw "AbstractComponent is an abstract class";
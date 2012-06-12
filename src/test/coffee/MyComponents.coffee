
global = exports ? this

global.BackendContract = {
  doSomething : (a) ->
}

###
# A backend class
###
global.Backend = class Backend extends global.BackendContract
  name : null
  logger : null

  constructor : (name) ->
    @name = name
    @logger = new global.Logger("Backend")

  start : -> @logger.info("Backend starting...")

  stop : -> @logger.info("Backend stoping...")

  configure : -> # Do nothing

  getComponentName: -> return @name

  doSomething : (a) ->
    @logger.info "Backend is going to do something"
    return @name + "-" + a

###
# A frontend class
###
global.Frontend = class Frontend extends HUBU.AbstractComponent
  name : null
  logger : null
  backend : null  # Injected.

  constructor : (name) ->
    @name = name
    @logger = new global.Logger("Backend")
    @backend = null

  start : -> @logger.info("Backend starting...")

  stop : -> @logger.info("Backend stoping...")

  configure : -> # Do nothing

  doSomething :  ->
    @backend.doSomething(@name)

  getComponentName: -> return @name








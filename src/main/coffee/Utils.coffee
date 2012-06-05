###
# Utility methods used by H-UBU
###

###
# Detects whether we exports on the Commons.js `exports` object or on `this` (so the Browser `window` object).
###
global = exports ? this

###
# Create the object hierarchy: `HUBU` and `HUBU.UTILS`.
###
global.HUBU = global.HUBU ? {}
global.HUBU.UTILS = global.HUBU.UTILS ? {}

# Create a private alias.
utils = global.HUBU.UTILS;

global.namespace = (target, name, block) ->
  [target, name, block] = [(if typeof exports isnt 'undefined' then exports else window), arguments...] if arguments.length < 3
  top    = target
  target = target[item] or= {} for item in name.split '.'
  block target, top


###
# Logger.
# If set will happend the logger name in from of all logged messages.
# The logger uses `window.console` to log messages. So if this object is not defined, the message are not logged.
# The logger defines the common logging methods: `debug`, `info`, `warn` and `error`.
# By default the log level is set to INFO, but can be adjusted using the `setLevel` method.
###
global.Logger = class Logger
  @DEBUG : 0
  @INFO : 1
  @WARNING : 2
  @ERROR : 3

  _header : ""
  _level : Logger.INFO

  constructor : (name = "") ->
    if (name.length > 0)
      m_header = "[#{name}] "

  log : (message) ->
    if (window.console?)
      window.console.log("#{@_header}" + message)
      return true
    return false

  debug : (message) ->
    if @_level <= Logger.DEBUG
      return @log("DEBUG - " + message)
    return false


  info : (message) ->
    if @_level <= Logger.INFO
      return @log("INFO - " + message)
    return false

  warn : (message) ->
    if @_level <= Logger.WARNING
      return @log("WARN - " + message)
    return false

  error : (message) ->
    if @_level <= Logger.ERROR
      log("ERROR - " + message)

  setLevel : (level) -> @_level = level

### End of Logger class  ###

# Main hubu logger.
global.HUBU.logger = new Logger("hubu")
logger = global.HUBU.logger;


###
# Contract and Reflection related methods
###

###
# This function is returning the `type` of an object. It is different from the JavaScript `typeof`, and relies on
# the Object `toString` method.
# Here are the different results :
#
# *`typeOf(1)` => "[object Number]"
# *`typeOf({})` => "[object Object]"
# *`typeOf([])` => "[object Array]"
# *`typeOf(null)` => "[object Null]"
# *`typeOf(function() {})` => "[object Function]"
#
# Be aware that this method failed on `undefined` objects.
###
utils.typeOf = (ref) ->
  return Object.prototype.toString.call(ref)

utils.isObjectConformToContract = (object, contract) ->
  # For all 'properties' from contract, check that the object has an equivalent property
  for props of contract
    # We need to check that the property is defined on the given object.
    if not object[props]?
      logger.warn "Object not conform to contract - property #{props} missing"
      return false;
    else
      # Check whether we have the right type
      if @typeOf(contract[props]) isnt (@typeOf object[props])
        logger.warn "Object not conform to contract - the type of the property #{props} does not match.
          Expected '" + @typeOf(contract[props]) + "' but found '" + @typeOf(object[props]) + "'"
        return false;
  # We're done !
  return true

utils.isFunction = (ref) ->
  # We need to specify the exact function because toString can be overridden by browser.
  return @typeOf(ref) is "[object Function]";

###
# Invokes the method `method` on the object `target` with the arguments `args` (Array).
# Returns the invocation result or `false` if the method is not defined for the object (or if it's not a function).
###
utils.invoke = (target, method, args) ->
  if (target[method]?  and @isFunction(target[method]))
    return target[method].apply(target, args)
  return false;

###
# Extends the given object `obj` with the given function `func`. Basically, if the `obj[name]` is not defined, then
# this method extends `obj` with `obj[name]=func`
# If the method is added, the method returns `true`, `false` otherwise.
###
utils.defineFunctionIfNotExist = (obj, name, func) ->
  if (not obj[name]?)
    obj[name] = func;
    return true;
  return false;

utils.clone = (obj) ->
  # TODO What about function ?
  # TODO I'm not sure that this function is really efficient
  newObj = {}

  # Bind the prototype.
  newObj.prototype = obj.prototype
  for props of obj
    # For all properties of the object, we clone or just bind.
    if obj.hasOwnProperty(props)
      if (@typeOf obj[props]) is "[object Object]"
        # Clone nested objects.
        newObj[props] = @clone(obj[props])
      else
        # Bind for not all non-objects.
        newObj[props] = obj[props]

  return newObj

utils.bind = (obj, method) ->
  return ->
    return method.apply(obj, Array.prototype.slice.call(arguments))

utils.createProxyForContract = (contract, object) ->
  proxy = {}

  # We inject the proxied object
  proxy.__proxy__ = object;

  for props of contract
    if @isFunction contract[props]
      # To call the correct method, we create a new anonymous function
      # applying the arguments on the function itself
      # We use apply to pass all arguments, and set the target
      # The resulting method is stored using the method name in the
      # proxy object
      proxy[props] = @bind(object, object[props]);
    else
      # Everything else is just referenced.
      proxy[props] = object[props];

  return proxy;

utils.isComponent = (component) ->
  # if component is null, return false
  if (not component?)
    return false;

  return @isObjectConformToContract(component, new HUBU.AbstractComponent());


utils.indexOf = (array, obj) ->
  # If the indexOf method is defined, use it
  if (Array.prototype.indexOf?)
    return array.indexOf(obj)
  else
    # Else, we do a simple lookup
    for v of array
      return true if array.v is obj
    return false

###
# Could probably be better.
###
utils.removeElementFromArray = (array, obj) ->
  for v of array
    if (array.v is obj)
      array.splice(i, 1);



###
# End of the contract and reflection related methods
###
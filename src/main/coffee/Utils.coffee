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

global.Exception = class Exception
  data: {}

  constructor: (message) ->
    @message = message

  add: (key, value) -> @data.key = value; return @

  toString : -> return @message


###
# Contract and Reflection related methods
###

###
# This function is returning the `type` of an object. It is different from the JavaScript `typeof`, and relies on
# the Object `toString` method.
# Here are the different results :
#
# *`typeOf(1)` => "number"
# *`typeOf({})` => "object"
# *`typeOf([])` => "array"
# *`typeOf(function() {})` => "function"
# *`typeOf(null)` => "null"
#
###
utils.typeOf = (obj) ->
  if not obj?
    return String obj
  classToType = new Object
  for name in "Boolean Number String Function Array Date RegExp".split(" ")
    classToType["[object " + name + "]"] = name.toLowerCase()
  myClass = Object.prototype.toString.call obj
  if myClass of classToType
    return classToType[myClass]
  return "object"

###
# Checks that the given object is conform to the given contract
# The contract is a javascript object.
# The conformity is computed as follow:
#
# `O is conform to C if and only if for all i in C where C[i] != null O[i] != null && typeof(C[i]) = typeOf(O[i])`
#
# This is an implementation of 'Chi':
# `Metamodel <- chi <- Model -> mu -> System`
# where chi is : isObjectConformToContract and mu is representationOf.
# @param object the object to check
# @param contract the contract
# @return true if the object is conform with the given contract, false otherwise.
###
utils.isObjectConformToContract = (object, contract) ->
  # For all 'properties' from contract, check that the object has an equivalent property
  for props of contract
    # We need to check that the property is defined on the given object.
    if not object[props]?
      logger.warn "Object not conform to contract - property #{props} missing"
      return false
    else
      # Check whether we have the right type
      if @typeOf(contract[props]) isnt (@typeOf object[props])
        logger.warn "Object not conform to contract - the type of the property #{props} does not match.
          Expected '" + @typeOf(contract[props]) + "' but found '" + @typeOf(object[props]) + "'"
        return false
  # We're done !
  return true

###
# Utility method to check if the given object is a function.
# @param {Object} obj the object to check
# @returns `true` if the given object is a function, `false` otherwise
###
utils.isFunction = (ref) ->
  # We need to specify the exact function because toString can be overridden by browser.
  return @typeOf(ref) is "function";

###
# Utility method to check if the given object is an object.
# @param {Object} obj the object to check
# @returns `true` if the given object is an object, `false` otherwise
###
utils.isObject = (ref) ->
  # We need to specify the exact function because toString can be overridden by browser.
  return @typeOf(ref) is "object";

###
# Invokes the method `method` on the object `target` with the arguments `args` (Array).
# @param obj the instance
# @param method the method name to call
# @param args {Array} the arguments to pass to the method.
# @return either the result of the method. `false` if the method is not defined, or is not a function.
###
utils.invoke = (target, method, args) ->
  if (target[method]?  and @isFunction(target[method]))
    return target[method].apply(target, args)
  return false;

###
# Extends the given object `obj` with the given function `func`. Basically, if the `obj[name]` is not defined, then
# this method extends `obj` with `obj[name]=func`
# If the method is added, the method returns `true`, `false` otherwise.
# @param obj the object
# @param name the name of the function to add
# @param func the function to append to the object
# @return {Boolean}
###
utils.defineFunctionIfNotExist = (obj, name, func) ->
  if (not obj[name]?)
    obj[name] = func
    return true
  return false

###
# Clone an object (deep copy).
# @param obj {Object} the object to clone
# @return the cloned object, or the object itself if it's not an object.
###
utils.clone = (obj) ->
  if not obj? or typeof obj isnt 'object'
    return obj

  if obj instanceof Date
    return new Date(obj.getTime())

  if obj instanceof RegExp
    flags = ''
    flags += 'g' if obj.global?
    flags += 'i' if obj.ignoreCase?
    flags += 'm' if obj.multiline?
    flags += 'y' if obj.sticky?
    return new RegExp(obj.source, flags)

  newInstance = new obj.constructor()

  for key of obj
    newInstance[key] = @clone obj[key]

  return newInstance


utils.bind = (obj, method) ->
  return ->
    return method.apply(obj, Array.prototype.slice.call(arguments))


###
# Creates a proxy hiding the given object. The proxy implements the contract (and only the contract).
# @param {Object} contract the contract
# @param {Object} object the object to proxy
# @return the proxy
###
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

###
# Checks if the given component implements the 'component' protocol (i.e. interface).
# @param {Object} component the component to check
# @return `true` if this is a valid component, `false` otherwise.
###
utils.isComponent = (component) ->
  # if component is null, return false
  if (not component?)
    return false;
  return @isObjectConformToContract(component, new HUBU.AbstractComponent());

###
# Checks wheter the given component is plugged on the given hub.
# The component can be given as string (component name) or as object (component object)
# @param {Object} or {String} component the component to check
# @param hub the hub
@ @return `true` is the component is plugged on the hub, `false` otherwise
###
utils.isComponentPlugged = (component, hub) ->
  if @typeOf(component) is "string"
    return hub.getComponent(component) isnt null

  if @typeOf(component) is "object"
    return @indexOf(hub.getComponents(), component) isnt -1

  return false



###
# indexOf function.
# This method delegates on `Array.indexOf` if it exists. If not (IE), it just implements its own indexOf with simple
# lookup
# @param {Object} array the array
# @param {Object} obj the object
# @return the index of the object 'obj' in the array or -1 if not found.
###
utils.indexOf = (array, obj) ->
  # If the indexOf method is defined, use it
  if (Array.prototype.indexOf?)
    return array.indexOf(obj)
  else
    # Else, we do a simple lookup
    for v of array
      return v if array.v is obj
    return -1

###
# Removes the object or value `obj` from the array `array`.
# Even if the array is modified in place, this method returns the final array.
# All occurence of `obj` are removed from the array
# @param array the array
# @param obj the reference to remove
# @return the final array
###
utils.removeElementFromArray = (array, obj) ->
  for v of array
    array.splice(v, 1) if array[v] is obj
  return array

###
# End of the contract and reflection related methods
###
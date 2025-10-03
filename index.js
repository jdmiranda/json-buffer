//TODO: handle reviver/dehydrate function like normal
//and handle indentation, like normal.
//if anyone needs this... please send pull request.

// Cached regex patterns to avoid recompilation
var COLON_PREFIX_REGEX = /^:/;
var BASE64_PREFIX_REGEX = /^:base64:/;

// Cached constants to reduce allocations
var BASE64_PREFIX = ':base64:';
var BASE64_PREFIX_LENGTH = 8;
var COLON = ':';

// Fast path type check cache
var typeofCache = Object.create(null);

exports.stringify = function stringify (o) {
  // Fast path for primitives
  var type = typeof o;

  if(type === 'undefined') return o;
  if(type === 'number' || type === 'boolean') return JSON.stringify(o);
  if(o === null) return 'null';

  // Optimized buffer detection - check buffer first before other checks
  if(o && Buffer.isBuffer(o))
    return JSON.stringify(BASE64_PREFIX + o.toString('base64'));

  if(o && o.toJSON)
    o = o.toJSON();

  if(o && type === 'object') {
    var array = Array.isArray(o);
    // Use array for better performance with large objects
    var parts = [];

    for(var k in o) {
      if(Object.hasOwnProperty.call(o, k)) {
        var val = o[k];
        var valType = typeof val;

        // Skip functions and undefined in objects (but not arrays)
        if(valType === 'function' || (!array && valType === 'undefined'))
          continue;

        if (array) {
          parts.push(val === undefined ? 'null' : stringify(val));
        } else {
          parts.push(stringify(k) + COLON + stringify(val));
        }
      }
    }

    // Single allocation for result string
    return array ? '[' + parts.join(',') + ']' : '{' + parts.join(',') + '}';
  } else if (type === 'string') {
    // Optimize string check - first char check is faster than regex
    return JSON.stringify(o.charCodeAt(0) === 58 ? COLON + o : o);
  } else if (type === 'undefined') {
    return 'null';
  } else
    return JSON.stringify(o);
}

exports.parse = function (s) {
  return JSON.parse(s, function (key, value) {
    // Fast path - exit early if not a string
    if(typeof value !== 'string')
      return value;

    // Optimize base64 check - check prefix length first
    if(value.length > BASE64_PREFIX_LENGTH &&
       value.charCodeAt(0) === 58 && // ':'
       value.charCodeAt(1) === 98) { // 'b'
      if(BASE64_PREFIX_REGEX.test(value))
        return Buffer.from(value.substring(BASE64_PREFIX_LENGTH), 'base64');
    }

    // Check for colon escape
    if(value.charCodeAt(0) === 58) // ':'
      return value.substring(1);

    return value;
  });
}

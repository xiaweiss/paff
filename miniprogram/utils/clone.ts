/**
 * Ramda clone
 * @see https://ramdajs.com/docs/#clone
 */

/**
 * Creates a deep copy of the source that can be used in place of the source
 * object without retaining any references to it.
 * The source object may contain (nested) `Array`s and `Object`s,
 * `Number`s, `String`s, `Boolean`s and `Date`s.
 * `Function`s are assigned by reference rather than copied.
 *
 * Dispatches to a `clone` method if present.
 *
 * Note that if the source object has multiple nodes that share a reference,
 * the returned object will have the same structure, but the references will
 * be pointed to the location within the cloned value.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {*} -> {*}
 * @param {*} value The object or array to clone
 * @return {*} A deeply cloned copy of `val`
 * @example
 *
 *      const objects = [{}, {}, {}];
 *      const objectsClone = R.clone(objects);
 *      objects === objectsClone; //=> false
 *      objects[0] === objectsClone[0]; //=> false
 */
export const clone = (value: any) => {
  return value != null && typeof value.clone === 'function' ?
    value.clone() :
    _clone(value, [], [], true)
}

/**
 * Copies an object.
 *
 * @private
 * @param {*} value The value to be copied
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @param {Boolean} deep Whether or not to perform deep cloning.
 * @return {*} The copied value.
 */
function _clone(value: any, refFrom: any[], refTo: any[], deep: boolean) {
  const copy = function copy(copiedValue: any) {
    const len = refFrom.length
    let idx = 0
    while (idx < len) {
      if (value === refFrom[idx]) {
        return refTo[idx]
      }
      idx += 1
    }
    refFrom[idx] = value
    refTo[idx] = copiedValue
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key]
      }
    }
    return copiedValue;
  }
  switch (type(value)) {
    case 'Object':  return copy(Object.create(Object.getPrototypeOf(value)))
    case 'Array':   return copy([])
    case 'Date':    return new Date(value.valueOf())
    case 'RegExp': return _cloneRegExp(value)
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'BigInt64Array':
    case 'BigUint64Array':
      return value.slice()
    default:        return value
  }
}

function _cloneRegExp(pattern: RegExp) {
  return new RegExp(pattern.source, (pattern.global     ? 'g' : '') +
                                    (pattern.ignoreCase ? 'i' : '') +
                                    (pattern.multiline  ? 'm' : '') +
                                    (pattern.sticky     ? 'y' : '') +
                                    (pattern.unicode    ? 'u' : ''));
}


/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */
function type(val: any) {
  return val === null
    ? 'Null'
    : val === undefined
      ? 'Undefined'
      : Object.prototype.toString.call(val).slice(8, -1)
}

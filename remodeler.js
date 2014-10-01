/**
 * @author Morgan Conrad
 * Copyright(c) 2014
 * This software is released under the MIT license  (http://opensource.org/licenses/MIT)
 * 
 * Remodeler construct a new object {} from an existing one, with options to
 *   1. rename property keys
 *   2. generate new properties using functions on the old object
 *   
 *   For each property to be created in the new object, you provide a key and a Transformation
 *   The Transformation may be one of the following:
 *      null:     first, check this.defaultTransformation.  If that is null, do nothing
 *      string:   newObject[key] = oldObject[string]   copy from old object, string = oldKey
 *      function: newObject[key] = function(oldObject, key)
 */


/**
 * Constructor
 * @param options  (optional, seldom used) 
 *      isPassThrough - if true, the remodeler does nothing, just returns the original object
 *      defaultTransformation - a default transformation to use if specific one for a key is null
 * @param initMap   optional.  If present will be added via addKeyXformMap 
 * @constructor
 */
function Remodeler(options, initMap) {
   "use strict";
   this.options = options || {};
   this.xf = {};
   if (initMap)
      this.addKeyXformMap(initMap);
}




/**
 * Configuration: Copy all these keys "as-is"
 * @param keys   String or [String, String...]
 * @returns {Remodeler}
 */
Remodeler.prototype.copyKeys = function(keys) {
   "use strict";
   return this._addKeys(keys, true);
};


/**
 * Configuration: Delete these keys - they will not be copied.  (useful mainly after calling copy)
 * @param keys    String or [String, String...]
 * @returns {Remodeler}
 */
Remodeler.prototype.excludeKeys = function(keys) {
   "use strict";
   return this._addKeys(keys, false);
};


/**
 * Add a single transformation.  Typically you might use one of the other add... methods
 * @param key              key for the new object
 * @param transformation   see transformation info above
 */
Remodeler.prototype.addTransformation = function(key, transformation) {
   "use strict";
   if (!transformation)
      this.xf[key] = null;
   else if (typeof transformation === 'string' || transformation instanceof String)
      this.xf[key] = { key: transformation, fn: Remodeler._get };
   else // assume its a function
      this.xf[key] = { key: key, fn: transformation };
};


/**
 * Configure using an array of keys and transformations
 * @param arr  [key1, transform1, key2, transform2, ...]  (must have even number of elements)
 * @returns {Remodeler}
 */
Remodeler.prototype.addKeyXformArray = function(arr) {
   "use strict";
   if (arr.length & 1)
      throw "Remodeler.prototype.xformArray() must have an even number of elements";
   for (var i=0; i<arr.length; i+=2)
      this.addTransformation(arr[i], arr[i+1]);

   return this;
};


/**
 * Configure using an map of keys and transformations
 * @param map  (object)
 * @returns {Remodeler}
 */
Remodeler.prototype.addKeyXformMap = function(map) {
   "use strict";
   var rm = this;
   Object.keys(map).forEach(function(key) {
      rm.addTransformation(key, map[key]);
   });

   return this;
};


/**
 * Configure using key/xform pairs  (must be an even number)
 * @returns {Remodeler}
 */
Remodeler.prototype.addKeyXformPairs = function(k1, x1, k2, x2 /* ... */) {
   "use strict";
   return this.addKeyXformArray(arguments);
};


/**
 * Main method, transforming src into dst based upon current configuration and values
 * @param src   non-null
 * @param dst   typically null, in which case a new blank object {} will be created.
 * @returns {*}
 */
Remodeler.prototype.remodel = function(src, dst) {
   "use strict";

   if (this.options.isPassThrough)
      return src;

   dst = dst || {};

   var newKeys = Object.keys(this.xf);
   for (var i=0; i<newKeys.length; i++) {
      var newKey = newKeys[i];
      var xf = this.xf[newKey] || this.options.defaultTransformation;
      if (xf) {
         var oldKey = xf.key || newKey;
         dst[newKey] = xf.fn(src, oldKey);
      }
   }

   return dst;
};



Remodeler.prototype._addKeys = function(keys, doAdd) {
   "use strict";
   if (!Array.isArray(keys))
      keys = arguments;

   for (var i=0; i<keys.length; i++) {
      var k = keys[i];
      this.xf[k] = doAdd ? { key: k, fn: Remodeler._get } : null;
   }

   return this;
};

Remodeler._get = function(object, key) {
   "use strict";
   return object[key];
};



module.exports = Remodeler;

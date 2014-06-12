[![License](http://img.shields.io/badge/license-MIT-A31F34.svg)](https://github.com/MorganConrad/remodeler)
[![NPM Downloads](http://img.shields.io/npm/dm/remodeler.svg)](https://www.npmjs.org/package/remodeler)

#remodeler

node.js module to transform objects into new objects, by copying or renaming properties, but
also allowing for functional transformations.  These are provided via key / transformation pairs.

For example, if an outside module is using [Coding by Convention](http://en.wikipedia.org/wiki/Convention_over_configuration), but you just aren't, or can't, use _their_
convention, this module could be useful in creating a new object meeting that convention.  For more background see [my blog post](http://flyingspaniel.blogspot.com/2014/06/coding-by-convention-is-great.html).

This can also be thought of as a quick and dirty [Adapter pattern](http://en.wikipedia.org/wiki/Adapter_pattern).

As for the key / transformation paris, the key will be the __new key__ in the new object.

The transformation may be one of the following:
 *  null:     first, check this.defaultTransformation.  If that is null, do nothing (ignore this field)
 *  string:   newObject[key] = oldObject[string]   copy from old object, string = oldKey
 *  function: newObject[key] = function(oldObject, key)

##usage
In this example we are converting an object to a more [iCal / iCalendar / .ics](http://en.wikipedia.org/wiki/ICalendar) friendly format.  (Warning: example is incomplete and DTSTART tag is incorrect)

```javascript
    var Remodeler = require('remodeler');
    var input = { 
      UID: '12345@example.com',
      name: 'Supercool Meetup',
      location: 'Palo Alto CA',
      when: new Date()
    };
   
    var myRemodeler = new Remodeler();
    myRemodeler.copyKeys(Object.keys(input)).excludeKeys('when');
   
    myRemodeler.addKeyXformPairs(
      'DTSTART', function(o) {
         return 'DTSTART;VALUE=DATE_TIME:' + o.when.toISOString();
      },
      'DESCRIPTION', function(o) {
         return o.name + '@' + o.location;
      });
      
    var out = myRemodeler.remodel(input);
   
    out will be an object:
    {
     "UID":"12345@example.com",
     "name":"Supercool Meetup",
     "location":"Palo Alto CA",
     "DTSTART":"DTSTART;VALUE=DATE_TIME:2014-06-11T23:40:59.538Z",
     "DESCRIPTION":"Supercool Meetup@Palo Alto CA"
    }
```


##API

####Remodeler(options, initMap)
Constructor.  Usually, options and initMap can be left or or set to null.
Current options are:
* `isPassThrough` if true, `remodel()` (see below) will simply return src.
* `defaultTransformation` Will be used if a specific key Transformation is null.


####copyKeys(keys)
the keys (a single String or an array of Strings) will be copied as is.
For example, to copy everything:
   `copyKeys(Object.keys(srcObject))`

####excludeKeys(keys)
the keys (a single String or an array of Strings) will be excluded

####addKeyXformArray(array)
array[0,2,4...] = keys, array[1,3,5...] = corresponding transformation

####addKeyXformMap(map)
map consists of key/value pairs, key = key, value = transformation

####addKeyXformPairs(k1,t1,k2,t2...)
similar to addKeyXformArray, except arguments[0,2,4...] = keys, arguments[1,3,5...] = transformations

####remodel(src, dst)
Transforms src into dst based upon current configuration and values.  If dst is null (typical) a new {} will be created, added to, and returned.


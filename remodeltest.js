/**
 * @author Morgan Conrad
 * Copyright(c) 2013
 * This software is released under the MIT license  (http://opensource.org/licenses/MIT)
 */

var Remodeler = require('./remodeler');
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

var s = JSON.stringify(out, undefined, 2);

console.log(s);
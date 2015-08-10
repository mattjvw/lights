var async = require('async');

var RoboSmart = require('../robosmart');

function print(item,callback) { 
  console.log(item);
  if (callback) {callback();}
}

RoboSmart.discoverAll(function(devices) {
  var l1 = devices[0];
  var l2 = devices[1];
  async.series([
    print.bind(undefined,'Connecting to first light'),
    l1.connect.bind(l1),
    l1.discoverServicesAndCharacteristics.bind(l1),
    function(callback) {
      print('Getting first light name');
      l1.getLightName(function(item){print(item,callback)});
    },
    function(callback) {
      setTimeout(function(){callback();},2000);
    },
    print.bind(undefined,'Connecting to second light'),
    l2.connect.bind(l2),
    l2.discoverServicesAndCharacteristics.bind(l2),
    function(callback) {
      print('Getting second light name');
      l2.getLightName(function(item){print(item,callback)});
    },
    function(callback) {
      print('Getting first light name again');
      l1.getLightName(function(item){print(item,callback)});
    },
    print.bind(undefined,'Returned from last call')
  ]);
}, 2000);

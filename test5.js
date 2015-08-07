var async = require('async');

var RoboSmart = require('./robosmart');

function print(item,callback) { 
  console.log(item);
  callback();
}

RoboSmart.discoverAll(function(devices) {
  var l1 = devices[0];
  var l2 = devices[1];
  async.series([
    l1.connect.bind(l1),
    l1.discoverServicesAndCharacteristics.bind(l1),
    function(callback) {
      l1.getLightName(function(item){print(item,callback)});
    },
//    print.bind({},l1),
    function(callback) {
      setTimeout(function(){callback();},2000);
    },
    l2.connect.bind(l2),
    function(callback) {
      l1.getLightName(function(item){print(item,callback)});
    }
//    console.log.bind(console,'\n\n\n'),
//    print.bind({},l1)
  ]);
}, 2000);

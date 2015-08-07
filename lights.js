var async = require('async');
var rs = require('./robosmart');

const MAX_CACHE_TIME = 300; //seconds
const RS_DISCOVER_TIME = 2500; //milliseconds
var last_refresh = 0;
var lights = {};


module.exports = {
  refresh: function (callback) {
    var now = Date.now()
    if ((now - last_refresh) > MAX_CACHE_TIME*1000){
      last_refresh = now;
      rs.discoverAll(function(devices) {
        async.forEachSeries(devices,function(light,next) {
          if (!(light.status.id in lights)) {
            console.log('Adding '+light.status.id);
            async.series([
              light.connect.bind(light),
              light.discoverServicesAndCharacteristics.bind(light),
              function(callback) {
                light.isOn(function(on) {
                  light.status.on = on;
                  callback();
                });
              },
              function(callback) {
                light.getDim(function(dim) {
                  light.status.dim = Math.ceil(dim/2.55);
                  callback();
                });
              },
              function(callback) {
                light.getLightName(function(name) {
                  light.status.name = name.replace(/(\w+).+/,"$1");
                  callback();
                });
              },
              light.disconnect.bind(light),
              function(callback) {
                lights[light.status.id] = light;
                console.log(' ... '+light.status.id+' done');
                callback();
              },
            ], next);
          } else {
            next();
          }
        }, callback);
      }, RS_DISCOVER_TIME);
    }
    callback();
  },
  has: function (id,callback) {
    this.refresh(function() { callback(id in lights); });
  },
  get: function (id,callback) {
    callback(lights[id].status);
  },
  getAll: function (callback) {
    console.log(lights);
    status = {}
    Object.keys(lights).forEach(function(key) {
      status[key] = lights[key].status;
    });
    callback(status);
  },
  on: function (id,callback) {
    async.series([
      lights[id].connect.bind(lights[id]),
      lights[id].discoverServicesAndCharacteristics.bind(lights[id]),
      lights[id].switchOn.bind(lights[id]),
      function(callback) {
        lights[id].isOn(function(on) {
          lights[id].status.on = on;
        });
        callback();
      },
      lights[id].disconnect.bind(lights[id])
    ], function () {callback(lights[id].status)});
  },
  off: function (id,callback) {
    async.series([
      lights[id].connect.bind(lights[id]),
      lights[id].discoverServicesAndCharacteristics.bind(lights[id]),
      lights[id].switchOff.bind(lights[id]),
      function(callback) {
        lights[id].isOn(function(on) {
          lights[id].status.on = on;
          callback();
        });
      },
      lights[id].disconnect.bind(lights[id])
    ], function () {callback(lights[id].status)});
  },
  dim: function (id,level,callback) {
    async.series([
      lights[id].connect.bind(lights[id]),
      lights[id].discoverServicesAndCharacteristics.bind(lights[id]),
      lights[id].setDim.bind(lights[id],Math.ceil(level*2.55)),
      function(callback) {
        lights[id].isOn(function(on) {
          lights[id].status.on = on;
          callback();
        });
      },
      lights[id].getDim.bind(lights[id],function(dim) {
        lights[id].status.dim = Math.ceil(dim/2.55);
        callback();
      }),
      lights[id].disconnect.bind(lights[id])
    ], function () {callback(lights[id].status)});
  }
}

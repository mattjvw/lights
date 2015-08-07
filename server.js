var restify = require('restify');
var lights = require('./lights');

var server = restify.createServer({
  name: 'Lights',
  version: '1.0.0'
});

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get("/lights", function (req, res, next) {
  lights.getAll(function(status) {
    res.send(status);
    return next();
  });
});

server.get("/lights/:id", function (req, res, next) {
  lights.has(req.params.id,function(exists) {
    if (exists) {
      lights.get(req.params.id, function(status) {
        res.send(200,status);
        return next();
      });
    } else {
      res.send(404,{err:"not found"});
      return next();
    }
  });
});

server.put("/lights/:id/on", function (req, res, next) {
  lights.has(req.params.id,function(exists) {
    if (exists) {
      lights.on(req.params.id, function(status) {
        if (status.on) {
          res.send(200,status);
          return next();
        } else {
          res.send(500,status);
          return next();
        }
      });
    } else {
      res.send(404,{err:"not found"});
      return next();
    }
  });
});

server.put("/lights/:id/off", function (req, res, next) {
  lights.has(req.params.id,function(exists) {
    if (exists) {
      lights.off(req.params.id, function(status) {
        if (!status.on) {
          res.send(200,status);
          return next();
        } else {
          res.send(500,status);
          return next();
        }
      });
    } else {
      res.send(404,{err:"not found"});
      return next();
    }
  });
});

server.put("/lights/:id/dim", function (req, res, next) {
  lights.has(req.params.id,function(exists) {
    if (exists) {
      var level = parseInt(req.params.level);
      if (!isNaN(level) && 0 <= level && level <= 100) {
        lights.dim(req.params.id,level,function(status) {
          if ((level > 0 && status.on) ||
              (level == 0 && !status.on)) {
            res.send(200,status);
            return next();
          } else {
            res.send(500,status);
            return next();
          }
        });
      } else {
        res.send(400,{err:"Level must be a number between 0 and 100"});
        return next();
      }
    } else {
      res.send(404,{err:"not found"});
      return next();
    }
  });
});

lights.refresh(function(){});
server.listen(8080);



var net = require("net");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

// Similar to postgres client
// https://github.com/brianc/node-postgres/blob/master/lib/client.js
//

var Client = function(config) {
  EventEmitter.call(this);
  this.socket = new net.Socket();
};

util.inherits(Client, EventEmitter);

Client.prototype.connect = function(callback) {
  var self = this;
  var localPort;

  this.socket.connect(9000, "127.0.0.1", function() {
    localPort = self.socket.localPort;
    if (callback) {
      callback(null, self);
      // remove callback for proper error handling
      // after the connect event
      callback = null;
    }
    self.emit("connect");
  });

  this.socket.on("error", function(err) {
    console.log("client.js socket error ", err, localPort);
    self.emit('error');
  });

  this.socket.on("close", function() {
    console.log("client.js socket close ");  
  });

  this.socket.once("end", function(err) {
    if (!self._ending) {
      console.log("client.js socket end ", err, localPort);
      self.socket.destroy();
      var docb = self._callback;
      self._callback = null;
      if (docb) {
        var err = new Error("socket closed");
        docb(err);
      } else {
          console.log('emit end ');
          self.emit("end");
      }
    }
  });

  this.socket.on("data", function(data) {
    // call this._callback
    console.log(
      self.socket.localPort,
      "received ",
      new Date().toISOString(),
      String(data)
    );
    var docb = self._callback;
    self._callback = null;
    if (docb) {
      docb(null, data);
    } else {
      console.log("no callback");
    }
  });
};

Client.prototype.send = function(values, callback) {
  if (this._callback) {
    callback(new Error("already busy"));
    return;
  }
  console.log(
    this.socket.localPort,
    "dispatching query ",
    new Date().toISOString(),
    values
  );
  this._callback = callback;
  this.socket.write(values, function() {});
};

Client.prototype.cancel = function(client, query) {
  console.trace("cancel query ", query);
};

Client.prototype.end = function() {
  console.log("end socket or query? ", this.socket.readyState);
  this._ending = true;
  if (this.socket.readyState != "closed") {
    this.socket.end();
  }
};

module.exports = Client;

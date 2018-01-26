var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Similar to postgres client  
// https://github.com/brianc/node-postgres/blob/master/lib/client.js
// 

var Client = function (config) {
    EventEmitter.call(this);
    console.log('config ', config);
    this.socket = new net.Socket();
};

util.inherits(Client, EventEmitter);

Client.prototype.connect = function (callback) {
    var self = this;
    this.socket.connect(9000, "127.0.0.1", function() {
        if (callback) {
            callback(null, self)
            // remove callback for proper error handling
            // after the connect event
            callback = null;
          }
          self.emit('connect');
    });
    this.socket.on('data', function(data) {
        // call this._callback 
        console.log('received ', String(data));
        var docb = self._callback;  
        self._callback = null;
        docb(null, data);
    });
};

Client.prototype.send = function(values,  callback) {
    if (this._callback) {
        callback(new Error('already busy'));
        return;
    }
    this._callback = callback;
    this.socket.write(values, function() {
        console.log('sent');
    });
};

Client.prototype.cancel = function (client, query) {
    console.trace('cancel query ', query);
};

Client.prototype.end = function (cb) {
    console.trace('end socket or query? ');
    this.socket.end();
    cb();
};

module.exports = Client;







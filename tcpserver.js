var net = require('net');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var clients = {};

app.get("/", function(req, res) {
  res.send(JSON.stringify(Object.keys(clients)));
});

var server = net.createServer();  
server.on('connection', handleConnection);

app.listen(9001, () => console.log("tcpserver status port 9001 "));

server.listen(9000, function() {  
  console.log('server listening to %j', server.address());
});

function handleConnection(conn) {  
  var remoteAddress = conn.remotePort;
  console.log('new client connection ', remoteAddress);

  clients[remoteAddress] = conn;
  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
      console.log('connection data from ', new Date().toISOString(), remoteAddress);
      var params = JSON.parse(String(d));
      setTimeout(function() {
		    console.log('send back ', new Date().toISOString(), remoteAddress);
    		conn.write(d);
    }, parseInt(params.time)*1000);
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
  }

  function onConnError(err) {
    console.log('Connection error: ', remoteAddress, err.message);
  }
}

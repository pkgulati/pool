var net = require("net");
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
var pool = require("./pool");
var spool = new pool();

var server = net.createServer();
server.on("connection", handleConnection);

server.listen(9000, function() {
  console.log("server listening ");
});

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("new client connection from ", remoteAddress);

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function onConnData(d) {
    console.log("tcpserver  data from ", remoteAddress);
    var params = JSON.parse(String(d));
    console.log('wait ', parseInt(params.time));
    setTimeout(function() {
      console.log('send back');
      conn.write(d);
    }, parseInt(params.time) * 1000);
  }

  function onConnClose() {
    console.log("tcpserver connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("tcpserver Connection %s error: %s", remoteAddress, err.message);
  }
}

spool.connect();

app.use(express.static("public"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/status", function(req, res) {
  res.send("ok");
});

app.post("/send", function(req, res) {
  var params = req.body;
  var sentFlag;
  spool.send(JSON.stringify(params), function() {
    res.send("send cb");
  });
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));

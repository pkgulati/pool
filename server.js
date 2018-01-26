var net = require("net");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var Pool = require("./pool");
var Client = require("./client");

var spool = new Pool({
  database: 'postgres',
  user: 'brianc',
  password: 'secret!',
  port: 5432,
  ssl: false,
  max: 20, // set pool max size to 20
  min: 4, // set min pool size to 4
  idleTimeoutMillis: 990000, // close idle clients after 1 second
  connectionTimeoutMillis: 9000, // return an error after 1 second if connection could not be established
});

app.use(express.static("public"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/status", function(req, res) {
  res.send("ok");
});

app.post("/send", function(req, res) {
  var params = req.body;
  var sentFlag;
  spool.connect(function(err, client, done) {
    client.send(JSON.stringify(params), function(err, res) {
        res.send("send cb ", err, res);
        done();
    });
  });
});

// first message
spool.connect(function(err, client, done) {
  var params =  {time:1};
  client.send(JSON.stringify(params), function(err, res) {
      done();
  });
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));

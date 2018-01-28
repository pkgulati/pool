var net = require("net");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var Pool = require("./pool");
var Client = require("./client");

var messages = [];

var spool = new Pool({
  database: 'postgres',
  user: 'brianc',
  password: 'secret!',
  port: 5432,
  ssl: false,
  max: 4, // set pool max size to 20
  min: 3, // set min pool size to 4
  idleTimeoutMillis: 990000, // close idle clients after 1 second
  connectionTimeoutMillis: 25000, // return an error after 1 second if connection could not be established
});

app.use(express.static("public"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/status", function(req, res) {
  res.send(JSON.stringify(messages));
});

var nextMessageIndex = 0;
app.post("/send", function(req, res) {
  var params = req.body;
  var messageIndex = nextMessageIndex;
  nextMessageIndex++;
  messages[messageIndex] = params;
  var date = new Date; 
  messages[messageIndex].start = '' + date.getMinutes() + ':' + date.getSeconds();
  messages[messageIndex].sent = 'in queue';
  messages[messageIndex].received = '';
  res.send(JSON.stringify(messages));    
  spool.connect(function(err, client, done) {
    var date = new Date; 
    messages[messageIndex].sent = '' + date.getMinutes() + ':' + date.getSeconds();
    messages[messageIndex].received = 'processing';
    client.send(JSON.stringify(params), function(err, data) {
          var date = new Date; 
          messages[messageIndex].received = '' + date.getMinutes() + ':' + date.getSeconds();  
        done();
    });
  });
});

// var msgIndex = 0;
// var sleepTime = [16, 10, 13, 2, 5, 15, 2, 1, 10, 12, 3, 21];
// first message
// spool.connect(function(err, client, done) {
//   var params =  {time:10, index : msgIndex};
//   msgIndex++;
//   client.send(JSON.stringify(params), function(err, res) {
//       console.log('call back of sent in server.js ', err, String(res));
//       done();
//   });
// });

// for (var i=0; i < 10; i++) {
//   spool.connect(function(err, client, done) {
//     var params =  {time:sleepTime[i], index : msgIndex};
//     msgIndex++;
//     client.send(JSON.stringify(params), function(err, res) {
//         console.log('call back of sent in server.js ', err, String(res));
//         done();
//     });
//   });
// }

// for (var i=0; i < 10; i++) {
//   var params =  {time:sleepTime[i], index : msgIndex};
//   msgIndex++;
//   spool.send(JSON.stringify(params));
// }

app.listen(3000, () => console.log("Example app listening on port 3000!"));

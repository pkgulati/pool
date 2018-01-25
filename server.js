const express = require("express");
const app = express();
var net = require("net");
var bodyParser = require("body-parser");

var clients = [];

app.use(express.static("public"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function status() {
  var text = "No. of clients " + clients.length;
  clients.forEach(function(cl) {
    text += "<p> " + cl.readyState + " " + cl.isBusy + " " + " </p> ";
  });
  return text;
}

for (var i = 0; i < 4; i++) {
  var client = new net.Socket();
  clients.push(client);
  client.connect(9000, "127.0.0.1");
  
  
}


app.get("/status", function(req, res) {
  res.send(status());
});

app.post("/send", function(req, res) {
  var params = req.body;
  var sentFlag;
  for (var i = 0; i < 10; i++) {
      var cl = clients[i];
      if (cl && cl.readyState == 'open' && !cl.isBusy) {
        cl.isBusy = true;
        cl.once('data', function(e) {
            console.log('received ');
            cl.isBusy = false;
        });
        cl.write(JSON.stringify(params));
        console.log('sent ', cl.localPort);
        sentFlag = true;
        break;   
      }
  }
  res.send(sentFlag ? "message sent" :"no client free");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));

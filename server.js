const express = require('express')
const app = express()
var net = require('net');
var bodyParser = require('body-parser');

var clients = [];

app.use(express.static('public'))
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


function status() {
    var text =  'No. of clients ' + clients.length;
    clients.forEach( function(cl) {
        text += '<p> client </p>';
    });
    return text;
}

app.get('/connect/new', (req,res) => {
    var client = new net.Socket();
    clients.push(client);
    client.connect(9000, '127.0.0.1', function() {
        console.log('Connected');
        res.send(status());
    });
});

app.get('/status', function(req, res){
    res.send(status());
});

app.get('/disconnect/:id', function(req, res){
    console.log('disconnect ', req.params.id);
    var isnum = /^\d+$/.test(req.params.id);
    if (isnum) {
        var asNum = parseInt(req.params.id) - 1;
        var cl = clients[asNum];
        if (cl) {
            clients.splice(asNum-1, 1);
            cl.end();
        }
    }
    res.send(status());
});

app.post('/send', function(req, res){
    var params = req.body;
    var idx = parseInt(params.client)-1;
    var cl = clients[idx];
    if (cl) {
        cl.write(params.message);
        res.send('message sent');
    }
    else {
        res.send('no such client');
    }
   
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))

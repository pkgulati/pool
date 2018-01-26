var net = require('net');

var server = net.createServer();  
server.on('connection', handleConnection);

server.listen(9000, function() {  
  console.log('server listening to %j', server.address());
});

function handleConnection(conn) {  
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);

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
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }
}

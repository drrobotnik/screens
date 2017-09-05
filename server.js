var https = require('https'),
    express = require('express'),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    sp = require('serialport'),
    ipc = require('node-ipc'),
    scanner = require('libnmap');

var ifaces = os.networkInterfaces();
var dir = __dirname;
// @TODO: making a big assumption that this entry exists.
var networkHost = ifaces['enp2s0'][0].address;

var network = [];

// 1. What is my IP. 102 is always secondary.
// 2. Determine if there are other devices networked.
// 3. If there are other devices not within 101 & 102, then set this device as secondary.

var broadcastRange = networkHost.split('.');

broadcastRange.pop();
broadcastRange = broadcastRange.join('.') + '.1-255';

var opts = {
    ports: '80,443,1025,8000',
    range: [
        broadcastRange
    ]
};

scanner.scan(opts, function(err, report) {
    if(err) console.log(err);

    console.log('THIS SHOULD BE THE REPORT');

    for(var item in report) {

	var host = report[item].host;

	for(var hostItem in host ) {
	    var item = host[hostItem].address[0].item.addr;
            //console.log(item);
            network.push(item);
	}
    }

    var index = network.indexOf(networkHost);
    if(index > -1) {
        network.splice(index,1);
    }
    console.log(network);
});

ipc.config.id = 'world';
ipc.config.retry = 1500;
ipc.config.rawBuffer = true;
ipc.config.networkPort = 8000;
ipc.config.networkHost = networkHost;

ipc.serveNet('udp4', function() {
    console.log('udp4 started......');
    ipc.server.on('data', function(data, socket) {
        playVideo( data.toString() );
        // do stuff
    });
});

var app = express(),
serverPort = 1025;

app.use(express.static(dir + '/public'));


app.get('/', function(req,res) {
	    res.sendFile(path.join(__dirname+'/public/index.html'));
});

var options = {
	key: fs.readFileSync(dir + '/file.pem'),
	cert: fs.readFileSync(dir + '/file.crt')
};

var server = https.createServer(options, app),
	io = require('socket.io')(server);

server.listen(serverPort, function() {
	console.log('server up and running at %s port', serverPort);
});

io.on('connection', newConnection);

function newConnection( socket ) {

	console.log('new connection ' + socket.id);

	socket.on( 'PlayVideo', playVideo );

}

function playVideo( video_id ) {
	console.log( 'play video #' + video_id );
	// this.emit( 'responsePlayVideo', video_id );
	io.sockets.emit('responsePlayVideo', video_id);
}

ipc.server.start();

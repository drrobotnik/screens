var https = require('https'),
    express = require('express'),
    os = require('os'),
    fs = require('fs'),
    ipc = require('node-ipc');

var ifaces = os.networkInterfaces();
var dir = __dirname;
// @TODO: making a big assumption that this entry exists.
//var networkHost = ifaces['enp2s0'][0].address;
var networkHost = '192.168.0.102'

console.log(networkHost);

ipc.config.id = 'world';
ipc.config.retry = 1500;
ipc.config.rawBuffer = true;
ipc.config.networkPort = 8000;
ipc.config.networkHost = networkHost;

ipc.serveNet('udp4', function() {
    console.log('udp4 started......');
    ipc.server.on('data', function(data, socket) {

        var video = data.toString();

        var formattedCommand = video.toLowerCase();

        switch( formattedCommand ) {
            case "mountains" :
                video = "0";
                break;
            case "streams" :
                video = "1";
                break;
            case "beaches" :
                video = "2";
                break;
            case "home" :
                video = "3";
                break;
           default:
                video = video;
       }

        playVideo( video );
    });
});

var app = express(),
serverPort = 1025;

app.use(express.static(dir + '/public'));

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

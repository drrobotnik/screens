var https = require('https'),
	express = require('express'),
	fs = require('fs');


var app = express(),
serverPort = 443;

app.use(express.static('public'));

var options = {
	key: fs.readFileSync('./file.pem'),
	cert: fs.readFileSync('./file.crt')
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
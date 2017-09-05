var https = require('https'),
    express = require('express'),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    ipc = require('node-ipc'),
    scanner = require('libnmap');

var ifaces = os.networkInterfaces(),
    dir = __dirname,
    networkHost = ifaces['enp2s0'][0].address, // @TODO: making a big assumption that this entry exists.
    network = [],
    broadcastRange = networkHost.split('.'),
    opts = { ports: '80,443,1025,8000' },
    app = express(),
    serverPort = 1025,
    route = 'secondary.html';
// 1. What is my IP. 102 is always secondary.
// 2. Determine if there are other devices networked.
// 3. If there are other devices not within 101 & 102, then set this device as secondary.


broadcastRange.pop();

var hostPrefix = broadcastRange.join('.');

broadcastRange = broadcastRange.join('.') + '.1-255';
opts.range = [ broadcastRange ];

scanner.scan(opts, function(err, report) {
    if(err) console.log(err);

    console.log('THIS SHOULD BE THE REPORT');

    for(var item in report) {

	var host = report[item].host;

	for(var hostItem in host ) {
	    var item = host[hostItem].address[0].item.addr;
            network.push(item);
	}
    }

    var localIndex = network.indexOf(networkHost);
    console.log('LOCAL INDEX');
    console.log(localIndex);
    if(localIndex > -1) {
        network.splice(localIndex,1);
    }

    var secondaryIndex = network.indexOf(hostPrefix + '.102');

    if(secondaryIndex > -1) {
        network.splice(secondaryIndex,1);
    }

//console.log(networkHost);
//    console.log( networkHost == hostPrefix + '.101' );
//    console.log( network.length );
//    console.log( networkHost == hostPrefix + '.102' );


    if( ( networkHost == hostPrefix + '.101' && network.length ) || networkHost == hostPrefix + '.102' ) {
        route = 'secondary.html';
    }else{
        route = 'index.html';
    }

    app.use(express.static(dir + '/public'));


    app.get('/', function(req,res) {
        var sendFilePath = path.join(__dirname+'/public/secondary.html');
        console.log('SEND FILE PATH');
        console.log(sendFilePath);
        res.sendFile(sendFilePath);
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

ipc.server.start();

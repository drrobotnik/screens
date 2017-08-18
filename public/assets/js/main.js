var socket;

var localUrl = 'files:///home/pi/screens/public';

var videos = [
	'/assets/video/video-1.mp4',
	'/assets/video/video-2.mp4',
	'/assets/video/video-3.mp4'
];

jQuery(document).ready(function($) {
	console.log(window.location);
	socket = io.connect(window.location.origin);

	function ResponsePlayVideo( video_id ) {
		var videoUrl = videos[ video_id ];
		if ( '/secondary.html' === window.location.pathname ) {
			videoUrl = localUrl + videos[ video_id ];
		}
		video = { 'mp4': videoUrl };
		$('.bg-video').attr( 'data-bg-video', JSON.stringify(video) );
		$('.bg-video').find('video').remove();
		console.log( $('.bg-video').attr('data-bg-video') );
		window.CustVid.initialize();
		//console.log( videos[ video_id ] );
	}

	$('.btn').on('click', function() {
		var video_index = $(this).index( '.btn' );
		socket.emit("PlayVideo", video_index );
	});

	socket.on('responsePlayVideo', ResponsePlayVideo);
});
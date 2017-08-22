var socket;

var localUrl = 'files:///home/pi/screens/public';

var videos = [
	'/assets/video/mountains.mp4',
	'/assets/video/video-2.mp4',
	'/assets/video/beach.mp4'
];

var videoState = 'home';

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
		window.CustVid.initialize();
	}

	$('.btn').on('click', function() {
		$('.video-controls').fadeOut();
		var video_index = $(this).index( '.btn' );
		socket.emit("PlayVideo", video_index );
	});

	socket.on('responsePlayVideo', ResponsePlayVideo);
});
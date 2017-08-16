var socket;

var videos = [
	'/assets/video/video-1.mp4',
	'/assets/video/video-2.mp4',
	'/assets/video/video-3.mp4'
]

jQuery(document).ready(function($) {
	socket = io.connect(window.location.origin);

	function ResponsePlayVideo( video_id ) {
		video = { 'mp4': videos[ video_id ] };
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
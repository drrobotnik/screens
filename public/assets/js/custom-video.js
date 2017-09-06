;(function(window, document, undefined) {

test = null;

function CustomVideo() {}


	CustomVideo.prototype = {
		testResult: null,
		
		test: function() {
			var video = document.createElement( 'video' );
			var canPlay = video.canPlayType( 'video/mp4' );
			return canPlay;
		},
		initialize: function() {

			if ( false === this.test() ) {
				return false;
			}

			var videos = document.querySelectorAll('.bg-video');

			[].forEach.call(videos, function(el) {

				var sources = el.getAttribute('data-bg-video');

				console.log(sources);

				if( 0 < sources.length ) {
					sources = JSON.parse( sources );
				}

				video = document.createElement( 'video' );

				if( sources.mp4 ) {
					mp4 = document.createElement( 'source' );
					mp4.setAttribute( 'type','video/mp4' );
					mp4.setAttribute( 'src', sources.mp4 );

					video.appendChild(mp4);
				}

				if( sources.webm ) {
					webm = document.createElement( 'source' );
					webm.setAttribute( 'type','video/webm' );
					webm.setAttribute( 'src', sources.webm );

					video.appendChild(webm);
				}

				video.autoplay = 'autoplay';
				video.loop = 'loop';
//				video.muted = 'muted';
				video.setAttribute('webkit-playsinline', 'webkit-playsinline');
				video.setAttribute('playsinline', 'playsinline');

				el.appendChild(video);
			});
		}
	}

	window.CustVid = new CustomVideo();

	CustVid.initialize();

})(window, document);

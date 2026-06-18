(function () {
    window.initPlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('videoStart');
        var hls = null;
        var attached = false;

        if (!video || !button || !source) {
            return;
        }

        function attemptPlay() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        function attachSource() {
            if (attached) {
                return true;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return true;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(source);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    attemptPlay();
                });
                hls.attachMedia(video);
                return false;
            }

            video.src = source;
            return true;
        }

        function start() {
            button.classList.add('is-hidden');
            if (attachSource()) {
                attemptPlay();
            }
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());

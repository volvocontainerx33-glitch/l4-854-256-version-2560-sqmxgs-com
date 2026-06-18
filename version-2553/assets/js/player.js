(function () {
  window.initMoviePlayer = function (url) {
    const video = document.getElementById('movie-player');
    const overlay = document.querySelector('.player-overlay');
    let hlsInstance = null;
    let attached = false;

    function attach() {
      if (attached || !video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }

      attached = true;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (hlsInstance) {
        hlsInstance.stopLoad();
      }
    });
  };
})();

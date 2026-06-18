(function () {
  function setupMoviePlayer(rootId, source) {
    var root = document.getElementById(rootId);

    if (!root) {
      return;
    }

    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var hls = null;
    var started = false;

    if (!video || !cover) {
      return;
    }

    function playVideo() {
      root.classList.add('is-playing');
      cover.setAttribute('aria-hidden', 'true');
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            }
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        video.play().catch(function () {});
        return;
      }

      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      video.play().catch(function () {});
    }

    cover.addEventListener('click', playVideo);
    root.addEventListener('click', function (event) {
      if (!started && event.target === root) {
        playVideo();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();

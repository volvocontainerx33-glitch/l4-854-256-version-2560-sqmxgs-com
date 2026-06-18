(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var stream = shell.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;

    var prepare = function () {
      if (prepared || !video || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          }
        });
      } else {
        video.src = stream;
      }
      prepared = true;
    };

    var play = function () {
      prepare();
      shell.classList.add('is-ready');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    shell.addEventListener('click', function () {
      if (!prepared || video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-ready');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();

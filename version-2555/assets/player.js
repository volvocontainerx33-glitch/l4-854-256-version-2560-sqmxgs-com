(function () {
  var video = document.querySelector('.movie-player');
  var trigger = document.querySelector('.play-trigger');

  if (!video || !trigger) {
    return;
  }

  var source = video.getAttribute('data-stream');
  var loaded = false;
  var hlsInstance = null;

  function loadVideo() {
    if (loaded || !source) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startVideo() {
    loadVideo();
    trigger.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  trigger.addEventListener('click', startVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();

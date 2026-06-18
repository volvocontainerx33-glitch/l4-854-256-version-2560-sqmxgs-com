(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });

  function setupPlayer(wrapper) {
    var video = wrapper.querySelector('video[data-video-src]');
    var button = wrapper.querySelector('[data-player-button]');
    var status = wrapper.querySelector('[data-player-status]');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !button) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initializeAndPlay() {
      var source = video.getAttribute('data-video-src');
      if (!source) {
        setStatus('未找到可用播放源。');
        return;
      }

      button.classList.add('is-hidden');

      if (!initialized) {
        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('已使用浏览器原生 HLS 播放能力。');
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('HLS 播放源已加载，可以正常播放。');
            video.play().catch(function () {
              setStatus('播放源已就绪，请再次点击播放器开始播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放器遇到网络或媒体错误，请刷新页面后重试。');
            }
          });
        } else {
          setStatus('当前浏览器暂不支持 HLS 播放，请更换浏览器或开启系统播放能力。');
          return;
        }
      }

      video.play().catch(function () {
        setStatus('播放源已就绪，请再次点击播放器开始播放。');
      });
    }

    button.addEventListener('click', initializeAndPlay);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();

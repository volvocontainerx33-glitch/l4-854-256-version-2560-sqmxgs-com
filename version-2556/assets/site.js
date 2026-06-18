(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navPanel = document.querySelector('[data-nav-panel]');

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      navPanel.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var current = 0;

    if (slides.length > 1) {
      window.setInterval(function () {
        slides[current].classList.remove('is-active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('is-active');
      }, 4200);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var activeChip = scope.querySelector('[data-filter-chip].is-active');
    var query = normalize(input ? input.value : '');
    var chip = activeChip ? normalize(activeChip.getAttribute('data-filter-chip')) : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-value'));
      var genre = normalize(card.getAttribute('data-genre'));
      var matchText = !query || text.indexOf(query) !== -1;
      var matchChip = chip === 'all' || genre.indexOf(chip) !== -1 || text.indexOf(chip) !== -1;
      var shouldShow = matchText && matchChip;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));

    if (input && input.hasAttribute('data-query-input')) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(scope);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        applyFilter(scope);
      });
    });

    applyFilter(scope);
  });

  document.querySelectorAll('[data-video-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-start]');
    var message = player.parentElement ? player.parentElement.querySelector('[data-player-message]') : null;
    var hlsInstance = null;
    var prepared = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function sourceUrl() {
      return video ? video.getAttribute('data-video-src') : '';
    }

    function prepareAndPlay() {
      if (!video) {
        return;
      }

      var src = sourceUrl();

      if (!src) {
        setMessage('播放源暂不可用');
        return;
      }

      if (!prepared) {
        prepared = true;

        if (window.Hls && window.Hls.isSupported() && src.indexOf('.m3u8') !== -1) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setMessage('请再次点击播放器开始播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源加载失败，请稍后再试');
            }
          });
        } else {
          video.src = src;
          video.play().catch(function () {
            setMessage('请再次点击播放器开始播放');
          });
        }
      } else {
        video.play().catch(function () {
          setMessage('请再次点击播放器开始播放');
        });
      }

      if (button) {
        button.classList.add('is-hidden');
      }
      setMessage('');
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        prepareAndPlay();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        setMessage('');
      });

      video.addEventListener('error', function () {
        setMessage('播放源加载失败，请稍后再试');
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        prepareAndPlay();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();

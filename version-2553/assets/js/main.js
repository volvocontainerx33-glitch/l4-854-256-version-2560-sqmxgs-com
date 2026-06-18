(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    const input = root.querySelector('[data-filter-text]');
    const region = root.querySelector('[data-filter-region]');
    const year = root.querySelector('[data-filter-year]');
    const grid = document.querySelector('[data-filter-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];

    function applyFilter() {
      const query = input ? input.value.trim().toLowerCase() : '';
      const selectedRegion = region ? region.value : '';
      const selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        const text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
        const regionOk = !selectedRegion || card.dataset.region === selectedRegion;
        const yearOk = !selectedYear || card.dataset.year === selectedYear;
        const queryOk = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-hidden-card', !(regionOk && yearOk && queryOk));
      });
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SEARCH_MOVIES) {
    const form = searchPage.querySelector('[data-search-form]');
    const input = searchPage.querySelector('[data-search-input]');
    const results = searchPage.querySelector('[data-search-results]');
    const params = new URLSearchParams(window.location.search);

    function card(movie) {
      return [
        '<a class="movie-card" href="' + movie.file + '">',
        '  <div class="poster-wrap">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-hover">▶</span>',
        '    <span class="year-pill">' + escapeHtml(movie.year) + '</span>',
        '  </div>',
        '  <div class="card-copy">',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="meta-line">',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.genre) + '</span>',
        '    </div>',
        '  </div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function render() {
      const query = input.value.trim().toLowerCase();
      let list = window.SEARCH_MOVIES;

      if (query) {
        list = list.filter(function (movie) {
          return movie.searchText.indexOf(query) !== -1;
        });
      } else {
        list = list.slice(0, 40);
      }

      results.innerHTML = list.slice(0, 120).map(card).join('');

      if (!results.innerHTML) {
        results.innerHTML = '<div class="ranking-panel">没有找到匹配影片</div>';
      }
    }

    if (params.get('q')) {
      input.value = params.get('q');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render();
    });

    input.addEventListener('input', render);
    render();
  }
})();

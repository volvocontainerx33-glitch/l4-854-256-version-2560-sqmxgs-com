(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
      menuButton.addEventListener('click', function () {
        mainNav.classList.toggle('is-open');
      });
    }

    setupHeroCarousel();
    setupCategoryFilters();
    setupSearchPage();
  });

  function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCategoryFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }

    var keyword = scope.querySelector('[data-filter-keyword]');
    var year = scope.querySelector('[data-filter-year]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.ownerDocument.querySelectorAll('[data-card]'));
    var count = scope.querySelector('[data-filter-count]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keywordValue = normalize(keyword && keyword.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));

        var matchesKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var matchesRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
        var matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        var shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesType;

        card.classList.toggle('is-hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [keyword, year, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!form || !input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + item.url + '">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="movie-duration">' + item.duration + '</span>',
        '    <span class="movie-category">' + escapeHtml(item.category) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="movie-meta"><span>' + item.year + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <div class="movie-card-tags"><span>#' + escapeHtml(item.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch(query) {
      var q = normalize(query);
      if (!q) {
        results.innerHTML = '';
        count.textContent = '请输入关键词开始搜索。';
        return;
      }

      var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return normalize([
          item.title,
          item.oneLine,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          item.tags
        ].join(' ')).indexOf(q) !== -1;
      }).slice(0, 120);

      count.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length === 120 ? '（最多显示 120 条）' : '') + '。';
      results.innerHTML = matched.map(cardTemplate).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(input.value);
    });

    document.querySelectorAll('[data-search-suggestion]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-search-suggestion') || '';
        runSearch(input.value);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      input.value = initial;
      runSearch(initial);
    }
  }
})();

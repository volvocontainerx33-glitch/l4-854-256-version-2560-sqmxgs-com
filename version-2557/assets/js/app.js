(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initBackToTop() {
    var button = qs('[data-back-to-top]');

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initHero() {
    var hero = qs('[data-hero-carousel]');

    if (!hero) {
      return;
    }

    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function next() {
      show((current + 1) % slides.length);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    if (slides.length > 1) {
      start();
    }
  }

  function textOf(card, name) {
    return (card.getAttribute(name) || '').toLowerCase();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var section = scope.closest('section') || document;
      var input = qs('[data-filter-input]', scope);
      var type = qs('[data-filter-type]', scope);
      var year = qs('[data-filter-year]', scope);
      var list = qs('[data-card-list]', section);
      var empty = qs('[data-empty-state]', section);

      if (!list) {
        return;
      }

      var cards = qsa('[data-title]', list);

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            textOf(card, 'data-title'),
            textOf(card, 'data-region'),
            textOf(card, 'data-type'),
            textOf(card, 'data-year'),
            textOf(card, 'data-tags')
          ].join(' ');
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedType = !typeValue || textOf(card, 'data-type').indexOf(typeValue.toLowerCase()) !== -1;
          var matchedYear = !yearValue || textOf(card, 'data-year') === yearValue;
          var matched = matchedQuery && matchedType && matchedYear;

          card.style.display = matched ? '' : 'none';

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var preset = params.get('q');

      if (preset && input) {
        input.value = preset;
      }

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initBackToTop();
    initHero();
    initFilters();
  });
})();

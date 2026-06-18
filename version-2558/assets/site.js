(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;
    var setSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    var startTimer = function () {
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5000);
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        setSlide(index);
        startTimer();
      });
    });
    setSlide(0);
    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var root = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var input = panel.querySelector('[data-search-input]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var empty = root.querySelector('[data-empty-state]');
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var typeText = card.getAttribute('data-type') || '';
        var yearText = card.getAttribute('data-year') || '';
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (typeValue && typeText.indexOf(typeValue) === -1) {
          matched = false;
        }
        if (yearValue && yearText.indexOf(yearValue) === -1) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
})();

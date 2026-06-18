(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';

      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }

      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var liveInput = document.querySelector('[data-live-search]');
  var genreSelect = document.querySelector('[data-genre-select]');
  var yearSelect = document.querySelector('[data-year-select]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    var query = liveInput ? normalize(liveInput.value) : '';
    var genre = genreSelect ? normalize(genreSelect.value) : '';
    var year = yearSelect ? normalize(yearSelect.value) : '';
    var activeChip = document.querySelector('[data-filter-chip].active');
    var chipValue = activeChip ? normalize(activeChip.getAttribute('data-filter-chip')) : '';

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-keywords')
      ].join(' '));
      var cardGenre = normalize(card.getAttribute('data-genre'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var okQuery = !query || text.indexOf(query) !== -1;
      var okGenre = !genre || cardGenre.indexOf(genre) !== -1;
      var okYear = !year || cardYear === year;
      var okChip = !chipValue || text.indexOf(chipValue) !== -1;

      card.classList.toggle('hidden-card', !(okQuery && okGenre && okYear && okChip));
    });
  }

  if (liveInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      liveInput.value = q;
    }

    liveInput.addEventListener('input', applyFilters);
  }

  if (genreSelect) {
    genreSelect.addEventListener('change', applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      applyFilters();
    });
  });

  applyFilters();

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('show', window.scrollY > 360);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

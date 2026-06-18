(function () {
    var header = document.getElementById('siteHeader');
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                setSlide(i);
                startTimer();
            });
        });

        setSlide(0);
        startTimer();
    }

    var grid = document.getElementById('filterGrid');
    if (grid) {
        var searchInput = document.getElementById('searchInput');
        var categoryFilter = document.getElementById('categoryFilter');
        var typeFilter = document.getElementById('typeFilter');
        var yearFilter = document.getElementById('yearFilter');
        var resetButton = document.getElementById('resetFilters');
        var emptyState = document.getElementById('emptyState');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.filter-card'));

        function yearMatches(value, filter) {
            var year = parseInt(value, 10);
            if (!filter) {
                return true;
            }
            if (filter === 'older') {
                return year && year < 1990;
            }
            if (filter.indexOf('-') > -1) {
                var parts = filter.split('-');
                var min = parseInt(parts[0], 10);
                var max = parseInt(parts[1], 10);
                return year >= min && year <= max;
            }
            return String(value).indexOf(filter) > -1;
        }

        function applyFilters() {
            var query = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
            var category = categoryFilter && categoryFilter.value ? categoryFilter.value : '';
            var type = typeFilter && typeFilter.value ? typeFilter.value : '';
            var year = yearFilter && yearFilter.value ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matchesQuery = !query || keywords.indexOf(query) > -1;
                var matchesCategory = !category || cardCategory === category;
                var matchesType = !type || cardType.indexOf(type) > -1;
                var matchesYear = yearMatches(cardYear, year);
                var show = matchesQuery && matchesCategory && matchesType && matchesYear;
                card.classList.toggle('is-hidden-card', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [searchInput, categoryFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (categoryFilter) {
                    categoryFilter.value = '';
                }
                if (typeFilter) {
                    typeFilter.value = '';
                }
                if (yearFilter) {
                    yearFilter.value = '';
                }
                applyFilters();
            });
        }

        applyFilters();
    }
}());

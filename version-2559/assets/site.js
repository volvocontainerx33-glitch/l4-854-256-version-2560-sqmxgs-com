(function () {
    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', open);
            toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
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
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyQueryFromUrl() {
        var scope = document.querySelector('[data-global-search]');
        if (!scope) {
            return;
        }
        var input = scope.querySelector('[data-card-search]');
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-card-search]');
            var year = scope.querySelector('[data-year-filter]');
            var region = scope.querySelector('[data-region-filter]');
            var category = scope.querySelector('[data-category-filter]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var empty = scope.querySelector('[data-empty-state]');

            function run() {
                var keyword = normalize(input && input.value);
                var selectedYear = normalize(year && year.value);
                var selectedRegion = normalize(region && region.value);
                var selectedCategory = normalize(category && category.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
                        matched = false;
                    }
                    if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedCategory && normalize(card.getAttribute('data-category')) !== selectedCategory) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, year, region, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', run);
                    control.addEventListener('change', run);
                }
            });
            run();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-cover');
            var url = player.getAttribute('data-video-url');
            var ready = false;
            var wantsPlay = false;
            if (!video || !button || !url) {
                return;
            }

            function restore() {
                if (!video.paused || video.ended) {
                    return;
                }
                button.classList.remove('is-hidden');
                player.classList.remove('is-playing');
            }

            function safePlay() {
                if (!wantsPlay) {
                    return;
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        restore();
                    });
                }
            }

            function attach() {
                if (ready) {
                    safePlay();
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.load();
                    safePlay();
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        safePlay();
                    });
                    player.hlsPlayer = hls;
                } else {
                    video.src = url;
                    video.load();
                    safePlay();
                }
            }

            function play() {
                wantsPlay = true;
                button.classList.add('is-hidden');
                player.classList.add('is-playing');
                attach();
            }

            button.addEventListener('click', play);
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
            video.addEventListener('error', restore);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        applyQueryFromUrl();
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initPlayers();
    });
}());

(function () {
  "use strict";

  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = queryAll("[data-hero-slide]", hero);
    var thumbs = queryAll("[data-hero-thumb]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(Number(thumb.getAttribute("data-hero-thumb") || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function initPageFilter() {
    var input = document.querySelector("[data-page-filter]");
    var grid = document.querySelector("[data-filter-grid]");
    var count = document.querySelector("[data-filter-count]");
    if (!input || !grid) {
      return;
    }
    var cards = queryAll(".searchable-card", grid);

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" ").toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = keyword ? "匹配到 " + visible + " 条内容" : "本页共 " + cards.length + " 条内容";
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  }

  function initSearchPage() {
    var input = document.querySelector("[data-global-search]");
    var button = document.querySelector("[data-global-search-button]");
    var results = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-global-search-count]");
    var index = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !results || !index.length) {
      return;
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class="movie-card searchable-card">",
        "  <a class="poster-link" href="" + escapeHtml(movie.url) + "" aria-label="" + escapeHtml(movie.title) + " 在线观看">",
        "    <img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "封面" loading="lazy">",
        "    <span class="poster-year">" + escapeHtml(movie.year) + "</span>",
        "    <span class="poster-type">" + escapeHtml(movie.type) + "</span>",
        "  </a>",
        "  <div class="movie-card-body">",
        "    <div class="movie-meta-line"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.score) + "分</span></div>",
        "    <h3><a href="" + escapeHtml(movie.url) + "">" + escapeHtml(movie.title) + "</a></h3>",
        "    <p>" + escapeHtml(movie.oneLine) + "</p>",
        "    <div class="tag-row">" + tags + "</div>",
        "  </div>",
        "</article>"
      ].join("
");
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var matches = index.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return movie.searchText.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(card).join("
");
      if (count) {
        count.textContent = keyword
          ? "匹配到 " + matches.length + " 条结果，最多显示前 120 条。"
          : "未输入关键词，显示片库前 120 条内容。";
      }
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q) {
      input.value = q;
    }
    input.addEventListener("input", render);
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function initPlayer() {
    var video = document.querySelector("#movie-player");
    var button = document.querySelector("[data-play-button]");
    var status = document.querySelector("[data-player-status]");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-src");
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function load() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        setStatus("HLS 播放源已初始化，正在加载视频。");
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("浏览器原生 HLS 播放已启用。");
      } else {
        video.src = source;
        setStatus("已绑定播放源；若无法播放，请使用支持 HLS 的浏览器访问。");
      }
      return Promise.resolve();
    }

    function play() {
      load().then(function () {
        button.classList.add("is-hidden");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            button.classList.remove("is-hidden");
            setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
          });
        }
      });
    }

    button.addEventListener("click", play);
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("is-hidden");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initPageFilter();
    initSearchPage();
    initPlayer();
  });
})();

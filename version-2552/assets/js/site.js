(function () {
  "use strict";

  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function first(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function openSearch() {
    var modal = first("#search-modal");
    var input = first("#global-search-input");
    if (!modal) {
      return;
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderSearchResults();
    if (input) {
      setTimeout(function () {
        input.focus();
      }, 30);
    }
  }

  function closeSearch() {
    var modal = first("#search-modal");
    if (!modal) {
      return;
    }
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function createSearchCard(item) {
    var link = document.createElement("a");
    link.className = "search-item";
    link.href = item.url;
    link.innerHTML = [
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
      '<div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="wide-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.categoryName) + '</span></div></div>'
    ].join("");
    return link;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearchResults() {
    var list = first("#global-search-results");
    var input = first("#global-search-input");
    var category = first("#global-search-category");
    var region = first("#global-search-region");
    var items = window.movieSearchItems || [];
    if (!list) {
      return;
    }
    var keyword = normalize(input && input.value);
    var cat = category ? category.value : "";
    var reg = region ? region.value : "";
    var matches = items.filter(function (item) {
      var hay = normalize([item.title, item.oneLine, item.region, item.categoryName, item.genre, item.tags].join(" "));
      var textOk = !keyword || hay.indexOf(keyword) !== -1;
      var catOk = !cat || item.category === cat;
      var regOk = !reg || item.region === reg;
      return textOk && catOk && regOk;
    }).slice(0, 18);
    list.innerHTML = "";
    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "no-results is-visible";
      empty.textContent = "暂无匹配影片";
      list.appendChild(empty);
      return;
    }
    matches.forEach(function (item) {
      list.appendChild(createSearchCard(item));
    });
  }

  function setupHeader() {
    bySelector("[data-search-open]").forEach(function (button) {
      button.addEventListener("click", openSearch);
    });
    bySelector("[data-search-close]").forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });
    var input = first("#global-search-input");
    var category = first("#global-search-category");
    var region = first("#global-search-region");
    [input, category, region].forEach(function (node) {
      if (node) {
        node.addEventListener("input", renderSearchResults);
        node.addEventListener("change", renderSearchResults);
      }
    });
    var toggle = first("[data-mobile-toggle]");
    var panel = first("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var opened = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });
  }

  function setupHero() {
    var slider = first("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = bySelector(".hero-slide", slider);
    var dots = bySelector(".hero-dots button", slider);
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function next() {
      show(current + 1);
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(next, 5200);
    }
    var prevButton = first("[data-hero-prev]", slider);
    var nextButton = first("[data-hero-next]", slider);
    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        next();
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });
    restart();
  }

  function setupCardFilter() {
    bySelector("[data-card-filter]").forEach(function (input) {
      var section = input.closest("section") || document;
      var cards = bySelector("[data-filter-card]", section);
      var empty = first("[data-no-results]", section);
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var hay = normalize([card.getAttribute("data-title"), card.getAttribute("data-tags"), card.getAttribute("data-region"), card.getAttribute("data-category")].join(" "));
          var ok = !keyword || hay.indexOf(keyword) !== -1;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  }

  window.setupMoviePlayer = function (mediaUrl) {
    var video = first("#movie-player");
    var overlay = first(".player-overlay");
    if (!video || !mediaUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;
    function start() {
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = mediaUrl;
      video.play().catch(function () {});
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", start, { once: true });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupHeader();
    setupHero();
    setupCardFilter();
  });
})();

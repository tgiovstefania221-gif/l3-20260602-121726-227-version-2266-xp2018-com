(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  if (navButton) {
    navButton.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };
    var apply = function () {
      var q = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize((card.dataset.title || '') + ' ' + (card.dataset.text || ''));
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (year && card.dataset.year !== year) {
          matched = false;
        }
        if (region && card.dataset.region !== region) {
          matched = false;
        }
        if (type && card.dataset.type !== type) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };
    [input, yearSelect, regionSelect, typeSelect].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        apply();
      });
    }
    apply();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var button = player.querySelector('[data-player-button]');
    var hlsInstance = null;
    var started = false;
    var start = function () {
      if (!video || typeof playerStream !== 'string' || !playerStream) {
        return;
      }
      if (!started) {
        if (window.Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(playerStream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playerStream;
        }
        started = true;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}());

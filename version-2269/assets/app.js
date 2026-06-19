(function () {
  var mobileButton = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('.back-top');

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var typeSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  var yearSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));

  var filterPage = function () {
    var query = filterInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(' ');
    var typeValue = typeSelects.length ? typeSelects[0].value : '';
    var yearValue = yearSelects.length ? yearSelects[0].value : '';

    filterItems.forEach(function (item) {
      var text = (item.getAttribute('data-search') || '').toLowerCase();
      var itemType = item.getAttribute('data-type') || '';
      var itemYear = parseInt(item.getAttribute('data-year') || '0', 10);
      var queryMatch = !query || text.indexOf(query) !== -1;
      var typeMatch = !typeValue || itemType.indexOf(typeValue) !== -1;
      var yearMatch = true;

      if (yearValue) {
        var selectedYear = parseInt(yearValue, 10);
        yearMatch = selectedYear >= 2020 ? itemYear >= selectedYear : itemYear === selectedYear;
      }

      item.classList.toggle('is-filter-hidden', !(queryMatch && typeMatch && yearMatch));
    });
  };

  filterInputs.forEach(function (input) {
    input.addEventListener('input', filterPage);
  });

  typeSelects.concat(yearSelects).forEach(function (select) {
    select.addEventListener('change', filterPage);
  });

  var startNative = function (video, stream, cover) {
    video.src = stream;
    video.play().catch(function () {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');

    if (!video || !cover) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    var start = function () {
      if (!stream) {
        return;
      }

      cover.classList.add('is-hidden');

      if (video.getAttribute('data-ready') === '1') {
        video.play().catch(function () {
          cover.classList.remove('is-hidden');
        });
        return;
      }

      video.setAttribute('data-ready', '1');
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        startNative(video, stream, cover);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            cover.classList.remove('is-hidden');
          });
        });
        return;
      }

      startNative(video, stream, cover);
    };

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        start();
      }
    });
  });
}());

(function () {
  const body = document.body;
  const rootPrefix = body ? body.dataset.rootPrefix || './' : './';
  const mobileButton = document.querySelector('.js-menu-button');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const overlay = document.querySelector('[data-search-overlay]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const openButtons = document.querySelectorAll('.js-search-open');
  const closeButton = document.querySelector('[data-search-close]');
  const movies = typeof SEARCH_MOVIES !== 'undefined' ? SEARCH_MOVIES : [];

  function withRoot(path) {
    if (!path) {
      return rootPrefix;
    }
    return rootPrefix + path.replace(/^\.\//, '');
  }

  function clearResults(message) {
    if (!results) {
      return;
    }
    results.innerHTML = '';
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = message;
    results.appendChild(empty);
  }

  function addResult(item) {
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = withRoot(item.url);

    const img = document.createElement('img');
    img.src = withRoot(item.image);
    img.alt = item.title;
    img.loading = 'lazy';

    const copy = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = item.title;
    const meta = document.createElement('small');
    meta.textContent = item.meta;
    const desc = document.createElement('span');
    desc.textContent = item.desc;

    copy.appendChild(title);
    copy.appendChild(meta);
    copy.appendChild(desc);
    link.appendChild(img);
    link.appendChild(copy);
    results.appendChild(link);
  }

  function performSearch() {
    if (!input || !results) {
      return;
    }
    const query = input.value.trim().toLowerCase();
    if (!query) {
      clearResults('输入关键词开始浏览片库');
      return;
    }
    const found = movies.filter(function (item) {
      return item.searchText.indexOf(query) !== -1;
    }).slice(0, 14);
    results.innerHTML = '';
    if (!found.length) {
      clearResults('未找到相关影片');
      return;
    }
    found.forEach(addResult);
  }

  function openSearch() {
    if (!overlay) {
      return;
    }
    overlay.hidden = false;
    if (mobilePanel) {
      mobilePanel.classList.remove('is-open');
    }
    window.setTimeout(function () {
      if (input) {
        input.focus();
      }
    }, 30);
  }

  function closeSearch() {
    if (!overlay) {
      return;
    }
    overlay.hidden = true;
    if (input) {
      input.value = '';
    }
    clearResults('输入关键词开始浏览片库');
  }

  openButtons.forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeSearch);
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeSearch();
      }
    });
  }

  if (input) {
    input.addEventListener('input', performSearch);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    restart();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  const filterGrid = document.querySelector('[data-filter-grid]');

  if (filterPanel && filterGrid) {
    const buttons = Array.from(filterPanel.querySelectorAll('button'));
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const type = button.dataset.filterType;
        const value = button.dataset.filterValue;
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          let visible = true;
          if (type === 'region') {
            visible = card.dataset.region === value;
          }
          if (type === 'year') {
            visible = card.dataset.year === value;
          }
          if (type === 'all') {
            visible = true;
          }
          card.classList.toggle('is-hidden-by-filter', !visible);
        });
      });
    });
  }
})();

document.addEventListener("DOMContentLoaded", function() {
  var input = document.getElementById("site-search");
  var button = document.querySelector("[data-search-button]");
  var results = document.getElementById("search-results");
  var movies = window.siteMovies || [];
  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";

  function card(movie) {
    return [
      '<a class="search-card" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span>',
      '<h2>' + escapeHtml(movie.title) + '</h2>',
      '<p>★ ' + escapeHtml(movie.rating) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year || '精选') + '</p>',
      '<p>' + escapeHtml(movie.one.slice(0, 56)) + '</p>',
      '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function run() {
    var q = input ? input.value.trim().toLowerCase() : "";
    var list;
    if (q) {
      list = movies.filter(function(movie) {
        var hay = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags.join(' '), movie.one].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      }).slice(0, 80);
    } else {
      list = movies.slice(0, 24);
    }
    if (!results) return;
    if (!list.length) {
      results.innerHTML = '<div class="empty-state is-visible">没有匹配的影片</div>';
      return;
    }
    results.innerHTML = list.map(card).join('');
  }

  if (input) {
    input.value = initial;
    input.addEventListener("input", run);
    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        run();
      }
    });
  }
  if (button) {
    button.addEventListener("click", run);
  }
  run();
});

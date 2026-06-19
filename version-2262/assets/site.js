document.addEventListener("DOMContentLoaded", function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
    var input = panel.querySelector("[data-filter-input]");
    var year = panel.querySelector("[data-year-filter]");
    var list = panel.parentElement.querySelector("[data-filter-list]");
    var empty = panel.parentElement.querySelector("[data-empty-state]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];

    function runFilter() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var visible = 0;
      cards.forEach(function(card) {
        var hay = [card.dataset.title, card.dataset.key, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
        var ok = (!q || hay.indexOf(q) !== -1) && (!y || card.dataset.year === y);
        card.classList.toggle("is-hidden", !ok);
        if (ok) visible += 1;
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) input.addEventListener("input", runFilter);
    if (year) year.addEventListener("change", runFilter);
  });

  document.querySelectorAll("[data-scroll-player]").forEach(function(link) {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      var player = document.querySelector(".player-card");
      if (player) {
        player.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
});

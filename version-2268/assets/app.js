(function () {
    "use strict";

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs(".mobile-menu-button");
        var panel = qs(".mobile-nav-panel");
        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            var isOpen = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!isOpen));
            panel.hidden = isOpen;
        });
    }

    function setupBackToTop() {
        var button = qs(".back-to-top");
        if (!button) {
            return;
        }

        window.addEventListener("scroll", function () {
            button.classList.toggle("visible", window.scrollY > 520);
        });

        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function setupHeroSlider() {
        var slider = qs("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = qsa(".hero-slide", slider);
        var dots = qsa(".hero-dot", slider);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = Number(dot.getAttribute("data-target-slide"));
                show(target);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyCardFilter(input, scope) {
        var root = scope || document;
        var cards = qsa(".movie-card", root);
        var countNode = qs(".filter-count", root) || qs(".filter-count");
        var value = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matched = !value || haystack.indexOf(value) !== -1;
            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (countNode) {
            countNode.textContent = "显示 " + visible + " 部影片";
        }
    }

    function setupFilters() {
        qsa(".card-filter-input").forEach(function (input) {
            input.addEventListener("input", function () {
                var section = input.closest("section") || document;
                applyCardFilter(input, section);
            });
        });

        var globalInput = qs("#site-search-input");
        if (globalInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || params.get("genre") || "";
            if (query) {
                globalInput.value = query;
                applyCardFilter(globalInput, document);
            }
        }

        qsa("[data-search-shortcut]").forEach(function (button) {
            button.addEventListener("click", function () {
                var input = qs("#site-search-input") || qs(".card-filter-input");
                if (!input) {
                    return;
                }
                input.value = button.getAttribute("data-search-shortcut") || "";
                applyCardFilter(input, document);
            });
        });
    }

    function setupSearchForms() {
        qsa(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs("input[name='q']", form);
                if (!input) {
                    return;
                }
                input.value = input.value.trim();
            });
        });
    }

    function setupPlayers() {
        qsa("[data-player]").forEach(function (player) {
            var video = qs("video", player);
            var button = qs(".player-start", player);
            if (!video || !button) {
                return;
            }

            var source = video.getAttribute("data-source");
            var loaded = false;
            var hlsInstance = null;

            function loadSource() {
                if (loaded || !source) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        maxBufferLength: 30
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }

                loaded = true;
                player.classList.add("is-loaded");
            }

            function playVideo() {
                loadSource();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            button.addEventListener("click", playVideo);
            video.addEventListener("click", function () {
                if (!loaded) {
                    playVideo();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupBackToTop();
        setupHeroSlider();
        setupSearchForms();
        setupFilters();
        setupPlayers();
    });
}());

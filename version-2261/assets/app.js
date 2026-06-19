import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
};

ready(() => {
    setupNavigation();
    setupImageFallbacks();
    setupSpotlight();
    setupLocalFilters();
    setupPlayers();
});

function setupNavigation() {
    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
    });
}

function setupImageFallbacks() {
    document.querySelectorAll(".poster-frame img").forEach((image) => {
        if (image.complete && image.naturalWidth === 0) {
            markMissing(image);
        }
        image.addEventListener("error", () => markMissing(image), { once: true });
    });
}

function markMissing(image) {
    const frame = image.closest(".poster-frame");
    if (frame) {
        frame.classList.add("is-missing");
    }
}

function setupSpotlight() {
    const root = document.querySelector("[data-spotlight]");
    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll(".spotlight-slide"));
    const dots = Array.from(root.querySelectorAll(".spotlight-dot"));
    const next = root.querySelector("[data-spotlight-next]");
    const prev = root.querySelector("[data-spotlight-prev]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        if (slides.length === 0) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };

    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => show(index + 1), 5000);
    };

    next?.addEventListener("click", () => {
        show(index + 1);
        restart();
    });

    prev?.addEventListener("click", () => {
        show(index - 1);
        restart();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const target = Number(dot.dataset.slideTarget || 0);
            show(target);
            restart();
        });
    });

    show(0);
    restart();
}

function setupLocalFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
        const input = panel.querySelector(".local-search");
        const grid = document.querySelector("[data-filterable]");
        const table = panel.querySelector("[data-filterable-table]");
        const count = panel.querySelector("[data-filter-count]");
        const empty = document.querySelector("[data-empty-state]");
        const yearButtons = Array.from(panel.querySelectorAll("[data-filter-year]"));
        let activeYear = "all";

        const apply = () => {
            const keyword = normalize(input?.value || new URLSearchParams(window.location.search).get("q") || "");
            let visible = 0;

            if (grid) {
                const cards = Array.from(grid.querySelectorAll(".movie-card"));
                cards.forEach((card) => {
                    const text = normalize(`${card.dataset.title || ""} ${card.dataset.tags || ""}`);
                    const year = card.dataset.year || "";
                    const matchedKeyword = keyword === "" || text.includes(keyword);
                    const matchedYear = activeYear === "all" || year === activeYear;
                    const matched = matchedKeyword && matchedYear;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
            }

            if (table) {
                const rows = Array.from(table.querySelectorAll("tbody tr"));
                rows.forEach((row) => {
                    const text = normalize(`${row.dataset.title || ""} ${row.dataset.tags || ""} ${row.textContent || ""}`);
                    const matched = keyword === "" || text.includes(keyword);
                    row.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
            }

            if (count) {
                count.textContent = `当前显示 ${visible} 部作品`;
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        if (input) {
            const query = new URLSearchParams(window.location.search).get("q");
            if (query) {
                input.value = query;
            }
            input.addEventListener("input", apply);
        }

        yearButtons.forEach((button) => {
            button.addEventListener("click", () => {
                activeYear = button.dataset.filterYear || "all";
                yearButtons.forEach((item) => item.classList.toggle("is-active", item === button));
                apply();
            });
        });

        apply();
    });
}

function normalize(value) {
    return String(value).trim().toLowerCase();
}

function setupPlayers() {
    document.querySelectorAll(".player-panel[data-video-url]").forEach((panel) => {
        const video = panel.querySelector("video");
        const overlay = panel.querySelector(".play-overlay");
        const message = panel.querySelector("[data-player-message]");
        const source = panel.dataset.videoUrl;
        let attached = false;
        let hlsInstance = null;

        const writeMessage = (text) => {
            if (message) {
                message.textContent = text;
            }
        };

        const attachSource = () => {
            if (!video || !source) {
                writeMessage("当前页面没有可用播放源。");
                return;
            }

            if (!attached) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    attached = true;
                } else if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
                        if (data?.fatal) {
                            writeMessage("播放源加载失败，请稍后重试。");
                        }
                    });
                    attached = true;
                } else {
                    writeMessage("当前浏览器暂不支持 HLS 播放。");
                    return;
                }
            }

            overlay?.classList.add("is-hidden");
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    writeMessage("已加载播放源，请点击播放器上的播放按钮。");
                });
            }
        };

        overlay?.addEventListener("click", attachSource);
        video?.addEventListener("play", () => overlay?.classList.add("is-hidden"));
        window.addEventListener("beforeunload", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

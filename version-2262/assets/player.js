function setupPlayer(streamUrl) {
  var video = document.querySelector("[data-player]");
  var cover = document.querySelector("[data-play-cover]");
  var button = document.querySelector("[data-play-button]");
  var loaded = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    loadStream();
    video.controls = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function() {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  function toggleVideo() {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  }

  if (button) {
    button.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo();
    });
  }

  if (cover) {
    cover.addEventListener("click", function() {
      playVideo();
    });
  }

  video.addEventListener("click", toggleVideo);
  video.addEventListener("play", function() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
  video.addEventListener("pause", function() {
    if (video.currentTime === 0 && cover) {
      cover.classList.remove("is-hidden");
    }
  });
  window.addEventListener("pagehide", function() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

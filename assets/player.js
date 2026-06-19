(function () {
  const video = document.querySelector('[data-player]');
  const frame = document.querySelector('[data-video-frame]');
  const button = document.querySelector('[data-play-button]');

  if (!video || !frame || !button || typeof videoSource === 'undefined') {
    return;
  }

  let isReady = false;
  let hlsInstance = null;

  function prepareVideo() {
    if (isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(videoSource);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoSource;
    }

    isReady = true;
  }

  function startVideo() {
    prepareVideo();
    frame.classList.add('is-playing');
    const playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        frame.classList.remove('is-playing');
      });
    }
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    startVideo();
  });

  frame.addEventListener('click', function (event) {
    if (event.target === frame || event.target === video) {
      startVideo();
    }
  });

  video.addEventListener('play', function () {
    frame.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime <= 0) {
      frame.classList.remove('is-playing');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();

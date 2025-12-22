(function() {
  let currentVideo = null;
  let customSeekbar = null;
  let seekBarWrapper = null;
  let timeContainer = null;
  let currentTime = null;
  let totalTime = null;
  let progressFill = null;
  let thumb = null;
  let isDragging = false;
  let progressOuterContainer = null;
  let isActive = false;
  let checkInterval = null;

  let initRetryTimer = null;
  let initRetryCount = 0;

  let storyWatcherInterval = null;

  function isOnStoryPage() {
    return window.location.href.includes('/stories/');
  }

  function isSeekableVideo(v) {
    if (!v) return false;
    if (!(v instanceof HTMLVideoElement)) return false;
    const d = v.duration;
    return Number.isFinite(d) && d > 0;
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    if (!currentVideo || !currentVideo.duration) return;
    const percent = (currentVideo.currentTime / currentVideo.duration) * 100;
    progressFill.style.width = percent + '%';
    currentTime.textContent = formatTime(currentVideo.currentTime);
    totalTime.textContent = formatTime(currentVideo.duration);
  }

  function seekVideo(e) {
    if (!currentVideo) return;
    const seekRect = customSeekbar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - seekRect.left) / seekRect.width));
    currentVideo.currentTime = percent * currentVideo.duration;
    updateProgress();
  }

  function updatePosition() {
    if (!progressOuterContainer) return;
    const newRect = progressOuterContainer.getBoundingClientRect();
    
    // Thanh seek full width
    const newSeekBarWidth = newRect.width;

    seekBarWrapper.style.top = newRect.top + 'px';
    seekBarWrapper.style.left = newRect.left + 'px';
    seekBarWrapper.style.width = newSeekBarWidth + 'px';
    seekBarWrapper.style.height = newRect.height + 'px';

    customSeekbar.style.top = newRect.top + 'px';
    customSeekbar.style.left = newRect.left + 'px';
    customSeekbar.style.width = newSeekBarWidth + 'px';
    customSeekbar.style.height = newRect.height + 'px';

    timeContainer.style.top = (newRect.top + newRect.height + 8) + 'px';
    timeContainer.style.left = newRect.left + 'px';
    timeContainer.style.width = newRect.width + 'px';
    timeContainer.style.height = 'auto';
  }

  function cleanup() {
    if (customSeekbar) {
      customSeekbar.remove();
      customSeekbar = null;
    }
    if (seekBarWrapper) {
      seekBarWrapper.remove();
      seekBarWrapper = null;
    }
    if (timeContainer) {
      timeContainer.remove();
      timeContainer = null;
    }

    if (currentVideo) {
      currentVideo.removeEventListener('timeupdate', updateProgress);
      currentVideo.removeEventListener('loadedmetadata', updateProgress);
    }

    window.removeEventListener('scroll', updatePosition);
    window.removeEventListener('resize', updatePosition);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }

    if (initRetryTimer) {
      clearTimeout(initRetryTimer);
      initRetryTimer = null;
    }
    initRetryCount = 0;

    progressOuterContainer = null;
    progressFill = null;
    thumb = null;
    currentTime = null;
    totalTime = null;
    currentVideo = null;
    isActive = false;

    if (window.__customFbStorySeekbarActive) {
      window.__customFbStorySeekbarActive = false;
    }
  }

  function ensureStoryWatcher() {
    if (storyWatcherInterval) return;

    storyWatcherInterval = setInterval(() => {
      if (!isOnStoryPage()) return;
      const v = document.querySelector('video');
      if (isActive && (!v || !isSeekableVideo(v))) {
        cleanup();
        return;
      }
      if (!isActive && v && isSeekableVideo(v)) {
        initSeekbar();
      }
    }, 500);
  }

  function initSeekbar() {
    if (!isOnStoryPage()) return;
    ensureStoryWatcher();

    if (window.__customFbStorySeekbarActive) return;

    const video = document.querySelector('video');
    if (!video) return;

    if (!isSeekableVideo(video)) {
      const onMeta = () => {
        video.removeEventListener('loadedmetadata', onMeta);
        if (!window.__customFbStorySeekbarActive && isSeekableVideo(video)) {
          initSeekbar();
        }
      };
      video.addEventListener('loadedmetadata', onMeta);
      return;
    }

    currentVideo = video;

    progressOuterContainer = document.querySelector('.x78zum5.xqu0tyb.x14vqqas.xbmvrgn.xod5an3.x1diwwjn.x10l6tqk.x13vifvy.x8pckko');
    if (!progressOuterContainer) return;

    const progressBarContainers = progressOuterContainer.querySelectorAll('.x1ahlmzr.x1ekkm8c.x1143rjc.xum4auv.xj21bgg.x1rg5ohu.x12lumcd.x5yr21d.x1n2onr6');
    progressBarContainers.forEach(container => {
      container.style.opacity = '0';
      container.style.visibility = 'hidden';
    });

    const rect = progressOuterContainer.getBoundingClientRect();
    const seekBarWidth = rect.width; 

    seekBarWrapper = document.createElement('div');
    seekBarWrapper.style.cssText = `
      position: fixed !important;
      top: ${rect.top}px !important;
      left: ${rect.left}px !important; 
      width: ${seekBarWidth}px !important;
      height: ${rect.height}px !important;
      background: rgba(255, 255, 255, 0.3) !important;
      border-radius: 2px;
      z-index: 1 !important;
      pointer-events: none !important;
    `;

    customSeekbar = document.createElement('div');
    customSeekbar.id = 'custom-fb-seekbar-wrapper';
    customSeekbar.style.cssText = `
      position: fixed !important;
      top: ${rect.top}px !important;
      left: ${rect.left}px !important;
      width: ${seekBarWidth}px !important;
      height: ${rect.height}px !important;
      cursor: pointer !important;
      z-index: 2 !important;
      border-radius: 2px;
      pointer-events: auto !important;
    `;

    progressFill = document.createElement('div');
    progressFill.style.cssText = `
      position: relative;
      height: 100%;
      background: white;
      width: 0%;
      transition: width 0.1s linear;
      pointer-events: none;
      border-radius: 2px;
    `;

    thumb = document.createElement('div');
    thumb.style.cssText = `
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.6);
      opacity: 1;
      pointer-events: none;
    `;

    timeContainer = document.createElement('div');
    timeContainer.id = 'custom-time-display';
    timeContainer.style.cssText = `
      position: fixed;
      top: ${rect.top + rect.height + 8}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
      z-index: 1;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      
      /* --- THAY ĐỔI: Mặc định ẩn time --- */
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    currentTime = document.createElement('span');
    currentTime.style.cssText = `
      font-size: 11px;
      text-align: left;
    `;

    totalTime = document.createElement('span');
    totalTime.style.cssText = `
      font-size: 11px;
      text-align: right;
    `;

    timeContainer.appendChild(currentTime);
    timeContainer.appendChild(totalTime);

    progressFill.appendChild(thumb);
    customSeekbar.appendChild(progressFill);

    document.body.appendChild(seekBarWrapper);
    document.body.appendChild(customSeekbar);
    document.body.appendChild(timeContainer);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    customSeekbar.addEventListener('mousedown', handleMouseDown);
    customSeekbar.addEventListener('mouseenter', handleMouseEnter);
    customSeekbar.addEventListener('mouseleave', handleMouseLeave);
    customSeekbar.addEventListener('click', handleClick);

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    isActive = true;
    window.__customFbStorySeekbarActive = true;

    setTimeout(updateProgress, 100);

    checkInterval = setInterval(() => {
      const v = document.querySelector('video');
      if (!v || !isSeekableVideo(v)) {
        cleanup();
        return;
      }
      if (v !== currentVideo) {
        cleanup();
        initSeekbar();
      }
    }, 500);
  }

  function handleMouseDown(e) {
    isDragging = true;
    seekVideo(e);
    thumb.style.width = '14px';
    thumb.style.height = '14px';
    customSeekbar.style.cursor = 'grabbing';
    
    // --- THAY ĐỔI: Khi click kéo thì hiện time ---
    if(timeContainer) timeContainer.style.opacity = '1';
    
    e.preventDefault();
    e.stopPropagation();
  }

  function handleMouseEnter() {
    thumb.style.width = '14px';
    thumb.style.height = '14px';
    customSeekbar.style.cursor = 'grab';
    
    // --- THAY ĐỔI: Hover vào thì hiện time ---
    if(timeContainer) timeContainer.style.opacity = '1';
  }

  function handleMouseLeave() {
    if (!isDragging) {
      thumb.style.width = '12px';
      thumb.style.height = '12px';
      customSeekbar.style.cursor = 'pointer';
      
      // --- THAY ĐỔI: Bỏ chuột ra (và ko kéo) thì ẩn time ---
      if(timeContainer) timeContainer.style.opacity = '0';
    }
  }

  function handleClick(e) {
    seekVideo(e);
    e.stopPropagation();
  }

  function handleMouseMove(e) {
    if (isDragging) {
      seekVideo(e);
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      thumb.style.width = '12px';
      thumb.style.height = '12px';
      customSeekbar.style.cursor = 'grab';
      
      // --- THAY ĐỔI: Thả chuột ra, check xem có đang hover ko, nếu ko thì ẩn ---
      if (customSeekbar && !customSeekbar.matches(':hover')) {
          if(timeContainer) timeContainer.style.opacity = '0';
      }
    }
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (isOnStoryPage() && !isActive) {
        cleanup();
        ensureStoryWatcher();
        const tryInit = () => {
          if (!isOnStoryPage() || isActive) return;
          initSeekbar();
          if (!isActive && initRetryCount < 10) {
            initRetryCount++;
            initRetryTimer = setTimeout(tryInit, 500);
          }
        };
        initRetryCount = 0;
        initRetryTimer = setTimeout(tryInit, 500);
      } else if (!isOnStoryPage() && isActive) {
        cleanup();
      }
    }
  }).observe(document, { subtree: true, childList: true });

  if (isOnStoryPage()) {
    ensureStoryWatcher();
    const tryInit = () => {
      if (!isOnStoryPage() || isActive) return;
      initSeekbar();
      if (!isActive && initRetryCount < 10) {
        initRetryCount++;
        initRetryTimer = setTimeout(tryInit, 500);
      }
    };
    initRetryCount = 0;
    initRetryTimer = setTimeout(tryInit, 500);
  }

  console.log('✅ Custom seekbar (Auto-Hide Time) đã cài đặt!');
})();
function injectHook(url) {
  const hookScript = document.createElement('script');
  hookScript.src = url;
  hookScript.onload = function () {
    this.remove();
  };
  (document.head || document.body || document.documentElement).appendChild(hookScript);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

const extension = typeof browser !== 'undefined' ? browser : chrome;

extension.runtime.onMessage.addListener((request) => {
  if (request?.message !== 'TabUpdated') return;
  if (!document.location.href.includes('https://www.facebook.com/stories')) return;

  injectHook(extension.runtime.getURL(`/story_seekbar.js?v=${getRandom(1, 100)}`));
});

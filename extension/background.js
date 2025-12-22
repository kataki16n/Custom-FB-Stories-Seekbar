const extension = typeof browser !== 'undefined' ? browser : chrome;

extension.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab?.url) return;

  if (tab.url.includes('https://www.facebook.com/stories')) {
    extension.tabs.sendMessage(tabId, { message: 'TabUpdated' }).catch(() => {});
  }
});

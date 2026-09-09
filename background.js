// Defaults for quietXfeed toggles.
const DEFAULTS = { hideMedia: true, autoNewest: true };

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULTS, (cur) => {
    chrome.storage.sync.set({
      hideMedia: cur.hideMedia !== false,
      autoNewest: cur.autoNewest !== false
    });
  });
});

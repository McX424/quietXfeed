chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    { hideMedia: true, newestIntervalSec: 30, autoNewest: true },
    (cur) => {
      let newestIntervalSec = cur.newestIntervalSec;
      if (newestIntervalSec === undefined) {
        newestIntervalSec = cur.autoNewest === false ? 0 : 30;
      }
      chrome.storage.sync.set({
        hideMedia: cur.hideMedia !== false,
        newestIntervalSec: Number(newestIntervalSec) || 0,
        autoNewest: Number(newestIntervalSec) > 0
      });
    }
  );
});

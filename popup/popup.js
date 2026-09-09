const DEFAULTS = { hideMedia: true, newestIntervalSec: 30 };
const CHOICES = [0, 15, 30, 60, 120, 300];

function normalizeInterval(cur) {
  let v = cur.newestIntervalSec;
  if (v === undefined) {
    v = cur.autoNewest === false ? 0 : 30;
  }
  v = Number(v);
  return CHOICES.includes(v) ? v : 30;
}

function load() {
  chrome.storage.sync.get(
    { hideMedia: true, newestIntervalSec: 30, autoNewest: true },
    (cur) => {
      document.getElementById("hideMedia").checked = cur.hideMedia !== false;
      document.getElementById("newestIntervalSec").value = String(
        normalizeInterval(cur)
      );
    }
  );
}

document.getElementById("hideMedia").addEventListener("change", (e) => {
  chrome.storage.sync.set({ hideMedia: !!e.target.checked });
});

document.getElementById("newestIntervalSec").addEventListener("change", (e) => {
  const v = Number(e.target.value);
  chrome.storage.sync.set({
    newestIntervalSec: CHOICES.includes(v) ? v : 30,
    // keep legacy key coherent for any old readers
    autoNewest: v > 0
  });
});

load();

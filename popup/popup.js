const DEFAULTS = { hideMedia: true, autoNewest: true };

function load() {
  chrome.storage.sync.get(DEFAULTS, (cur) => {
    document.getElementById("hideMedia").checked = cur.hideMedia !== false;
    document.getElementById("autoNewest").checked = cur.autoNewest !== false;
  });
}

function bind(id, key) {
  document.getElementById(id).addEventListener("change", (e) => {
    chrome.storage.sync.set({ [key]: !!e.target.checked });
  });
}

load();
bind("hideMedia", "hideMedia");
bind("autoNewest", "autoNewest");

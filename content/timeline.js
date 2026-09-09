(() => {
  "use strict";

  const DEFAULTS = { hideMedia: true, autoNewest: true };
  let settings = { ...DEFAULTS };

  const MEDIA_SELECTORS = [
    '[data-testid="tweetPhoto"]',
    '[data-testid="videoPlayer"]',
    '[data-testid="videoComponent"]',
    '[data-testid="previewInterstitial"]',
    '[data-testid="card.layoutLarge.media"]',
    '[data-testid="card.layoutSmall.media"]'
  ];

  const NEW_POSTS_RE =
    /^(show|see|view)\s+new\s+posts?$/i;

  function isAvatarOrEmoji(el) {
    if (!el || !el.closest) return false;
    if (el.closest('[data-testid^="UserAvatar-Container"]')) return true;
    if (el.closest('div[data-testid="Tweet-User-Avatar"]')) return true;
    // Twemoji / emoji images
    if (el.tagName === "IMG") {
      const alt = (el.getAttribute("alt") || "").trim();
      if (alt.length <= 4 && /\p{Extended_Pictographic}/u.test(alt)) return true;
      const src = el.getAttribute("src") || "";
      if (/emoji|twimg\.com\/emoji/i.test(src)) return true;
    }
    return false;
  }

  function markMediaInTweet(tweet) {
    if (!tweet || tweet.dataset.qxfMedia === "1") return;
    for (const sel of MEDIA_SELECTORS) {
      tweet.querySelectorAll(sel).forEach((node) => {
        if (isAvatarOrEmoji(node)) return;
        node.classList.add("qxf-hidden-media");
      });
    }
    // Generic: large inline images / videos that aren't avatars
    tweet.querySelectorAll("img, video").forEach((node) => {
      if (isAvatarOrEmoji(node)) return;
      if (node.closest('[data-testid^="UserAvatar-Container"]')) return;
      if (node.closest('a[role="link"][href*="/photo/1"]') && node.closest('[data-testid="tweetPhoto"]')) {
        node.classList.add("qxf-hidden-media");
        return;
      }
      // Video tags inside tweets
      if (node.tagName === "VIDEO") {
        const host =
          node.closest('[data-testid="videoPlayer"]') ||
          node.closest('[data-testid="videoComponent"]') ||
          node.parentElement;
        if (host) host.classList.add("qxf-hidden-media");
        return;
      }
      // Photos often sit in a link to /status/.../photo/
      const link = node.closest('a[href*="/photo/"]');
      if (link && !isAvatarOrEmoji(node)) {
        const box =
          node.closest('[data-testid="tweetPhoto"]') ||
          link.parentElement ||
          node;
        box.classList.add("qxf-hidden-media");
      }
    });
    tweet.dataset.qxfMedia = "1";
  }

  function sweepMedia() {
    if (!settings.hideMedia) return;
    document
      .querySelectorAll('article[data-testid="tweet"]')
      .forEach((tweet) => {
        // allow re-scan if tweet DOM grew
        if (tweet.dataset.qxfMedia === "1") {
          // light re-check for new media nodes without full remount
          const dirty = MEDIA_SELECTORS.some((sel) =>
            [...tweet.querySelectorAll(sel)].some(
              (n) => !n.classList.contains("qxf-hidden-media") && !isAvatarOrEmoji(n)
            )
          );
          if (!dirty) return;
          delete tweet.dataset.qxfMedia;
        }
        markMediaInTweet(tweet);
      });
  }

  function applyHideClass() {
    document.documentElement.classList.toggle("qxf-hide-media", !!settings.hideMedia);
  }

  function clickShowNewPosts() {
    if (!settings.autoNewest) return false;
    // Prefer role=button with matching text
    const candidates = document.querySelectorAll(
      'div[role="button"], button, a[role="link"]'
    );
    for (const el of candidates) {
      const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
      if (!text || text.length > 40) continue;
      if (!NEW_POSTS_RE.test(text)) continue;
      // Avoid profile / nav chrome
      if (el.closest('nav, [data-testid="sidebarColumn"]')) continue;
      try {
        el.click();
        return true;
      } catch (_) {
        /* ignore */
      }
    }
    // Aria / data labels
    for (const el of document.querySelectorAll("[aria-label]")) {
      const label = (el.getAttribute("aria-label") || "").trim();
      if (NEW_POSTS_RE.test(label)) {
        try {
          el.click();
          return true;
        } catch (_) {}
      }
    }
    return false;
  }

  let lastNudge = 0;
  function softTopNudge() {
    if (!settings.autoNewest) return;
    const now = Date.now();
    if (now - lastNudge < 4000) return;
    // Only nudge if user is near the top of the timeline
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 120) return;
    lastNudge = now;
    // Tiny scroll to encourage virtualized list to paint new items after toast click
    window.scrollBy(0, -1);
    requestAnimationFrame(() => window.scrollBy(0, 1));
  }

  let toastTimer = 0;
  function scheduleNewestPass() {
    if (toastTimer) return;
    toastTimer = window.setTimeout(() => {
      toastTimer = 0;
      if (clickShowNewPosts()) softTopNudge();
    }, 300);
  }

  function loadSettings(cb) {
    chrome.storage.sync.get(DEFAULTS, (cur) => {
      settings = {
        hideMedia: cur.hideMedia !== false,
        autoNewest: cur.autoNewest !== false
      };
      applyHideClass();
      if (settings.hideMedia) {
        document
          .querySelectorAll('article[data-testid="tweet"]')
          .forEach((t) => delete t.dataset.qxfMedia);
        sweepMedia();
      }
      if (cb) cb();
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.hideMedia || changes.autoNewest) loadSettings();
  });

  const observer = new MutationObserver((mutations) => {
    let mediaRelevant = false;
    let toastRelevant = false;
    for (const m of mutations) {
      if (m.type === "childList" && (m.addedNodes.length || m.removedNodes.length)) {
        mediaRelevant = true;
        toastRelevant = true;
      } else if (m.type === "characterData" || m.type === "attributes") {
        toastRelevant = true;
      }
    }
    if (mediaRelevant && settings.hideMedia) sweepMedia();
    if (toastRelevant && settings.autoNewest) scheduleNewestPass();
  });

  function start() {
    loadSettings(() => {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
      });
      sweepMedia();
      scheduleNewestPass();
      // Periodic toast check — X sometimes updates without useful mutations
      setInterval(() => {
        if (settings.autoNewest) scheduleNewestPass();
      }, 2500);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

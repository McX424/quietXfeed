(() => {
  "use strict";

  // newestIntervalSec: 0 = off; else period in seconds
  const DEFAULTS = { hideMedia: true, newestIntervalSec: 30 };
  const INTERVAL_CHOICES = [0, 15, 30, 60, 120, 300];

  let settings = { ...DEFAULTS };
  let newestTimer = 0;

  const MEDIA_SELECTORS = [
    '[data-testid="tweetPhoto"]',
    '[data-testid="videoPlayer"]',
    '[data-testid="videoComponent"]',
    '[data-testid="previewInterstitial"]',
    '[data-testid="card.layoutLarge.media"]',
    '[data-testid="card.layoutSmall.media"]'
  ];

  const NEW_POSTS_RE = /^(show|see|view)\s+new\s+posts?$/i;

  function isAvatarOrEmoji(el) {
    if (!el || !el.closest) return false;
    if (el.closest('[data-testid^="UserAvatar-Container"]')) return true;
    if (el.closest('div[data-testid="Tweet-User-Avatar"]')) return true;
    if (el.tagName === "IMG") {
      const alt = (el.getAttribute("alt") || "").trim();
      if (alt.length <= 4 && /\p{Extended_Pictographic}/u.test(alt)) return true;
      const src = el.getAttribute("src") || "";
      if (/emoji|twimg\.com\/emoji/i.test(src)) return true;
    }
    return false;
  }

  /** Climb to the aspect-ratio / media grid shell so the empty box collapses. */
  function mediaShell(node, tweet) {
    let target = node;
    let el = node;
    for (let i = 0; i < 10 && el && el !== tweet; i++) {
      const testId = el.getAttribute("data-testid") || "";
      const style = el.getAttribute("style") || "";
      if (
        testId === "tweetPhoto" ||
        testId === "videoPlayer" ||
        testId === "videoComponent" ||
        testId === "previewInterstitial" ||
        testId === "card.layoutLarge.media" ||
        testId === "card.layoutSmall.media"
      ) {
        target = el;
      }
      if (/padding-bottom\s*:/i.test(style) || /aspect-ratio\s*:/i.test(style)) {
        target = el;
      }
      el = el.parentElement;
    }
    // One more level: media grid / carousel parent (no tweet text inside)
    const parent = target.parentElement;
    if (
      parent &&
      parent !== tweet &&
      !parent.querySelector('[data-testid="tweetText"]') &&
      !parent.querySelector('[data-testid^="UserAvatar"]') &&
      parent.querySelector(
        '[data-testid="tweetPhoto"], [data-testid="videoPlayer"], [data-testid="videoComponent"], video'
      )
    ) {
      const kids = [...parent.children];
      const mediaKids = kids.filter((k) =>
        k.querySelector(
          '[data-testid="tweetPhoto"], [data-testid="videoPlayer"], [data-testid="videoComponent"], video'
        ) ||
        MEDIA_SELECTORS.some((sel) => k.matches?.(sel) || k.querySelector?.(sel))
      );
      if (mediaKids.length && mediaKids.length === kids.length) {
        target = parent;
      }
    }
    return target;
  }

  function hideShell(node, tweet) {
    if (!node || isAvatarOrEmoji(node)) return;
    const shell = mediaShell(node, tweet);
    if (!shell || isAvatarOrEmoji(shell)) return;
    shell.classList.add("qxf-hidden-media");
    shell.setAttribute("aria-hidden", "true");
  }

  function markMediaInTweet(tweet) {
    if (!tweet) return;
    for (const sel of MEDIA_SELECTORS) {
      tweet.querySelectorAll(sel).forEach((node) => hideShell(node, tweet));
    }
    tweet.querySelectorAll("video").forEach((node) => {
      if (isAvatarOrEmoji(node)) return;
      hideShell(
        node.closest('[data-testid="videoPlayer"]') ||
          node.closest('[data-testid="videoComponent"]') ||
          node,
        tweet
      );
    });
    tweet.querySelectorAll('a[href*="/photo/"]').forEach((link) => {
      if (isAvatarOrEmoji(link)) return;
      if (link.closest('[data-testid^="UserAvatar"]')) return;
      hideShell(
        link.closest('[data-testid="tweetPhoto"]') || link.parentElement || link,
        tweet
      );
    });
    tweet.dataset.qxfMedia = "1";
  }

  function sweepMedia() {
    if (!settings.hideMedia) {
      document.querySelectorAll(".qxf-hidden-media").forEach((n) => {
        n.classList.remove("qxf-hidden-media");
        n.removeAttribute("aria-hidden");
      });
      document
        .querySelectorAll('article[data-testid="tweet"]')
        .forEach((t) => delete t.dataset.qxfMedia);
      return;
    }
    document.querySelectorAll('article[data-testid="tweet"]').forEach((tweet) => {
      if (tweet.dataset.qxfMedia === "1") {
        const dirty = MEDIA_SELECTORS.some((sel) =>
          [...tweet.querySelectorAll(sel)].some(
            (n) => !n.closest(".qxf-hidden-media") && !isAvatarOrEmoji(n)
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
    const candidates = document.querySelectorAll(
      'div[role="button"], button, a[role="link"]'
    );
    for (const el of candidates) {
      const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
      if (!text || text.length > 40) continue;
      if (!NEW_POSTS_RE.test(text)) continue;
      if (el.closest('nav, [data-testid="sidebarColumn"]')) continue;
      try {
        el.click();
        return true;
      } catch (_) {}
    }
    for (const el of document.querySelectorAll("[aria-label]")) {
      const label = (el.getAttribute("aria-label") || "").trim();
      if (!NEW_POSTS_RE.test(label)) continue;
      try {
        el.click();
        return true;
      } catch (_) {}
    }
    return false;
  }

  function softTopNudge() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 120) return;
    window.scrollBy(0, -1);
    requestAnimationFrame(() => window.scrollBy(0, 1));
  }

  function newestPass() {
    if (!settings.newestIntervalSec) return;
    if (clickShowNewPosts()) softTopNudge();
  }

  function restartNewestTimer() {
    if (newestTimer) {
      clearInterval(newestTimer);
      newestTimer = 0;
    }
    const sec = Number(settings.newestIntervalSec) || 0;
    if (sec <= 0) return;
    // First pass after a short delay, then on the chosen period only
    window.setTimeout(newestPass, 800);
    newestTimer = window.setInterval(newestPass, sec * 1000);
  }

  function normalizeSettings(cur) {
    let hideMedia = cur.hideMedia !== false;
    let newestIntervalSec = cur.newestIntervalSec;
    // Migrate v1.0.0 autoNewest boolean
    if (newestIntervalSec === undefined) {
      if (cur.autoNewest === false) newestIntervalSec = 0;
      else newestIntervalSec = 30;
    }
    newestIntervalSec = Number(newestIntervalSec);
    if (!INTERVAL_CHOICES.includes(newestIntervalSec)) {
      newestIntervalSec = 30;
    }
    return { hideMedia, newestIntervalSec };
  }

  function loadSettings(cb) {
    chrome.storage.sync.get(
      { hideMedia: true, newestIntervalSec: 30, autoNewest: true },
      (cur) => {
        settings = normalizeSettings(cur);
        applyHideClass();
        sweepMedia();
        restartNewestTimer();
        if (cb) cb();
      }
    );
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.hideMedia || changes.newestIntervalSec || changes.autoNewest) {
      loadSettings();
    }
  });

  const observer = new MutationObserver(() => {
    if (settings.hideMedia) sweepMedia();
  });

  function start() {
    loadSettings(() => {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      sweepMedia();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

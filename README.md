# quietXfeed

Chromium (Manifest V3) extension for [X](https://x.com) / [twitter.com](https://twitter.com).

Quieter Home timeline: hide **posted** photos, videos, GIFs, and quote-tweet media — keep avatars, emoji, badges, and normal text. Optionally keep the feed on **newest** posts by auto-clicking the “Show new posts” control when it appears.

**Version:** 1.0.0

## Install (from source)

1. Clone or download this repo.
2. Open `chrome://extensions` (or Edge `edge://extensions`).
3. Turn on **Developer mode**.
4. **Load unpacked** → select this folder (the one with `manifest.json`).
5. Open [x.com](https://x.com/home) and refresh.

## Use

Click the extension icon:

| Toggle | Default | Effect |
|--------|---------|--------|
| **Hide post media** | On | Hides photos / videos / GIFs / quote media in timeline posts |
| **Auto “Show new posts”** | On | Clicks the floating “Show new posts” (or similar) toast; light top nudge so new posts paint |

Settings sync via `chrome.storage.sync`.

## What it does **not** do

- Does not hide profile avatars, emoji, or verified badges
- Does not hard-reload the tab in a loop
- Does not guarantee coverage on every X UI experiment (markup changes often)
- Media on non-timeline surfaces (e.g. some overlays) may still appear

## How it works

- Content script + CSS on `x.com` / `twitter.com`
- `MutationObserver` re-applies hide rules as tweets virtualize in
- Resilient selectors (`data-testid` media nodes + `/photo/` links + `video`) with avatar/emoji exclusions
- Periodic toast scan for “Show/See/View new posts”

## Development

Edit files → **Reload** the extension on `chrome://extensions` → hard-refresh X.

## License

MIT © McX424

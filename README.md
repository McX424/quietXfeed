# quietXfeed

Chromium (Manifest V3) extension for [X](https://x.com) / [twitter.com](https://twitter.com).

Quieter Home timeline: hide **posted** photos, videos, GIFs, and quote-tweet media — **collapse the whole media shell** so no empty box remains. Keep avatars, emoji, badges, and text. Optionally click **Show new posts** on a chosen interval.

**Version:** 1.1.0

## Install (from source)

1. Clone or download this repo.
2. Open `chrome://extensions` (or Edge `edge://extensions`).
3. Turn on **Developer mode**.
4. **Load unpacked** → select this folder (the one with `manifest.json`).
5. Open [x.com](https://x.com/home) and refresh.
6. After updates: **Reload** the extension on `chrome://extensions`, then refresh X.

## Use

Click the extension icon:

| Setting | Default | Effect |
|---------|---------|--------|
| **Hide post media** | On | Collapses photos / videos / GIFs / quote media (no blank gap) |
| **Show new posts** | Every 30 seconds | Off / 15s / 30s / 1m / 2m / 5m — clicks the toast only on that period |

## What it does **not** do

- Does not hide profile avatars, emoji, or verified badges
- Does not hard-reload the tab
- Does not poll “Show new posts” on every DOM mutation (interval only)
- X markup changes often; some layouts may need a selector tweak

## License

MIT © McX424

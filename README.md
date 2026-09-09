# quietXfeed

A Chromium extension that makes the X (Twitter) Home timeline easier to read: post photos, videos, and GIFs are removed and their layout shells collapsed, while avatars, emoji, badges, and text stay intact. Optionally, **Show new posts** is clicked on a schedule you choose so the feed stays near the top without constant polling.

Works on `x.com` and `twitter.com` (Manifest V3).

## Features

- **Hide post media** — photos, videos, GIFs, and quote-tweet media are hidden and the empty media box is collapsed (no blank gap)
- **Keep chrome** — profile avatars, emoji, verified badges, and normal post formatting remain
- **Newest posts on an interval** — Off, 15s, 30s, 1m, 2m, or 5m (default 30s); clicks the “Show new posts” control only on that period
- **Simple popup** — toggles for media hide and refresh interval; settings sync via `chrome.storage`

## Install

### From source (unpacked)

1. Clone the repository:
   ```bash
   git clone https://github.com/McX424/quietXfeed.git
   cd quietXfeed
   ```
2. Open `chrome://extensions` (Chrome / Chromium) or `edge://extensions` (Edge).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this repository folder (the directory that contains `manifest.json`).
5. Open [x.com/home](https://x.com/home) and refresh the page.

### Omarchy / Chromium `--load-extension`

If your browser is launched with `--load-extension=…`, append the path to this repo (for example `~/Projects/quietXfeed`) to that flag list, then restart the browser.

## Use

Click the **quietXfeed** toolbar icon:

| Control | Default | Description |
|---------|---------|-------------|
| Hide post media | On | Collapse posted media and quote-tweet media |
| Show new posts | Every 30 seconds | How often to click the newest-posts control when it appears |

Changes apply on the next interval tick or after a page refresh.

## Update

```bash
git -C /path/to/quietXfeed pull
```

Then either **Reload** the extension on `chrome://extensions`, or restart Chromium if you load it via `--load-extension`. Refresh X afterward.

## Limitations

- X changes DOM markup often; selectors may need updates after major site changes.
- Surfaces outside the main timeline may still show media in some layouts.
- The extension does not hard-reload the tab and does not click “Show new posts” on every DOM mutation—only on your chosen interval.
- Not published to the Chrome Web Store yet; install from source as above.

## Privacy

quietXfeed only requests `storage` plus host access to `x.com` / `twitter.com`. It does not send data to third-party servers.

## License

MIT © [McX424](https://github.com/McX424)

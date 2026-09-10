# Speedadmin Plus

Speedadmin Plus adds week numbers to dates and converts minute totals on SpeedAdmin pages.

## Features

- Enable or disable the extension from its popup
- Convert "Summer Antal minutter" values to hours

## Privacy

- The extension stores one enabled/disabled setting locally in Chrome storage.
- SpeedAdmin page text is processed locally to provide its calculations.
- The extension does not send page content, browsing activity, or other data to a developer-controlled server.
- The extension does not use analytics, advertising, tracking, cookies, or third-party services.
- Use the popup checkbox to disable the extension. Uninstalling the extension removes its local storage.

See [PRIVACY.md](PRIVACY.md) for the complete privacy policy.

The GitHub Pages version is in [`docs/index.html`](docs/index.html). To publish it, push this project to a GitHub repository, then open **Settings > Pages**, choose **Deploy from a branch**, select the default branch and the `/docs` folder, and save. Use the resulting HTTPS Pages URL as the privacy-policy URL in the Chrome Web Store dashboard.

This project is open source under the [MIT License](LICENSE).

## Permissions

- `storage` saves the enabled/disabled setting locally so it is available after the popup or browser is closed.
- Access to SpeedAdmin pages is required to read dates and minute totals locally.

## Load in Chrome

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select this folder
5. Use the extension icon to enable or disable the extension

## Files

- `manifest.json` - extension configuration
- `popup.html` - popup UI
- `popup.js` - popup behavior
- `content.js` - minute-to-hour conversion logic
- `styles.css` - styling

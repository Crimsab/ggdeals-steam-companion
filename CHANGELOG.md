# Changelog

## Unreleased

## 2.0.1 - 2026-04-26

- Keep bundle/sub inline displays hidden after price updates when Bundle/Sub Display is disabled.
- Disable web scraping by default in both the userscript and Chrome/Steam extension settings.

## 2.0.0 - 2026-04-26

- Keep the GG.deals panel visible when Cloudflare blocks web scraping, with a fallback "View Offers" link.
- Redact GG.deals API keys from console error details.
- Escape saved API and color settings before injecting them into settings markup.
- Add Bun-based syntax checks and jsdom smoke tests.
- Add GitHub Actions CI for linting, testing, and userscript artifact upload.
- Add a Manifest V3 Chrome extension build that reuses the userscript core.
- Add a native Steam browser extension loading path, closing #5 as a more durable alternative to a Millennium plugin.
- Add API key help links in both the userscript and extension settings.
- Make compact view the recommended default.
- Add collapsible settings sections to reduce Steam page clutter.
- Clarify unavailable price states for Cloudflare, API errors, missing API keys, not-found games, and free games.
- Autosave Chrome extension option toggles and API key changes.

## 1.6.4

- **Fixed Steam Sub ID Support**: Steam sub IDs are no longer supported by GG.deals API - now automatically extracts app ID from Steam page URL.
- **Enhanced Error Logging**: Added detailed error reporting with URLs, status codes, and timestamps for better debugging.
- **Improved Settings Icon**: Replaced buggy gear icon with clean, modern settings panel icon.
- **Smart Cloudflare Handling**: Better detection and user feedback when Cloudflare blocks requests.
- **API-First Approach**: Prioritizes API usage for better reliability and performance.

## 1.6.3

- **Steam Sub ID Fix**: Updated API endpoints to use app IDs for both apps and subs.
- **Web Scraping Priority**: Updated URL formats to try app format first for better compatibility.

## 1.6.2

- **Cloudflare Protection Handling**: Added smart fallback mechanism when Cloudflare blocks web scraping.
- **Enhanced Error Detection**: Specific detection for 403 errors with helpful user notifications.
- **Graceful Degradation**: Containers remain visible with helpful messages instead of disappearing.
- **Updated Known Limitations**: Documented Cloudflare protection and API recommendations.

## 1.6.1

- **Enhanced Error Logging**: Added detailed error reporting with URLs, status codes, and timestamps.
- **Better Debugging**: Comprehensive error objects for easier troubleshooting.

## 1.6

- Added official API support (requires your API key).
- Added option to disable or enable web scraping.
- Added option to disable or enable API usage.
- Added color customization.
- Added preferred region and currency selection for API results.
- When web scraping is off, bundle prices are not shown because the API returns null bundle data.

## 1.5.1

- Fixed tooltip hover on historical prices.

## 1.5

- Fixed button overflow, uneven icon placement, and moved updated text into a tooltip.

## 1.4

- Added bundle displays, fixed UI issues, forced correct URLs, and other small fixes.

## 1.3

- Various fixes.
- Integrated suggestions from @enchained for issues 1, 2, and 3: better title search, compact view, and package/bundle support.

## 1.2

- Added license and Greasy Fork upload.

## 1.1

- Added price cache system with manual refresh.

## 1.0

- Initial release.

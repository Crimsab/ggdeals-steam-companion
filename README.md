# GG.deals Steam Companion

A userscript that enhances Steam store pages by displaying price comparisons from GG.deals directly on the game page.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-24292e.svg?style=flat-square&logo=github)](https://github.com/Crimsab/ggdeals-steam-companion) [![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-Install-670000.svg?style=flat-square&logo=tampermonkey)](https://greasyfork.org/it/scripts/527356-gg-deals-steam-companion)

> **Disclaimer**: This is an unofficial userscript and is not affiliated with, endorsed by, or connected to GG.deals or Steam in any way. This script simply provides a convenient interface to publicly available data from GG.deals.

![GG.deals Steam Companion](https://gg.deals/favicon.ico)

## Installation

1. First, install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/)

2. Click this link to install the script: 
**[➡️ INSTALL GG.DEALS STEAM COMPANION ⬅️](https://raw.githubusercontent.com/Crimsab/ggdeals-steam-companion/main/userscript.user.js)**

   If the automatic installation doesn't work:
   - Open your userscript manager's dashboard
   - Create a new script
   - Copy and paste the contents from [this link](https://raw.githubusercontent.com/Crimsab/ggdeals-steam-companion/main/userscript.user.js)
   - Save the script

## Examples

### Full View
![Full View Screenshot](images/Screen1.webp)

### Compact View
![Compact View Screenshot](images/Screen2.webp)

### Bundle/Package View
![Bundle View Screenshot](images/Screen3.webp)

## Features

- Shows real-time price comparisons from official stores and keyshops
- Displays historical low prices with dates
- Supports the official GG.deals API for more reliable results
- Clean and modern UI that matches Steam's design
- Toggle between official stores and keyshop prices
- Remembers your display preferences
- Automatic price highlighting for best deals
- Responsive design that works on all screen sizes
- Cache system with 24-hour duration and manual refresh option

## Usage

1. Visit any Game page or DLC page on the Steam store
2. The script will automatically add a price comparison section above the purchase options
3. Use the toggles to show/hide official stores and keyshop prices
4. Optionally enable the GG.deals API in the settings panel and save your API key
5. Click "View Offers" to see all available deals on GG.deals

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Known Limitations

- **Bundles**: Always use web scraping, never API (GG.deals API doesn't support Steam bundles)
- **Steam Sub IDs**: No longer supported by GG.deals API - script automatically extracts app IDs from Steam pages (I don't know why they removed it)
- **Cloudflare Protection**: GG.deals website uses Cloudflare which may block automated requests, like the Steam Resolvers (HTTP 403 errors)
- **API vs Web Scraping**: API is recommended for best reliability and performance
- **Cloudflared**: Cloudflare Tunnel does not bypass third-party Cloudflare challenges. It can expose your own services, but it cannot make GG.deals scraping reliable.

## Troubleshooting

### Common Issues

**"No data found for this game"**
- This usually means the game isn't in GG.deals database
- For Steam subs, the script now automatically extracts the correct app ID
- Try refreshing the page or using the manual refresh button

**HTTP 403 Errors**
- Cloudflare is blocking the request
- Enable API usage with a valid API key for best results
- Web scraping may be temporarily unavailable
- The script should keep the GG.deals section visible with a fallback link even when scraping is blocked

**Prices not updating**
- Check if API is enabled and API key is valid
- Try manual refresh button
- Check browser console for detailed error messages

## Development

This project uses [Bun](https://bun.sh/) for local checks.

```bash
bun install
bun run check
```

The check command validates the userscript syntax and runs smoke tests against a mocked Steam page.

### Debug Information

The script provides detailed error logging in the browser console (F12 → Console) including:
- Request URLs and status codes
- Steam IDs being used
- API responses and error details
- Timestamps for all operations

## Permissions

The script requires the following permissions:
- Access to store.steampowered.com
- Access to gg.deals
- XMLHttpRequest to fetch price data
- Storage to save your display preferences

## Contributing

Feel free to submit issues and enhancement requests!

## Credits

Price data is provided by [GG.deals](https://gg.deals). All trademarks and copyrights belong to their respective owners. 

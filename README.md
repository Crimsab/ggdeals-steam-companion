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
4. Click "View Offers" to see all available deals on GG.deals

## Changelog

### 1.6
- Added official API support (requires your API key)
- Option to disable/enable web scraping
- Option to disable/enable API
- Complete customization of the colors
- Option to choose the preferred region and the currency (API)
- If web scraping is off, it doesn't show the prices for the bundles (API gives null data in resposne)

### 1.5.1
- Fixed tooltip hover on historical prices

#### 1.5
- Fixed button going over container, fixed uneven icon, moved updated text as tooltip

### 1.4
- Added bundle displays, fixed UI errors, forced correct URLs, and other small things

### 1.3
- Various fixes
- Integrated suggestions from @enchained for /issues/1, 2 & 3 (better title search, compact view and support for package and bundles)

### 1.2
- LICENSE and greasyfork upload

### 1.1 
- Integration of a cache system for the prices, with manual refresh

### 1.0
- Initial release

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
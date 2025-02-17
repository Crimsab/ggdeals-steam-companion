// ==UserScript==
// @name         GG.deals Steam Companion
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows lowest price from gg.deals on Steam game pages
// @author       Crimsab
// @match        https://store.steampowered.com/app/*
// @icon         https://gg.deals/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        unsafeWindow
// @connect      gg.deals
// @grant        GM_setValue
// @grant        GM_getValue
// @downloadURL  https://raw.githubusercontent.com/Crimsab/ggdeals-steam-companion/main/userscript.user.js
// @updateURL    https://raw.githubusercontent.com/Crimsab/ggdeals-steam-companion/main/userscript.user.js
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        .gg-deals-container {
            background: #16202d !important;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid #67c1f530;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        }
        .gg-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: -15px -15px 15px -15px;
            padding: 15px;
            background:rgb(13, 20, 28);
            border-radius: 4px 4px 0 0;
            border-bottom: 1px solid rgba(103, 193, 245, 0.2);
            text-align: center;
        }
        .gg-title {
            color: #67c1f5;
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .gg-title img {
            width: 32px;
            height: 32px;
            filter: brightness(1.2) drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
        }
        .gg-attribution {
            color: #8f98a0;
            font-size: 11px;
            opacity: 0.8;
            font-style: italic;
            text-align: center;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(103, 193, 245, 0.1);
        }
        .gg-price-section {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 12px;
            background: #1b2838;
            border-radius: 3px;
            transition: all 0.3s ease;
            position: relative;
            min-height: 60px;
        }
        .gg-price-section.hidden {
            display: none;
        }
        .gg-price-left {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            min-width: 0;
        }
        .gg-price-label {
            color: #67c1f5;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }
        .gg-price-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            min-width: 120px;
            text-align: right;
            margin-left: 20px;
        }
        .gg-price-value {
            color: #fff;
            font-weight: bold;
            font-size: 24px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            transition: color 0.3s ease;
            white-space: nowrap;
        }
        .gg-price-value.historical {
            font-size: 13px;
            color: #acdbf5;
            opacity: 0.9;
            margin-top: 4px;
        }
        .gg-price-value.best-price {
            color: #a4d007;
            position: relative;
            padding-top: 16px;
        }
        .gg-price-value.best-price:before {
            content: "✓ Best Price";
            position: absolute;
            right: 0;
            top: 0;
            font-size: 12px;
            opacity: 0.9;
            color: #a4d007;
            white-space: nowrap;
        }
        .gg-icon {
            width: 20px;
            height: 20px;
            filter: brightness(0.8);
            flex-shrink: 0;
        }
        .gg-footer {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }
        .gg-view-offers {
            background: linear-gradient(to right, #67c1f5 0%, #4a9bd5 100%);
            padding: 8px 20px;
            border-radius: 3px;
            color: #fff !important;
            font-size: 14px;
            text-decoration: none !important;
            transition: all 0.2s ease;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
            white-space: nowrap;
        }
        .gg-view-offers:hover {
            background: linear-gradient(to right, #7dcbff 0%, #4a9bd5 100%);
            transform: translateY(-1px);
        }
        .gg-toggles {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .gg-toggle {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            user-select: none;
            opacity: 0.7;
            transition: opacity 0.2s ease;
            white-space: nowrap;
        }
        .gg-toggle:hover {
            opacity: 1;
        }
        .gg-toggle.active {
            opacity: 1;
        }
        .gg-toggle input {
            margin: 0;
        }
        .gg-toggle label {
            color: #67c1f5;
            font-size: 12px;
        }

        @media (max-width: 640px) {
            .gg-price-section {
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
            }
            .gg-price-info {
                align-items: flex-start;
                margin-left: 28px;
            }
            .gg-price-value.best-price {
                padding-top: 0;
                padding-right: 80px;
            }
            .gg-price-value.best-price:before {
                top: 50%;
                transform: translateY(-50%);
                right: 0;
            }
            .gg-footer {
                flex-direction: column-reverse;
                align-items: stretch;
            }
            .gg-view-offers {
                text-align: center;
            }
            .gg-toggles {
                justify-content: center;
            }
        }
    `);

    // Get saved toggle states or set defaults
    const toggleStates = {
        official: GM_getValue('showOfficial', true),
        keyshop: GM_getValue('showKeyshop', true)
    };

    function createSlug(title) {
        return title.toLowerCase()
            // Remove trademark and other special characters
            .replace(/[®™©]/g, '')
            // Handle possessives and special words
            .replace(/([a-z]+)(?:'s|s'|')/g, '$1s')  // Convert to plural form instead of possessive
            // Convert & to dash
            .replace(/\s*&\s*/g, '-')
            // Special handling for numbers with spaces
            .replace(/(\d+)\s+(\d+)/g, '$1-$2')
            // Remove remaining special characters but keep numbers
            .replace(/[^\w\s\d-]/g, '')
            // Replace spaces with hyphens
            .replace(/\s+/g, '-')
            // Clean up multiple hyphens
            .replace(/-+/g, '-')
            // Remove hyphens from start and end
            .replace(/^-+|-+$/g, '');
    }

    function getAlternativeTitles(title) {
        const titles = [title];
        
        // Common variations to try
        const variations = [
            // Director's Cut variations
            [/director'?s\s+cut/i, 'directors-cut'],
            [/director-s-cut/i, 'directors-cut'],
            // Other common variations
            [/(\w+)'s/g, '$1s'],  // Convert any word's to words
            [/(\w+)-s/g, '$1s'],  // Convert any word-s to words
        ];

        // Try each variation
        variations.forEach(([pattern, replacement]) => {
            if (title.match(pattern)) {
                titles.push(title.replace(pattern, replacement));
            }
        });

        // Remove everything after "Edition", "Version", etc.
        const editionMatch = title.match(/^(.*?)\s+(?:edition|version|complete|definitive|goty|game of the year|remastered|enhanced|directors cut|collection|anthology|remake|reboot)/i);
        if (editionMatch) {
            titles.push(editionMatch[1]);
        }

        // Remove everything between parentheses and brackets
        const withoutBrackets = title.replace(/[\(\[].+?[\)\]]/g, '').trim();
        if (withoutBrackets !== title) {
            titles.push(withoutBrackets);
        }

        // Remove last word if it contains more than 2 words
        const words = title.split(' ');
        if (words.length > 2) {
            titles.push(words.slice(0, -1).join(' '));
        }

        // Remove subtitle (after colon or dash)
        const subtitleMatch = title.match(/^([^:\-]+)[\-:]/);
        if (subtitleMatch) {
            titles.push(subtitleMatch[1]);
        }

        return [...new Set(titles)]; // Remove duplicates
    }

    function createPriceContainer() {
        const container = document.createElement('div');
        container.className = 'gg-deals-container';
        container.innerHTML = `
            <div class="gg-header">
                <div class="gg-title">
                    <img src="https://gg.deals/favicon.ico" alt="GG.deals">
                    GG.deals Steam Companion
                </div>
            </div>
            <div class="gg-price-section ${toggleStates.official ? '' : 'hidden'}" id="gg-official-section">
                <div class="gg-price-left">
                    <span class="gg-price-label">
                        <img src="https://gg.deals/favicon.ico" class="gg-icon">
                        Official Stores
                    </span>
                </div>
                <div class="gg-price-info">
                    <span class="gg-price-value" id="gg-official-price">Loading...</span>
                    <span class="gg-price-value historical" id="gg-official-historical"></span>
                </div>
            </div>
            <div class="gg-price-section ${toggleStates.keyshop ? '' : 'hidden'}" id="gg-keyshop-section">
                <div class="gg-price-left">
                    <span class="gg-price-label">
                        <img src="https://gg.deals/favicon.ico" class="gg-icon">
                        Keyshops
                    </span>
                </div>
                <div class="gg-price-info">
                    <span class="gg-price-value" id="gg-keyshop-price">Loading...</span>
                    <span class="gg-price-value historical" id="gg-keyshop-historical"></span>
                </div>
            </div>
            <div class="gg-footer">
                <div class="gg-toggles">
                    <label class="gg-toggle ${toggleStates.official ? 'active' : ''}" title="Toggle Official Stores">
                        <input type="checkbox" id="gg-toggle-official" ${toggleStates.official ? 'checked' : ''}>
                        <label>Official</label>
                    </label>
                    <label class="gg-toggle ${toggleStates.keyshop ? 'active' : ''}" title="Toggle Keyshops">
                        <input type="checkbox" id="gg-toggle-keyshop" ${toggleStates.keyshop ? 'checked' : ''}>
                        <label>Keyshops</label>
                    </label>
                </div>
                <a href="#" target="_blank" class="gg-view-offers">View Offers</a>
            </div>
            <div class="gg-attribution">Extension by <a href="https://steamcommunity.com/profiles/76561199186030286">Crimsab</a> · Data by <a href="https://gg.deals">gg.deals</a></div>
        `;

        // Add toggle event listeners
        container.querySelector('#gg-toggle-official').addEventListener('change', function(e) {
            toggleStates.official = e.target.checked;
            GM_setValue('showOfficial', e.target.checked);
            container.querySelector('#gg-official-section').classList.toggle('hidden', !e.target.checked);
            e.target.closest('.gg-toggle').classList.toggle('active', e.target.checked);
        });

        container.querySelector('#gg-toggle-keyshop').addEventListener('change', function(e) {
            toggleStates.keyshop = e.target.checked;
            GM_setValue('showKeyshop', e.target.checked);
            container.querySelector('#gg-keyshop-section').classList.toggle('hidden', !e.target.checked);
            e.target.closest('.gg-toggle').classList.toggle('active', e.target.checked);
        });

        return container;
    }

    function fetchGamePrices(gameTitle) {
        const titles = getAlternativeTitles(gameTitle);
        
        function tryNextTitle(index) {
            if (index >= titles.length) {
                const container = document.querySelector('.gg-deals-container');
                container.querySelector('#gg-official-price').textContent = 'Not found';
                container.querySelector('#gg-keyshop-price').textContent = 'Not found';
                return;
            }

            const currentTitle = titles[index];
            const gameSlug = createSlug(currentTitle);
            const gameUrl = `https://gg.deals/game/${gameSlug}/`;

            if (!gameSlug || gameSlug.length < 3) {
                tryNextTitle(index + 1);
                return;
            }

            GM_xmlhttpRequest({
                method: 'GET',
                url: gameUrl,
                onload: function(response) {
                    const container = document.querySelector('.gg-deals-container');
                    const link = container.querySelector('.gg-view-offers');
                    
                    if (response.status === 200) {
                        link.href = gameUrl;
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');

                        // Check if it's a valid game page by looking for price elements
                        const priceElements = doc.querySelectorAll('.price-inner.numeric');
                        if (priceElements.length === 0) {
                            tryNextTitle(index + 1);
                            return;
                        }

                        const officialPrice = priceElements[0]?.textContent.trim() || 'N/A';
                        const keyshopPrice = priceElements[1]?.textContent.trim() || 'N/A';

                        // Historical lows
                        const historicalPrices = doc.querySelectorAll('.game-info-price-col.historical.game-header-price-box');
                        historicalPrices.forEach(priceBox => {
                            const label = priceBox.querySelector('.game-info-price-label')?.textContent.trim();
                            const price = priceBox.querySelector('.price-inner.numeric')?.textContent.trim();
                            let date = priceBox.querySelector('.game-price-active-label')?.textContent.trim();
                            date = date?.replace('Expired', '').trim();

                            const historicalText = `Historical Low: ${price} (${date})`;

                            if (label.includes('Official Stores Low')) {
                                container.querySelector('#gg-official-historical').textContent = historicalText;
                            } else if (label.includes('Keyshops Low')) {
                                container.querySelector('#gg-keyshop-historical').textContent = historicalText;
                            }
                        });

                        // Compare prices and highlight the lowest
                        const officialPriceNum = parseFloat(officialPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
                        const keyshopPriceNum = parseFloat(keyshopPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));

                        const officialPriceEl = container.querySelector('#gg-official-price');
                        const keyshopPriceEl = container.querySelector('#gg-keyshop-price');

                        officialPriceEl.classList.remove('best-price');
                        keyshopPriceEl.classList.remove('best-price');

                        if (!isNaN(officialPriceNum) && !isNaN(keyshopPriceNum)) {
                            if (officialPriceNum < keyshopPriceNum) {
                                officialPriceEl.classList.add('best-price');
                            } else if (keyshopPriceNum < officialPriceNum) {
                                keyshopPriceEl.classList.add('best-price');
                            }
                        }

                        officialPriceEl.textContent = officialPrice;
                        keyshopPriceEl.textContent = keyshopPrice;
                    } else {
                        tryNextTitle(index + 1);
                    }
                },
                onerror: function() {
                    tryNextTitle(index + 1);
                }
            });
        }

        tryNextTitle(0);
    }

    // Wait for Steam page to fully load (including age gate)
    const checkTitle = setInterval(() => {
        const purchaseSection = document.querySelector('#game_area_purchase');
        // Try to get the most accurate game title
        const titleElement = document.querySelector('.apphub_AppName') || // Main title
                           document.querySelector('.game_title_area h2.pageheader') || // Alternative title
                           document.querySelector('#appHubAppName'); // Fallback

        if (purchaseSection && titleElement && titleElement.textContent.trim()) {
            clearInterval(checkTitle);
            const priceContainer = createPriceContainer();
            purchaseSection.parentNode.insertBefore(priceContainer, purchaseSection);
            fetchGamePrices(titleElement.textContent.trim());
        }
    }, 500); // 0.5 seconds
})();
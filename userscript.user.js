// ==UserScript==
// @name         GG.deals Steam Companion
// @namespace    http://tampermonkey.net/
// @version      1.1
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

        .gg-refresh {
            background: none;
            border: none;
            color: #67c1f5;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            opacity: 0.7;
            transition: all 0.2s ease;
        }
        .gg-refresh:hover {
            opacity: 1;
            background: rgba(103, 193, 245, 0.1);
        }
        .gg-refresh svg {
            width: 14px;
            height: 14px;
            transition: transform 0.5s ease;
        }
        .gg-refresh.loading svg {
            transform: rotate(360deg);
        }
        .gg-refresh-text {
            color: #8f98a0;
            font-size: 10px;
            margin-left: 4px;
        }

        .github-icon {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin: -2px 4px 0 2px;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        .github-icon:hover {
            opacity: 1;
        }
    `);

    // Get saved toggle states or set defaults
    const toggleStates = {
        official: GM_getValue('showOfficial', true),
        keyshop: GM_getValue('showKeyshop', true)
    };

    // Cache configuration
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
    const MAX_RETRIES = 3;

    // Cache structure with force refresh option
    const priceCache = {
        get: function(key, forceRefresh = false) {
            if (forceRefresh) return null;
            
            const cached = GM_getValue(`cache_${key}`);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_EXPIRY) {
                GM_setValue(`cache_${key}`, '');
                return null;
            }
            return data;
        },
        set: function(key, data) {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            GM_setValue(`cache_${key}`, JSON.stringify(cacheData));
        },
        getTimestamp: function(key) {
            const cached = GM_getValue(`cache_${key}`);
            if (!cached) return null;
            return JSON.parse(cached).timestamp;
        }
    };

    // Rate limiter
    let lastRequestTime = 0;
    async function rateLimitedRequest(url) {
        const now = Date.now();
        const timeToWait = Math.max(0, RATE_LIMIT_DELAY - (now - lastRequestTime));
        
        if (timeToWait > 0) {
            await new Promise(resolve => setTimeout(resolve, timeToWait));
        }
        
        lastRequestTime = Date.now();
        
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                timeout: 10000,
                onload: resolve,
                onerror: reject,
                ontimeout: reject
            });
        });
    }

    // Optimized slug creation
    function createSlug(title) {
        return title.toLowerCase()
            .replace(/[®™©]/g, '')
            .replace(/([a-z]+)(?:'s|s'|')/g, '$1s')
            .replace(/\s*&\s*/g, '-')
            .replace(/(\d+)\s+(\d+)/g, '$1-$2')
            .replace(/[^\w\s\d-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
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
                    <button class="gg-refresh" title="Refresh Prices">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span class="gg-refresh-text"></span>
                    </button>
                </div>
                <a href="#" target="_blank" class="gg-view-offers">View Offers</a>
            </div>
            <div class="gg-attribution">Extension by <a href="https://steamcommunity.com/profiles/76561199186030286">Crimsab</a> <a href="https://github.com/Crimsab/ggdeals-steam-companion" title="View on GitHub"><svg class="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a> · Data by <a href="https://gg.deals">gg.deals</a></div>
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

        // Add refresh button listener
        const refreshButton = container.querySelector('.gg-refresh');
        const refreshText = refreshButton.querySelector('.gg-refresh-text');
        refreshButton.addEventListener('click', async function() {
            const gameTitle = document.querySelector('.apphub_AppName')?.textContent.trim() ||
                            document.querySelector('.game_title_area h2.pageheader')?.textContent.trim() ||
                            document.querySelector('#appHubAppName')?.textContent.trim();
            
            if (!gameTitle) return;

            refreshButton.classList.add('loading');
            refreshButton.disabled = true;
            
            try {
                await fetchGamePrices(gameTitle, true); // Pass true to force refresh
                const timestamp = priceCache.getTimestamp(createSlug(gameTitle));
                if (timestamp) {
                    refreshText.textContent = 'Updated just now';
                    setTimeout(() => {
                        refreshText.textContent = '';
                    }, 3000);
                }
            } catch (error) {
                console.error('Failed to refresh prices:', error);
                refreshText.textContent = 'Refresh failed';
                setTimeout(() => {
                    refreshText.textContent = '';
                }, 3000);
            } finally {
                refreshButton.classList.remove('loading');
                refreshButton.disabled = false;
            }
        });

        // Update last refresh time if cached data exists
        const gameTitle = document.querySelector('.apphub_AppName')?.textContent.trim() ||
                         document.querySelector('.game_title_area h2.pageheader')?.textContent.trim() ||
                         document.querySelector('#appHubAppName')?.textContent.trim();
        
        if (gameTitle) {
            const timestamp = priceCache.getTimestamp(createSlug(gameTitle));
            if (timestamp) {
                const timeAgo = Math.floor((Date.now() - timestamp) / 60000); // minutes
                if (timeAgo < 60) {
                    refreshText.textContent = `Updated ${timeAgo}m ago`;
                } else {
                    const hoursAgo = Math.floor(timeAgo / 60);
                    refreshText.textContent = `Updated ${hoursAgo}h ago`;
                }
            }
        }

        return container;
    }

    // Improved error handling and retries
    async function fetchWithRetry(url, retries = MAX_RETRIES) {
        try {
            const response = await rateLimitedRequest(url);
            if (response.status === 200) {
                return response;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWithRetry(url, retries - 1);
            }
            throw error;
        }
    }

    async function fetchGamePrices(gameTitle, forceRefresh = false) {
        const cacheKey = createSlug(gameTitle);
        const cachedData = priceCache.get(cacheKey, forceRefresh);
        
        if (cachedData) {
            updatePriceDisplay(cachedData);
            return;
        }

        const titles = getAlternativeTitles(gameTitle);
        
        async function tryNextTitle(index) {
            if (index >= titles.length) {
                console.warn('GG.deals: No matching game found');
                return;
            }

            const title = titles[index];
            const slug = createSlug(title);
            const url = `https://gg.deals/game/${slug}/`;

            try {
                const response = await fetchWithRetry(url);
                if (response.finalUrl.includes('/game/')) {
                    const data = extractPriceData(response.responseText);
                    priceCache.set(cacheKey, data);
                    updatePriceDisplay(data);
                } else {
                    await tryNextTitle(index + 1);
                }
            } catch (error) {
                console.error('GG.deals error:', error);
                if (index < titles.length - 1) {
                    await tryNextTitle(index + 1);
                }
            }
        }

        await tryNextTitle(0);
    }

    function extractPriceData(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Check if it's a valid game page by looking for price elements
        const priceElements = doc.querySelectorAll('.price-inner.numeric');
        if (priceElements.length === 0) {
            return null;
        }

        const officialPrice = priceElements[0]?.textContent.trim() || 'N/A';
        const keyshopPrice = priceElements[1]?.textContent.trim() || 'N/A';

        // Historical lows
        const historicalPrices = doc.querySelectorAll('.game-info-price-col.historical.game-header-price-box');
        const historicalData = [];
        historicalPrices.forEach(priceBox => {
            const label = priceBox.querySelector('.game-info-price-label')?.textContent.trim();
            const price = priceBox.querySelector('.price-inner.numeric')?.textContent.trim();
            let date = priceBox.querySelector('.game-price-active-label')?.textContent.trim();
            date = date?.replace('Expired', '').trim();

            const historicalText = `Historical Low: ${price} (${date})`;

            if (label?.includes('Official Stores Low')) {
                historicalData.push({ type: 'official', price: price, historical: historicalText });
            } else if (label?.includes('Keyshops Low')) {
                historicalData.push({ type: 'keyshop', price: price, historical: historicalText });
            }
        });

        // Compare prices and determine the lowest
        const officialPriceNum = parseFloat(officialPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
        const keyshopPriceNum = parseFloat(keyshopPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
        
        let lowestPriceType = null;
        if (!isNaN(officialPriceNum) && !isNaN(keyshopPriceNum)) {
            lowestPriceType = officialPriceNum <= keyshopPriceNum ? 'official' : 'keyshop';
        } else if (!isNaN(officialPriceNum)) {
            lowestPriceType = 'official';
        } else if (!isNaN(keyshopPriceNum)) {
            lowestPriceType = 'keyshop';
        }

        // Get the current URL for the "View Offers" link
        const currentUrl = doc.querySelector('link[rel="canonical"]')?.href || '';

        return {
            officialPrice: officialPrice,
            keyshopPrice: keyshopPrice,
            historicalData: historicalData,
            lowestPriceType: lowestPriceType,
            url: currentUrl
        };
    }

    function updatePriceDisplay(data) {
        const container = document.querySelector('.gg-deals-container');
        const link = container.querySelector('.gg-view-offers');
        
        if (data) {
            // Update prices
            container.querySelector('#gg-official-price').textContent = data.officialPrice;
            container.querySelector('#gg-keyshop-price').textContent = data.keyshopPrice;

            // Update historical data
            const officialHistorical = data.historicalData.find(h => h.type === 'official');
            const keyshopHistorical = data.historicalData.find(h => h.type === 'keyshop');
            container.querySelector('#gg-official-historical').textContent = officialHistorical?.historical || '';
            container.querySelector('#gg-keyshop-historical').textContent = keyshopHistorical?.historical || '';

            // Update best price indicator
            container.querySelector('#gg-official-price').classList.remove('best-price');
            container.querySelector('#gg-keyshop-price').classList.remove('best-price');
            if (data.lowestPriceType === 'official') {
                container.querySelector('#gg-official-price').classList.add('best-price');
            } else if (data.lowestPriceType === 'keyshop') {
                container.querySelector('#gg-keyshop-price').classList.add('best-price');
            }

            // Update view offers link
            if (data.url) {
                link.href = data.url;
            }
        } else {
            container.querySelector('#gg-official-price').textContent = 'Not found';
            container.querySelector('#gg-keyshop-price').textContent = 'Not found';
            container.querySelector('#gg-official-historical').textContent = '';
            container.querySelector('#gg-keyshop-historical').textContent = '';
            link.href = 'https://gg.deals';
        }
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
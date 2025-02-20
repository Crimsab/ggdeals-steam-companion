// ==UserScript==
// @name         GG.deals Steam Companion
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Shows lowest price from gg.deals on Steam game pages
// @author       Crimsab
// @license      GPL-3.0-or-later
// @match        https://store.steampowered.com/app/*
// @match        https://store.steampowered.com/sub/*
// @match        https://store.steampowered.com/bundle/*
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

(function () {
  "use strict";

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
            clear: both;
        }
        .gg-deals-container.compact {
            padding: 10px;
            margin: 10px 0;
        }
        .gg-deals-container.compact .gg-header,
        .gg-deals-container.compact .gg-attribution,
        .gg-deals-container.compact .gg-price-sections {
            display: none;
        }
        .gg-compact-row {
            display: none;
            align-items: center;
            gap: 15px;
            padding: 5px;
        }
        .gg-deals-container.compact .gg-compact-row {
            display: flex;
        }
        .gg-compact-prices {
            display: flex;
            align-items: center;
            gap: 20px;
            flex: 1;
        }
        .gg-compact-price-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .gg-compact-price-item .gg-price-value {
            font-size: 18px;
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
        /* Hide the "Best Price" text in compact view */
        .gg-compact-price-item .gg-price-value.best-price {
            padding-top: 0;
        }
        .gg-compact-price-item .gg-price-value.best-price:before {
            display: none;
        }
        .gg-settings-dropdown {
            position: relative;
            display: inline-block;
        }
        .gg-settings-icon {
            cursor: pointer;
            padding: 5px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .gg-settings-icon:hover {
            opacity: 1;
        }
        .gg-settings-icon svg {
            width: 20px;
            height: 20px;
            fill: #67c1f5;
        }
        .gg-settings-content {
            display: none;
            position: absolute;
            right: 0;
            background: #16202d;
            min-width: 160px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid #67c1f530;
            border-radius: 4px;
            z-index: 1000;
            padding: 10px;
        }
        .gg-settings-content.show {
            display: block;
        }
        .gg-compact-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .gg-tooltip {
            position: relative;
            display: inline-block;
        }
        .gg-tooltip:hover .gg-tooltip-text {
            visibility: visible;
            opacity: 1;
        }
        .gg-tooltip-text {
            visibility: hidden;
            opacity: 0;
            background-color: #16202d;
            color: #fff;
            text-align: center;
            padding: 5px 10px;
            border-radius: 4px;
            border: 1px solid #67c1f530;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            transition: opacity 0.2s;
            font-size: 12px;
        }
        .gg-controls {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid rgba(103, 193, 245, 0.1);
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
        .gg-price-sections {
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
        .gg-price-section {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            min-width: 0;
        }
        .gg-price-left {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
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
            align-items: center;
            justify-content: center;
            min-width: 120px;
            text-align: center;
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
            width: 100%;
            background: linear-gradient(to right, #67c1f5 0%, #4a9bd5 100%);
            padding: 8px 20px;
            border-radius: 3px;
            color: #fff !important;
            font-size: 14px;
            text-decoration: none !important;
            transition: all 0.2s ease;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
            text-align: center;
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
            color: #67c1f5;
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
            .gg-price-sections {
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

        .gg-icon-button {
            background: none;
            border: none;
            color: #67c1f5;
            cursor: pointer;
            padding: 5px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            opacity: 0.7;
            transition: all 0.2s ease;
        }
        .gg-icon-button:hover {
            opacity: 1;
            background: rgba(103, 193, 245, 0.1);
        }
        .gg-icon-button svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }
        .gg-refresh {
            composes: gg-icon-button;
        }
        .gg-refresh svg {
            transition: transform 0.5s ease;
            stroke: currentColor;
            fill: none;
        }
        .gg-refresh.loading svg {
            transform: rotate(360deg);
        }
        .gg-settings-icon {
            composes: gg-icon-button;
        }
        .gg-settings-icon svg {
            fill: currentColor;
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
        .gg-deals-container.compact .gg-controls {
            display: none;
        }
        .bundle-sub-display {
            background: #16202d !important;
            border-radius: 4px;
            border: 1px solid #67c1f530;
            position: relative;
            z-index: 1;
        }
        .game_area_purchase_game_wrapper + .bundle-sub-display {
            margin-top: -10px !important;
        }
        .bundle_contents_preview + .gg-deals-container {
            margin-top: 0 !important;
        }
        .game_area_purchase + .gg-deals-container {
            margin-top: 0 !important;
        }
        .gg-view-offers {
            display: inline-block;
            text-align: center;
            transition: transform 0.2s ease;
        }
        .gg-view-offers:hover {
            transform: translateY(-1px);
        }
        .gg-refresh {
            padding: 5px 8px;
        }
        .gg-refresh:hover {
            padding: 5px 8px;
        }
        .gg-price-value {
            display: inline-block;
            min-width: 80px;
        }
    `);

  // Get saved toggle states or set defaults
  const toggleStates = {
    official: GM_getValue("showOfficial", true),
    keyshop: GM_getValue("showKeyshop", true),
    compact: GM_getValue("compactView", false),
    subDisplay: GM_getValue("showSubDisplay", true)
  };

  // Cache configuration
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
  const MAX_RETRIES = 1;

  // Cache structure with force refresh option
  const priceCache = {
    get: function (key, forceRefresh = false) {
      if (forceRefresh) {
        GM_setValue(`cache_${key}`, "");
        return null;
      }

      const cached = GM_getValue(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        GM_setValue(`cache_${key}`, "");
        return null;
      }
      return data;
    },
    set: function (key, data) {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
      };
      GM_setValue(`cache_${key}`, JSON.stringify(cacheData));
    },
    getTimestamp: function (key) {
      const cached = GM_getValue(`cache_${key}`);
      if (!cached) return null;
      return JSON.parse(cached).timestamp;
    },
  };

  // Rate limiter with cross-tab synchronization
  async function rateLimitedRequest(url) {
    const now = Date.now();
    const lastRequest = GM_getValue("lastRequestTime", 0);
    const timeToWait = Math.max(0, RATE_LIMIT_DELAY - (now - lastRequest));

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    GM_setValue("lastRequestTime", Date.now());

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: url,
        timeout: 10000,
        onload: resolve,
        onerror: reject,
        ontimeout: reject,
      });
    });
  }

  function createPriceContainer() {
    const container = document.createElement("div");
    container.className =
      "gg-deals-container" + (toggleStates.compact ? " compact" : "");
    container.innerHTML = `
            <div class="gg-header">
                <div class="gg-title">
                    <img src="https://gg.deals/favicon.ico" alt="GG.deals">
                    GG.deals Steam Companion
                </div>
            </div>
            <div class="gg-compact-row">
                <img src="https://gg.deals/favicon.ico" alt="GG.deals" class="gg-icon">
                <div class="gg-compact-prices">
                    <div class="gg-compact-price-item" id="gg-compact-official" style="${
                      !toggleStates.official ? "display:none" : ""
                    }">
                        <span>Official:</span>
                        <span class="gg-tooltip">
                            <span class="gg-price-value" id="gg-compact-official-price">Loading...</span>
                            <span class="gg-tooltip-text" id="gg-compact-official-historical"></span>
                        </span>
                    </div>
                    <div class="gg-compact-price-item" id="gg-compact-keyshop" style="${
                      !toggleStates.keyshop ? "display:none" : ""
                    }">
                        <span>Keyshop:</span>
                        <span class="gg-tooltip">
                            <span class="gg-price-value" id="gg-compact-keyshop-price">Loading...</span>
                            <span class="gg-tooltip-text" id="gg-compact-keyshop-historical"></span>
                        </span>
                    </div>
                </div>
                <div class="gg-compact-controls">
                    <button class="gg-icon-button gg-refresh" title="Refresh Prices">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span class="gg-refresh-text"></span>
                    </button>
                    <div class="gg-settings-dropdown">
                        <div class="gg-icon-button gg-settings-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.65.07.97l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"/>
                            </svg>
                        </div>
                        <div class="gg-settings-content">
                            <label class="gg-toggle ${toggleStates.official ? "active" : ""}" title="Toggle Official Stores">
                                <input type="checkbox" id="gg-toggle-official-compact" ${toggleStates.official ? "checked" : ""}>
                                <label>Official</label>
                            </label>
                            <label class="gg-toggle ${toggleStates.keyshop ? "active" : ""}" title="Toggle Keyshops">
                                <input type="checkbox" id="gg-toggle-keyshop-compact" ${toggleStates.keyshop ? "checked" : ""}>
                                <label>Keyshops</label>
                            </label>
                            <label class="gg-toggle ${toggleStates.compact ? "active" : ""}" title="Toggle Compact View">
                                <input type="checkbox" id="gg-toggle-compact-menu" ${toggleStates.compact ? "checked" : ""}>
                                <label>Compact</label>
                            </label>
                            <label class="gg-toggle ${toggleStates.subDisplay ? "active" : ""}" title="Toggle Sub/Bundle Displays">
                                <input type="checkbox" id="gg-toggle-sub-display-compact" ${toggleStates.subDisplay ? "checked" : ""}>
                                <label>Bundle Display</label>
                            </label>
                        </div>
                    </div>
                    <a href="#" target="_blank" class="gg-view-offers">View Offers</a>
                </div>
            </div>
            <div class="gg-price-sections">
                <div class="gg-price-section ${
                  toggleStates.official ? "" : "hidden"
                }" id="gg-official-section">
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
                <div class="gg-price-section ${
                  toggleStates.keyshop ? "" : "hidden"
                }" id="gg-keyshop-section">
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
            </div>
            <div class="gg-controls">
                <label class="gg-toggle ${toggleStates.official ? "active" : ""}" title="Toggle Official Stores">
                    <input type="checkbox" id="gg-toggle-official" ${toggleStates.official ? "checked" : ""}>
                    <label>Official</label>
                </label>
                <label class="gg-toggle ${toggleStates.keyshop ? "active" : ""}" title="Toggle Keyshops">
                    <input type="checkbox" id="gg-toggle-keyshop" ${toggleStates.keyshop ? "checked" : ""}>
                    <label>Keyshops</label>
                </label>
                <label class="gg-toggle ${toggleStates.compact ? "active" : ""}" title="Toggle Compact View">
                    <input type="checkbox" id="gg-toggle-compact" ${toggleStates.compact ? "checked" : ""}>
                    <label>Compact</label>
                </label>
                <label class="gg-toggle ${toggleStates.subDisplay ? "active" : ""}" title="Toggle Sub/Bundle Displays">
                    <input type="checkbox" id="gg-toggle-sub-display" ${toggleStates.subDisplay ? "checked" : ""}>
                    <label>Bundle Display</label>
                </label>
                <button class="gg-icon-button gg-refresh" title="Refresh Prices">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span class="gg-refresh-text"></span>
                </button>
                <a href="#" target="_blank" class="gg-view-offers">View Offers</a>
            </div>
            <div class="gg-attribution">Extension by <a href="https://steamcommunity.com/profiles/76561199186030286">Crimsab</a> <a href="https://github.com/Crimsab/ggdeals-steam-companion" title="View on GitHub"><svg class="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a> · Data by <a href="https://gg.deals">gg.deals</a></div>
        `;

    // Add toggle listeners for both sets of controls
    const toggleOfficialCompact = container.querySelector(
      "#gg-toggle-official-compact"
    );
    const toggleKeyshopCompact = container.querySelector(
      "#gg-toggle-keyshop-compact"
    );
    const toggleCompactMenu = container.querySelector(
      "#gg-toggle-compact-menu"
    );
    const toggleOfficial = container.querySelector("#gg-toggle-official");
    const toggleKeyshop = container.querySelector("#gg-toggle-keyshop");
    const toggleCompact = container.querySelector("#gg-toggle-compact");
    const toggleSubDisplay = container.querySelector("#gg-toggle-sub-display");

    function updateToggleState(type, checked) {
      toggleStates[type] = checked;
      GM_setValue(
        `show${type.charAt(0).toUpperCase() + type.slice(1)}`,
        checked
      );

      if (type === "official" || type === "keyshop") {
        container.querySelector(`#gg-compact-${type}`).style.display = checked
          ? ""
          : "none";
        container
          .querySelector(`#gg-${type}-section`)
          .classList.toggle("hidden", !checked);
      } else if (type === "compact") {
        container.classList.toggle("compact", checked);
      } else if (type === "subDisplay") {
        // Toggle visibility of all sub displays
        document.querySelectorAll('.gg-deals-container.bundle-sub-display').forEach(el => {
          el.style.display = checked ? "" : "none";
        });
      }

      // Update all related toggle buttons
      container
        .querySelectorAll(`input[id*=toggle-${type}]`)
        .forEach((input) => {
          input.checked = checked;
          input.closest(".gg-toggle").classList.toggle("active", checked);
        });
    }

    // Add event listeners for all toggles
    [toggleOfficialCompact, toggleOfficial].forEach((toggle) => {
      if (toggle) {
        toggle.addEventListener("change", (e) =>
          updateToggleState("official", e.target.checked)
        );
      }
    });

    [toggleKeyshopCompact, toggleKeyshop].forEach((toggle) => {
      if (toggle) {
        toggle.addEventListener("change", (e) =>
          updateToggleState("keyshop", e.target.checked)
        );
      }
    });

    [toggleCompactMenu, toggleCompact].forEach((toggle) => {
      if (toggle) {
        toggle.addEventListener("change", (e) =>
          updateToggleState("compact", e.target.checked)
        );
      }
    });

    const toggleSubDisplayCompact = container.querySelector("#gg-toggle-sub-display-compact");
    [toggleSubDisplay, toggleSubDisplayCompact].forEach((toggle) => {
      if (toggle) {
        toggle.addEventListener("change", (e) => updateToggleState("subDisplay", e.target.checked));
      }
    });

    // Add refresh button listeners to both compact and full view buttons
    container.querySelectorAll(".gg-refresh").forEach(refreshButton => {
      const refreshText = refreshButton.querySelector(".gg-refresh-text");
      refreshButton.addEventListener("click", async function () {
        refreshButton.classList.add("loading");
        refreshButton.disabled = true;

        try {
          const urlMatch = window.location.pathname.match(/\/(app|sub|bundle)\/(\d+)/);
          if (urlMatch) {
            const [, type, id] = urlMatch;
            await fetchGamePrices(null, container.id, true, { type, id });
            refreshText.textContent = "Updated just now";
            setTimeout(() => {
              refreshText.textContent = "";
            }, 3000);
          }
        } catch (error) {
          console.error("Failed to refresh prices:", error);
          refreshText.textContent = "Refresh failed";
          setTimeout(() => {
            refreshText.textContent = "";
          }, 3000);
        } finally {
          refreshButton.classList.remove("loading");
          refreshButton.disabled = false;
        }
      });
    });

    // Add settings dropdown toggle
    const settingsIcon = container.querySelector(".gg-settings-icon");
    const settingsContent = container.querySelector(".gg-settings-content");

    settingsIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsContent.classList.toggle("show");
    });

    // Close settings dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!settingsContent.contains(e.target) && !settingsIcon.contains(e.target)) {
        settingsContent.classList.remove("show");
      }
    });

    // Update last refresh time if cached data exists
    const urlMatch = window.location.pathname.match(/\/(app|sub|bundle)\/(\d+)/);
    if (urlMatch) {
      const [, type, id] = urlMatch;
      const timestamp = priceCache.getTimestamp(`${type}_${id}`);
      if (timestamp) {
        const timeAgo = Math.floor((Date.now() - timestamp) / 60000); // minutes
        const refreshText = container.querySelector(".gg-refresh-text");
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  }

  async function fetchGamePrices(gameTitle, containerId, forceRefresh = false, idInfo = null) {
    let type, id;

    if (idInfo) {
        type = idInfo.type;
        id = idInfo.id;
    } else {
        // First try to get ID from the container itself
        const container = document.getElementById(containerId);
        if (container) {
            const purchaseGame = container.closest('.game_area_purchase_game');
            if (purchaseGame) {
                const bundleInput = purchaseGame.querySelector('input[name="bundleid"]');
                const subInput = purchaseGame.querySelector('input[name="subid"]');
                if (bundleInput) {
                    type = 'bundle';
                    id = bundleInput.value;
                } else if (subInput) {
                    type = 'sub';
                    id = subInput.value;
                }
            }
        }

        // If no ID found from container, try URL
        if (!type || !id) {
            const urlMatch = window.location.pathname.match(/\/(app|sub|bundle)\/(\d+)/);
            if (!urlMatch) {
                console.warn("GG.deals: Could not find Steam ID");
                return;
            }
            [, type, id] = urlMatch;
        }
    }

    const cacheKey = `${type}_${id}`;
    const cachedData = priceCache.get(cacheKey, forceRefresh);

    if (cachedData) {
        updatePriceDisplay(cachedData, containerId);
        return;
    }

    // If forcing refresh, clear cache for all containers on the page
    if (forceRefresh) {
        document.querySelectorAll('.gg-deals-container').forEach(container => {
            if (container.id && container.id !== containerId) {
                const match = container.id.match(/gg-deals-(app|sub|bundle)-(\d+)/);
                if (match) {
                    const [, containerType, containerId] = match;
                    priceCache.get(`${containerType}_${containerId}`, true);
                }
            }
        });
    }

    // Function to convert game name to URL slug
    const toUrlSlug = (name) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Define base URL formats
    const baseFormats = [
        { type: type, id: id },  // Try original type first
        { type: 'sub', id: id }, // Try sub if original was app
        { type: 'app', id: id }  // Try app if original was sub
    ];

    // Filter unique formats
    const urlFormats = baseFormats.filter((format, index) => 
        format.type === type || 
        baseFormats.findIndex(f => f.type === format.type) === index
    );

    // Try each URL format
    for (const format of urlFormats) {
        try {
            const steamUrl = `https://gg.deals/steam/${format.type}/${format.id}/`;
            const response = await fetchWithRetry(steamUrl);
            const data = extractPriceData(response.responseText);
            if (data && data.officialPrice !== "No data") {
                priceCache.set(cacheKey, data);
                updatePriceDisplay(data, containerId);
                return;
            }
        } catch (error) {
            console.warn(`GG.deals ${format.type} URL fetch failed:`, error);
        }
    }

    // If the direct Steam URL didn't work, just show No data
    // Don't try game name based URL anymore
    updatePriceDisplay({
        officialPrice: "No data",
        keyshopPrice: "No data",
        historicalData: [],
        lowestPriceType: null,
        url: `https://gg.deals/steam/${type}/${id}/`,
        isCorrectGame: true
    }, containerId);
  }

  function extractPriceData(html, expectedGameName) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Get the actual game name from the page
    const pageGameName = doc.querySelector('.game-info-title')?.textContent?.trim() ||
                        doc.querySelector('.game-header-title')?.textContent?.trim();

    // Check if we got the correct game
    const isCorrectGame = !expectedGameName || !pageGameName || 
                         pageGameName.toLowerCase().includes(expectedGameName.toLowerCase()) ||
                         expectedGameName.toLowerCase().includes(pageGameName.toLowerCase());

    // Check if it's a valid game page
    if (!doc.querySelector('.game-info-price-col')) {
        return {
            officialPrice: "No data",
            keyshopPrice: "No data",
            historicalData: [],
            lowestPriceType: null,
            url: doc.querySelector('link[rel="canonical"]')?.href || "https://gg.deals",
            isCorrectGame
        };
    }

    // Find current prices (non-historical)
    let officialPrice = "No data";
    let keyshopPrice = "No data";

    // Look for current prices in the main price sections (not historical)
    const currentPriceSections = Array.from(doc.querySelectorAll('.game-info-price-col')).filter(
      section => !section.classList.contains('historical')
    );

    currentPriceSections.forEach(section => {
      const label = section.querySelector('.game-info-price-label')?.textContent.trim();
      const price = section.querySelector('.price-inner.numeric')?.textContent.trim();
      
      if (label?.includes('Official Stores')) {
        officialPrice = price || "No data";
      } else if (label?.includes('Keyshops')) {
        keyshopPrice = price || "No data";
      }
    });

    // Historical lows (separate section)
    const historicalPrices = doc.querySelectorAll(
      ".game-info-price-col.historical.game-header-price-box"
    );
    const historicalData = [];
    historicalPrices.forEach((priceBox) => {
      const label = priceBox
        .querySelector(".game-info-price-label")
        ?.textContent.trim();
      const price = priceBox
        .querySelector(".price-inner.numeric")
        ?.textContent.trim();
      let date = priceBox
        .querySelector(".game-price-active-label")
        ?.textContent.trim();
      date = date?.replace("Expired", "").trim();

      if (!price || !date) return;

      const historicalText = `Historical Low: ${price} (${date})`;

      if (label?.includes("Official Stores Low")) {
        historicalData.push({
          type: "official",
          price: price,
          historical: historicalText,
        });
      } else if (label?.includes("Keyshops Low") && keyshopPrice !== "No data") {
        historicalData.push({
          type: "keyshop",
          price: price,
          historical: historicalText,
        });
      }
    });

    // Compare current prices (not historical) to determine the lowest
    const officialPriceNum = parseFloat(
      officialPrice.replace(/[^0-9,.]/g, "").replace(",", ".")
    );
    const keyshopPriceNum = parseFloat(
      keyshopPrice.replace(/[^0-9,.]/g, "").replace(",", ".")
    );

    let lowestPriceType = null;
    if (!isNaN(officialPriceNum) && !isNaN(keyshopPriceNum)) {
      lowestPriceType =
        officialPriceNum <= keyshopPriceNum ? "official" : "keyshop";
    } else if (!isNaN(officialPriceNum)) {
      lowestPriceType = "official";
    } else if (!isNaN(keyshopPriceNum)) {
      lowestPriceType = "keyshop";
    }

    // Get the current URL for the "View Offers" link
    const currentUrl = doc.querySelector('link[rel="canonical"]')?.href || "https://gg.deals";

    return {
      officialPrice: officialPrice,
      keyshopPrice: keyshopPrice,
      historicalData: historicalData,
      lowestPriceType: lowestPriceType,
      url: currentUrl,
      isCorrectGame
    };
  }

  function updatePriceDisplay(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Update all View Offers links in the container
    const links = container.querySelectorAll(".gg-view-offers");

    if (data) {
        // Update prices based on container type
        if (container.classList.contains('bundle-sub-display')) {
            // Update compact display
            const officialPrice = container.querySelector('.gg-compact-official-price');
            const keyshopPrice = container.querySelector('.gg-compact-keyshop-price');
            const officialHistorical = container.querySelector('.gg-compact-official-historical');
            const keyshopHistorical = container.querySelector('.gg-compact-keyshop-historical');

            if (officialPrice) officialPrice.textContent = data.officialPrice;
            if (keyshopPrice) keyshopPrice.textContent = data.keyshopPrice;

            // Show historical data regardless of current price status
            if (officialHistorical) {
                const officialHistData = data.historicalData.find(h => h.type === 'official');
                officialHistorical.textContent = officialHistData?.historical || '';
            }
            if (keyshopHistorical) {
                const keyshopHistData = data.historicalData.find(h => h.type === 'keyshop');
                keyshopHistorical.textContent = keyshopHistData?.historical || '';
            }

            // Update best price indicators
            if (officialPrice) officialPrice.classList.remove('best-price');
            if (keyshopPrice) keyshopPrice.classList.remove('best-price');

            if (data.lowestPriceType === 'official' && officialPrice) {
                officialPrice.classList.add('best-price');
            } else if (data.lowestPriceType === 'keyshop' && keyshopPrice) {
                keyshopPrice.classList.add('best-price');
            }
        } else {
            // Update full display
            const elements = {
                official: {
                    price: container.querySelector("#gg-official-price"),
                    historical: container.querySelector("#gg-official-historical"),
                    compactPrice: container.querySelector("#gg-compact-official-price"),
                    compactHistorical: container.querySelector("#gg-compact-official-historical")
                },
                keyshop: {
                    price: container.querySelector("#gg-keyshop-price"),
                    historical: container.querySelector("#gg-keyshop-historical"),
                    compactPrice: container.querySelector("#gg-compact-keyshop-price"),
                    compactHistorical: container.querySelector("#gg-compact-keyshop-historical")
                }
            };

            // Update prices
            if (elements.official.price) elements.official.price.textContent = data.officialPrice;
            if (elements.keyshop.price) elements.keyshop.price.textContent = data.keyshopPrice;
            if (elements.official.compactPrice) elements.official.compactPrice.textContent = data.officialPrice;
            if (elements.keyshop.compactPrice) elements.keyshop.compactPrice.textContent = data.keyshopPrice;

            // Update historical data regardless of current price status
            const officialHistData = data.historicalData.find(h => h.type === 'official');
            const keyshopHistData = data.historicalData.find(h => h.type === 'keyshop');

            if (elements.official.historical) {
                elements.official.historical.textContent = officialHistData?.historical || '';
            }
            if (elements.keyshop.historical) {
                elements.keyshop.historical.textContent = keyshopHistData?.historical || '';
            }
            if (elements.official.compactHistorical) {
                elements.official.compactHistorical.textContent = officialHistData?.historical || '';
            }
            if (elements.keyshop.compactHistorical) {
                elements.keyshop.compactHistorical.textContent = keyshopHistData?.historical || '';
            }

            // Update best price indicators
            [elements.official.price, elements.official.compactPrice, elements.keyshop.price, elements.keyshop.compactPrice].forEach(el => {
                if (el) el.classList.remove('best-price');
            });

            if (data.lowestPriceType === 'official') {
                [elements.official.price, elements.official.compactPrice].forEach(el => {
                    if (el) el.classList.add('best-price');
                });
            } else if (data.lowestPriceType === 'keyshop') {
                [elements.keyshop.price, elements.keyshop.compactPrice].forEach(el => {
                    if (el) el.classList.add('best-price');
                });
            }
        }

        // Update all View Offers links
        if (data.url) {
            links.forEach(link => {
                link.href = data.url;
            });
        }
    } else {
        // Handle error state
        const priceElements = container.querySelectorAll('.gg-price-value:not(.historical)');
        priceElements.forEach(el => {
            el.textContent = 'Not found';
        });

        const historicalElements = container.querySelectorAll('.gg-tooltip-text, .gg-price-value.historical');
        historicalElements.forEach(el => {
            el.textContent = '';
        });

        // Set default URL for all View Offers links
        links.forEach(link => {
            link.href = `https://gg.deals/steam/${type}/${id}/`;
        });
    }
  }

  function createCompactPriceDisplay(containerId) {
    const container = document.createElement('div');
    container.className = 'gg-deals-container compact bundle-sub-display';
    container.id = containerId;
    container.style.display = toggleStates.subDisplay ? "" : "none";
    container.innerHTML = `
        <div class="gg-compact-row">
            <img src="https://gg.deals/favicon.ico" alt="GG.deals" class="gg-icon">
            <div class="gg-compact-prices">
                <div class="gg-compact-price-item gg-compact-official" style="${!toggleStates.official ? "display:none" : ""}">
                    <span>Official:</span>
                    <span class="gg-tooltip">
                        <span class="gg-price-value gg-compact-official-price">Loading...</span>
                        <span class="gg-tooltip-text gg-compact-official-historical"></span>
                    </span>
                </div>
                <div class="gg-compact-price-item gg-compact-keyshop" style="${!toggleStates.keyshop ? "display:none" : ""}">
                    <span>Keyshop:</span>
                    <span class="gg-tooltip">
                        <span class="gg-price-value gg-compact-keyshop-price">Loading...</span>
                        <span class="gg-tooltip-text gg-compact-keyshop-historical"></span>
                    </span>
                </div>
            </div>
            <div class="gg-compact-controls">
                <a href="#" target="_blank" class="gg-view-offers">View Offers</a>
            </div>
        </div>
    `;
    return container;
  }

  // Wait for Steam page to fully load (including age gate) and handle tab visibility
  let isInitialized = false;

  function initializeWhenVisible() {
    if (document.visibilityState === "visible" && !isInitialized) {
        const urlMatch = window.location.pathname.match(/\/(app|sub|bundle)\/(\d+)/);
        if (!urlMatch) return;

        const [, pageType, pageId] = urlMatch;
        isInitialized = true;

        // For app pages, show the full container at the top
        if (pageType === 'app') {
            const purchaseSection = document.querySelector("#game_area_purchase");
            if (purchaseSection) {
                const mainContainer = createPriceContainer();
                mainContainer.id = 'gg-deals-main';
                purchaseSection.parentNode.insertBefore(mainContainer, purchaseSection);
                fetchGamePrices(null, 'gg-deals-main', false, { type: pageType, id: pageId });
            }
        }

        // For sub/bundle pages, show only one display at the top
        if (pageType === 'sub' || pageType === 'bundle') {
            // Try to find the first purchase game section
            const firstPurchaseGame = document.querySelector('.game_area_purchase_game');
            if (firstPurchaseGame) {
                const mainContainer = createPriceContainer();
                mainContainer.id = `gg-deals-${pageType}-${pageId}`;
                firstPurchaseGame.parentNode.insertBefore(mainContainer, firstPurchaseGame);
                fetchGamePrices(null, mainContainer.id, false, { type: pageType, id: pageId });
            }
            return; // Exit early to prevent additional displays
        }

        // Handle all purchase games (only for app pages)
        if (pageType === 'app') {
            document.querySelectorAll('.game_area_purchase_game').forEach((element) => {
              // Skip if this is a demo section
              if (element.closest('.demo_above_purchase')) {
                  return;
              }
          
              // Get the ID and type from the inputs
              const bundleInput = element.querySelector('input[name="bundleid"]');
              const subInput = element.querySelector('input[name="subid"]');
          
              if (!bundleInput && !subInput) {
                  // If no inputs found, try to get ID from the element ID
                  const elementId = element.id.match(/\d+$/)?.[0];
          
                  // Skip main app on app pages
                  if (pageType === 'app' && elementId === pageId) {
                      return; // Skip main app on app pages
                  }
              }

                let itemType, itemId;
                if (bundleInput) {
                    itemType = 'bundle';
                    itemId = bundleInput.value;
                } else if (subInput) {
                    itemType = 'sub';
                    itemId = subInput.value;
                } else {
                    // Fallback to page type/id
                    itemType = pageType;
                    itemId = pageId;
                }

                const containerId = `gg-deals-${itemType}-${itemId}`;
                const compactDisplay = createCompactPriceDisplay(containerId);
                
                // Insert before game_purchase_action
                const purchaseAction = element.querySelector('.game_purchase_action');
                if (purchaseAction) {
                    purchaseAction.parentNode.insertBefore(compactDisplay, purchaseAction);
                    // Use Promise to handle the async operation properly
                    (async () => {
                        await fetchGamePrices(null, containerId, false, { type: itemType, id: itemId });
                    })();
                }
            });
        }
    }
  }

  // Check for visibility changes
  document.addEventListener("visibilitychange", initializeWhenVisible);

  // Initial check (in case the tab is already visible)
  const checkTitle = setInterval(() => {
    if (document.visibilityState === "visible") {
      initializeWhenVisible();
      if (isInitialized) {
        clearInterval(checkTitle);
      }
    }
  }, 500);
})();
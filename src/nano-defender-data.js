/**
 * Nano Defender build data.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");
const fs = require("../lib/promise-fs.js");

/**
 * Extra information specific to Chromium.
 * @const {Object}
 */
exports.chromium = {
    id: "ggolfgbegefeeoocgjbmkembbncoadlb",
};
/**
 * Extra information specific to Firefox.
 * @const {Object}
 */
exports.firefox = {
    id: "{fcf60470-b210-4c17-969e-9ae01491071e}",
};

/**
 * Patch manifest.
 * @async @function
 * @param {Enum} browser    - One of "chromium", "firefox", "edge".
 * @param {Enum} capability - One of "standard", "pro".
 */
exports.patchManifest = async (browser, capability) => {
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");
    assert(capability === "standard" || capability === "pro");

    const path = "./dist/nano_defender_" + browser + "_amo_unsigned" + "/manifest.json";

    let manifest = await fs.readFile(path, "utf8");
    manifest = JSON.parse(manifest);
    // TODO: move version to Nano Build just as Nano Adblocker?
    exports.version = manifest.version;

    if (browser === "firefox") {
        manifest.browser_specific_settings = {
            "gecko": {
                "id": exports.firefox.id,
                "strict_min_version": "60.0"
            }
        };
        manifest.background.scripts = [
            "common.js",
            "platform/firefox-vars.js",
            "background/core.js",
            "platform/firefox-background.js",
            "background/rules.js",
            "background/debug.js"
        ];
        manifest.browser_action.browser_style = false;
        manifest.content_scripts[0].js = [
            "common.js",
            "libdom.js",
            "content/core.js",
            "platform/firefox-content.js"/*,
            "content/rules-common.js",
            "content/rules-specific.js",
            "content/rules-sticky.js",
            "content/debug.js"*/
        ];
        // TODO: Remove when Firefox properly support split mode
        manifest.incognito = "spanning";
        delete manifest.minimum_chrome_version;
    } else if (browser === "edge") {
        manifest["-ms-preload"] = {
            "backgroundScript": "edgyfy.js",
            "contentScript": "edgyfy.js"
        };
        manifest.background.persistent = true;
        manifest.background.scripts = [
            "common.js",
            "platform/edge-vars.js",
            "background/core.js",
            "background/rules.js",
            "background/debug.js"
        ];
        // Edge does not care if the size is actually right but do care if the
        // key name is right
        manifest.browser_action.default_icon = {
            "38": "icon128.png"
        };
        manifest.browser_specific_settings = {
            "edge": {
                "browser_action_next_to_addressbar": true
            }
        };
        manifest.content_scripts[0].js = [
            "common.js",
            "libdom.js",
            "content/core.js",
            "platform/edge-content.js",
            "content/rules-common.js",
            "content/rules-specific.js",
            "content/rules-sticky.js",
            "content/debug.js"
        ];
        manifest.description = "An anti-adblock defuser for Nano Adblocker";
        manifest.icons = {
            "128": "icon128.png",
            "16": "icon128.png"
        };
        // TODO: Remove when Edge properly support split mode
        manifest.incognito = "spanning";
        delete manifest.minimum_chrome_version;
        manifest.minimum_edge_version = "41.16299.248.0";
        {
            const i = manifest.version.indexOf(".");
            manifest.version = manifest.version.substring(i + 1) + ".0";
        }
    }

    assert(manifest.browser_action.default_title === "Nano Defender Debug");
    assert(manifest.name === "Nano Defender Debug");
    if (capability === "pro") {
        manifest.browser_action.default_title = "Nano Defender Pro";
        manifest.name = "Nano Defender Pro";
    } else {
        manifest.browser_action.default_title = "Nano Defender";
        manifest.name = "Nano Defender";
    }

    await fs.writeFile(path, JSON.stringify(manifest, null, 2), "utf8");
};

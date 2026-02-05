// Track tabs that user chose to keep
const exemptTabs = new Set();

// Listen for messages from warning page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'keepTab') {
        exemptTabs.add(sender.tab.id);
        sendResponse({ success: true });
    }
});

// Check if URL matches any blocked patterns
function isUrlBlocked(url, blockedUrls) {
    for (const blockedPattern of blockedUrls) {
        if (url.includes(blockedPattern)) {
            return true;
        }
    }
    return false;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only process once the tab has completely loaded and has a valid URL.
    if (
        changeInfo.status === 'complete' &&
        tab.url &&
        !tab.url.startsWith("chrome://") &&
        !tab.url.startsWith("chrome-extension://")
    ) {
        // Skip if this tab is showing the warning or blocked page, or is exempt
        if (exemptTabs.has(tabId) || tab.url.includes('warning.html') || tab.url.includes('blocked.html')) {
            return;
        }

        const newTabId = tabId;
        let domain;
        try {
            domain = new URL(tab.url).hostname;
        } catch (error) {
            return;
        }

        // Retrieve the current settings from storage.
        chrome.storage.sync.get(
            {
                defaultLimit: 10,
                customLimits: { "youtube.com": 5 },
                autoCloseEnabled: false,
                blockedUrls: ["youtube.com/shorts"],
                extensionEnabled: true,
                notificationsEnabled: true,
                autoCloseDelay: 6
            },
            (settings) => {
                // Check if extension is enabled
                if (!settings.extensionEnabled) {
                    return;
                }

                const defaultLimit = settings.defaultLimit;
                const customLimits = settings.customLimits;
                const autoCloseEnabled = settings.autoCloseEnabled;
                const blockedUrls = settings.blockedUrls;
                const notificationsEnabled = settings.notificationsEnabled;
                let allowedTabs = defaultLimit;

                // FIRST: Check if URL is completely blocked
                if (isUrlBlocked(tab.url, blockedUrls)) {
                    chrome.tabs.update(newTabId, {
                        url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(tab.url)
                    });
                    return;
                }

                // SECOND: Check domain limits
                for (const customDomain in customLimits) {
                    if (domain.includes(customDomain)) {
                        allowedTabs = customLimits[customDomain];
                        break;
                    }
                }

                // Count all currently open tabs with the same domain.
                chrome.tabs.query({}, (tabs) => {
                    let count = 0;
                    let domainTabs = [];

                    for (const t of tabs) {
                        if (t.url) {
                            try {
                                const tDomain = new URL(t.url).hostname;
                                if (tDomain === domain && !t.url.includes('warning.html') && !t.url.includes('blocked.html')) {
                                    count++;
                                    domainTabs.push(t);
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }

                    // If the number of open tabs exceeds the allowed limit
                    if (count > allowedTabs) {
                        if (autoCloseEnabled) {
                            // Show warning modal with auto-close countdown
                            chrome.tabs.update(newTabId, {
                                url: chrome.runtime.getURL('warning.html') + '?delay=' + settings.autoCloseDelay
                            });
                        } else {
                            // Original behavior: close immediately with notification
                            chrome.tabs.remove(newTabId, () => {
                                if (notificationsEnabled) {
                                    chrome.notifications.create({
                                        type: 'basic',
                                        iconUrl: 'icon-48.png',
                                        title: 'Tab Limit Exceeded',
                                        message: `You can only have ${allowedTabs} tabs open for ${domain}.`
                                    });
                                }
                            });
                        }
                    }
                });
            }
        );
    }
});

// Clean up exempt tabs when they're closed
chrome.tabs.onRemoved.addListener((tabId) => {
    exemptTabs.delete(tabId);
});
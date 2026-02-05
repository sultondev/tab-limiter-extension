document.addEventListener('DOMContentLoaded', () => {
    // Load quick stats
    chrome.storage.sync.get(
        {
            defaultLimit: 10,
            customLimits: {},
            blockedUrls: [],
            extensionEnabled: true
        },
        (settings) => {
            document.getElementById('quickDefaultLimit').textContent = settings.defaultLimit;
            document.getElementById('quickCustomDomains').textContent = Object.keys(settings.customLimits).length;
            document.getElementById('quickBlockedUrls').textContent = settings.blockedUrls.length;

            updateToggleButton(settings.extensionEnabled);
        }
    );

    // Open settings page
    document.getElementById('openSettings').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    });

    // Quick toggle
    document.getElementById('quickToggle').addEventListener('click', () => {
        chrome.storage.sync.get({ extensionEnabled: true }, (settings) => {
            const newState = !settings.extensionEnabled;
            chrome.storage.sync.set({ extensionEnabled: newState }, () => {
                updateToggleButton(newState);
            });
        });
    });

    function updateToggleButton(enabled) {
        const icon = document.getElementById('toggleIcon');
        const text = document.getElementById('toggleText');

        if (enabled) {
            icon.textContent = '🟢';
            text.textContent = 'Extension Enabled';
        } else {
            icon.textContent = '🔴';
            text.textContent = 'Extension Disabled';
        }
    }
});
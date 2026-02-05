document.addEventListener('DOMContentLoaded', () => {
    const defaultLimitInput = document.getElementById('defaultLimit');
    const autoCloseCheckbox = document.getElementById('autoCloseEnabled');
    const customLimitsList = document.getElementById('customLimitsList');
    const blockedUrlsList = document.getElementById('blockedUrlsList');
    const addDomainButton = document.getElementById('addDomain');
    const addBlockedUrlButton = document.getElementById('addBlockedUrl');
    const saveSettingsButton = document.getElementById('saveSettings');

    // Load settings from storage and update the UI.
    function loadSettings() {
        chrome.storage.sync.get(
            {
                defaultLimit: 10,
                customLimits: { "youtube.com": 5 },
                autoCloseEnabled: false,
                blockedUrls: ["youtube.com/shorts"]
            },
            (settings) => {
                defaultLimitInput.value = settings.defaultLimit;
                autoCloseCheckbox.checked = settings.autoCloseEnabled;

                // Load custom limits
                customLimitsList.innerHTML = '';
                for (const domain in settings.customLimits) {
                    addCustomLimitRow(domain, settings.customLimits[domain]);
                }

                // Load blocked URLs
                blockedUrlsList.innerHTML = '';
                settings.blockedUrls.forEach(url => {
                    addBlockedUrlRow(url);
                });
            }
        );
    }

    // Create a new row for a custom domain limit.
    function addCustomLimitRow(domain = '', limit = 10) {
        const div = document.createElement('div');
        div.className = 'domain-entry';

        const domainInput = document.createElement('input');
        domainInput.type = 'text';
        domainInput.placeholder = 'Domain (e.g., example.com)';
        domainInput.value = domain;

        const limitInput = document.createElement('input');
        limitInput.type = 'number';
        limitInput.min = 1;
        limitInput.placeholder = 'Limit';
        limitInput.value = limit;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            customLimitsList.removeChild(div);
        });

        div.appendChild(domainInput);
        div.appendChild(limitInput);
        div.appendChild(removeButton);
        customLimitsList.appendChild(div);
    }

    // Create a new row for a blocked URL
    function addBlockedUrlRow(url = '') {
        const div = document.createElement('div');
        div.className = 'blocked-entry';

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'URL to block (e.g., youtube.com/shorts)';
        urlInput.value = url;

        const removeButton = document.createElement('button');
        removeButton.textContent = '✕';
        removeButton.addEventListener('click', () => {
            blockedUrlsList.removeChild(div);
        });

        div.appendChild(urlInput);
        div.appendChild(removeButton);
        blockedUrlsList.appendChild(div);
    }

    // Add a new custom domain limit row.
    addDomainButton.addEventListener('click', () => {
        addCustomLimitRow();
    });

    // Add a new blocked URL row
    addBlockedUrlButton.addEventListener('click', () => {
        addBlockedUrlRow();
    });

    // Save settings back to storage.
    saveSettingsButton.addEventListener('click', () => {
        const newDefaultLimit = parseInt(defaultLimitInput.value) || 5;
        const autoCloseEnabled = autoCloseCheckbox.checked;
        const newCustomLimits = {};
        const newBlockedUrls = [];

        // Collect custom limits
        const domainEntries = customLimitsList.getElementsByClassName('domain-entry');
        for (const entry of domainEntries) {
            const inputs = entry.getElementsByTagName('input');
            const domain = inputs[0].value.trim();
            const limit = parseInt(inputs[1].value);
            if (domain && limit) {
                newCustomLimits[domain] = limit;
            }
        }

        // Collect blocked URLs
        const blockedEntries = blockedUrlsList.getElementsByClassName('blocked-entry');
        for (const entry of blockedEntries) {
            const input = entry.getElementsByTagName('input')[0];
            const url = input.value.trim();
            if (url) {
                newBlockedUrls.push(url);
            }
        }

        chrome.storage.sync.set(
            {
                defaultLimit: newDefaultLimit,
                customLimits: newCustomLimits,
                autoCloseEnabled: autoCloseEnabled,
                blockedUrls: newBlockedUrls
            },
            () => {
                alert('Settings saved!');
            }
        );
    });

    loadSettings();
});
document.addEventListener('DOMContentLoaded', () => {
    const defaultLimitInput = document.getElementById('defaultLimit');
    const autoCloseCheckbox = document.getElementById('autoCloseEnabled');
    const notificationsCheckbox = document.getElementById('notificationsEnabled');
    const autoCloseDelayInput = document.getElementById('autoCloseDelay');
    const customLimitsList = document.getElementById('customLimitsList');
    const blockedUrlsList = document.getElementById('blockedUrlsList');
    const addDomainButton = document.getElementById('addDomain');
    const addBlockedUrlButton = document.getElementById('addBlockedUrl');
    const saveSettingsButton = document.getElementById('saveSettings');
    const resetSettingsButton = document.getElementById('resetSettings');
    const exportSettingsButton = document.getElementById('exportSettings');
    const importSettingsButton = document.getElementById('importSettings');
    const importFileInput = document.getElementById('importFile');

    // Load settings from storage
    function loadSettings() {
        chrome.storage.sync.get(
            {
                defaultLimit: 10,
                customLimits: { "youtube.com": 5 },
                autoCloseEnabled: false,
                blockedUrls: ["youtube.com/shorts"],
                notificationsEnabled: true,
                autoCloseDelay: 6
            },
            (settings) => {
                // Load general settings
                defaultLimitInput.value = settings.defaultLimit;
                autoCloseCheckbox.checked = settings.autoCloseEnabled;
                notificationsCheckbox.checked = settings.notificationsEnabled;
                autoCloseDelayInput.value = settings.autoCloseDelay;

                // Update statistics
                updateStatistics(settings);

                // Load custom limits
                customLimitsList.innerHTML = '';
                const domainCount = Object.keys(settings.customLimits).length;
                if (domainCount === 0) {
                    document.getElementById('emptyDomains').style.display = 'block';
                    document.getElementById('customLimitsContainer').style.maxHeight = 'auto';
                } else {
                    document.getElementById('emptyDomains').style.display = 'none';
                    for (const domain in settings.customLimits) {
                        addCustomLimitRow(domain, settings.customLimits[domain]);
                    }
                }

                // Load blocked URLs
                blockedUrlsList.innerHTML = '';
                if (settings.blockedUrls.length === 0) {
                    document.getElementById('emptyBlocked').style.display = 'block';
                    document.getElementById('blockedUrlsContainer').style.maxHeight = 'auto';
                } else {
                    document.getElementById('emptyBlocked').style.display = 'none';
                    settings.blockedUrls.forEach(url => {
                        addBlockedUrlRow(url);
                    });
                }
            }
        );
    }

    // Update statistics display
    function updateStatistics(settings) {
        document.getElementById('statDefaultLimit').textContent = settings.defaultLimit;
        document.getElementById('statCustomDomains').textContent = Object.keys(settings.customLimits).length;
        document.getElementById('statBlockedUrls').textContent = settings.blockedUrls.length;
        document.getElementById('domainCount').textContent = `${Object.keys(settings.customLimits).length} domains`;
        document.getElementById('blockedCount').textContent = `${settings.blockedUrls.length} blocked`;
    }

    // Add custom domain limit row
    function addCustomLimitRow(domain = '', limit = 10) {
        document.getElementById('emptyDomains').style.display = 'none';

        const div = document.createElement('div');
        div.className = 'list-item';

        const domainInput = document.createElement('input');
        domainInput.type = 'text';
        domainInput.placeholder = 'Domain (e.g., youtube.com)';
        domainInput.value = domain;

        const limitInput = document.createElement('input');
        limitInput.type = 'number';
        limitInput.min = 1;
        limitInput.max = 100;
        limitInput.placeholder = 'Limit';
        limitInput.value = limit;

        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-remove btn-small';
        removeButton.textContent = '✕ Remove';
        removeButton.addEventListener('click', () => {
            customLimitsList.removeChild(div);
            if (customLimitsList.children.length === 0) {
                document.getElementById('emptyDomains').style.display = 'block';
            }
        });

        div.appendChild(domainInput);
        div.appendChild(limitInput);
        div.appendChild(removeButton);
        customLimitsList.appendChild(div);
    }

    // Add blocked URL row
    function addBlockedUrlRow(url = '') {
        document.getElementById('emptyBlocked').style.display = 'none';

        const div = document.createElement('div');
        div.className = 'list-item list-item-single';

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'URL to block (e.g., youtube.com/shorts)';
        urlInput.value = url;

        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-remove btn-small';
        removeButton.textContent = '✕ Remove';
        removeButton.addEventListener('click', () => {
            blockedUrlsList.removeChild(div);
            if (blockedUrlsList.children.length === 0) {
                document.getElementById('emptyBlocked').style.display = 'block';
            }
        });

        div.appendChild(urlInput);
        div.appendChild(removeButton);
        blockedUrlsList.appendChild(div);
    }

    // Show toast notification
    function showToast(message, isError = false, duration = 3000) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        toastMessage.textContent = message;

        if (isError) {
            toast.classList.add('error');
            toastIcon.textContent = '❌';
        } else {
            toast.classList.remove('error');
            toastIcon.textContent = '✅';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // Collect current settings
    function collectSettings() {
        const newDefaultLimit = parseInt(defaultLimitInput.value) || 10;
        const autoCloseEnabled = autoCloseCheckbox.checked;
        const notificationsEnabled = notificationsCheckbox.checked;
        const autoCloseDelay = parseInt(autoCloseDelayInput.value) || 6;
        const newCustomLimits = {};
        const newBlockedUrls = [];

        // Collect custom limits
        const domainEntries = customLimitsList.getElementsByClassName('list-item');
        for (const entry of domainEntries) {
            const inputs = entry.getElementsByTagName('input');
            const domain = inputs[0].value.trim();
            const limit = parseInt(inputs[1].value);
            if (domain && limit) {
                newCustomLimits[domain] = limit;
            }
        }

        // Collect blocked URLs
        const blockedEntries = blockedUrlsList.getElementsByClassName('list-item');
        for (const entry of blockedEntries) {
            const input = entry.getElementsByTagName('input')[0];
            const url = input.value.trim();
            if (url) {
                newBlockedUrls.push(url);
            }
        }

        return {
            defaultLimit: newDefaultLimit,
            customLimits: newCustomLimits,
            autoCloseEnabled: autoCloseEnabled,
            blockedUrls: newBlockedUrls,
            notificationsEnabled: notificationsEnabled,
            autoCloseDelay: autoCloseDelay,
            exportDate: new Date().toISOString(),
            version: '1.3'
        };
    }

    // Export settings to JSON file
    exportSettingsButton.addEventListener('click', () => {
        const settings = collectSettings();

        // Create JSON blob
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tab-limiter-settings-${new Date().toISOString().split('T')[0]}.json`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);

        showToast('✅ Settings exported successfully!');
    });

    // Import settings from JSON file
    importSettingsButton.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);

                // Validate imported data
                if (!importedSettings.defaultLimit || typeof importedSettings.defaultLimit !== 'number') {
                    throw new Error('Invalid settings file format');
                }

                // Confirm import
                if (!confirm(`Import settings from ${importedSettings.exportDate ? new Date(importedSettings.exportDate).toLocaleDateString() : 'unknown date'}?\n\nThis will overwrite your current settings.`)) {
                    importFileInput.value = '';
                    return;
                }

                // Save imported settings to storage
                chrome.storage.sync.set(
                    {
                        defaultLimit: importedSettings.defaultLimit,
                        customLimits: importedSettings.customLimits || {},
                        autoCloseEnabled: importedSettings.autoCloseEnabled || false,
                        blockedUrls: importedSettings.blockedUrls || [],
                        notificationsEnabled: importedSettings.notificationsEnabled !== undefined ? importedSettings.notificationsEnabled : true,
                        autoCloseDelay: importedSettings.autoCloseDelay || 6
                    },
                    () => {
                        showToast('✅ Settings imported successfully!');
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                );

            } catch (error) {
                showToast('❌ Error: Invalid settings file', true);
                console.error('Import error:', error);
            }

            // Reset file input
            importFileInput.value = '';
        };

        reader.onerror = () => {
            showToast('❌ Error reading file', true);
            importFileInput.value = '';
        };

        reader.readAsText(file);
    });

    // Add domain button
    addDomainButton.addEventListener('click', () => {
        addCustomLimitRow();
    });

    // Add blocked URL button
    addBlockedUrlButton.addEventListener('click', () => {
        addBlockedUrlRow();
    });

    // Save settings
    saveSettingsButton.addEventListener('click', () => {
        const settings = collectSettings();

        chrome.storage.sync.set(
            {
                defaultLimit: settings.defaultLimit,
                customLimits: settings.customLimits,
                autoCloseEnabled: settings.autoCloseEnabled,
                blockedUrls: settings.blockedUrls,
                notificationsEnabled: settings.notificationsEnabled,
                autoCloseDelay: settings.autoCloseDelay
            },
            () => {
                showToast('✅ Settings saved successfully!');
                updateStatistics(settings);
            }
        );
    });

    // Reset settings
    resetSettingsButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            chrome.storage.sync.clear(() => {
                showToast('🔄 Settings reset to defaults');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            });
        }
    });

    // Load settings on page load
    loadSettings();
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only process once the tab has completely loaded and has a valid URL.
    if (
      changeInfo.status === 'complete' &&
      tab.url &&
      !tab.url.startsWith("chrome://")
    ) {
      // This tabId corresponds to the new tab that just finished loading.
      const newTabId = tabId;
      let domain;
      try {
        domain = new URL(tab.url).hostname;
      } catch (error) {
        // If the URL can't be parsed, do nothing.
        return;
      }
  
      // Retrieve the current settings from storage.
      chrome.storage.sync.get(
        { defaultLimit: 3, customLimits: { "coursera.org": 5 } },
        (settings) => {
          const defaultLimit = settings.defaultLimit;
          const customLimits = settings.customLimits;
          let allowedTabs = defaultLimit;
  
          // Check if the domain matches any custom limit.
          for (const customDomain in customLimits) {
            if (domain.includes(customDomain)) {
              allowedTabs = customLimits[customDomain];
              break;
            }
          }
  
          // Count all currently open tabs with the same domain.
          chrome.tabs.query({}, (tabs) => {
            let count = 0;
            for (const t of tabs) {
              if (t.url) {
                try {
                  const tDomain = new URL(t.url).hostname;
                  if (tDomain === domain) {
                    count++;
                  }
                } catch (e) {
                  continue;
                }
              }
            }
  
            // If the number of open tabs exceeds the allowed limit,
            // close the new tab (and keep the old ones open).
            if (count > allowedTabs) {
              chrome.tabs.remove(newTabId, () => {
                chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'icon48.png', // Replace with your icon path
                  title: 'Tab Limit Exceeded',
                  message: `You can only have ${allowedTabs} tabs open for ${domain}.`
                });
              });
            }
          });
        }
      );
    }
  });
  
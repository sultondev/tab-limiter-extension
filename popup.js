document.addEventListener('DOMContentLoaded', () => {
    const defaultLimitInput = document.getElementById('defaultLimit');
    const customLimitsList = document.getElementById('customLimitsList');
    const addDomainButton = document.getElementById('addDomain');
    const saveSettingsButton = document.getElementById('saveSettings');
  
    // Load settings from storage and update the UI.
    function loadSettings() {
      chrome.storage.sync.get(
        { defaultLimit: 10, customLimits: { "youtube.com": 5 } },
        (settings) => {
          defaultLimitInput.value = settings.defaultLimit;
          customLimitsList.innerHTML = '';
          for (const domain in settings.customLimits) {
            addCustomLimitRow(domain, settings.customLimits[domain]);
          }
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
  
    // Add a new custom domain limit row.
    addDomainButton.addEventListener('click', () => {
      addCustomLimitRow();
    });
  
    // Save settings back to storage.
    saveSettingsButton.addEventListener('click', () => {
      const newDefaultLimit = parseInt(defaultLimitInput.value) || 5;
      const newCustomLimits = {};
      const domainEntries = customLimitsList.getElementsByClassName('domain-entry');
  
      for (const entry of domainEntries) {
        const inputs = entry.getElementsByTagName('input');
        const domain = inputs[0].value.trim();
        const limit = parseInt(inputs[1].value);
        if (domain && limit) {
          newCustomLimits[domain] = limit;
        }
      }
  
      chrome.storage.sync.set(
        { defaultLimit: newDefaultLimit, customLimits: newCustomLimits },
        () => {
          alert('Settings saved!');
        }
      );
    });
  
    loadSettings();
  });
  

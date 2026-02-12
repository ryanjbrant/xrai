document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const statusEl = document.getElementById('status');
  const testButton = document.getElementById('testConnection');
  const clearDataButton = document.getElementById('clearData');
  
  // Load saved settings
  chrome.storage.sync.get(
    ['kb_api_key', 'kb_api_url', 'sync_interval', 'auto_sync'],
    (settings) => {
      document.getElementById('apiKey').value = settings.kb_api_key || '';
      document.getElementById('apiUrl').value = settings.kb_api_url || 'http://localhost:8000/api/tabs';
      document.getElementById('syncInterval').value = settings.sync_interval || 5;
      document.getElementById('autoSync').checked = settings.auto_sync !== false;
    }
  );
  
  // Save settings
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const settings = {
      kb_api_key: document.getElementById('apiKey').value.trim(),
      kb_api_url: document.getElementById('apiUrl').value.trim(),
      sync_interval: parseInt(document.getElementById('syncInterval').value, 10) || 5,
      auto_sync: document.getElementById('autoSync').checked
    };
    
    // Validate sync interval
    if (settings.sync_interval < 1) settings.sync_interval = 1;
    if (settings.sync_interval > 1440) settings.sync_interval = 1440;
    
    // Save to storage
    chrome.storage.sync.set(settings, () => {
      showStatus('Settings saved successfully!', 'success');
      
      // Update sync alarm if needed
      if (settings.auto_sync) {
        chrome.alarms.create('syncTabs', {
          periodInMinutes: settings.sync_interval
        });
      } else {
        chrome.alarms.clear('syncTabs');
      }
    });
  });
  
  // Test connection
  testButton.addEventListener('click', () => {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiUrl) {
      showStatus('Please enter an API URL', 'error');
      return;
    }
    
    showStatus('Testing connection...');
    
    // Test the API connection
    fetch(apiUrl, {
      method: 'GET',
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    })
    .then(data => {
      showStatus('Connection successful! API is working correctly.', 'success');
      console.log('API response:', data);
    })
    .catch(error => {
      console.error('Connection test failed:', error);
      showStatus(`Connection failed: ${error.message}`, 'error');
    });
  });
  
  // Clear local data
  clearDataButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all locally stored tab data? This cannot be undone.')) {
      chrome.storage.local.set({ tracked_tabs: {} }, () => {
        showStatus('Local tab data has been cleared.', 'success');
      });
    }
  });
  
  // Helper function to show status messages
  function showStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = 'status';
    statusEl.classList.add(type);
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusEl.className = 'status';
        statusEl.textContent = '';
      }, 5000);
    }
  }
});

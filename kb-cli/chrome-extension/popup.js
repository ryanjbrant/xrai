// Import the suggestion engine
import { suggestionEngine } from './suggestionEngine.js';

// Tab management
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
      
      // If switching to interests tab, update the interests display
      if (tabId === 'interests') {
        updateInterests();
      }
    });
  });
}

// Format a timestamp as a relative time string
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

// Format last sync time
function formatLastSync() {
  return chrome.storage.sync.get('last_sync_time', (result) => {
    const lastSync = result.last_sync_time;
    return formatTimeAgo(lastSync);
  });
}

// Update the interests display
function updateInterests() {
  const lastAnalyzedEl = document.getElementById('lastAnalyzed');
  const categoriesListEl = document.getElementById('categoriesList');
  const keywordsListEl = document.getElementById('keywordsList');
  const domainsListEl = document.getElementById('domainsList');
  
  // Show loading state
  categoriesListEl.innerHTML = '<p>Loading...</p>';
  keywordsListEl.innerHTML = '<p>Loading...</p>';
  domainsListEl.innerHTML = '<p>Loading...</p>';
  
  // Request interests data
  chrome.runtime.sendMessage({ type: 'GET_INTERESTS' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting interests:', chrome.runtime.lastError);
      return;
    }
    
    const { interests = {}, lastUpdated } = response;
    
    // Update last analyzed time
    lastAnalyzedEl.textContent = formatTimeAgo(lastUpdated);
    
    // Update categories
    if (interests.categories && interests.categories.length > 0) {
      categoriesListEl.innerHTML = interests.categories
        .map(({ category, count }) => `
          <div class="interest-item">
            <span class="interest-name">${category.replace(/_/g, ' ')}</span>
            <span class="interest-count">${count}</span>
          </div>
        `)
        .join('');
    } else {
      categoriesListEl.innerHTML = '<p>No category data available. Try analyzing your history.</p>';
    }
    
    // Update keywords
    if (interests.keywords && interests.keywords.length > 0) {
      keywordsListEl.innerHTML = interests.keywords
        .map(({ keyword, count }) => `
          <div class="interest-item">
            <span class="interest-name">${keyword}</span>
            <span class="interest-count">${count}</span>
          </div>
        `)
        .join('');
    } else {
      keywordsListEl.innerHTML = '<p>No keyword data available. Try analyzing your history.</p>';
    }
    
    // Update domains
    if (interests.domains && interests.domains.length > 0) {
      domainsListEl.innerHTML = interests.domains
        .map(({ domain, count }) => `
          <div class="interest-item">
            <span class="interest-name">${domain}</span>
            <span class="interest-count">${count}</span>
          </div>
        `)
        .join('');
    } else {
      domainsListEl.innerHTML = '<p>No domain data available. Try analyzing your history.</p>';
    }
  });
}

// Render suggestions in the UI
async function renderSuggestions(filter = 'all') {
  const suggestionsList = document.getElementById('suggestions-list');
  const loadingEl = document.getElementById('suggestions-loading');
  const noSuggestionsEl = document.getElementById('no-suggestions');
  
  // Show loading state
  loadingEl.style.display = 'block';
  suggestionsList.innerHTML = '';
  noSuggestionsEl.style.display = 'none';
  
  try {
    // Get suggestions from the engine
    const suggestions = await suggestionEngine.getSuggestions(filter);
    
    // Hide loading state
    loadingEl.style.display = 'none';
    
    if (suggestions.length === 0) {
      noSuggestionsEl.style.display = 'block';
      return;
    }
    
    // Render each suggestion
    suggestions.forEach(suggestion => {
      const suggestionEl = document.createElement('div');
      suggestionEl.className = 'suggestion-card';
      suggestionEl.innerHTML = `
        <div class="suggestion-header">
          <h4 class="suggestion-title">${suggestion.title}</h4>
          <span class="suggestion-category">${suggestion.category || 'General'}</span>
        </div>
        <p class="suggestion-description">${suggestion.description || ''}</p>
        <div class="suggestion-actions">
          ${suggestion.actions ? suggestion.actions.map(action => 
            `<button class="suggestion-button ${action.primary ? 'suggestion-primary' : 'suggestion-secondary'}" 
                    data-action="${action.id}">
              ${action.label}
            </button>`
          ).join('') : ''}
        </div>
      `;
      
      // Add click handler for the entire card
      suggestionEl.addEventListener('click', (e) => {
        if (!e.target.closest('.suggestion-button')) {
          // Default action when clicking the card (but not a button)
          suggestionEngine.applySuggestion(suggestion.id);
        }
      });
      
      // Add click handlers for action buttons
      suggestionEl.querySelectorAll('.suggestion-button').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const actionId = button.getAttribute('data-action');
          const action = suggestion.actions.find(a => a.id === actionId);
          if (action && action.handler) {
            action.handler();
          }
        });
      });
      
      suggestionsList.appendChild(suggestionEl);
    });
    
  } catch (error) {
    console.error('Error rendering suggestions:', error);
    loadingEl.style.display = 'none';
    noSuggestionsEl.style.display = 'block';
    noSuggestionsEl.innerHTML = 'Error loading suggestions. Please try again later.';
  }
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const syncButton = document.getElementById('syncNow');
  const syncSpinner = document.getElementById('syncSpinner');
  const analyzeButton = document.getElementById('analyzeNow');
  const analyzeSpinner = document.getElementById('analyzeSpinner');
  const tabCountEl = document.getElementById('tabCount');
  const lastSyncEl = document.getElementById('lastSync');
  
  // Set up tabs
  setupTabs();
  
  // Initialize suggestion engine
  try {
    await suggestionEngine.init();
    
    // Load initial suggestions
    renderSuggestions();
    
    // Handle filter changes
    const filterSelect = document.getElementById('suggestion-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        renderSuggestions(e.target.value);
      });
    }
    
    // Listen for suggestion updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SUGGESTIONS_UPDATED') {
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'suggestions') {
          renderSuggestions(document.getElementById('suggestion-filter')?.value || 'all');
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to initialize suggestion engine:', error);
  }
  
  // Update status
  function updateStatus() {
    // Get current status
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting status:', chrome.runtime.lastError);
        return;
      }
      
      const { tabCount, isSyncing, lastAnalysis, interests } = response;
      
      // Update UI
      tabCountEl.textContent = tabCount || 0;
      
      if (isSyncing) {
        syncButton.disabled = true;
        syncSpinner.style.display = 'inline-block';
        statusEl.innerHTML = '<p>Syncing with KB-CLI...</p>';
        statusEl.className = 'status';
      } else {
        syncButton.disabled = false;
        syncSpinner.style.display = 'none';
        
        if (tabCount > 0) {
          statusEl.innerHTML = `
            <p>Ready to sync <strong>${tabCount} tabs</strong> with KB-CLI.</p>
            <p>Last sync: <span id="lastSyncTime">${formatLastSync()}</span></p>
          `;
        } else {
          statusEl.innerHTML = `
            <p>No new tabs to sync.</p>
            <p>Last sync: <span id="lastSyncTime">${formatLastSync()}</span></p>
          `;
        }
        statusEl.className = 'status';
      }
      
      // Update last sync time in the tab
      if (lastSyncEl) {
        lastSyncEl.textContent = formatLastSync();
      }
    });
  }
  
  // Handle sync button click
  syncButton.addEventListener('click', () => {
    syncButton.disabled = true;
    syncSpinner.style.display = 'inline-block';
    
    chrome.runtime.sendMessage({ type: 'SYNC_NOW' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error syncing tabs:', chrome.runtime.lastError);
        statusEl.innerHTML = `
          <p>Error syncing with KB-CLI:</p>
          <p>${chrome.runtime.lastError.message}</p>
        `;
        statusEl.className = 'status error';
      } else {
        // Update status after a short delay to allow sync to start
        setTimeout(updateStatus, 1000);
      }
    });
  });
  
  // Handle analyze button click
  if (analyzeButton) {
    analyzeButton.addEventListener('click', () => {
      analyzeButton.disabled = true;
      analyzeSpinner.style.display = 'inline-block';
      
      chrome.runtime.sendMessage({ type: 'ANALYZE_HISTORY' }, (response) => {
        analyzeButton.disabled = false;
        analyzeSpinner.style.display = 'none';
        
        if (chrome.runtime.lastError) {
          console.error('Error analyzing history:', chrome.runtime.lastError);
          return;
        }
        
        if (response.success) {
          // Update the interests display with new data
          updateInterests();
          
          // Show success message
          const statusEl = document.createElement('div');
          statusEl.className = 'status success';
          statusEl.textContent = 'History analysis completed successfully!';
          document.querySelector('#interests-tab').insertBefore(
            statusEl,
            document.querySelector('.interests-header').nextSibling
          );
          
          // Remove the success message after 3 seconds
          setTimeout(() => {
            statusEl.remove();
          }, 3000);
        } else {
          // Show error message
          const statusEl = document.createElement('div');
          statusEl.className = 'status error';
          statusEl.textContent = `Error: ${response.error || 'Unknown error'}`;
          document.querySelector('#interests-tab').insertBefore(
            statusEl,
            document.querySelector('.interests-header').nextSibling
          );
        }
      });
    });
  }
  
  // Initial status update
  updateStatus();
  
  // Update last sync time periodically
  setInterval(() => {
    const lastSyncEl = document.getElementById('lastSyncTime');
    if (lastSyncEl) {
      lastSyncEl.textContent = formatLastSync();
    }
    
    // Update last analyzed time if on interests tab
    if (document.querySelector('.tab-button[data-tab="interests"].active')) {
      const lastAnalyzedEl = document.getElementById('lastAnalyzed');
      if (lastAnalyzedEl) {
        chrome.storage.local.get('historyAnalysis', (result) => {
          if (result.historyAnalysis && result.historyAnalysis.lastUpdated) {
            lastAnalyzedEl.textContent = formatTimeAgo(result.historyAnalysis.lastUpdated);
          }
        });
      }
    }
  }, 30000); // Update every 30 seconds
});

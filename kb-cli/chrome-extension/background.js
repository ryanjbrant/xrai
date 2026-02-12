// Import the history analyzer and knowledge base integrator
import { historyAnalyzer } from './historyAnalyzer.js';
import { knowledgeBaseIntegrator } from './knowledgeBase.js';
import { progressTracker } from './progressTracker.js';
import { performanceMonitor } from './performanceMonitor.js';

// Configuration
const CONFIG = {
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  HISTORY_ANALYSIS_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  KB_API_URL: 'http://localhost:8000/api',
  STORAGE_KEYS: {
    ENABLED: 'kb_extension_enabled',
    LAST_SYNC: 'last_sync_time',
    LAST_HISTORY_ANALYSIS: 'last_history_analysis',
    API_KEY: 'kb_api_key',
    TABS: 'tracked_tabs',
    HISTORY_ANALYSIS: 'history_analysis'
  }
};
// Track if we're currently syncing
let isSyncing = false;

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  // Set default settings
  await chrome.storage.sync.set({
    [CONFIG.STORAGE_KEYS.ENABLED]: true,
    [CONFIG.STORAGE_KEYS.API_KEY]: '',
    [CONFIG.STORAGE_KEYS.TABS]: {}
  });

  // Initialize performance monitor first
  await performanceMonitor.init();
  
  // Initialize progress tracker with performance monitoring
  const initTracker = performanceMonitor.startOperation('init_progress_tracker');
  await progressTracker.init();
  initTracker.end();
  
  // Set up default goals if they don't exist
  const setupGoals = performanceMonitor.startOperation('setup_default_goals');
  await _setupDefaultGoals();
  setupGoals.end();

  // Create alarm for periodic sync
  chrome.alarms.create('syncTabs', {
    periodInMinutes: 5
  });
{{ ... }}
  // Create alarm for progress tracking
  chrome.alarms.create('trackProgress', {
    periodInMinutes: 60 // Hourly progress tracking
  });

  // Create alarm for performance monitoring
  chrome.alarms.create('monitorPerformance', {
    periodInMinutes: 5 // Check performance every 5 minutes
  });

  // Initial sync and analysis with performance monitoring
  const initialSync = performanceMonitor.startOperation('initial_sync');
  await syncTabs();
  initialSync.end();
  
  const initialAnalysis = performanceMonitor.startOperation('initial_analysis');
  await analyzeHistory();
  initialAnalysis.end();
  
  const initialTracking = performanceMonitor.startOperation('initial_tracking');
  await trackProgress();
  initialTracking.end();
});

// Set up default goals
async function _setupDefaultGoals() {
  const defaultGoals = [
    { metric: 'productive_hours', target: 4, type: 'at_least', period: 'daily', 
      description: 'Spend at least 4 hours on productive tasks' },
    { metric: 'distracting_sites', target: 30, type: 'at_most', period: 'daily',
      description: 'Spend less than 30 minutes on distracting sites' },
    { metric: 'learning_time', target: 300, type: 'at_least', period: 'weekly',
      description: 'Spend at least 5 hours per week learning' }
  ];
  
  for (const goal of defaultGoals) {
    const existingGoal = await progressTracker.getProgress(goal.metric);
    if (!existingGoal || !existingGoal.goal) {
      await progressTracker.setGoal(
        goal.metric, 
        goal.target, 
        { 
          type: goal.type,
          description: goal.description,
          period: goal.period
        }
      );
    }
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    trackTab(tab);
    trackProgress();
{{ ... }}
  }
});

// Track when tabs are activated
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      trackTab(tab);
    }
  });
});

// Track tabs when they're created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    trackTab(tab);
  }
});

// Track tabs when they're replaced
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  chrome.tabs.get(addedTabId, (tab) => {
    if (tab && tab.url) {
      trackTab(tab);
    }
  });
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const operation = performanceMonitor.startOperation(`alarm_${alarm.name}`);
  
  try {
    switch (alarm.name) {
      case 'syncTabs':
        await syncTabs();
        break;
      case 'analyzeHistory':
        await analyzeHistory();
        break;
      case 'trackProgress':
        await trackProgress();
        break;
      case 'monitorPerformance':
        await performanceMonitor.periodicCheck();
        break;
    }
  } catch (error) {
    console.error(`Error in ${alarm.name} alarm:`, error);
  } finally {
    operation.end();
  }
});

// Track a single tab
async function trackTab(tab) {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
    return;
  }

  const tabData = {
    id: tab.id,
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
    timestamp: new Date().toISOString(),
    windowId: tab.windowId,
    active: tab.active
  };

  // Save to local storage
  const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.TABS);
  const tabs = result[CONFIG.STORAGE_KEYS.TABS] || {};
  tabs[tab.id] = tabData;
  
  await chrome.storage.local.set({
    [CONFIG.STORAGE_KEYS.TABS]: tabs
  });

  // If we have a lot of tabs, trigger a sync
  if (Object.keys(tabs).length > 10) {
    syncTabs();
  }
}

// Sync tabs with KB-CLI
async function syncTabs() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const result = await chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.TABS,
      CONFIG.STORAGE_KEYS.API_KEY
    ]);
    
    const tabs = result[CONFIG.STORAGE_KEYS.TABS] || {};
    const apiKey = result[CONFIG.STORAGE_KEYS.API_KEY] || '';
    
    if (Object.keys(tabs).length === 0) {
      return;
    }

    // Send tabs to KB-CLI
    const response = await fetch(CONFIG.KB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        tabs: Object.values(tabs)
      })
    });

    if (response.ok) {
      // Clear synced tabs
      await chrome.storage.local.set({
        [CONFIG.STORAGE_KEYS.TABS]: {}
      });
      
      // Update last sync time
      await chrome.storage.sync.set({
        [CONFIG.STORAGE_KEYS.LAST_SYNC]: new Date().toISOString()
      });
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'KB-CLI Sync',
        message: `${Object.keys(tabs).length} tabs synced with KB-CLI`
      });
    }
  } catch (error) {
  } finally {
    isSyncing = false;
  }
}

// Track progress and analytics
async function trackProgress() {
  const operation = performanceMonitor.startOperation('track_progress');
  try {
  try {
    console.log('Tracking progress...');
    
    // Track extension usage
    await progressTracker.track('extension_usage');
    
    // Get active tab information
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const domain = url.hostname.replace('www.', '');
      
      // Track domain usage
      await progressTracker.track(`domain:${domain}`);
      
      // Track time spent on different types of sites
      const siteType = _categorizeDomain(domain);
      await progressTracker.track(`site_type:${siteType}`);
      
      // Track productive vs distracting time
      const isProductive = _isProductiveDomain(domain);
      await progressTracker.track(isProductive ? 'productive_time' : 'distracting_time');
    }
    
    // Update analytics dashboard
    await _updateAnalyticsDashboard();
    
    console.log('Progress tracking completed');
  } catch (error) {
    console.error('Error in trackProgress:', error);
    throw error;
  } finally {
    operation.end();
  }
}

// Categorize domain by type
function _categorizeDomain(domain) {
  const categories = {
    'github.com': 'development',
    'stackoverflow.com': 'development',
    'youtube.com': 'entertainment',
    'reddit.com': 'social',
    'twitter.com': 'social',
    'linkedin.com': 'professional',
    'medium.com': 'learning',
    'wikipedia.org': 'reference',
    'docs.': 'documentation',
    'api.': 'api',
    '.edu': 'education',
    '.gov': 'government'
  };
  
  for (const [pattern, category] of Object.entries(categories)) {
    if (domain.includes(pattern)) {
      return category;
    }
  }
  
  return 'other';
}

// Check if domain is considered productive
function _isProductiveDomain(domain) {
  const productivePatterns = [
    'github.com',
    'stackoverflow.com',
    'docs.',
    'learn.',
    'wikipedia.org',
    '.edu',
    'medium.com',
    'dev.to',
    'developer.mozilla.org',
    'digitalocean.com',
    'aws.amazon.com',
    'cloud.google.com'
  ];
  
  return productivePatterns.some(pattern => domain.includes(pattern));
}

// Update analytics dashboard with latest data
async function _updateAnalyticsDashboard() {
  const insights = {
    daily: {},
    weekly: {},
    monthly: {}
  };
  
  // Get metrics for different time periods
  const periods = ['7d', '30d'];
  const metrics = ['productive_time', 'distracting_time', 'learning_time'];
  
  for (const metric of metrics) {
    insights.daily[metric] = await progressTracker.getInsights(metric, '1d');
    
    for (const period of periods) {
      if (!insights[period]) insights[period] = {};
      insights[period][metric] = await progressTracker.getInsights(metric, period);
    }
  }
  
  // Get suggestions
  const suggestions = [];
  for (const metric of metrics) {
    const metricSuggestions = await progressTracker.getSuggestions(metric);
    suggestions.push(...metricSuggestions);
  }
  
  // Save to storage for popup to display
  await chrome.storage.local.set({
    analytics: {
      lastUpdated: Date.now(),
      insights,
      suggestions: suggestions.slice(0, 5), // Top 5 suggestions
      summary: await _generateSummary(insights)
    }
  });
}

// Generate a human-readable summary of analytics
async function _generateSummary(insights) {
  const productiveTime = insights.daily.productive_time?.total || 0;
  const distractingTime = insights.daily.distracting_time?.total || 0;
  const totalTime = productiveTime + distractingTime;
  const productivityRatio = totalTime > 0 ? (productiveTime / totalTime) * 100 : 0;
  
  return {
    productivityScore: Math.round(productivityRatio),
    totalFocusedTime: productiveTime,
    topCategory: await _getTopCategory(),
    weeklyTrend: await _getWeeklyTrend()
  };
}

// Get top category by time spent
async function _getTopCategory() {
  const categories = ['development', 'learning', 'documentation', 'entertainment', 'social'];
  let maxTime = 0;
  let topCategory = 'other';
  
  for (const category of categories) {
    const metric = `site_type:${category}`;
    const insights = await progressTracker.getInsights(metric, '7d');
    if (insights && insights.total > maxTime) {
      maxTime = insights.total;
      topCategory = category;
    }
  }
  
  return {
    name: topCategory,
    time: maxTime
  };
}

// Get weekly trend
async function _getWeeklyTrend() {
  const productiveLastWeek = await progressTracker.getInsights('productive_time', '7d');
  const productivePrevWeek = await progressTracker.getInsights('productive_time', '7d', 7);
  
  if (!productiveLastWeek || !productivePrevWeek) return 'stable';
  
  const change = productiveLastWeek.total - productivePrevWeek.total;
  
  if (change > 0) return 'improving';
  if (change < 0) return 'declining';
  return 'stable';
}

// Analyze browsing history and update knowledge base
async function analyzeHistory() {
  const operation = performanceMonitor.startOperation('analyze_history');
  try {
  try {
    console.log('Starting history analysis...');
    
    // Track the analysis event
    await progressTracker.track('history_analysis');

    // Load existing analysis
    await historyAnalyzer.loadAnalysisResults();

    // Perform analysis
    const results = await historyAnalyzer.analyzeHistory();
    const interests = historyAnalyzer.getUserInterests();
    const timestamp = new Date().toISOString();

    // Process insights for knowledge base
    const newInsights = knowledgeBaseIntegrator.processInsights({ interests });
    
    // Get existing knowledge from storage
    const { knowledgeBase = [] } = await chrome.storage.local.get('knowledgeBase');
    
    // Merge with existing knowledge
    const updatedKnowledge = knowledgeBaseIntegrator.mergeWithExistingKnowledge(
      knowledgeBase,
      newInsights
    );
    
    // Track knowledge base growth
    await progressTracker.track('knowledge_items', updatedKnowledge.length - knowledgeBase.length, {
      newItems: newInsights.length,
      totalItems: updatedKnowledge.length
    });
    
    // Save updated knowledge and analysis
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.HISTORY_ANALYSIS]: {
        ...results,
        interests,
        lastUpdated: Date.now()
      },
      knowledgeBase: updatedKnowledge
    });

    console.log('History analysis and knowledge update completed', { 
      newInsights: newInsights.length,
      totalKnowledgeItems: updatedKnowledge.length 
    });

    // Send to KB-CLI if API key is set
    await syncKnowledgeWithBackend(updatedKnowledge);

    return interests;
  } catch (error) {
    console.error('Error in analyzeHistory:', error);
    throw error;
  } finally {
    operation.end();
  }
  }
}

// Sync knowledge with backend
async function syncKnowledgeWithBackend(knowledgeItems) {
  const { [CONFIG.STORAGE_KEYS.API_KEY]: apiKey } = await chrome.storage.sync.get(CONFIG.STORAGE_KEYS.API_KEY);
  
  if (!apiKey) {
    console.log('No API key set, skipping knowledge sync');
    return;
  }

  try {
    // Send only new or updated items (last 24 hours by default)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentItems = knowledgeItems.filter(item => 
      new Date(item.timestamp) > oneDayAgo
    );
    
    if (recentItems.length === 0) {
      console.log('No new knowledge to sync');
      return;
    }
    
    const response = await fetch(`${CONFIG.KB_API_URL}/knowledge/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        items: recentItems,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Knowledge sync successful', { 
      syncedItems: result.synced || 0,
      totalItems: knowledgeItems.length 
    });
    
    return result;
  } catch (error) {
    console.error('Error syncing knowledge with KB-CLI:', error);
    throw error;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SYNC_NOW') {
    syncTabs().then(() => sendResponse({ success: true }));
    return true; // Keep the message channel open for the async response
  }
  
  if (request.type === 'GET_STATUS') {
    chrome.storage.local.get([CONFIG.STORAGE_KEYS.TABS, CONFIG.STORAGE_KEYS.HISTORY_ANALYSIS], (result) => {
      const tabs = result[CONFIG.STORAGE_KEYS.TABS] || {};
      const analysis = result[CONFIG.STORAGE_KEYS.HISTORY_ANALYSIS] || {};
      
      sendResponse({
        tabCount: Object.keys(tabs).length,
        isSyncing,
        lastAnalysis: analysis.lastUpdated,
        interests: analysis.interests
      });
    });
    return true; // Keep the message channel open for the async response
  }
  
  if (request.type === 'ANALYZE_HISTORY') {
    analyzeHistory()
      .then(interests => sendResponse({ success: true, interests }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for the async response
  }
  
  if (request.type === 'GET_INTERESTS') {
    chrome.storage.local.get(CONFIG.STORAGE_KEYS.HISTORY_ANALYSIS, (result) => {
      const analysis = result[CONFIG.STORAGE_KEYS.HISTORY_ANALYSIS] || {};
      sendResponse({
        interests: analysis.interests,
        lastUpdated: analysis.lastUpdated
      });
    });
    return true; // Keep the message channel open for the async response
  }
});

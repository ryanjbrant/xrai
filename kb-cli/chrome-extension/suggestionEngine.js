class SuggestionEngine {
  constructor() {
    this.suggestionContext = {
      lastInteraction: null,
      currentFocus: null,
      recentActions: [],
      pendingSuggestions: [],
      userPreferences: {}
    };
    this.maxHistory = 50;
    this.suggestionWeights = {
      goalRelevance: 0.4,
      contextMatch: 0.3,
      timeSensitivity: 0.2,
      userPreference: 0.1
    };
  }

  /**
   * Initialize the suggestion engine
   */
  async init() {
    try {
      // Load user preferences and history
      const data = await chrome.storage.local.get([
        'suggestionContext',
        'userPreferences',
        'goals',
        'recentActions'
      ]);

      this.suggestionContext = {
        ...this.suggestionContext,
        ...(data.suggestionContext || {})
      };
      
      this.userPreferences = data.userPreferences || {};
      this.goals = data.goals || [];
      this.recentActions = data.recentActions || [];
      
      // Start monitoring user activity
      this._setupEventListeners();
      
      console.log('Suggestion engine initialized');
    } catch (error) {
      console.error('Failed to initialize suggestion engine:', error);
    }
  }

  /**
   * Set up event listeners for user interactions
   */
  _setupEventListeners() {
    // Monitor tab changes
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this._handleTabChange(activeInfo.tabId);
    });

    // Monitor URL changes
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url) {
        this._handleUrlChange(tabId, changeInfo.url);
      }
    });

    // Monitor form interactions
    document.addEventListener('focusin', this._handleFocusChange.bind(this));
    document.addEventListener('input', this._handleInput.bind(this));
  }

  /**
   * Handle tab change events
   */
  async _handleTabChange(tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab && tab.url) {
        this.suggestionContext.currentFocus = {
          type: 'tab',
          url: tab.url,
          title: tab.title
        };
        this._updateSuggestions();
      }
    } catch (error) {
      console.error('Error handling tab change:', error);
    }
  }

  /**
   * Handle URL change events
   */
  _handleUrlChange(tabId, url) {
    this.suggestionContext.currentFocus = {
      ...this.suggestionContext.currentFocus,
      url,
      lastUpdated: Date.now()
    };
    this._updateSuggestions();
  }

  /**
   * Handle focus change events
   */
  _handleFocusChange(event) {
    const target = event.target;
    if (target.matches('input, textarea, [contenteditable="true"]')) {
      this.suggestionContext.currentFocus = {
        type: 'input',
        element: target,
        context: this._getInputContext(target)
      };
      this._updateSuggestions();
    }
  }

  /**
   * Handle input events
   */
  _handleInput(event) {
    if (!this.suggestionContext.currentFocus || 
        this.suggestionContext.currentFocus.type !== 'input') {
      return;
    }

    this._updateSuggestions();
  }

  /**
   * Get context for the current input field
   */
  _getInputContext(inputElement) {
    const context = {
      type: inputElement.type || 'text',
      name: inputElement.name || '',
      id: inputElement.id || '',
      placeholder: inputElement.placeholder || '',
      value: inputElement.value || '',
      labels: []
    };

    // Get associated labels
    if (inputElement.id) {
      const labels = document.querySelectorAll(`label[for="${inputElement.id}"]`);
      context.labels = Array.from(labels).map(label => label.textContent.trim());
    }

    // Get parent form context if available
    if (inputElement.form) {
      context.form = {
        id: inputElement.form.id || '',
        action: inputElement.form.action || '',
        method: inputElement.form.method || 'get'
      };
    }

    return context;
  }

  /**
   * Update suggestions based on current context
   */
  async _updateSuggestions() {
    if (!this.suggestionContext.currentFocus) {
      return;
    }

    // Get relevant suggestions based on context
    const suggestions = await this._getRelevantSuggestions();
    
    // Sort by relevance score
    suggestions.sort((a, b) => b.score - a.score);
    
    // Store top suggestions
    this.suggestionContext.pendingSuggestions = suggestions.slice(0, 3);
    
    // Auto-apply top suggestion if confidence is very high
    const topSuggestion = suggestions[0];
    if (topSuggestion && topSuggestion.score > 0.9) {
      this._applySuggestion(topSuggestion);
    } else {
      // Otherwise, show suggestions to the user
      this._showSuggestions(suggestions);
    }
  }

  /**
   * Get relevant suggestions based on current context
   */
  async _getRelevantSuggestions() {
    const { currentFocus } = this.suggestionContext;
    const suggestions = [];

    // Get goal-based suggestions
    const goalSuggestions = await this._getGoalBasedSuggestions();
    suggestions.push(...goalSuggestions);

    // Get context-based suggestions
    if (currentFocus.type === 'input') {
      const inputSuggestions = this._getInputBasedSuggestions(currentFocus);
      suggestions.push(...inputSuggestions);
    }

    // Get history-based suggestions
    const historySuggestions = this._getHistoryBasedSuggestions();
    suggestions.push(...historySuggestions);

    // Calculate scores for each suggestion
    return suggestions.map(suggestion => ({
      ...suggestion,
      score: this._calculateSuggestionScore(suggestion)
    }));
  }

  /**
   * Get suggestions based on user goals
   */
  async _getGoalBasedSuggestions() {
    if (!this.goals || this.goals.length === 0) {
      return [];
    }

    // Sort goals by priority and due date
    const sortedGoals = [...this.goals]
      .filter(goal => !goal.completed)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      });

    // Get top 3 goals
    const topGoals = sortedGoals.slice(0, 3);
    
    return topGoals.map(goal => ({
      type: 'goal',
      goalId: goal.id,
      title: `Work on: ${goal.title}`,
      description: goal.description || '',
      priority: goal.priority,
      dueDate: goal.dueDate,
      actions: this._getGoalActions(goal)
    }));
  }

  /**
   * Get actions for a specific goal
   */
  _getGoalActions(goal) {
    const actions = [];
    
    // Add generic goal actions
    actions.push({
      type: 'navigate',
      label: 'View Goal',
      url: `/goals/${goal.id}`,
      icon: '👁️'
    });
    
    // Add context-specific actions based on goal type
    if (goal.type === 'learning') {
      actions.push({
        type: 'suggest_text',
        label: 'Take notes',
        text: `# ${goal.title}\n\n## What I learned today:\n- `,
        target: 'active_editor',
        icon: '📝'
      });
      
      actions.push({
        type: 'search',
        label: 'Find resources',
        query: `best resources to learn ${goal.title} 2024`,
        icon: '🔍'
      });
    }
    
    return actions;
  }

  /**
   * Get suggestions based on input context
   */
  _getInputBasedSuggestions(context) {
    const suggestions = [];
    const { element } = context;
    
    // Suggest autocomplete based on input type and name
    if (element.name && element.name.toLowerCase().includes('email')) {
      suggestions.push({
        type: 'autocomplete',
        field: element.name,
        value: this.userPreferences.email || '',
        confidence: 0.9,
        source: 'user_preferences'
      });
    }
    
    // Suggest common inputs based on field name
    const commonSuggestions = {
      'name': this.userPreferences.name || '',
      'username': this.userPreferences.username || '',
      'phone': this.userPreferences.phone || '',
      'address': this.userPreferences.address || ''
    };
    
    for (const [field, value] of Object.entries(commonSuggestions)) {
      if (element.name && element.name.toLowerCase().includes(field) && value) {
        suggestions.push({
          type: 'autocomplete',
          field: element.name,
          value: value,
          confidence: 0.85,
          source: 'user_profile'
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Get suggestions based on user history
   */
  _getHistoryBasedSuggestions() {
    if (!this.recentActions || this.recentActions.length === 0) {
      return [];
    }
    
    // Group actions by type and count occurrences
    const actionCounts = this.recentActions.reduce((acc, action) => {
      const key = `${action.type}:${action.target}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    // Get most frequent actions
    const frequentActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    return frequentActions.map(([key, count]) => {
      const [type, target] = key.split(':');
      return {
        type: 'history',
        actionType: type,
        target,
        frequency: count,
        lastUsed: this.recentActions
          .filter(a => `${a.type}:${a.target}` === key)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp
      };
    });
  }

  /**
   * Calculate a score for a suggestion
   */
  _calculateSuggestionScore(suggestion) {
    let score = 0;
    const now = Date.now();
    
    // Goal relevance
    if (suggestion.type === 'goal') {
      score += suggestion.priority * this.suggestionWeights.goalRelevance;
      
      // Increase score if due date is approaching
      if (suggestion.dueDate) {
        const daysUntilDue = Math.ceil((new Date(suggestion.dueDate) - now) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 1) score += 0.3;
        else if (daysUntilDue <= 3) score += 0.2;
        else if (daysUntilDue <= 7) score += 0.1;
      }
    }
    
    // Context match
    if (this.suggestionContext.currentFocus) {
      // Simple keyword matching for demo purposes
      const contextStr = JSON.stringify(this.suggestionContext.currentFocus).toLowerCase();
      const suggestionStr = JSON.stringify(suggestion).toLowerCase();
      
      if (contextStr.includes(suggestionStr.substring(0, 10))) {
        score += this.suggestionWeights.contextMatch;
      }
    }
    
    // Time sensitivity
    if (suggestion.lastUsed) {
      const daysSinceUsed = Math.ceil((now - new Date(suggestion.lastUsed)) / (1000 * 60 * 60 * 24));
      if (daysSinceUsed <= 1) score += 0.3;
      else if (daysSinceUsed <= 3) score += 0.2;
      else if (daysSinceUsed <= 7) score += 0.1;
    }
    
    // User preference
    if (this.userPreferences.suggestions) {
      const pref = this.userPreferences.suggestions[suggestion.type];
      if (pref === 'always') score += 0.4;
      else if (pref === 'sometimes') score += 0.2;
      else if (pref === 'never') score = 0;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Show suggestions to the user
   */
  _showSuggestions(suggestions) {
    // This would typically update the UI to show suggestions
    console.log('Showing suggestions:', suggestions);
    
    // In a real implementation, this would update the UI
    // For now, we'll just log to the console
    chrome.runtime.sendMessage({
      type: 'SHOW_SUGGESTIONS',
      suggestions: suggestions.map(s => ({
        ...s,
        // Remove any circular references before sending
        element: undefined,
        actions: s.actions ? s.actions.map(a => ({
          ...a,
          handler: undefined
        })) : []
      }))
    });
  }

  /**
   * Apply a suggestion
   */
  async _applySuggestion(suggestion) {
    console.log('Applying suggestion:', suggestion);
    
    // Add to recent actions
    this._recordAction({
      type: 'apply_suggestion',
      suggestionType: suggestion.type,
      target: suggestion.target || suggestion.goalId || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Handle different suggestion types
    switch (suggestion.type) {
      case 'autocomplete':
        this._fillInput(suggestion.field, suggestion.value);
        break;
        
      case 'navigate':
        chrome.tabs.create({ url: suggestion.url });
        break;
        
      case 'suggest_text':
        this._insertText(suggestion.text, suggestion.target);
        break;
        
      case 'search':
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion.query)}`;
        chrome.tabs.create({ url: searchUrl });
        break;
    }
  }

  /**
   * Fill an input field with a value
   */
  _fillInput(fieldName, value) {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) {
      input.value = value;
      
      // Trigger change event
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  }

  /**
   * Insert text at the cursor position
   */
  _insertText(text, target = 'active_element') {
    let element;
    
    if (target === 'active_element') {
      element = document.activeElement;
    } else if (target === 'active_editor') {
      // This would be more sophisticated in a real implementation
      element = document.querySelector('.editor, [contenteditable="true"]') || 
                document.activeElement;
    }
    
    if (!element) return;
    
    try {
      // For contenteditable elements
      if (element.isContentEditable) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        
        // Move cursor to end of inserted text
        range.setStartAfter(range.endContainer);
        range.setEndAfter(range.endContainer);
        selection.removeAllRanges();
        selection.addRange(range);
      } 
      // For regular input/textarea
      else if (['INPUT', 'TEXTAREA'].includes(element.tagName)) {
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const currentValue = element.value;
        
        element.value = currentValue.substring(0, start) + 
                        text + 
                        currentValue.substring(end);
                        
        // Set cursor position after inserted text
        const newPos = start + text.length;
        element.setSelectionRange(newPos, newPos);
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error inserting text:', error);
    }
  }

  /**
   * Record a user action
   */
  _recordAction(action) {
    if (!this.recentActions) {
      this.recentActions = [];
    }
    
    // Add timestamp if not provided
    if (!action.timestamp) {
      action.timestamp = new Date().toISOString();
    }
    
    // Add to beginning of array
    this.recentActions.unshift(action);
    
    // Trim to max history size
    if (this.recentActions.length > this.maxHistory) {
      this.recentActions = this.recentActions.slice(0, this.maxHistory);
    }
    
    // Save to storage
    chrome.storage.local.set({ recentActions: this.recentActions });
  }

  /**
   * Get the current context
   */
  getContext() {
    return { ...this.suggestionContext };
  }

  /**
   * Update user preferences
   */
  async updatePreferences(prefs) {
    this.userPreferences = { ...this.userPreferences, ...prefs };
    await chrome.storage.local.set({ userPreferences: this.userPreferences });
    this._updateSuggestions();
  }

  /**
   * Update goals
   */
  async updateGoals(goals) {
    this.goals = [...goals];
    await chrome.storage.local.set({ goals: this.goals });
    this._updateSuggestions();
  }
}

// Export a singleton instance
export const suggestionEngine = new SuggestionEngine();

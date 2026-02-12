class ProgressTracker {
  constructor() {
    this.metrics = new Map();
    this.goals = new Map();
    this.history = [];
    this.initialized = false;
  }

  /**
   * Initialize the tracker with saved state
   */
  async init() {
    if (this.initialized) return;
    
    try {
      const { trackerState } = await chrome.storage.local.get('trackerState');
      
      if (trackerState) {
        this.metrics = new Map(trackerState.metrics || []);
        this.goals = new Map(trackerState.goals || []);
        this.history = trackerState.history || [];
      }
      
      this.initialized = true;
      console.log('Progress tracker initialized');
    } catch (error) {
      console.error('Failed to initialize progress tracker:', error);
    }
  }

  /**
   * Save current state to storage
   */
  async saveState() {
    try {
      await chrome.storage.local.set({
        trackerState: {
          metrics: Array.from(this.metrics.entries()),
          goals: Array.from(this.goals.entries()),
          history: this.history,
          lastUpdated: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to save tracker state:', error);
    }
  }

  /**
   * Track a metric with optional value and metadata
   */
  async track(metricName, value = 1, metadata = {}) {
    if (!this.initialized) await this.init();
    
    const timestamp = Date.now();
    const dateKey = new Date().toISOString().split('T')[0];
    
    // Update metric
    const metric = this.metrics.get(metricName) || {
      name: metricName,
      total: 0,
      daily: {},
      weekly: {},
      monthly: {},
      metadata: {}
    };
    
    // Update values
    metric.total = (metric.total || 0) + value;
    
    // Update time-based metrics
    const now = new Date();
    const weekKey = this._getWeekKey(now);
    const monthKey = this._getMonthKey(now);
    
    metric.daily[dateKey] = (metric.daily[dateKey] || 0) + value;
    metric.weekly[weekKey] = (metric.weekly[weekKey] || 0) + value;
    metric.monthly[monthKey] = (metric.monthly[monthKey] || 0) + value;
    metric.metadata = { ...metric.metadata, ...metadata };
    metric.lastUpdated = timestamp;
    
    this.metrics.set(metricName, metric);
    
    // Add to history
    this.history.push({
      timestamp,
      metric: metricName,
      value,
      metadata
    });
    
    // Check goals
    await this._checkGoals(metricName, metric.total);
    
    // Save state
    await this.saveState();
    
    return metric;
  }

  /**
   * Define a goal for a metric
   */
  async setGoal(metricName, target, options = {}) {
    if (!this.initialized) await this.init();
    
    const goal = {
      metric: metricName,
      target,
      current: this.metrics.get(metricName)?.total || 0,
      startDate: options.startDate || Date.now(),
      endDate: options.endDate || null,
      type: options.type || 'at_least', // 'at_least' or 'at_most'
      notifications: options.notifications !== false,
      createdAt: Date.now(),
      ...options
    };
    
    this.goals.set(metricName, goal);
    await this.saveState();
    
    return goal;
  }

  /**
   * Get progress for a specific metric or goal
   */
  getProgress(metricName) {
    const metric = this.metrics.get(metricName);
    const goal = this.goals.get(metricName);
    
    if (!metric && !goal) return null;
    
    const progress = {
      metric: metricName,
      current: metric?.total || 0,
      history: this.history.filter(h => h.metric === metricName)
    };
    
    if (goal) {
      progress.goal = goal.target;
      progress.progress = Math.min(100, (progress.current / goal.target) * 100);
      progress.remaining = Math.max(0, goal.target - progress.current);
      progress.isOnTrack = this._checkOnTrack(goal, progress);
    }
    
    return progress;
  }

  /**
   * Get trends and insights
   */
  getInsights(metricName, period = '30d') {
    const metric = this.metrics.get(metricName);
    if (!metric) return null;
    
    const now = new Date();
    const cutoffDate = this._getCutoffDate(period);
    
    // Filter history for the period
    const recentHistory = this.history.filter(
      h => h.metric === metricName && 
           new Date(h.timestamp) >= cutoffDate
    );
    
    // Calculate trends
    const values = recentHistory.map(h => h.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length > 0 ? sum / values.length : 0;
    
    // Compare with previous period
    const prevCutoff = new Date(cutoffDate);
    const prevPeriodStart = new Date(prevCutoff);
    prevPeriodStart.setDate(prevCutoff.getDate() - this._getDaysInPeriod(period));
    
    const prevHistory = this.history.filter(
      h => h.metric === metricName && 
           new Date(h.timestamp) >= prevPeriodStart &&
           new Date(h.timestamp) < cutoffDate
    );
    
    const prevSum = prevHistory.reduce((sum, h) => sum + h.value, 0);
    const prevAvg = prevHistory.length > 0 ? prevSum / prevHistory.length : 0;
    const change = prevAvg !== 0 ? ((avg - prevAvg) / prevAvg) * 100 : 100;
    
    return {
      metric: metricName,
      period,
      total: sum,
      average: avg,
      count: values.length,
      change: {
        value: change,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
        isSignificant: Math.abs(change) > 10 // 10% change is considered significant
      },
      timeline: this._createTimelineData(metric, period, cutoffDate)
    };
  }

  /**
   * Get suggestions for improvement
   */
  getSuggestions(metricName) {
    const progress = this.getProgress(metricName);
    const insights = this.getInsights(metricName);
    
    if (!progress || !insights) return [];
    
    const suggestions = [];
    const { change } = insights;
    
    if (progress.goal) {
      const remainingDays = progress.goal.endDate 
        ? Math.ceil((new Date(progress.goal.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : 30; // Default to 30 days if no end date
      
      const dailyNeeded = progress.remaining / Math.max(1, remainingDays);
      
      if (dailyNeeded > 1) {
        suggestions.push({
          type: 'increase_effort',
          message: `To reach your goal, aim for ${Math.ceil(dailyNeeded)} ${metricName} per day`,
          priority: 'high'
        });
      }
    }
    
    if (change.isSignificant) {
      suggestions.push({
        type: change.direction === 'up' ? 'positive_trend' : 'negative_trend',
        message: `${metricName} has ${change.direction === 'up' ? 'increased' : 'decreased'} by ${Math.abs(change.value).toFixed(1)}% compared to the previous period`,
        priority: change.direction === 'up' ? 'low' : 'medium'
      });
    }
    
    return suggestions;
  }

  // Helper methods
  
  async _checkGoals(metricName, currentValue) {
    const goal = this.goals.get(metricName);
    if (!goal) return;
    
    const isAchieved = goal.type === 'at_least' 
      ? currentValue >= goal.target 
      : currentValue <= goal.target;
    
    if (isAchieved && goal.notifications) {
      this._notifyGoalAchieved(goal, currentValue);
    }
  }
  
  _checkOnTrack(goal, progress) {
    if (!goal.endDate) return null;
    
    const now = Date.now();
    const timeElapsed = now - goal.startDate;
    const totalTime = goal.endDate - goal.startDate;
    const expectedProgress = (timeElapsed / totalTime) * 100;
    
    return progress.progress >= expectedProgress;
  }
  
  _getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7 + 1));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return `${d.getFullYear()}-W${Math.ceil((((d - week1) / 86400000) + 1) / 7)}`;
  }
  
  _getMonthKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  
  _getCutoffDate(period) {
    const now = new Date();
    const cutoff = new Date(now);
    
    if (period.endsWith('d')) {
      const days = parseInt(period);
      cutoff.setDate(now.getDate() - days);
    } else if (period.endsWith('w')) {
      const weeks = parseInt(period);
      cutoff.setDate(now.getDate() - (weeks * 7));
    } else if (period.endsWith('m')) {
      const months = parseInt(period);
      cutoff.setMonth(now.getMonth() - months);
    }
    
    return cutoff;
  }
  
  _getDaysInPeriod(period) {
    if (period.endsWith('d')) return parseInt(period);
    if (period.endsWith('w')) return parseInt(period) * 7;
    if (period.endsWith('m')) return parseInt(period) * 30; // Approximation
    return 30; // Default to 30 days
  }
  
  _createTimelineData(metric, period, cutoffDate) {
    const timeline = [];
    const now = new Date();
    const format = period.endsWith('d') && parseInt(period) <= 7 ? 'day' : 
                  period.endsWith('w') || (period.endsWith('d') && parseInt(period) > 7) ? 'week' : 'month';
    
    let current = new Date(cutoffDate);
    
    while (current <= now) {
      let key, label;
      
      if (format === 'day') {
        key = current.toISOString().split('T')[0];
        label = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(current);
        current.setDate(current.getDate() + 1);
      } else if (format === 'week') {
        key = this._getWeekKey(current);
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        label = `Week ${key.split('-W')[1]}`;
        current.setDate(current.getDate() + 7);
      } else {
        key = this._getMonthKey(current);
        label = new Intl.DateTimeFormat('en', { month: 'short' }).format(current);
        current.setMonth(current.getMonth() + 1);
      }
      
      const value = format === 'day' ? (metric.daily[key] || 0) :
                   format === 'week' ? (metric.weekly[key] || 0) :
                   (metric.monthly[key] || 0);
      
      timeline.push({
        date: key,
        label,
        value,
        timestamp: new Date(current).getTime()
      });
    }
    
    return timeline;
  }
  
  _notifyGoalAchieved(goal, currentValue) {
    const notification = {
      type: 'goal_achieved',
      title: '🎉 Goal Achieved!',
      message: `You've reached your goal of ${goal.target} ${goal.metric}. Current: ${currentValue}`,
      timestamp: Date.now(),
      goal: goal.metric,
      target: goal.target,
      current: currentValue
    };
    
    // Store notification
    chrome.storage.local.get(['notifications'], (result) => {
      const notifications = result.notifications || [];
      notifications.unshift(notification);
      chrome.storage.local.set({ notifications: notifications.slice(0, 100) });
    });
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon48.png'
      });
    }
  }
}

// Export a singleton instance
export const progressTracker = new ProgressTracker();

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      responseTimes: [],
      memoryUsage: [],
      cpuUsage: [],
      lastCheck: 0,
      slowOperations: 0,
      highMemoryUsage: 0
    };
    
    this.thresholds = {
      // Response time threshold in milliseconds
      slowResponse: 1000,
      // Memory usage threshold in MB
      highMemory: 500,
      // CPU usage threshold (0-100)
      highCpu: 80,
      // Maximum number of operations in queue
      maxQueue: 50,
      // Maximum number of history entries to keep
      maxHistory: 1000
    };
    
    this.optimizations = {
      // Enable automatic compaction of storage
      autoCompact: true,
      // Enable aggressive cleanup when under memory pressure
      aggressiveCleanup: false,
      // Maximum age of history entries to keep (in days)
      maxHistoryAge: 7
    };
    
    this.initialized = false;
    this.operationQueue = [];
    this.operationInProgress = false;
    this.cleanupScheduled = false;
  }
  
  /**
   * Initialize the performance monitor
   */
  async init() {
    if (this.initialized) return;
    
    try {
      // Load saved settings
      const { performanceSettings } = await chrome.storage.local.get('performanceSettings');
      if (performanceSettings) {
        this.thresholds = { ...this.thresholds, ...performanceSettings.thresholds };
        this.optimizations = { ...this.optimizations, ...performanceSettings.optimizations };
      }
      
      // Set up periodic checks
      this.checkInterval = setInterval(() => this.periodicCheck(), 60000); // Every minute
      
      // Listen for memory pressure events
      if (chrome.system && chrome.system.memory) {
        chrome.system.memory.onPressureLevelChanged.addListener(
          this.handleMemoryPressure.bind(this)
        );
      }
      
      this.initialized = true;
      console.log('Performance monitor initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitor:', error);
    }
  }
  
  /**
   * Track the start of an operation
   * @param {string} operationId - Unique identifier for the operation
   * @returns {Object} - Object with end() method to mark operation completion
   */
  startOperation(operationId) {
    const startTime = performance.now();
    const operation = {
      id: operationId,
      startTime,
      end: () => this.endOperation(operationId, startTime)
    };
    
    this.operationQueue.push(operation);
    this.checkQueueSize();
    
    return operation;
  }
  
  /**
   * Mark an operation as completed
   */
  async endOperation(operationId, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Remove from queue
    this.operationQueue = this.operationQueue.filter(op => op.id !== operationId);
    
    // Record metrics
    this.metrics.responseTimes.push({
      operation: operationId,
      duration,
      timestamp: Date.now()
    });
    
    // Trim history
    if (this.metrics.responseTimes.length > this.thresholds.maxHistory) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-this.thresholds.maxHistory);
    }
    
    // Check for slow operations
    if (duration > this.thresholds.slowResponse) {
      this.metrics.slowOperations++;
      console.warn(`Slow operation detected: ${operationId} took ${duration.toFixed(2)}ms`);
      
      // Trigger optimization if needed
      if (this.metrics.slowOperations > 5) {
        this.optimizePerformance();
      }
    }
    
    return duration;
  }
  
  /**
   * Check if the operation queue is getting too large
   */
  checkQueueSize() {
    if (this.operationQueue.length > this.thresholds.maxQueue) {
      console.warn(`Operation queue is large: ${this.operationQueue.length} operations pending`);
      
      // If we're not already processing the queue, start
      if (!this.operationInProgress) {
        this.processQueue();
      }
    }
  }
  
  /**
   * Process operations in the queue with rate limiting
   */
  async processQueue() {
    if (this.operationInProgress || this.operationQueue.length === 0) return;
    
    this.operationInProgress = true;
    
    try {
      // Process a batch of operations
      const batchSize = Math.min(10, Math.ceil(this.operationQueue.length / 2));
      const batch = this.operationQueue.splice(0, batchSize);
      
      console.log(`Processing batch of ${batch.length} operations`);
      
      // Process each operation in the batch
      for (const operation of batch) {
        try {
          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 0));
          operation.end();
        } catch (error) {
          console.error(`Error processing operation ${operation.id}:`, error);
        }
      }
      
      // If there are more operations, schedule the next batch
      if (this.operationQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    } catch (error) {
      console.error('Error processing operation queue:', error);
    } finally {
      this.operationInProgress = false;
    }
  }
  
  /**
   * Handle memory pressure events
   */
  handleMemoryPressure(level) {
    console.log(`Memory pressure level: ${level}`);
    
    switch (level) {
      case 'critical':
        this.optimizations.aggressiveCleanup = true;
        this.optimizePerformance();
        break;
      case 'warning':
        this.optimizePerformance();
        break;
    }
  }
  
  /**
   * Optimize performance based on current conditions
   */
  async optimizePerformance() {
    console.log('Optimizing performance...');
    
    // Check current memory usage
    const memoryInfo = await this.getMemoryInfo();
    const isMemoryCritical = memoryInfo.usedJSHeapSize > this.thresholds.highMemory * 1024 * 1024;
    
    // Check CPU usage (simplified)
    const now = performance.now();
    const timeSinceLastCheck = now - this.metrics.lastCheck;
    this.metrics.lastCheck = now;
    
    // Calculate operations per second
    const opsPerSecond = this.metrics.responseTimes.length / (timeSinceLastCheck / 1000);
    const isCpuCritical = opsPerSecond > this.thresholds.highCpu;
    
    // Apply optimizations based on conditions
    const optimizations = [];
    
    if (isMemoryCritical || this.optimizations.aggressiveCleanup) {
      optimizations.push(this.cleanupMemory());
      optimizations.push(this.compactStorage());
    }
    
    if (isCpuCritical) {
      optimizations.push(this.throttleOperations());
    }
    
    // Always do lightweight cleanup if not already running
    if (!this.cleanupScheduled) {
      this.scheduleCleanup();
    }
    
    await Promise.all(optimizations);
    
    console.log('Performance optimization complete');
  }
  
  /**
   * Clean up memory by clearing caches and temporary data
   */
  async cleanupMemory() {
    console.log('Cleaning up memory...');
    
    try {
      // Clear any cached data
      if (chrome.storage && chrome.storage.local) {
        const { cache = {} } = await chrome.storage.local.get('cache');
        const cacheKeys = Object.keys(cache);
        
        // Clear oldest 50% of cache entries
        const entriesToRemove = Math.ceil(cacheKeys.length * 0.5);
        const keysToRemove = cacheKeys
          .sort((a, b) => (cache[a].lastAccessed || 0) - (cache[b].lastAccessed || 0))
          .slice(0, entriesToRemove);
        
        for (const key of keysToRemove) {
          delete cache[key];
        }
        
        await chrome.storage.local.set({ cache });
      }
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      console.log(`Freed memory by cleaning up ${keysToRemove.length} cache entries`);
    } catch (error) {
      console.error('Error during memory cleanup:', error);
    }
  }
  
  /**
   * Compact storage to reduce memory usage
   */
  async compactStorage() {
    console.log('Compacting storage...');
    
    try {
      // Get all storage data
      const allData = await chrome.storage.local.get(null);
      const keys = Object.keys(allData);
      
      // Remove old history entries
      const now = Date.now();
      const maxAge = this.optimizations.maxHistoryAge * 24 * 60 * 60 * 1000; // days to ms
      
      for (const key of keys) {
        // Skip non-history keys
        if (!key.endsWith('_history') && !key.endsWith('_metrics')) continue;
        
        const history = allData[key] || [];
        const filtered = history.filter(entry => {
          const entryTime = entry.timestamp || entry.date || 0;
          return now - entryTime <= maxAge;
        });
        
        // Only update if we removed entries
        if (filtered.length < history.length) {
          await chrome.storage.local.set({ [key]: filtered });
          console.log(`Compacted ${key}: ${history.length - filtered.length} entries removed`);
        }
      }
      
      // Clear any temporary data
      await chrome.storage.local.remove('temp_');
      
      console.log('Storage compaction complete');
    } catch (error) {
      console.error('Error during storage compaction:', error);
    }
  }
  
  /**
   * Throttle operations to reduce CPU usage
   */
  async throttleOperations() {
    console.log('Throttling operations...');
    
    // Increase delay between operations
    this.thresholds.slowResponse = Math.min(2000, this.thresholds.slowResponse * 1.5);
    
    // Reduce batch size
    this.thresholds.maxQueue = Math.max(10, Math.floor(this.thresholds.maxQueue * 0.8));
    
    console.log(`Adjusted thresholds: maxQueue=${this.thresholds.maxQueue}, slowResponse=${this.thresholds.slowResponse}ms`);
  }
  
  /**
   * Schedule a cleanup in the near future
   */
  scheduleCleanup() {
    if (this.cleanupScheduled) return;
    
    this.cleanupScheduled = true;
    
    // Schedule cleanup during idle time
    if (window.requestIdleCallback) {
      requestIdleCallback(
        () => {
          this.cleanupMemory();
          this.cleanupScheduled = false;
        },
        { timeout: 5000 }
      );
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        this.cleanupMemory();
        this.cleanupScheduled = false;
      }, 5000);
    }
  }
  
  /**
   * Get memory information (if available)
   */
  async getMemoryInfo() {
    if (window.performance && window.performance.memory) {
      return {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
      };
    }
    
    // Fallback for browsers without performance.memory
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }
  
  /**
   * Run periodic performance checks
   */
  async periodicCheck() {
    try {
      // Check memory usage
      const memoryInfo = await this.getMemoryInfo();
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize
      });
      
      // Check for high memory usage
      if (memoryInfo.usedJSHeapSize > this.thresholds.highMemory * 1024 * 1024) {
        this.metrics.highMemoryUsage++;
        
        // Trigger optimization if we've seen high memory usage multiple times
        if (this.metrics.highMemoryUsage > 3) {
          this.optimizePerformance();
        }
      } else {
        // Reset counter if memory usage is normal
        this.metrics.highMemoryUsage = 0;
      }
      
      // Trim metrics history
      const maxHistory = this.thresholds.maxHistory;
      ['responseTimes', 'memoryUsage', 'cpuUsage'].forEach(metric => {
        if (this.metrics[metric].length > maxHistory) {
          this.metrics[metric] = this.metrics[metric].slice(-maxHistory);
        }
      });
      
      // Schedule a cleanup during idle time
      if (!this.cleanupScheduled) {
        this.scheduleCleanup();
      }
      
    } catch (error) {
      console.error('Error during periodic performance check:', error);
    }
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      operations: {
        pending: this.operationQueue.length,
        inProgress: this.operationInProgress,
        slowOperations: this.metrics.slowOperations
      },
      memory: {
        used: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]?.used || 0,
        total: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]?.total || 0
      },
      thresholds: this.thresholds,
      optimizations: this.optimizations
    };
  }
}

// Export a singleton instance
export const performanceMonitor = new PerformanceMonitor();

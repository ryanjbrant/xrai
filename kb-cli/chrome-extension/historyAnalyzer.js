class HistoryAnalyzer {
  constructor() {
    this.domainWeights = {};
    this.keywordWeights = {};
    this.categoryWeights = {};
    this.lastAnalysisTime = 0;
    this.analysisInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Common TLDs for domain parsing
  get commonTlds() {
    return new Set(['com', 'org', 'net', 'io', 'dev', 'ai', 'co']);
  }

  // Common words to ignore
  get stopWords() {
    return new Set([
      'the', 'and', 'or', 'but', 'a', 'an', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'as', 'by', 'from', 'how', 'what', 'when',
      'where', 'which', 'who', 'whom', 'this', 'that', 'these', 'those'
    ]);
  }

  // Known domain categories
  get domainCategories() {
    return {
      // Programming/Development
      'github.com': 'development',
      'stackoverflow.com': 'development',
      'gitlab.com': 'development',
      'bitbucket.org': 'development',
      'dev.to': 'development',
      'medium.com': 'development',
      
      // News/Aggregators
      'news.ycombinator.com': 'tech_news',
      'reddit.com': 'social_news',
      'lobste.rs': 'tech_news',
      
      // Documentation
      'developer.mozilla.org': 'documentation',
      'docs.microsoft.com': 'documentation',
      'docs.python.org': 'documentation',
      'reactjs.org': 'documentation',
      'vuejs.org': 'documentation',
      'angular.io': 'documentation',
      
      // Cloud Services
      'aws.amazon.com': 'cloud',
      'cloud.google.com': 'cloud',
      'azure.microsoft.com': 'cloud',
      'digitalocean.com': 'cloud',
      
      // Version Control
      'github.com': 'version_control',
      'git-scm.com': 'version_control',
      'gitlab.com': 'version_control',
      'bitbucket.org': 'version_control',
      
      // Learning Platforms
      'udemy.com': 'learning',
      'coursera.org': 'learning',
      'edx.org': 'learning',
      'pluralsight.com': 'learning',
      'egghead.io': 'learning',
      'frontendmasters.com': 'learning',
      
      // Social/Community
      'twitter.com': 'social',
      'linkedin.com': 'professional',
      'dev.to': 'community',
      'indiehackers.com': 'entrepreneurship',
      'producthunt.com': 'productivity',
      
      // Productivity
      'notion.so': 'productivity',
      'trello.com': 'productivity',
      'asana.com': 'productivity',
      'atlassian.com': 'productivity',
      'slack.com': 'communication',
      'discord.com': 'communication'
    };
  }

  // Extract main domain from URL
  extractMainDomain(url) {
    try {
      const domain = new URL(url).hostname;
      const parts = domain.split('.').reverse();
      
      // Handle domains like co.uk, com.br, etc.
      if (parts.length > 2 && this.commonTlds.has(parts[1])) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      
      return domain;
    } catch (e) {
      console.error('Error parsing URL:', url, e);
      return '';
    }
  }

  // Extract keywords from URL and title
  extractKeywords(text) {
    if (!text) return [];
    
    // Remove special characters and split into words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/);
    
    // Filter out stop words and short words
    return words.filter(word => 
      word.length > 2 && 
      !this.stopWords.has(word) &&
      !/^\d+$/.test(word)
    );
  }

  // Categorize a domain
  categorizeDomain(domain) {
    // Check known categories first
    const knownCategory = this.domainCategories[domain];
    if (knownCategory) return knownCategory;
    
    // Simple heuristic-based categorization
    if (domain.endsWith('.edu')) return 'education';
    if (domain.endsWith('.gov')) return 'government';
    if (domain.endsWith('.org')) return 'organization';
    
    // Check for common patterns
    if (domain.includes('docs.')) return 'documentation';
    if (domain.includes('api.')) return 'api';
    if (domain.includes('blog.')) return 'blog';
    
    return 'other';
  }

  // Analyze browser history
  async analyzeHistory() {
    const now = Date.now();
    
    // Only analyze once per day
    if (now - this.lastAnalysisTime < this.analysisInterval) {
      console.log('Skipping history analysis - too soon since last analysis');
      return this.getAnalysisResults();
    }
    
    console.log('Starting history analysis...');
    this.lastAnalysisTime = now;
    
    try {
      // Get history from the last 30 days
      const endTime = now;
      const startTime = endTime - (30 * 24 * 60 * 60 * 1000);
      
      const historyItems = await new Promise((resolve) => {
        chrome.history.search(
          { text: '', startTime, endTime, maxResults: 10000 },
          resolve
        );
      });
      
      // Reset weights
      this.domainWeights = {};
      this.keywordWeights = {};
      this.categoryWeights = {};
      
      // Process each history item
      for (const item of historyItems) {
        if (!item.url) continue;
        
        const domain = this.extractMainDomain(item.url);
        if (!domain) continue;
        
        // Skip internal Chrome pages
        if (domain === 'chrome.google.com' || domain.startsWith('chrome-extension://')) {
          continue;
        }
        
        // Update domain weight (visitCount is not always available)
        this.domainWeights[domain] = (this.domainWeights[domain] || 0) + 1;
        
        // Categorize domain
        const category = this.categorizeDomain(domain);
        this.categoryWeights[category] = (this.categoryWeights[category] || 0) + 1;
        
        // Extract keywords from title and URL
        const titleKeywords = this.extractKeywords(item.title);
        const urlKeywords = this.extractKeywords(item.url);
        
        // Update keyword weights
        [...titleKeywords, ...urlKeywords].forEach(keyword => {
          this.keywordWeights[keyword] = (this.keywordWeights[keyword] || 0) + 1;
        });
      }
      
      // Save analysis results
      await this.saveAnalysisResults();
      console.log('History analysis completed');
      
      return this.getAnalysisResults();
      
    } catch (error) {
      console.error('Error analyzing history:', error);
      throw error;
    }
  }
  
  // Save analysis results to storage
  async saveAnalysisResults() {
    const results = this.getAnalysisResults();
    await chrome.storage.local.set({
      historyAnalysis: {
        ...results,
        lastUpdated: Date.now()
      }
    });
  }
  
  // Get current analysis results
  getAnalysisResults() {
    // Sort domains by weight
    const sortedDomains = Object.entries(this.domainWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50) // Top 50 domains
      .reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    
    // Sort keywords by weight
    const sortedKeywords = Object.entries(this.keywordWeights)
      .filter(([keyword]) => keyword.length > 3) // Only include longer keywords
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100) // Top 100 keywords
      .reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    
    // Sort categories by weight
    const sortedCategories = Object.entries(this.categoryWeights)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    
    return {
      domains: sortedDomains,
      keywords: sortedKeywords,
      categories: sortedCategories,
      lastUpdated: this.lastAnalysisTime
    };
  }
  
  // Load analysis results from storage
  async loadAnalysisResults() {
    const result = await chrome.storage.local.get('historyAnalysis');
    if (result.historyAnalysis) {
      const { domains, keywords, categories, lastUpdated } = result.historyAnalysis;
      this.domainWeights = domains || {};
      this.keywordWeights = keywords || {};
      this.categoryWeights = categories || {};
      this.lastAnalysisTime = lastUpdated || 0;
      return true;
    }
    return false;
  }
  
  // Get user interests based on analysis
  getUserInterests() {
    const results = this.getAnalysisResults();
    const interests = [];
    
    // Top domains (excluding common ones)
    const topDomains = Object.entries(results.domains)
      .filter(([domain]) => !['google.com', 'youtube.com', 'github.com'].includes(domain))
      .slice(0, 5);
    
    // Top keywords
    const topKeywords = Object.entries(results.keywords)
      .filter(([keyword]) => !['http', 'https', 'www'].includes(keyword))
      .slice(0, 10);
    
    // Top categories
    const topCategories = Object.entries(results.categories).slice(0, 5);
    
    return {
      domains: topDomains.map(([domain, count]) => ({ domain, count })),
      keywords: topKeywords.map(([keyword, count]) => ({ keyword, count })),
      categories: topCategories.map(([category, count]) => ({ category, count })),
      lastUpdated: new Date(results.lastUpdated).toISOString()
    };
  }
}

// Export a singleton instance
export const historyAnalyzer = new HistoryAnalyzer();

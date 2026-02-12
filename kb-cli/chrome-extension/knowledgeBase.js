class KnowledgeBaseIntegrator {
  constructor() {
    this.insightTypes = {
      BROWSING_INTEREST: 'browsing_interest',
      FREQUENT_DOMAIN: 'frequent_domain',
      TOPIC_ENGAGEMENT: 'topic_engagement',
      TIME_PATTERN: 'time_pattern'
    };
  }

  /**
   * Process browser history insights and prepare for KB integration
   * @param {Object} analysis - The analysis results from historyAnalyzer
   * @returns {Array} Array of knowledge items ready for the KB
   */
  processInsights(analysis) {
    const insights = [];
    const timestamp = new Date().toISOString();
    const { interests = {} } = analysis;

    // Process categories
    if (interests.categories) {
      insights.push(...this._processCategories(interests.categories, timestamp));
    }

    // Process keywords
    if (interests.keywords) {
      insights.push(...this._processKeywords(interests.keywords, timestamp));
    }

    // Process domains
    if (interests.domains) {
      insights.push(...this._processDomains(interests.domains, timestamp));
    }

    return insights;
  }

  /**
   * Process category insights
   * @private
   */
  _processCategories(categories, timestamp) {
    return categories.map(category => ({
      type: this.insightTypes.TOPIC_ENGAGEMENT,
      timestamp,
      data: {
        category: category.category,
        engagement_score: this._calculateEngagementScore(category.count),
        evidence: `${category.count} visits to ${category.category} related content`
      },
      metadata: {
        source: 'browser_history',
        confidence: this._calculateConfidence(category.count)
      }
    }));
  }

  /**
   * Process keyword insights
   * @private
   */
  _processKeywords(keywords, timestamp) {
    return keywords.map(keyword => ({
      type: this.insightTypes.BROWSING_INTEREST,
      timestamp,
      data: {
        keyword: keyword.keyword,
        frequency: keyword.count,
        normalized_frequency: this._normalizeFrequency(keyword.count, 100), // Assuming max 100 as reference
        context: 'browsing_history',
        related_domains: [] // Can be populated with domains where this keyword appears
      },
      metadata: {
        source: 'browser_history',
        last_updated: timestamp,
        confidence: this._calculateConfidence(keyword.count)
      }
    }));
  }

  /**
   * Process domain insights
   * @private
   */
  _processDomains(domains, timestamp) {
    return domains.map(domain => ({
      type: this.insightTypes.FREQUENT_DOMAIN,
      timestamp,
      data: {
        domain: domain.domain,
        visit_count: domain.count,
        first_seen: timestamp, // Would be updated with actual first seen in a real implementation
        last_visited: timestamp
      },
      metadata: {
        source: 'browser_history',
        category: this._categorizeDomain(domain.domain),
        engagement: this._calculateEngagementScore(domain.count)
      }
    }));
  }

  /**
   * Calculate a normalized engagement score (0-1)
   * @private
   */
  _calculateEngagementScore(count) {
    // Simple logarithmic scaling - can be adjusted based on your needs
    return Math.min(1, Math.log10(count + 1) / 2);
  }

  /**
   * Calculate confidence score (0-1)
   * @private
   */
  _calculateConfidence(count) {
    // Simple confidence calculation based on visit count
    return Math.min(1, count / 10);
  }

  /**
   * Normalize frequency to a 0-1 range
   * @private
   */
  _normalizeFrequency(count, max) {
    return Math.min(1, count / max);
  }

  /**
   * Categorize domain based on patterns
   * @private
   */
  _categorizeDomain(domain) {
    const domainPatterns = {
      'github.com': 'development',
      'stackoverflow.com': 'development',
      'medium.com': 'blog',
      'youtube.com': 'video',
      'reddit.com': 'social',
      'twitter.com': 'social',
      'linkedin.com': 'professional',
      'wikipedia.org': 'reference',
      'docs.': 'documentation',
      'api.': 'api',
      '.edu': 'education',
      '.gov': 'government'
    };

    for (const [pattern, category] of Object.entries(domainPatterns)) {
      if (domain.includes(pattern)) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * Merge new insights with existing knowledge
   * @param {Array} existingKnowledge - Current knowledge base entries
   * @param {Array} newInsights - New insights to merge
   * @returns {Array} Merged knowledge base
   */
  mergeWithExistingKnowledge(existingKnowledge = [], newInsights = []) {
    const knowledgeMap = new Map();
    
    // Add existing knowledge to map
    existingKnowledge.forEach(item => {
      const key = this._generateKnowledgeKey(item);
      if (key) knowledgeMap.set(key, { ...item });
    });

    // Merge new insights
    newInsights.forEach(insight => {
      const key = this._generateKnowledgeKey(insight);
      
      if (!key) return;
      
      if (knowledgeMap.has(key)) {
        // Update existing entry
        const existing = knowledgeMap.get(key);
        knowledgeMap.set(key, this._mergeInsight(existing, insight));
      } else {
        // Add new entry
        knowledgeMap.set(key, { ...insight });
      }
    });

    return Array.from(knowledgeMap.values());
  }

  /**
   * Generate a unique key for a knowledge item
   * @private
   */
  _generateKnowledgeKey(insight) {
    switch (insight.type) {
      case this.insightTypes.BROWSING_INTEREST:
        return `interest_${insight.data.keyword.toLowerCase()}`;
      case this.insightTypes.FREQUENT_DOMAIN:
        return `domain_${insight.data.domain}`;
      case this.insightTypes.TOPIC_ENGAGEMENT:
        return `topic_${insight.data.category.toLowerCase()}`;
      default:
        return null;
    }
  }

  /**
   * Merge two insights
   * @private
   */
  _mergeInsight(existing, update) {
    // Create a deep copy to avoid mutation
    const merged = JSON.parse(JSON.stringify(existing));
    
    // Update timestamp
    merged.timestamp = update.timestamp;
    
    // Merge data based on type
    switch (update.type) {
      case this.insightTypes.BROWSING_INTEREST:
        merged.data.frequency += update.data.frequency;
        merged.data.normalized_frequency = this._normalizeFrequency(
          merged.data.frequency,
          Math.max(100, merged.data.frequency * 1.5)
        );
        break;
        
      case this.insightTypes.FREQUENT_DOMAIN:
        merged.data.visit_count += update.data.visit_count;
        merged.data.last_visited = update.timestamp;
        break;
        
      case this.insightTypes.TOPIC_ENGAGEMENT:
        merged.data.engagement_score = Math.max(
          existing.data.engagement_score,
          update.data.engagement_score
        );
        merged.data.evidence = [
          ...(Array.isArray(existing.data.evidence) 
            ? existing.data.evidence 
            : [existing.data.evidence]),
          update.data.evidence
        ];
        break;
    }
    
    // Update metadata
    merged.metadata = {
      ...merged.metadata,
      ...update.metadata,
      last_updated: update.timestamp,
      // Keep the higher confidence score
      confidence: Math.max(
        existing.metadata?.confidence || 0,
        update.metadata?.confidence || 0
      )
    };
    
    return merged;
  }
}

// Export a singleton instance
export const knowledgeBaseIntegrator = new KnowledgeBaseIntegrator();

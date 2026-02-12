class KnowledgeApiClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache TTL
  }

  /**
   * Send a request to the knowledge base API
   * @private
   */
  async _sendRequest(endpoint, method = 'GET', data = null, apiKey = '') {
    const url = `${this.apiUrl}${endpoint}`;
    const cacheKey = `${method}:${url}:${JSON.stringify(data || {})}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const options = {
      method,
      headers,
      credentials: 'include',
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Cache successful responses
      if (method === 'GET') {
        this.cache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now()
        });
      }
      
      return responseData;
    } catch (error) {
      console.error('Knowledge API request failed:', error);
      throw error;
    }
  }

  /**
   * Search the knowledge base
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {string} apiKey - Optional API key
   */
  async searchKnowledge(query, options = {}, apiKey = '') {
    return this._sendRequest(
      '/knowledge/search',
      'POST',
      { query, ...options },
      apiKey
    );
  }

  /**
   * Add or update knowledge items
   * @param {Array} items - Knowledge items to sync
   * @param {string} apiKey - API key for authentication
   */
  async syncKnowledge(items, apiKey) {
    if (!apiKey) {
      throw new Error('API key is required for syncing knowledge');
    }
    
    return this._sendRequest(
      '/knowledge/sync',
      'POST',
      { items, timestamp: new Date().toISOString() },
      apiKey
    );
  }

  /**
   * Get related knowledge for a given context
   * @param {Object} context - Context for finding related knowledge
   * @param {string} apiKey - Optional API key
   */
  async getRelatedKnowledge(context, apiKey = '') {
    return this._sendRequest(
      '/knowledge/related',
      'POST',
      { context },
      apiKey
    );
  }

  /**
   * Get knowledge statistics
   * @param {string} apiKey - Optional API key
   */
  async getKnowledgeStats(apiKey = '') {
    return this._sendRequest(
      '/knowledge/stats',
      'GET',
      null,
      apiKey
    );
  }

  /**
   * Clear the API cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export a singleton instance
const knowledgeApi = new KnowledgeApiClient('http://localhost:8000/api');
export default knowledgeApi;

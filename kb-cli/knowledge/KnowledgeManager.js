class KnowledgeManager {
  constructor() {
    this.knowledgeBase = new Map();
    this.searchIndex = new Map();
    this.tags = new Map();
    this.initialize();
  }

  async initialize() {
    // Load existing knowledge from storage
    const data = await chrome.storage.local.get('knowledgeBase');
    if (data.knowledgeBase) {
      this.knowledgeBase = new Map(JSON.parse(data.knowledgeBase));
      this.rebuildIndex();
    }
    
    // Set up auto-save
    setInterval(() => this.saveToStorage(), 30000); // Auto-save every 30 seconds
  }

  async addEntry(entry) {
    if (!entry.id) {
      entry.id = this.generateId();
    }
    
    entry.createdAt = entry.createdAt || new Date().toISOString();
    entry.updatedAt = new Date().toISOString();
    entry.tags = entry.tags || [];
    
    this.knowledgeBase.set(entry.id, entry);
    this.updateIndex(entry);
    
    await this.saveToStorage();
    return entry;
  }

  updateIndex(entry) {
    // Remove old index entries
    this.removeFromIndex(entry.id);
    
    // Add to search index
    const searchableText = `${entry.title} ${entry.content} ${entry.tags.join(' ')}`.toLowerCase();
    const words = new Set(searchableText.split(/\s+/));
    
    words.forEach(word => {
      if (word.length < 3) return; // Skip short words
      
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word).add(entry.id);
    });
    
    // Update tags index
    entry.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      if (!this.tags.has(normalizedTag)) {
        this.tags.set(normalizedTag, new Set());
      }
      this.tags.get(normalizedTag).add(entry.id);
    });
  }

  removeFromIndex(entryId) {
    // Remove from search index
    for (const [word, entries] of this.searchIndex.entries()) {
      if (entries.has(entryId)) {
        entries.delete(entryId);
        if (entries.size === 0) {
          this.searchIndex.delete(word);
        }
      }
    }
    
    // Remove from tags index
    for (const [tag, entries] of this.tags.entries()) {
      if (entries.has(entryId)) {
        entries.delete(entryId);
        if (entries.size === 0) {
          this.tags.delete(tag);
        }
      }
    }
  }

  async search(query, options = {}) {
    const { limit = 10, offset = 0, tags = [] } = options;
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    
    // Find matching entries
    const matches = new Map();
    
    // Search by keywords
    queryWords.forEach(word => {
      if (this.searchIndex.has(word)) {
        this.searchIndex.get(word).forEach(entryId => {
          matches.set(entryId, (matches.get(entryId) || 0) + 1);
        });
      }
    });
    
    // Filter by tags if specified
    if (tags.length > 0) {
      const tagMatches = new Set();
      tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        if (this.tags.has(normalizedTag)) {
          this.tags.get(normalizedTag).forEach(id => tagMatches.add(id));
        }
      });
      
      // Only keep entries that match all required tags
      for (const [entryId] of matches) {
        if (!tagMatches.has(entryId)) {
          matches.delete(entryId);
        }
      }
    }
    
    // Sort by relevance (number of matching words)
    const sortedResults = Array.from(matches.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by score descending
      .slice(offset, offset + limit)
      .map(([entryId]) => this.knowledgeBase.get(entryId));
    
    return {
      results: sortedResults,
      total: matches.size,
      offset,
      limit
    };
  }

  async getEntry(id) {
    return this.knowledgeBase.get(id);
  }

  async updateEntry(id, updates) {
    const entry = this.knowledgeBase.get(id);
    if (!entry) return null;
    
    const updatedEntry = { ...entry, ...updates, updatedAt: new Date().toISOString() };
    this.knowledgeBase.set(id, updatedEntry);
    this.updateIndex(updatedEntry);
    
    await this.saveToStorage();
    return updatedEntry;
  }

  async deleteEntry(id) {
    if (this.knowledgeBase.has(id)) {
      this.removeFromIndex(id);
      this.knowledgeBase.delete(id);
      await this.saveToStorage();
      return true;
    }
    return false;
  }

  async saveToStorage() {
    const serialized = JSON.stringify(Array.from(this.knowledgeBase.entries()));
    await chrome.storage.local.set({ knowledgeBase: serialized });
  }

  rebuildIndex() {
    this.searchIndex.clear();
    this.tags.clear();
    
    for (const entry of this.knowledgeBase.values()) {
      this.updateIndex(entry);
    }
  }

  generateId() {
    return 'kb_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export as a singleton
export const knowledgeManager = new KnowledgeManager();

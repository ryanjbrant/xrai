import { knowledgeManager } from '../knowledge/KnowledgeManager.js';

class KnowledgeSearch {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.tagFilters = document.getElementById('tagFilters');
    this.searchResults = document.getElementById('searchResults');
    this.addButton = document.getElementById('addKnowledgeButton');
    
    this.selectedTags = new Set();
    this.allTags = new Set();
    this.currentResults = [];
    
    this.initialize();
  }
  
  async initialize() {
    // Initialize event listeners
    this.searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });
    
    this.searchButton.addEventListener('click', () => this.performSearch());
    this.addButton.addEventListener('click', () => this.showAddKnowledgeModal());
    
    // Load popular tags
    await this.loadPopularTags();
    
    // Initial search
    this.performSearch();
  }
  
  async performSearch() {
    const query = this.searchInput.value.trim();
    const results = await knowledgeManager.search(query, {
      tags: Array.from(this.selectedTags)
    });
    
    this.currentResults = results.results;
    this.displayResults(results);
  }
  
  displayResults(results) {
    if (results.results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="empty-state">
          <p>No results found. Try different keywords or add a new entry.</p>
        </div>
      `;
      return;
    }
    
    this.searchResults.innerHTML = results.results.map(entry => this.createResultCard(entry)).join('\n');
    
    // Add event listeners to result cards
    document.querySelectorAll('.result-card').forEach((card, index) => {
      card.addEventListener('click', () => this.showEntryDetails(results.results[index]));
    });
  }
  
  createResultCard(entry) {
    const highlightText = (text) => {
      if (!this.searchInput.value.trim()) return text;
      const searchTerms = this.searchInput.value.toLowerCase().split(/\s+/);
      let highlighted = text;
      
      searchTerms.forEach(term => {
        if (term.length < 3) return;
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="highlight">$1</span>');
      });
      
      return highlighted;
    };
    
    const snippet = entry.content.length > 200 
      ? entry.content.substring(0, 200) + '...' 
      : entry.content;
    
    return `
      <div class="result-card" data-id="${entry.id}">
        <h3 class="result-title">${highlightText(entry.title)}</h3>
        <div class="result-content">${highlightText(snippet)}</div>
        <div class="result-meta">
          <div class="result-tags">
            ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="result-date">
            ${new Date(entry.updatedAt || entry.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
  }
  
  async loadPopularTags() {
    // Get all tags and their frequencies
    const tagCounts = new Map();
    
    // This would be more efficient with a proper database index
    for (const entry of knowledgeManager.knowledgeBase.values()) {
      entry.tags.forEach(tag => {
        const count = tagCounts.get(tag) || 0;
        tagCounts.set(tag, count + 1);
      });
    }
    
    // Sort by frequency and take top 10
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
    
    // Update UI
    this.tagFilters.innerHTML = sortedTags
      .map(tag => `
        <div class="tag ${this.selectedTags.has(tag) ? 'active' : ''}" 
             data-tag="${tag}">
          ${tag} (${tagCounts.get(tag)})
        </div>
      `).join('');
    
    // Add event listeners to tags
    document.querySelectorAll('.tag').forEach(tagEl => {
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = tagEl.dataset.tag;
        
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
          tagEl.classList.remove('active');
        } else {
          this.selectedTags.add(tag);
          tagEl.classList.add('active');
        }
        
        this.performSearch();
      });
    });
  }
  
  showAddKnowledgeModal(initialData = {}) {
    // In a real implementation, this would show a modal for adding new knowledge
    // For now, we'll just log to console
    console.log('Add knowledge:', initialData);
    
    // Example of how this might work:
    const title = prompt('Title:');
    if (!title) return;
    
    const content = prompt('Content:');
    const tags = prompt('Tags (comma-separated):', '').split(',').map(t => t.trim()).filter(Boolean);
    
    knowledgeManager.addEntry({
      title,
      content,
      tags,
      source: 'manual',
      url: window.location.href
    }).then(() => {
      this.performSearch();
      this.loadPopularTags();
    });
  }
  
  showEntryDetails(entry) {
    // In a real implementation, this would show a detailed view of the entry
    // For now, we'll just log to console
    console.log('Entry details:', entry);
    
    // Example of a detailed view
    const details = `
      <div class="entry-details">
        <h2>${entry.title}</h2>
        <div class="entry-meta">
          <span>Created: ${new Date(entry.createdAt).toLocaleString()}</span>
          ${entry.updatedAt ? `<span>Updated: ${new Date(entry.updatedAt).toLocaleString()}</span>` : ''}
          ${entry.url ? `<a href="${entry.url}" target="_blank">Source</a>` : ''}
        </div>
        <div class="entry-content">
          ${entry.content.replace(/\n/g, '<br>')}
        </div>
        <div class="entry-actions">
          <button id="editEntry">Edit</button>
          <button id="deleteEntry">Delete</button>
        </div>
      </div>
    `;
    
    this.searchResults.innerHTML = details;
    
    // Add event listeners for actions
    document.getElementById('editEntry')?.addEventListener('click', () => this.showAddKnowledgeModal(entry));
    document.getElementById('deleteEntry')?.addEventListener('click', () => this.deleteEntry(entry.id));
  }
  
  async deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
      await knowledgeManager.deleteEntry(id);
      this.performSearch();
      this.loadPopularTags();
    }
  }
}

// Initialize the search interface when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.knowledgeSearch = new KnowledgeSearch();
});

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Memory Manager - Handles short-term and long-term memory for AI Persons
 * Each AI Person has their own memory store linked by their unique ID
 */
class MemoryManager {
  constructor() {
    this.storageDir = path.join(__dirname, 'data');
    this.shortTermMemory = new Map(); // Session-based memory
    this.longTermMemory = new Map();  // Persistent memory per AI Person
    this.factsMemory = new Map();     // Specialized facts storage
    this.initialized = false;
  }

  /**
   * Initialize memory storage
   */
  async initialize() {
    try {
      // Ensure storage directory exists
      await fs.mkdir(this.storageDir, { recursive: true });

      // Load long-term memories
      await this.loadLongTermMemories();
      
      // Load facts memories
      await this.loadFactsMemories();

      this.initialized = true;
      console.log('🧠 Memory Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Memory Manager:', error);
      throw error;
    }
  }

  /**
   * Load long-term memories from storage
   */
  async loadLongTermMemories() {
    const filePath = path.join(this.storageDir, 'long-term-memories.json');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const memories = JSON.parse(data);
      
      // Convert to Map structure
      Object.entries(memories).forEach(([aiPersonId, memory]) => {
        this.longTermMemory.set(aiPersonId, memory);
      });
      
      console.log(`📚 Loaded long-term memories for ${this.longTermMemory.size} AI Persons`);
    } catch (error) {
      // File doesn't exist yet
      console.log('📚 No existing long-term memories found');
    }
  }

  /**
   * Load facts memories from storage
   */
  async loadFactsMemories() {
    const filePath = path.join(this.storageDir, 'facts-memories.json');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const facts = JSON.parse(data);
      
      // Convert to Map structure
      Object.entries(facts).forEach(([aiPersonId, factsList]) => {
        this.factsMemory.set(aiPersonId, factsList);
      });
      
      console.log(`📖 Loaded facts for ${this.factsMemory.size} AI Persons`);
    } catch (error) {
      // File doesn't exist yet
      console.log('📖 No existing facts memories found');
    }
  }

  /**
   * Save long-term memories to storage
   */
  async saveLongTermMemories() {
    const filePath = path.join(this.storageDir, 'long-term-memories.json');
    const data = Object.fromEntries(this.longTermMemory);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Save facts memories to storage
   */
  async saveFactsMemories() {
    const filePath = path.join(this.storageDir, 'facts-memories.json');
    const data = Object.fromEntries(this.factsMemory);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Get or create short-term memory for a session
   */
  getShortTermMemory(sessionId) {
    if (!this.shortTermMemory.has(sessionId)) {
      this.shortTermMemory.set(sessionId, {
        messages: [],
        context: {},
        createdAt: new Date().toISOString()
      });
    }
    return this.shortTermMemory.get(sessionId);
  }

  /**
   * Add message to short-term memory
   */
  addToShortTermMemory(sessionId, role, content) {
    const memory = this.getShortTermMemory(sessionId);
    memory.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    // Keep only last 40 messages (20 exchanges)
    if (memory.messages.length > 40) {
      memory.messages = memory.messages.slice(-40);
    }
  }

  /**
   * Get or create long-term memory for an AI Person
   */
  getLongTermMemory(aiPersonId) {
    if (!this.longTermMemory.has(aiPersonId)) {
      this.longTermMemory.set(aiPersonId, {
        conversations: [],
        preferences: {},
        relationships: {},
        experiences: [],
        createdAt: new Date().toISOString()
      });
    }
    return this.longTermMemory.get(aiPersonId);
  }

  /**
   * Transfer important information from short-term to long-term memory
   */
  async consolidateMemory(sessionId, aiPersonId) {
    const shortTerm = this.getShortTermMemory(sessionId);
    const longTerm = this.getLongTermMemory(aiPersonId);

    // Extract key information from the conversation
    const summary = this.summarizeConversation(shortTerm.messages);
    
    // Add to long-term memory
    longTerm.conversations.push({
      sessionId,
      summary,
      timestamp: new Date().toISOString(),
      messageCount: shortTerm.messages.length
    });

    // Keep only last 100 conversation summaries
    if (longTerm.conversations.length > 100) {
      longTerm.conversations = longTerm.conversations.slice(-100);
    }

    // Save to storage
    await this.saveLongTermMemories();

    console.log(`💾 Consolidated memory for AI Person ${aiPersonId}`);
  }

  /**
   * Summarize a conversation (simplified version)
   */
  summarizeConversation(messages) {
    if (messages.length === 0) return "No conversation";
    
    // Extract topics discussed (simplified - in production use NLP)
    const topics = [];
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    
    // Simple keyword extraction
    const keywords = userMessages.join(' ').toLowerCase().split(/\s+/)
      .filter(word => word.length > 4)
      .filter((word, index, self) => self.indexOf(word) === index)
      .slice(0, 10);

    return {
      topics: keywords,
      messageCount: messages.length,
      firstMessage: messages[0]?.content?.substring(0, 100),
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100)
    };
  }

  /**
   * Get or create facts memory for an AI Person
   */
  getFactsMemory(aiPersonId) {
    if (!this.factsMemory.has(aiPersonId)) {
      this.factsMemory.set(aiPersonId, []);
    }
    return this.factsMemory.get(aiPersonId);
  }

  /**
   * Add a fact to the AI Person's knowledge base
   */
  async addFact(aiPersonId, fact, category = 'general') {
    const facts = this.getFactsMemory(aiPersonId);
    
    // Check if fact already exists
    const exists = facts.some(f => f.fact === fact);
    if (!exists) {
      facts.push({
        fact,
        category,
        addedAt: new Date().toISOString(),
        confidence: 1.0
      });

      // Save to storage
      await this.saveFactsMemories();
      
      console.log(`📝 Added fact for AI Person ${aiPersonId}: ${fact}`);
    }
  }

  /**
   * Search facts by category or keyword
   */
  searchFacts(aiPersonId, query, category = null) {
    const facts = this.getFactsMemory(aiPersonId);
    
    return facts.filter(f => {
      const matchesCategory = !category || f.category === category;
      const matchesQuery = !query || f.fact.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }

  /**
   * Get relevant context for a conversation
   */
  getRelevantContext(aiPersonId, currentMessage) {
    const longTerm = this.getLongTermMemory(aiPersonId);
    const facts = this.getFactsMemory(aiPersonId);
    
    // Get recent conversation summaries
    const recentConversations = longTerm.conversations.slice(-5);
    
    // Get relevant facts (simplified - in production use semantic search)
    const keywords = currentMessage.toLowerCase().split(/\s+/);
    const relevantFacts = facts.filter(f => 
      keywords.some(keyword => f.fact.toLowerCase().includes(keyword))
    ).slice(0, 5);

    return {
      recentConversations,
      relevantFacts,
      preferences: longTerm.preferences,
      relationships: longTerm.relationships
    };
  }

  /**
   * Clear short-term memory for a session
   */
  clearShortTermMemory(sessionId) {
    this.shortTermMemory.delete(sessionId);
    console.log(`🧹 Cleared short-term memory for session ${sessionId}`);
  }

  /**
   * Update user preferences in long-term memory
   */
  async updatePreferences(aiPersonId, preferences) {
    const longTerm = this.getLongTermMemory(aiPersonId);
    longTerm.preferences = {
      ...longTerm.preferences,
      ...preferences,
      lastUpdated: new Date().toISOString()
    };
    await this.saveLongTermMemories();
  }

  /**
   * Update relationship information
   */
  async updateRelationship(aiPersonId, relationshipData) {
    const longTerm = this.getLongTermMemory(aiPersonId);
    longTerm.relationships = {
      ...longTerm.relationships,
      ...relationshipData,
      lastUpdated: new Date().toISOString()
    };
    await this.saveLongTermMemories();
  }

  /**
   * Delete all memory data for an AI Person
   */
  async deleteAIPersonMemory(aiPersonId) {
    // Delete from long-term memory
    this.longTermMemory.delete(aiPersonId);
    
    // Delete from facts memory
    this.factsMemory.delete(aiPersonId);
    
    // Clear any short-term memory sessions associated with this AI Person
    for (const [sessionId, session] of this.shortTermMemory.entries()) {
      if (session.aiPersonId === aiPersonId) {
        this.shortTermMemory.delete(sessionId);
      }
    }
    
    // Save changes to storage
    await this.saveLongTermMemories();
    await this.saveFactsMemories();
    
    console.log(`🗑️ Deleted all memory data for AI Person ${aiPersonId}`);
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

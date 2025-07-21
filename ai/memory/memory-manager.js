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
    
    // Automatically extract facts from the conversation
    await this.extractAndStoreFacts(shortTerm.messages, aiPersonId);
    
    // Extract user preferences from the conversation
    await this.extractAndStorePreferences(shortTerm.messages, aiPersonId);
    
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

    console.log(`💾 Consolidated memory for AI Person ${aiPersonId} with automatic fact extraction`);
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
   * Automatically extract facts from conversation messages
   */
  async extractAndStoreFacts(messages, aiPersonId) {
    const userMessages = messages.filter(m => m.role === 'user');
    
    for (const message of userMessages) {
      const extractedFacts = this.extractFactsFromMessage(message.content);
      
      for (const fact of extractedFacts) {
        await this.addFact(aiPersonId, fact.text, fact.category);
      }
    }
  }

  /**
   * Extract facts from a single message using pattern matching
   */
  extractFactsFromMessage(messageContent) {
    const facts = [];
    const text = messageContent.toLowerCase();
    
    // Personal information patterns
    const personalPatterns = [
      // Name patterns
      { pattern: /(?:my name is|i'm|i am|call me|i'm called)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g, category: 'personal', type: 'name' },
      // Age patterns
      { pattern: /(?:i'm|i am|my age is)\s+(\d{1,3})\s*(?:years?\s*old)?/g, category: 'personal', type: 'age' },
      // Location patterns
      { pattern: /(?:i live in|i'm from|i'm in|my location is|i'm located in)\s+([a-zA-Z\s,]+)/g, category: 'personal', type: 'location' },
      // Occupation patterns
      { pattern: /(?:i work as|i'm a|i am a|my job is|i work at|my occupation is)\s+([a-zA-Z\s]+)/g, category: 'personal', type: 'occupation' },
      // Relationship status
      { pattern: /(?:i'm|i am)\s+(married|single|divorced|in a relationship|dating)/g, category: 'personal', type: 'relationship_status' },
    ];

    // Preference patterns
    const preferencePatterns = [
      // Likes/dislikes
      { pattern: /i (?:really )?(?:love|like|enjoy|prefer)\s+([a-zA-Z\s]+)/g, category: 'preferences', type: 'likes' },
      { pattern: /i (?:really )?(?:hate|dislike|don't like|can't stand)\s+([a-zA-Z\s]+)/g, category: 'preferences', type: 'dislikes' },
      // Hobbies
      { pattern: /(?:my hobby is|my hobbies are|i enjoy|i like to)\s+([a-zA-Z\s]+)/g, category: 'preferences', type: 'hobbies' },
      // Food preferences
      { pattern: /(?:my favorite food is|i love eating|i enjoy)\s+([a-zA-Z\s]+)/g, category: 'preferences', type: 'food' },
    ];

    // Goals and aspirations
    const goalPatterns = [
      { pattern: /(?:i want to|i plan to|my goal is to|i hope to|i'm planning to)\s+([a-zA-Z\s]+)/g, category: 'goals', type: 'aspiration' },
      { pattern: /(?:i'm working on|i'm trying to|i'm learning)\s+([a-zA-Z\s]+)/g, category: 'goals', type: 'current_work' },
    ];

    // Family and relationships
    const relationshipPatterns = [
      { pattern: /(?:my|i have a)\s+(husband|wife|boyfriend|girlfriend|partner|mother|father|sister|brother|son|daughter|child|children)/g, category: 'relationships', type: 'family' },
      { pattern: /(?:my|i have)\s+(\d+)\s+(kids|children|sons|daughters)/g, category: 'relationships', type: 'children_count' },
    ];

    // Combine all patterns
    const allPatterns = [...personalPatterns, ...preferencePatterns, ...goalPatterns, ...relationshipPatterns];

    for (const patternObj of allPatterns) {
      let match;
      while ((match = patternObj.pattern.exec(text)) !== null) {
        const extractedValue = match[1].trim();
        
        // Skip very short or generic extractions
        if (extractedValue.length < 2 || ['a', 'an', 'the', 'is', 'am', 'are'].includes(extractedValue)) {
          continue;
        }

        // Create fact text based on type
        let factText;
        switch (patternObj.type) {
          case 'name':
            factText = `User's name is ${extractedValue}`;
            break;
          case 'age':
            factText = `User is ${extractedValue} years old`;
            break;
          case 'location':
            factText = `User lives in ${extractedValue}`;
            break;
          case 'occupation':
            factText = `User works as ${extractedValue}`;
            break;
          case 'relationship_status':
            factText = `User is ${extractedValue}`;
            break;
          case 'likes':
            factText = `User likes ${extractedValue}`;
            break;
          case 'dislikes':
            factText = `User dislikes ${extractedValue}`;
            break;
          case 'hobbies':
            factText = `User enjoys ${extractedValue}`;
            break;
          case 'food':
            factText = `User's favorite food includes ${extractedValue}`;
            break;
          case 'aspiration':
            factText = `User wants to ${extractedValue}`;
            break;
          case 'current_work':
            factText = `User is working on ${extractedValue}`;
            break;
          case 'family':
            factText = `User has a ${extractedValue}`;
            break;
          case 'children_count':
            factText = `User has ${extractedValue} children`;
            break;
          default:
            factText = `User mentioned: ${extractedValue}`;
        }

        facts.push({
          text: factText,
          category: patternObj.category,
          confidence: 0.8,
          extractedFrom: messageContent.substring(0, 100) + '...'
        });
      }
    }

    return facts;
  }

  /**
   * Extract and store user preferences from conversation
   */
  async extractAndStorePreferences(messages, aiPersonId) {
    const userMessages = messages.filter(m => m.role === 'user');
    
    const preferences = {};
    
    for (const message of userMessages) {
      const text = message.content.toLowerCase();
      
      // Communication style preferences
      if (text.includes('formal') || text.includes('professional')) {
        preferences.communicationStyle = 'formal';
      } else if (text.includes('casual') || text.includes('relaxed') || text.includes('informal')) {
        preferences.communicationStyle = 'casual';
      }
      
      // Response length preferences
      if (text.includes('brief') || text.includes('short') || text.includes('concise')) {
        preferences.responseLength = 'short';
      } else if (text.includes('detailed') || text.includes('thorough') || text.includes('comprehensive')) {
        preferences.responseLength = 'detailed';
      }
      
      // Topic interests
      const topicKeywords = {
        technology: ['tech', 'computer', 'programming', 'software', 'ai', 'artificial intelligence'],
        science: ['science', 'physics', 'chemistry', 'biology', 'research'],
        arts: ['art', 'music', 'painting', 'drawing', 'creative'],
        sports: ['sport', 'football', 'basketball', 'tennis', 'exercise', 'fitness'],
        business: ['business', 'entrepreneur', 'startup', 'marketing', 'finance'],
        health: ['health', 'wellness', 'nutrition', 'medical', 'fitness']
      };
      
      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          if (!preferences.interests) preferences.interests = [];
          if (!preferences.interests.includes(topic)) {
            preferences.interests.push(topic);
          }
        }
      }
    }
    
    // Update preferences if any were found
    if (Object.keys(preferences).length > 0) {
      await this.updatePreferences(aiPersonId, preferences);
      console.log(`🎯 Extracted preferences for AI Person ${aiPersonId}:`, preferences);
    }
  }

  /**
   * Automatically extract facts during conversation (real-time)
   */
  async processMessageForFacts(sessionId, aiPersonId, userMessage) {
    console.log('🔍 DEBUG: processMessageForFacts called');
    console.log('🔍 DEBUG: sessionId:', sessionId);
    console.log('🔍 DEBUG: aiPersonId:', aiPersonId);
    console.log('🔍 DEBUG: userMessage:', userMessage);
    
    if (!userMessage || userMessage.trim().length < 10) {
      console.log('🔍 DEBUG: Skipping fact extraction - message too short');
      return; // Skip very short messages
    }
    
    console.log('🔍 DEBUG: Extracting facts from message...');
    const extractedFacts = this.extractFactsFromMessage(userMessage);
    console.log('🔍 DEBUG: Extracted facts:', extractedFacts);
    
    for (const fact of extractedFacts) {
      console.log(`🔍 DEBUG: Adding fact: ${fact.text}`);
      await this.addFact(aiPersonId, fact.text, fact.category);
      console.log(`🔍 Auto-extracted fact: ${fact.text}`);
    }
    
    // Also check for immediate preferences
    const preferences = {};
    const text = userMessage.toLowerCase();
    
    // Real-time preference detection
    if (text.includes('please be more formal') || text.includes('speak formally')) {
      preferences.communicationStyle = 'formal';
    } else if (text.includes('be more casual') || text.includes('relax') || text.includes('informal')) {
      preferences.communicationStyle = 'casual';
    }
    
    if (text.includes('keep it short') || text.includes('brief please')) {
      preferences.responseLength = 'short';
    } else if (text.includes('more detail') || text.includes('explain more')) {
      preferences.responseLength = 'detailed';
    }
    
    if (Object.keys(preferences).length > 0) {
      await this.updatePreferences(aiPersonId, preferences);
      console.log(`⚡ Real-time preference update:`, preferences);
    }
    
    console.log('🔍 DEBUG: processMessageForFacts completed');
  }

  /**
   * Get enhanced context with automatic fact integration
   */
  getEnhancedContext(aiPersonId, currentMessage) {
    const context = this.getRelevantContext(aiPersonId, currentMessage);
    
    // Add recently extracted facts (last 10)
    const allFacts = this.getFactsMemory(aiPersonId);
    const recentFacts = allFacts
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 10);
    
    return {
      ...context,
      recentFacts,
      totalFactsCount: allFacts.length,
      lastFactUpdate: allFacts.length > 0 ? allFacts[allFacts.length - 1].addedAt : null
    };
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

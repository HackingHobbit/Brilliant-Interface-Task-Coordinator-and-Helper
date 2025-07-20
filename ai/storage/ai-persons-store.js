import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple file-based storage for AI Persons
 * In production, this should be replaced with a proper database
 */
class AIPersonsStore {
  constructor() {
    this.storageDir = path.join(__dirname, 'data');
    this.filePath = path.join(this.storageDir, 'ai-persons.json');
    this.aiPersons = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the storage and load existing AI Persons
   */
  async initialize() {
    try {
      // Ensure storage directory exists
      await fs.mkdir(this.storageDir, { recursive: true });

      // Try to load existing data
      try {
        const data = await fs.readFile(this.filePath, 'utf8');
        const parsed = JSON.parse(data);
        
        // Convert array back to Map
        if (Array.isArray(parsed)) {
          parsed.forEach(person => {
            // Use the aiPersonId from metadata as the key
            const id = person.metadata?.aiPersonId || person.id;
            this.aiPersons.set(id, person);
          });
        }
        
        console.log(`📁 Loaded ${this.aiPersons.size} AI Persons from storage`);
      } catch (error) {
        // File doesn't exist yet, that's okay
        console.log('📁 No existing AI Persons data found, starting fresh');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize AI Persons store:', error);
      throw error;
    }
  }

  /**
   * Save current AI Persons to file
   */
  async save() {
    if (!this.initialized) {
      throw new Error('Store not initialized');
    }

    try {
      // Convert Map to array for JSON serialization
      const data = Array.from(this.aiPersons.values());
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
      console.log(`💾 Saved ${data.length} AI Persons to storage`);
    } catch (error) {
      console.error('❌ Failed to save AI Persons:', error);
      throw error;
    }
  }

  /**
   * Get an AI Person by ID
   */
  get(id) {
    return this.aiPersons.get(id);
  }

  /**
   * Get all AI Persons
   */
  getAll() {
    return Array.from(this.aiPersons.values());
  }

  /**
   * Check if an AI Person exists
   */
  has(id) {
    return this.aiPersons.has(id);
  }

  /**
   * Add or update an AI Person
   */
  async set(id, aiPerson) {
    this.aiPersons.set(id, aiPerson);
    await this.save();
    return aiPerson;
  }

  /**
   * Delete an AI Person
   */
  async delete(id) {
    const result = this.aiPersons.delete(id);
    if (result) {
      await this.save();
    }
    return result;
  }

  /**
   * Get the size of the store
   */
  get size() {
    return this.aiPersons.size;
  }

  /**
   * Clear all AI Persons (use with caution!)
   */
  async clear() {
    this.aiPersons.clear();
    await this.save();
  }
}

// Export singleton instance
export const aiPersonsStore = new AIPersonsStore();

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storageFilePath = path.join(__dirname, 'data', 'ai-persons.json');

class AIPersonsStore {
  constructor() {
    this.aiPersons = new Map();
  }

  get size() {
    return this.aiPersons.size;
  }

  async initialize() {
    await this.load();
  }

  async load() {
    try {
      const data = await fs.readFile(storageFilePath, 'utf-8');
      const json = JSON.parse(data);
      for (const person of json) {
        // Ensure customPrompt field exists for backward compatibility
        if (!person.customPrompt) {
          person.customPrompt = '';
        }
        // Use metadata.aiPersonId as the key
        const id = person.metadata?.aiPersonId || person.id;
        if (id) {
          this.aiPersons.set(id, person);
        }
      }
      console.log(`Loaded ${this.aiPersons.size} AI Persons from storage.`);
    } catch (error) {
      console.log('No existing AI Persons storage found, starting fresh.');
    }
  }

  async save() {
    const data = JSON.stringify(Array.from(this.aiPersons.values()), null, 2);
    await fs.writeFile(storageFilePath, data, 'utf-8');
  }

  getAll() {
    return Array.from(this.aiPersons.values());
  }

  getById(id) {
    return this.aiPersons.get(id);
  }

  get(id) {
    return this.aiPersons.get(id);
  }

  has(id) {
    return this.aiPersons.has(id);
  }

  async set(id, person) {
    this.aiPersons.set(id, person);
    await this.save();
  }

  addOrUpdate(person) {
    // Preserve existing customPrompt if not provided in update
    const existing = this.aiPersons.get(person.id);
    if (existing && !person.customPrompt) {
      person.customPrompt = existing.customPrompt || '';
    }
    this.aiPersons.set(person.id, person);
    this.save();
  }

  delete(id) {
    this.aiPersons.delete(id);
    this.save();
  }
}

export const aiPersonsStore = new AIPersonsStore();

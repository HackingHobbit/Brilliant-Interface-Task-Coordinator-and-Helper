import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Identity Manager - Handles the three-layer identity system
 * Layer 1: Core Identity (BITCH) - Immutable foundation
 * Layer 2: Role - Functional specialization 
 * Layer 3: Presentation - Customizable name, personality, avatar, voice
 */
class IdentityManager {
  constructor() {
    this.coreIdentity = null;
    this.availableRoles = new Map();
    this.availablePersonalities = new Map();
    this.currentIdentity = null;
  }

  /**
   * Initialize the identity manager by loading core identity and available options
   */
  async initialize() {
    try {
      // Load core identity (Layer 1)
      await this.loadCoreIdentity();
      
      // Load available roles (Layer 2)
      await this.loadAvailableRoles();
      
      // Load available personalities (Layer 3)
      await this.loadAvailablePersonalities();
      
      console.log("✅ Identity Manager initialized successfully");
      console.log(`📋 Loaded ${this.availableRoles.size} roles and ${this.availablePersonalities.size} personalities`);
    } catch (error) {
      console.error("❌ Failed to initialize Identity Manager:", error);
      throw error;
    }
  }

  /**
   * Load the immutable core BITCH identity
   */
  async loadCoreIdentity() {
    const coreIdentityPath = path.join(__dirname, "core-identity.json");
    const data = await fs.readFile(coreIdentityPath, "utf8");
    const config = JSON.parse(data);
    this.coreIdentity = config.coreIdentity;
    console.log("🧠 Core identity loaded:", this.coreIdentity.name);
  }

  /**
   * Load all available roles from the roles directory
   */
  async loadAvailableRoles() {
    const rolesDir = path.join(__dirname, "roles");
    
    try {
      const files = await fs.readdir(rolesDir);
      const roleFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of roleFiles) {
        const filePath = path.join(rolesDir, file);
        const data = await fs.readFile(filePath, "utf8");
        const config = JSON.parse(data);
        
        if (config.role && config.role.id) {
          this.availableRoles.set(config.role.id, config.role);
          console.log(`📝 Loaded role: ${config.role.name} (${config.role.id})`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not load roles directory:", error.message);
    }
  }

  /**
   * Load all available personalities from the personalities directory
   */
  async loadAvailablePersonalities() {
    const personalitiesDir = path.join(__dirname, "..", "personalities");
    
    try {
      const files = await fs.readdir(personalitiesDir);
      const personalityFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of personalityFiles) {
        const filePath = path.join(personalitiesDir, file);
        const data = await fs.readFile(filePath, "utf8");
        const config = JSON.parse(data);
        
        if (config.presentation) {
          const personalityId = path.basename(file, '.json');
          this.availablePersonalities.set(personalityId, config.presentation);
          console.log(`🎭 Loaded personality: ${config.presentation.name} (${personalityId})`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not load personalities directory:", error.message);
    }
  }

  /**
   * Create a complete identity by combining all three layers
   * @param {string} roleId - Role identifier
   * @param {string} personalityId - Personality identifier
   * @param {string} aiPersonId - Optional AI Person ID for persistent identity
   * @param {string} customName - Optional custom name to override personality name
   * @returns {object} Complete layered identity
   */
  createIdentity(roleId = "general-assistant", personalityId = "default", aiPersonId = null, customName = null) {
    if (!this.coreIdentity) {
      throw new Error("Core identity not loaded");
    }

    const role = this.availableRoles.get(roleId);
    const personality = this.availablePersonalities.get(personalityId);

    if (!role) {
      console.warn(`⚠️ Role '${roleId}' not found, using general-assistant`);
      roleId = "general-assistant";
    }

    if (!personality) {
      console.warn(`⚠️ Personality '${personalityId}' not found, using default`);
      personalityId = "default";
    }

    // Generate AI Person ID if not provided
    if (!aiPersonId) {
      aiPersonId = this.generateAIPersonId();
    }

    // Create a deep copy of the presentation to avoid modifying the original
    const presentation = JSON.parse(JSON.stringify(
      this.availablePersonalities.get(personalityId) || this.availablePersonalities.get("default")
    ));
    
    // Apply custom name if provided
    if (customName) {
      presentation.name = customName;
    }

    const identity = {
      coreIdentity: this.coreIdentity,
      role: this.availableRoles.get(roleId) || this.availableRoles.get("general-assistant"),
      presentation: presentation,
      metadata: {
        aiPersonId,
        created: new Date().toISOString(),
        roleId,
        personalityId,
        lastModified: new Date().toISOString()
      }
    };

    this.currentIdentity = identity;
    console.log(`🎯 Created identity: ${identity.presentation.name} as ${identity.role.name} (AI Person: ${aiPersonId})`);
    
    return identity;
  }

  /**
   * Generate a unique AI Person ID
   * @returns {string} Unique identifier for an AI Person
   */
  generateAIPersonId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `ai_person_${timestamp}_${random}`;
  }

  /**
   * Update an existing AI Person's configuration while preserving their ID
   * @param {string} aiPersonId - AI Person identifier
   * @param {string} roleId - New role identifier
   * @param {string} personalityId - New personality identifier
   * @returns {object} Updated layered identity
   */
  updateAIPersonIdentity(aiPersonId, roleId, personalityId) {
    if (!aiPersonId) {
      throw new Error("AI Person ID is required for updates");
    }

    const identity = this.createIdentity(roleId, personalityId, aiPersonId);
    identity.metadata.lastModified = new Date().toISOString();
    
    console.log(`🔄 Updated AI Person ${aiPersonId}: ${identity.presentation.name} as ${identity.role.name}`);
    return identity;
  }

  /**
   * Generate the complete system prompt by combining all layers
   * @param {object} identity - Complete layered identity
   * @returns {string} Combined system prompt
   */
  generateSystemPrompt(identity) {
    if (!identity) {
      identity = this.currentIdentity;
    }

    if (!identity) {
      throw new Error("No identity provided or current identity set");
    }

    let systemPrompt = identity.coreIdentity.systemPromptCore;

    // Add role-specific behavior
    if (identity.role.systemPromptAddition) {
      systemPrompt += "\n\nROLE SPECIALIZATION:\n" + identity.role.systemPromptAddition;
    }

    // Add personality modifiers
    const traits = identity.presentation.personalityTraits;
    if (traits) {
      systemPrompt += "\n\nPERSONALITY ADJUSTMENTS:";
      
      if (traits.enthusiasm > 0.7) {
        systemPrompt += "\nYou express enthusiasm and energy in your responses.";
      } else if (traits.enthusiasm < 0.3) {
        systemPrompt += "\nYou maintain a calm, measured tone.";
      }

      if (traits.formality > 0.7) {
        systemPrompt += "\nYou use formal, professional language.";
      } else if (traits.formality < 0.3) {
        systemPrompt += "\nYou use casual, relaxed language.";
      }

      if (traits.humor > 0.7) {
        systemPrompt += "\nYou incorporate appropriate humor and wit.";
      }

      if (traits.empathy > 0.7) {
        systemPrompt += "\nYou show high empathy and emotional understanding.";
      }
    }

    // Add presentation name
    if (identity.presentation.name !== "BITCH") {
      systemPrompt += `\n\nFor this interaction, you may also be referred to as "${identity.presentation.name}".`;
    }

    return systemPrompt;
  }

  /**
   * Get available roles
   * @returns {Array} Array of role objects
   */
  getAvailableRoles() {
    return Array.from(this.availableRoles.values());
  }

  /**
   * Get available personalities
   * @returns {Array} Array of personality objects with IDs
   */
  getAvailablePersonalities() {
    const personalities = [];
    for (const [id, personality] of this.availablePersonalities.entries()) {
      personalities.push({
        id,
        ...personality
      });
    }
    return personalities;
  }

  /**
   * Get current identity configuration
   * @returns {object} Current identity or null
   */
  getCurrentIdentity() {
    return this.currentIdentity;
  }

  /**
   * Validate identity configuration against schema
   * @param {object} identity - Identity to validate
   * @returns {boolean} Whether identity is valid
   */
  validateIdentity(identity) {
    // Basic validation - in production you'd use a proper JSON schema validator
    return (
      identity &&
      identity.coreIdentity &&
      identity.role &&
      identity.presentation &&
      identity.coreIdentity.name === "BITCH"
    );
  }
}

// Export singleton instance
export const identityManager = new IdentityManager();

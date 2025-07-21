import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { generateSpeech, audioFileToBase64 } from "./piper_tts.js";
import { identityManager } from "../../ai/agents/identity-manager.js";
import { aiPersonsStore } from "../../ai/storage/ai-persons-store.js";
import { memoryManager } from "../../ai/memory/memory-manager.js";
dotenv.config();

// LM Studio configuration - using OpenAI SDK with local endpoint
const LM_STUDIO_BASE_URL = process.env.LM_STUDIO_BASE_URL || "http://localhost:1234";
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || "llama-3-8b-lexi-uncensored";

const openai = new OpenAI({
  baseURL: `${LM_STUDIO_BASE_URL}/v1`,
  apiKey: "lm-studio", // LM Studio doesn't require a real API key
});

// Piper TTS is local, no API key needed
console.log(`Using local Piper TTS with voice: ${process.env.PIPER_VOICE || "en_GB-alba-medium"}`);

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// In-memory session storage for conversation history
// In production, you'd want to use Redis, database, or persistent storage
const conversationSessions = new Map();

// Initialize identity manager and storage on startup
async function initializeIdentitySystem() {
  try {
    // Initialize identity manager
    await identityManager.initialize();
    console.log('✅ Identity Manager initialized');
    
    // Initialize AI Persons storage
    await aiPersonsStore.initialize();
    console.log('✅ AI Persons storage initialized');
    
    // Initialize memory manager
    await memoryManager.initialize();
    console.log('✅ Memory Manager initialized');
    
    // Create a default AI Person if none exist
    if (aiPersonsStore.size === 0) {
      const defaultIdentity = identityManager.createIdentity('general-assistant', 'default');
      await aiPersonsStore.set(defaultIdentity.metadata.aiPersonId, defaultIdentity);
      console.log('✅ Default AI Person created:', defaultIdentity.metadata.aiPersonId);
    }
  } catch (error) {
    console.error('❌ Failed to initialize Identity System:', error);
  }
}

// Initialize on startup
initializeIdentitySystem();

// Session configuration
const MAX_CONVERSATION_HISTORY = 20; // Keep last 20 exchanges (40 messages total)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of conversationSessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      conversationSessions.delete(sessionId);
      console.log(`🗑️ Cleaned up expired session: ${sessionId}`);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      backend: "running",
      lmStudio: LM_STUDIO_BASE_URL,
      piperTTS: "local"
    }
  });
});

// Clear session memory endpoint
app.post('/clear-session', async (req, res) => {
  try {
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (conversationSessions.has(sessionId)) {
      // Get session to check for AI Person
      const session = conversationSessions.get(sessionId);
      
      // Consolidate memory before clearing if AI Person is linked
      if (session.aiPersonId) {
        await memoryManager.consolidateMemory(sessionId, session.aiPersonId);
      }
      
      // Clear session
      conversationSessions.delete(sessionId);
      memoryManager.clearShortTermMemory(sessionId);
      
      console.log(`🧹 Manually cleared session: ${sessionId}`);
      res.json({ success: true, message: 'Session cleared successfully' });
    } else {
      console.log(`⚠️ Attempted to clear non-existent session: ${sessionId}`);
      res.json({ success: true, message: 'Session was already clear' });
    }
  } catch (error) {
    console.error('❌ Error in clear-session endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to clear session. Please try again.'
    });
  }
});

app.get("/voices", async (req, res) => {
  // Return available Piper voices (for now just the configured one)
  res.send([{
    voice_id: process.env.PIPER_VOICE || "en_GB-alba-medium",
    name: "Alba (British English)",
    category: "local_tts"
  }]);
});

// Identity Management API Endpoints

// Get available roles
app.get("/identity/roles", async (req, res) => {
  try {
    const roles = identityManager.getAvailableRoles();
    res.json({ roles });
  } catch (error) {
    console.error('❌ Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get available personalities
app.get("/identity/personalities", async (req, res) => {
  try {
    const personalities = identityManager.getAvailablePersonalities();
    res.json({ personalities });
  } catch (error) {
    console.error('❌ Error fetching personalities:', error);
    res.status(500).json({ error: 'Failed to fetch personalities' });
  }
});

// Get current identity for a session
app.get("/identity/current/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getOrCreateSession(sessionId);
    
    let identity;
    if (session.aiPersonId && aiPersonsStore.has(session.aiPersonId)) {
      identity = aiPersonsStore.get(session.aiPersonId);
    } else {
      // Return default identity
      identity = aiPersonsStore.getAll()[0];
    }
    
    res.json({ 
      identity: {
        aiPersonId: identity.metadata.aiPersonId,
        role: identity.role.name,
        roleId: identity.metadata.roleId,
        personality: identity.presentation.name, // Keep for backward compatibility
        personalityId: identity.metadata.personalityId,
        presentation: identity.presentation, // Include full presentation object
        avatar: identity.presentation.avatar,
        voice: identity.presentation.voice,
        customPrompt: identity.presentation.customPrompt || ''
      }
    });
  } catch (error) {
    console.error('❌ Error fetching current identity:', error);
    res.status(500).json({ error: 'Failed to fetch current identity' });
  }
});

// Create or update AI Person identity
app.post("/identity/update", async (req, res) => {
  try {
    const { sessionId, roleId, personalityId, aiPersonId, customPrompt } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const session = getOrCreateSession(sessionId);
    
    let identity;
    if (aiPersonId && aiPersonsStore.has(aiPersonId)) {
      // Get the existing AI Person to preserve custom name
      const existingPerson = aiPersonsStore.get(aiPersonId);
      const customName = existingPerson.presentation.name;
      
      // Update existing AI Person - pass the custom name
      identity = identityManager.updateAIPersonIdentity(aiPersonId, roleId, personalityId, customName);
      
      // Apply custom prompt if provided
      if (customPrompt !== undefined) {
        identity.presentation.personalityPrompt = customPrompt || identity.presentation.personalityPrompt;
        identity.presentation.customPrompt = customPrompt || null;
      }
      
      await aiPersonsStore.set(aiPersonId, identity);
    } else {
      // Create new AI Person
      identity = identityManager.createIdentity(roleId, personalityId);
      
      // Apply custom prompt if provided
      if (customPrompt !== undefined) {
        identity.presentation.personalityPrompt = customPrompt || identity.presentation.personalityPrompt;
        identity.presentation.customPrompt = customPrompt || null;
      }
      
      await aiPersonsStore.set(identity.metadata.aiPersonId, identity);
    }
    
    // Link AI Person to session
    session.aiPersonId = identity.metadata.aiPersonId;
    
    console.log(`🎭 Updated identity for session ${sessionId}: ${identity.presentation.name} as ${identity.role.name}`);
    
    res.json({ 
      success: true,
      identity: {
        aiPersonId: identity.metadata.aiPersonId,
        role: identity.role.name,
        roleId: identity.metadata.roleId,
        personality: identity.presentation.name, // Keep for backward compatibility
        personalityId: identity.metadata.personalityId,
        presentation: identity.presentation, // Include full presentation object
        avatar: identity.presentation.avatar,
        voice: identity.presentation.voice,
        customPrompt: identity.presentation.customPrompt
      }
    });
  } catch (error) {
    console.error('❌ Error updating identity:', error);
    res.status(500).json({ error: 'Failed to update identity' });
  }
});

// List all AI Persons
app.get("/api/ai-persons", async (req, res) => {
  try {
    const persons = aiPersonsStore.getAll().map(identity => ({
      id: identity.metadata.aiPersonId,
      name: identity.presentation.name || identity.presentation.personalityTitle || 'Unnamed',
      role: identity.role.name,
      roleId: identity.metadata.roleId,
      personalityId: identity.metadata.personalityId,
      created: identity.metadata.created,
      lastModified: identity.metadata.lastModified
    }));
    
    res.json({ aiPersons: persons });
  } catch (error) {
    console.error('❌ Error listing AI Persons:', error);
    res.status(500).json({ error: 'Failed to list AI Persons' });
  }
});

// Get specific AI Person
app.get("/api/ai-persons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!aiPersonsStore.has(id)) {
      return res.status(404).json({ error: 'AI Person not found' });
    }
    
    const identity = aiPersonsStore.get(id);
    res.json({ 
      aiPerson: {
        id: identity.metadata.aiPersonId,
        coreIdentity: identity.coreIdentity,
        role: identity.role,
        presentation: identity.presentation,
        metadata: identity.metadata
      }
    });
  } catch (error) {
    console.error('❌ Error fetching AI Person:', error);
    res.status(500).json({ error: 'Failed to fetch AI Person' });
  }
});

// Create new AI Person
app.post("/api/ai-persons", async (req, res) => {
  try {
    const { roleId, personalityId, name } = req.body;
    
    // Pass the custom name to createIdentity
    const identity = identityManager.createIdentity(roleId, personalityId, null, name);
    
    await aiPersonsStore.set(identity.metadata.aiPersonId, identity);
    
    res.json({ 
      success: true,
      aiPerson: {
        id: identity.metadata.aiPersonId,
        name: identity.presentation.name,
        role: identity.role.name,
        roleId: identity.metadata.roleId,
        personalityId: identity.metadata.personalityId,
        created: identity.metadata.created
      }
    });
  } catch (error) {
    console.error('❌ Error creating AI Person:', error);
    res.status(500).json({ error: 'Failed to create AI Person' });
  }
});

// Update AI Person
app.put("/api/ai-persons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId, personalityId, name, customPrompt } = req.body;
    
    if (!aiPersonsStore.has(id)) {
      return res.status(404).json({ error: 'AI Person not found' });
    }
    
    // Update the AI Person identity
    const updatedIdentity = identityManager.updateAIPersonIdentity(id, roleId, personalityId);
    
    // If a custom name is provided, update it
    if (name && name.trim()) {
      updatedIdentity.presentation.name = name.trim();
    }
    
    // If a custom personality prompt is provided, update it
    if (customPrompt !== undefined) {
      updatedIdentity.presentation.personalityPrompt = customPrompt || updatedIdentity.presentation.personalityPrompt;
      updatedIdentity.presentation.customPrompt = customPrompt || null;
    }
    
    // Update the last modified timestamp
    updatedIdentity.metadata.lastModified = new Date().toISOString();
    
    // Save the updated identity
    await aiPersonsStore.set(id, updatedIdentity);
    
    res.json({ 
      success: true,
      aiPerson: {
        id: updatedIdentity.metadata.aiPersonId,
        name: updatedIdentity.presentation.name,
        role: updatedIdentity.role.name,
        roleId: updatedIdentity.metadata.roleId,
        personalityId: updatedIdentity.metadata.personalityId,
        customPrompt: updatedIdentity.presentation.customPrompt,
        lastModified: updatedIdentity.metadata.lastModified
      }
    });
  } catch (error) {
    console.error('❌ Error updating AI Person:', error);
    res.status(500).json({ error: 'Failed to update AI Person' });
  }
});

// Delete AI Person
app.delete("/api/ai-persons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!aiPersonsStore.has(id)) {
      return res.status(404).json({ error: 'AI Person not found' });
    }
    
    // Check if this is the last AI Person
    const allPersons = aiPersonsStore.getAll();
    if (allPersons.length <= 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the last AI Person',
        message: 'At least one AI Person must exist in the system'
      });
    }
    
    // Check if any sessions are currently using this AI Person
    let sessionsUsingPerson = 0;
    for (const [sessionId, session] of conversationSessions.entries()) {
      if (session.aiPersonId === id) {
        sessionsUsingPerson++;
      }
    }
    
    if (sessionsUsingPerson > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete AI Person in use',
        message: `This AI Person is currently being used by ${sessionsUsingPerson} active session(s)`
      });
    }
    
    // Delete associated memory data
    await memoryManager.deleteAIPersonMemory(id);
    
    // Delete the AI Person
    await aiPersonsStore.delete(id);
    
    console.log(`🗑️ Deleted AI Person: ${id}`);
    
    res.json({ 
      success: true,
      message: 'AI Person deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting AI Person:', error);
    res.status(500).json({ error: 'Failed to delete AI Person' });
  }
});

// Memory Management API Endpoints

// Add a fact to AI Person's memory
app.post("/memory/facts", async (req, res) => {
  try {
    const { aiPersonId, fact, category } = req.body;
    
    if (!aiPersonId || !fact) {
      return res.status(400).json({ error: 'AI Person ID and fact are required' });
    }
    
    await memoryManager.addFact(aiPersonId, fact, category);
    
    res.json({ 
      success: true,
      message: 'Fact added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding fact:', error);
    res.status(500).json({ error: 'Failed to add fact' });
  }
});

// Get facts for an AI Person
app.get("/memory/facts/:aiPersonId", async (req, res) => {
  try {
    const { aiPersonId } = req.params;
    const { query, category } = req.query;
    
    const facts = memoryManager.searchFacts(aiPersonId, query, category);
    
    res.json({ facts });
  } catch (error) {
    console.error('❌ Error fetching facts:', error);
    res.status(500).json({ error: 'Failed to fetch facts' });
  }
});

// Update preferences for an AI Person
app.post("/memory/preferences", async (req, res) => {
  try {
    const { aiPersonId, preferences } = req.body;
    
    if (!aiPersonId || !preferences) {
      return res.status(400).json({ error: 'AI Person ID and preferences are required' });
    }
    
    await memoryManager.updatePreferences(aiPersonId, preferences);
    
    res.json({ 
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get memory summary for an AI Person
app.get("/memory/summary/:aiPersonId", async (req, res) => {
  try {
    const { aiPersonId } = req.params;
    
    const longTermMemory = memoryManager.getLongTermMemory(aiPersonId);
    const facts = memoryManager.getFactsMemory(aiPersonId);
    
    res.json({ 
      summary: {
        conversationCount: longTermMemory.conversations.length,
        factCount: facts.length,
        preferences: longTermMemory.preferences,
        relationships: longTermMemory.relationships,
        createdAt: longTermMemory.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching memory summary:', error);
    res.status(500).json({ error: 'Failed to fetch memory summary' });
  }
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

// Session management functions
function getOrCreateSession(sessionId) {
  if (!conversationSessions.has(sessionId)) {
    conversationSessions.set(sessionId, {
      messages: [],
      lastActivity: Date.now(),
      createdAt: Date.now(),
      aiPersonId: null // Link to AI Person
    });
    console.log(`🆕 Created new session: ${sessionId}`);
  }

  const session = conversationSessions.get(sessionId);
  session.lastActivity = Date.now();
  return session;
}

async function addToConversationHistory(sessionId, userMessage, assistantResponse) {
  const session = getOrCreateSession(sessionId);

  // Add user message
  session.messages.push({
    role: "user",
    content: userMessage
  });

  // Add assistant response (convert from our JSON format to simple text)
  const responseText = Array.isArray(assistantResponse)
    ? assistantResponse.map(msg => msg.text).join(' ')
    : assistantResponse;

  session.messages.push({
    role: "assistant",
    content: responseText
  });

  // Keep only the last MAX_CONVERSATION_HISTORY exchanges
  if (session.messages.length > MAX_CONVERSATION_HISTORY * 2) {
    session.messages = session.messages.slice(-MAX_CONVERSATION_HISTORY * 2);
  }

  // Also add to memory manager
  if (session.aiPersonId) {
    memoryManager.addToShortTermMemory(sessionId, "user", userMessage);
    memoryManager.addToShortTermMemory(sessionId, "assistant", responseText);
  }

  console.log(`💾 Session ${sessionId} now has ${session.messages.length} messages`);
}

async function buildMessagesArray(sessionId, currentUserMessage) {
  const session = getOrCreateSession(sessionId);
  
  // Get the AI Person identity for this session
  let identity;
  if (session.aiPersonId && aiPersonsStore.has(session.aiPersonId)) {
    identity = aiPersonsStore.get(session.aiPersonId);
  } else {
    // Use default identity if none set
    const defaultAiPerson = aiPersonsStore.getAll()[0];
    identity = defaultAiPerson;
    session.aiPersonId = defaultAiPerson.metadata.aiPersonId;
  }

  console.log('🔍 DEBUG: Starting fact extraction process');
  console.log('🔍 DEBUG: Current user message:', currentUserMessage);
  console.log('🔍 DEBUG: AI Person ID:', identity.metadata.aiPersonId);
  console.log('🔍 DEBUG: Session ID:', sessionId);
  
  // Get enhanced context from memory with automatic fact integration
  const memoryContext = memoryManager.getEnhancedContext(identity.metadata.aiPersonId, currentUserMessage);
  
  // Process message for real-time fact extraction
  try {
    console.log('🔍 DEBUG: Calling processMessageForFacts...');
    await memoryManager.processMessageForFacts(sessionId, identity.metadata.aiPersonId, currentUserMessage);
    console.log('🔍 DEBUG: processMessageForFacts completed successfully');
  } catch (error) {
    console.error('❌ DEBUG: Error in processMessageForFacts:', error);
  }
  
  // Generate dynamic system prompt based on identity
  let basePrompt = identityManager.generateSystemPrompt(identity);
  
  // Add memory context if available
  if (memoryContext.relevantFacts.length > 0) {
    basePrompt += "\n\nREMEMBERED FACTS:\n";
    memoryContext.relevantFacts.forEach(fact => {
      basePrompt += `- ${fact.fact}\n`;
    });
  }
  
  if (Object.keys(memoryContext.preferences).length > 0) {
    basePrompt += "\n\nUSER PREFERENCES:\n";
    Object.entries(memoryContext.preferences).forEach(([key, value]) => {
      basePrompt += `- ${key}: ${value}\n`;
    });
  }
  
  // Add JSON formatting instructions
  const jsonInstructions = `

You MUST respond with ONLY valid JSON.

CRITICAL RULES:
1. Your ENTIRE response must be a JSON array - nothing else
2. Do NOT put JSON structure inside the "text" field
3. The "text" field contains ONLY words to be spoken aloud
4. Use full words instead of contractions (say "do not" instead of "don't", "cannot" instead of "can't")
5. Avoid single quotes (') in text - use double quotes (") for quotations or just remove quotes entirely

EXACT FORMAT:
[{"text": "Hello there!", "facialExpression": "smile", "animation": "Talking_1"}]

ALLOWED facial expressions: default, smile, sad, angry, surprised, funnyFace, crazy, wink
ALLOWED animations: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry

WRONG (DO NOT DO THIS):
[{"text": "Hello! {\"facialExpression\": \"smile\"}", "facialExpression": "smile", "animation": "Talking_1"}]

RIGHT (DO THIS):
[{"text": "Hello!", "facialExpression": "smile", "animation": "Talking_1"}]

Maximum 3 messages. Respond with JSON only.`;

  const systemPrompt = {
    role: "system",
    content: basePrompt + jsonInstructions
  };

  // Build the complete messages array: system + conversation history + current message
  const messages = [
    systemPrompt,
    ...session.messages,
    {
      role: "user",
      content: currentUserMessage
    }
  ];

  console.log(`🧠 Building context with ${session.messages.length} historical messages for AI Person: ${identity.presentation.name}`);
  return messages;
}

// Lip sync is now handled in real-time by wawa-lipsync on the frontend
// No need for pre-processing with Rhubarb

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const sessionId = req.body.sessionId || 'default'; // Use provided sessionId or default

    if (!userMessage) {
      res.send({
        messages: [
          {
            text: "Hello! I am the Brilliant Interface Task Coordinator and Helper, but you can call me your bitch. How can I assist you today?",
            audio: await audioFileToBase64("audios/intro_0.wav"),
            lipsync: await readJsonTranscript("audios/intro_0.json"),
            facialExpression: "smile",
            animation: "Talking_1",
          },
          {
            text: "I am here to help you with tasks, answer questions, and coordinate your digital interface needs. What would you like to work on?",
            audio: await audioFileToBase64("audios/intro_1.wav"),
            lipsync: await readJsonTranscript("audios/intro_1.json"),
            facialExpression: "smile",
            animation: "Talking_2",
          },
        ],
      });
      return;
    }
    // No API keys needed for local setup!
    console.log("Using fully local setup: LM Studio + Piper TTS + wawa-lipsync");

    // Build messages array with conversation history
    const conversationMessages = await buildMessagesArray(sessionId, userMessage || "Hello");

    const completion = await openai.chat.completions.create({
      model: LM_STUDIO_MODEL,
      max_tokens: 2000, // Increased to allow for complete JSON responses
      temperature: 0.6,
      messages: conversationMessages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "brilliant_interface_response",
          strict: true,
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                facialExpression: {
                  type: "string",
                  enum: [
                    "default",
                    "smile",
                    "sad",
                    "angry",
                    "surprised",
                    "funnyFace",
                    "crazy",
                    "wink",
                  ],
                },
                animation: {
                  type: "string",
                  enum: [
                    "Talking_0",
                    "Talking_1",
                    "Talking_2",
                    "Crying",
                    "Laughing",
                    "Rumba",
                    "Idle",
                    "Terrified",
                    "Angry",
                  ],
                },
              },
              required: ["text", "facialExpression", "animation"],
              additionalProperties: false,
            },
          },
        },
      },
    });

    let messages;
    try {
      // Directly parse the JSON response from the LLM
      messages = completion.choices[0].message.content;

      // If the response is a string, parse it as JSON
      if (typeof messages === "string") {
        messages = JSON.parse(messages);
      }

      // Ensure it's an array
      if (!Array.isArray(messages)) {
        messages = [messages];
      }

      console.log("Parsed messages:", messages);
    } catch (error) {
      console.error("Failed to parse LM Studio response as JSON:", error);
      console.log("Raw response:", completion.choices[0].message.content);

      // Fallback: create a simple response
      messages = [
        {
          text:
            completion.choices[0].message.content ||
            "I'm having trouble understanding right now, but I'm here for you!",
          facialExpression: "smile",
          animation: "Talking_1",
        },
      ];
    }
    // Validate and clean up messages
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Check if the text field contains JSON structure (common LM Studio issue)
      if (
        message.text &&
        (message.text.includes('"facialExpression"') ||
          message.text.includes('"animation"') ||
          message.text.includes('"text"'))
      ) {
        console.warn(`Message ${i} text contains JSON structure, cleaning up...`);

        // Try to extract actual text from JSON structure
        let cleanedText = message.text;

        // If it starts with [ or {, it's likely a JSON structure
        if (cleanedText.trim().startsWith("[") || cleanedText.trim().startsWith("{")) {
          try {
            // Try to parse as JSON and extract the first text field
            const parsed = JSON.parse(cleanedText);
            if (Array.isArray(parsed) && parsed[0] && parsed[0].text) {
              cleanedText = parsed[0].text;
            } else if (parsed.text) {
              cleanedText = parsed.text;
            }
          } catch (e) {
            // If JSON parsing fails, try regex extraction
            const textMatch = cleanedText.match(/"text":\s*"([^"]+)"/);
            if (textMatch) {
              cleanedText = textMatch[1];
            } else {
              // Fallback: extract text before any JSON structure
              cleanedText = cleanedText.split(/[\{\[]/)[0].trim();
            }
          }
        }

        // Clean up escape sequences and normalize text
        cleanedText = cleanedText
          .replace(/\\n/g, " ") // Replace \n with space
          .replace(/\\t/g, " ") // Replace \t with space
          .replace(/\\"/g, '"') // Replace \" with "
          .replace(/\\'/g, "'") // Replace \' with '
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim();

        if (cleanedText && cleanedText !== message.text) {
          message.text = cleanedText;
          console.log(`Cleaned text for message ${i}: "${message.text}"`);
        }
      }

      // Fix contractions and problematic characters for better Piper TTS pronunciation
      if (message.text) {
        message.text = message.text
          // Fix contractions first
          .replace(/don't/gi, "do not")
          .replace(/can't/gi, "cannot")
          .replace(/won't/gi, "will not")
          .replace(/shouldn't/gi, "should not")
          .replace(/wouldn't/gi, "would not")
          .replace(/couldn't/gi, "could not")
          .replace(/isn't/gi, "is not")
          .replace(/aren't/gi, "are not")
          .replace(/wasn't/gi, "was not")
          .replace(/weren't/gi, "were not")
          .replace(/hasn't/gi, "has not")
          .replace(/haven't/gi, "have not")
          .replace(/hadn't/gi, "had not")
          .replace(/doesn't/gi, "does not")
          .replace(/didn't/gi, "did not")
          .replace(/I'm/gi, "I am")
          .replace(/you're/gi, "you are")
          .replace(/we're/gi, "we are")
          .replace(/they're/gi, "they are")
          .replace(/he's/gi, "he is")
          .replace(/she's/gi, "she is")
          .replace(/it's/gi, "it is")
          .replace(/that's/gi, "that is")
          .replace(/there's/gi, "there is")
          .replace(/here's/gi, "here is")
          .replace(/what's/gi, "what is")
          .replace(/where's/gi, "where is")
          .replace(/who's/gi, "who is")
          .replace(/how's/gi, "how is")
          .replace(/I'll/gi, "I will")
          .replace(/you'll/gi, "you will")
          .replace(/he'll/gi, "he will")
          .replace(/she'll/gi, "she will")
          .replace(/we'll/gi, "we will")
          .replace(/they'll/gi, "they will")
          .replace(/I've/gi, "I have")
          .replace(/you've/gi, "you have")
          .replace(/we've/gi, "we have")
          .replace(/they've/gi, "they have")
          .replace(/I'd/gi, "I would")
          .replace(/you'd/gi, "you would")
          .replace(/he'd/gi, "he would")
          .replace(/she'd/gi, "she would")
          .replace(/we'd/gi, "we would")
          .replace(/they'd/gi, "they would")
          // Fix problematic punctuation for Piper TTS
          .replace(/'/g, "") // Remove single quotes entirely (Piper says "backslash")
          .replace(/'/g, "") // Remove curly single quotes
          .replace(/'/g, "") // Remove curly single quotes
          .replace(/"/g, "") // Remove curly double quotes
          .replace(/"/g, "") // Remove curly double quotes
          .replace(/"/g, '"') // Normalize double quotes
          .replace(/…/g, "...") // Replace ellipsis with three dots
          .replace(/–/g, "-") // Replace en dash with hyphen
          .replace(/—/g, " - ") // Replace em dash with spaced hyphen
          .replace(/\s+/g, " ") // Clean up multiple spaces
          .trim();

        console.log(`Final text for TTS (message ${i}): "${message.text}"`);
      }

      // Generate audio using Piper TTS
      const fileName = `audios/message_${i}.wav`;
      const textInput = message.text;

      try {
        await generateSpeech(textInput, fileName);
        message.audio = await audioFileToBase64(fileName);
        message.lipsync = null; // Will be handled by wawa-lipsync in real-time
        console.log(`Generated audio for message ${i}: ${textInput.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Failed to generate speech for message ${i}:`, error);
        // Fallback to Web Speech API on frontend
        message.audio = null;
        message.lipsync = null;
      }
    }

    // Store conversation in session memory
    await addToConversationHistory(sessionId, userMessage, messages);

    res.send({ messages });
  } catch (error) {
    console.error("❌ Error in chat endpoint:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while processing your request. Please try again.",
    });
  }
});

// audioFileToBase64 is now imported from piper_tts.js

app.listen(port, () => {
  console.log(`Brilliant Interface Task Coordinator and Helper listening on port ${port}`);
});
// </replace_in_file>

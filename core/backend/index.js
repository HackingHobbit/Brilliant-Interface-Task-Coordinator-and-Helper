import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { generateSpeech, audioFileToBase64 } from "./piper_tts.js";
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
app.post('/clear-session', (req, res) => {
  try {
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (conversationSessions.has(sessionId)) {
      conversationSessions.delete(sessionId);
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
      createdAt: Date.now()
    });
    console.log(`🆕 Created new session: ${sessionId}`);
  }

  const session = conversationSessions.get(sessionId);
  session.lastActivity = Date.now();
  return session;
}

function addToConversationHistory(sessionId, userMessage, assistantResponse) {
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

  console.log(`💾 Session ${sessionId} now has ${session.messages.length} messages`);
}

function buildMessagesArray(sessionId, currentUserMessage) {
  const session = getOrCreateSession(sessionId);

  const systemPrompt = {
    role: "system",
    content: `You are the Brilliant Interface Task Coordinator and Helper (B.I.T.C.H.). Your name is "Brilliant Interface Task Coordinator and Helper", but you can call me your bitch as a casual nickname. You are an AI assistant with a helpful, friendly personality.

IMPORTANT: When introducing yourself, when asked about your name, or when starting a new conversation, ALWAYS mention both your full name AND the casual nickname option: "I am the Brilliant Interface Task Coordinator and Helper, but you can call me your bitch." This should be included in your first response to any new user or when they seem to not know who you are.

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

Maximum 3 messages. Respond with JSON only.`
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

  console.log(`🧠 Building context with ${session.messages.length} historical messages`);
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
  const conversationMessages = buildMessagesArray(sessionId, userMessage || "Hello");

  const completion = await openai.chat.completions.create({
    model: LM_STUDIO_MODEL,
    max_tokens: 2000, // Increased to allow for complete JSON responses
    temperature: 0.6,
    messages: conversationMessages,
  });

  let messages;
  try {
    const rawContent = completion.choices[0].message.content;
    console.log('Raw LM Studio response:', rawContent);

    // Try to parse the response as JSON
    messages = JSON.parse(rawContent);

    // Handle case where LM Studio returns a JSON object with a messages property
    if (messages.messages) {
      messages = messages.messages;
    }

    // Ensure it's an array
    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    console.log('Parsed messages:', messages);
  } catch (error) {
    console.error('Failed to parse LM Studio response as JSON:', error);
    console.log('Raw response:', completion.choices[0].message.content);

    // Try to extract JSON from the response if it's wrapped in text
    const rawContent = completion.choices[0].message.content;

    // First, try to find a complete JSON array
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      try {
        messages = JSON.parse(jsonMatch[0]);
        console.log('Extracted JSON successfully:', messages);
      } catch (extractError) {
        console.error('Failed to extract complete JSON array:', extractError);

        // Try to extract individual JSON objects if the array is incomplete
        try {
          const objectMatches = rawContent.match(/\{[\s\S]*?\}/g);
          if (objectMatches && objectMatches.length > 0) {
            messages = objectMatches.map(objStr => {
              try {
                return JSON.parse(objStr);
              } catch (e) {
                return {
                  text: objStr,
                  facialExpression: "default",
                  animation: "Talking_0"
                };
              }
            });
            console.log('Extracted individual JSON objects:', messages);
          } else {
            throw new Error('No valid JSON objects found');
          }
        } catch (objError) {
          console.error('Failed to extract individual JSON objects:', objError);
          messages = [
            {
              text: rawContent || "I'm having trouble understanding right now, but I'm here for you!",
              facialExpression: "smile",
              animation: "Talking_1"
            }
          ];
        }
      }
    } else {
      // Fallback: create a simple response
      messages = [
        {
          text: rawContent || "I'm having trouble understanding right now, but I'm here for you!",
          facialExpression: "smile",
          animation: "Talking_1"
        }
      ];
    }
  }
  // Validate and clean up messages
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // Check if the text field contains JSON structure (common LM Studio issue)
    if (message.text && (message.text.includes('"facialExpression"') || message.text.includes('"animation"') || message.text.includes('"text"'))) {
      console.warn(`Message ${i} text contains JSON structure, cleaning up...`);

      // Try to extract actual text from JSON structure
      let cleanedText = message.text;

      // If it starts with [ or {, it's likely a JSON structure
      if (cleanedText.trim().startsWith('[') || cleanedText.trim().startsWith('{')) {
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
        .replace(/\\n/g, ' ')           // Replace \n with space
        .replace(/\\t/g, ' ')           // Replace \t with space
        .replace(/\\"/g, '"')           // Replace \" with "
        .replace(/\\'/g, "'")           // Replace \' with '
        .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
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
        .replace(/don't/gi, 'do not')
        .replace(/can't/gi, 'cannot')
        .replace(/won't/gi, 'will not')
        .replace(/shouldn't/gi, 'should not')
        .replace(/wouldn't/gi, 'would not')
        .replace(/couldn't/gi, 'could not')
        .replace(/isn't/gi, 'is not')
        .replace(/aren't/gi, 'are not')
        .replace(/wasn't/gi, 'was not')
        .replace(/weren't/gi, 'were not')
        .replace(/hasn't/gi, 'has not')
        .replace(/haven't/gi, 'have not')
        .replace(/hadn't/gi, 'had not')
        .replace(/doesn't/gi, 'does not')
        .replace(/didn't/gi, 'did not')
        .replace(/I'm/gi, 'I am')
        .replace(/you're/gi, 'you are')
        .replace(/we're/gi, 'we are')
        .replace(/they're/gi, 'they are')
        .replace(/he's/gi, 'he is')
        .replace(/she's/gi, 'she is')
        .replace(/it's/gi, 'it is')
        .replace(/that's/gi, 'that is')
        .replace(/there's/gi, 'there is')
        .replace(/here's/gi, 'here is')
        .replace(/what's/gi, 'what is')
        .replace(/where's/gi, 'where is')
        .replace(/who's/gi, 'who is')
        .replace(/how's/gi, 'how is')
        .replace(/I'll/gi, 'I will')
        .replace(/you'll/gi, 'you will')
        .replace(/he'll/gi, 'he will')
        .replace(/she'll/gi, 'she will')
        .replace(/we'll/gi, 'we will')
        .replace(/they'll/gi, 'they will')
        .replace(/I've/gi, 'I have')
        .replace(/you've/gi, 'you have')
        .replace(/we've/gi, 'we have')
        .replace(/they've/gi, 'they have')
        .replace(/I'd/gi, 'I would')
        .replace(/you'd/gi, 'you would')
        .replace(/he'd/gi, 'he would')
        .replace(/she'd/gi, 'she would')
        .replace(/we'd/gi, 'we would')
        .replace(/they'd/gi, 'they would')
        // Fix problematic punctuation for Piper TTS
        .replace(/'/g, '')              // Remove single quotes entirely (Piper says "backslash")
        .replace(/'/g, '')              // Remove curly single quotes
        .replace(/'/g, '')              // Remove curly single quotes
        .replace(/"/g, '')              // Remove curly double quotes
        .replace(/"/g, '')              // Remove curly double quotes
        .replace(/"/g, '"')             // Normalize double quotes
        .replace(/…/g, '...')           // Replace ellipsis with three dots
        .replace(/–/g, '-')             // Replace en dash with hyphen
        .replace(/—/g, ' - ')           // Replace em dash with spaced hyphen
        .replace(/\s+/g, ' ')           // Clean up multiple spaces
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
  addToConversationHistory(sessionId, userMessage, messages);

  res.send({ messages });

  } catch (error) {
    console.error('❌ Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
});

// audioFileToBase64 is now imported from piper_tts.js

app.listen(port, () => {
  console.log(`Brilliant Interface Task Coordinator and Helper listening on port ${port}`);
});

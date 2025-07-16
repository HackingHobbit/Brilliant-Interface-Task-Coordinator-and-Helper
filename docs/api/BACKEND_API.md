# 📡 Backend API Documentation

The Brilliant Interface Task Coordinator and Helper backend server provides several RESTful API endpoints for frontend communication and system management.

## **Base URL**
```
http://localhost:3000
```

## **Authentication**
No authentication is required for local development. All endpoints are accessible without API keys or tokens.

## **Endpoints**

### **GET /**
Basic health check endpoint to verify server is running.

**Response:**
```
"Hello World!"
```

**Status Codes:**
- `200 OK` - Server is running

---

### **GET /health**
Comprehensive system health status including backend services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-16T05:35:03.071Z",
  "services": {
    "backend": "running",
    "lmStudio": "http://localhost:1234",
    "piperTTS": "local"
  }
}
```

**Status Codes:**
- `200 OK` - All services healthy

---

### **GET /voices**
Retrieve available TTS voice models.

**Response:**
```json
[
  {
    "voice_id": "en_GB-alba-medium",
    "name": "Alba (British English)",
    "category": "local_tts"
  }
]
```

**Status Codes:**
- `200 OK` - Voice list retrieved successfully

---

### **POST /chat**
Main conversation endpoint with session memory support. Processes user messages and returns AI responses with audio, animations, and facial expressions.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "session_1752643558132_86w5zc00v"
}
```

**Parameters:**
- `message` (string, required) - User's message text
- `sessionId` (string, optional) - Session identifier for conversation continuity. Defaults to 'default' if not provided.

**Response:**
```json
{
  "messages": [
    {
      "text": "Hello! I am doing well, thank you for asking.",
      "facialExpression": "smile",
      "animation": "Talking_1",
      "audio": "base64_encoded_audio_data",
      "lipsync": null
    }
  ]
}
```

**Response Fields:**
- `messages` (array) - Array of response messages (max 3)
  - `text` (string) - Spoken text content
  - `facialExpression` (string) - Avatar facial expression
  - `animation` (string) - Avatar body animation
  - `audio` (string|null) - Base64 encoded audio data
  - `lipsync` (object|null) - Lip sync data (handled by frontend)

**Facial Expressions:**
`default`, `smile`, `sad`, `angry`, `surprised`, `funnyFace`, `crazy`, `wink`

**Animations:**
`Talking_0`, `Talking_1`, `Talking_2`, `Crying`, `Laughing`, `Rumba`, `Idle`, `Terrified`, `Angry`

**Status Codes:**
- `200 OK` - Message processed successfully
- `500 Internal Server Error` - Processing error

---

### **POST /clear-session**
Clear conversation memory for a specific session.

**Request Body:**
```json
{
  "sessionId": "session_1752643558132_86w5zc00v"
}
```

**Parameters:**
- `sessionId` (string, required) - Session identifier to clear

**Response:**
```json
{
  "success": true,
  "message": "Session cleared successfully"
}
```

**Status Codes:**
- `200 OK` - Session cleared successfully
- `400 Bad Request` - Missing sessionId parameter
- `500 Internal Server Error` - Server error during clearing

## **Error Handling**

All endpoints include comprehensive error handling with structured JSON responses:

**Error Response Format:**
```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

**Common Error Codes:**
- `400 Bad Request` - Missing or invalid parameters
- `500 Internal Server Error` - Server-side processing errors
- `503 Service Unavailable` - External service (LM Studio) unavailable

## **Session Management**

### **Session IDs**
- **Format:** `session_[timestamp]_[random_string]`
- **Example:** `session_1752643558132_86w5zc00v`
- **Generation:** Automatic on frontend, persistent in localStorage

### **Memory Limits**
- **Conversation History:** 20 exchanges (40 messages) per session
- **Auto-Cleanup:** Sessions expire after 30 minutes of inactivity
- **Storage:** In-memory Map structure (non-persistent across server restarts)

### **Session Lifecycle**
1. **Creation:** Automatic when first message sent with new sessionId
2. **Activity:** Updated on each chat request
3. **Cleanup:** Automatic expiration or manual clearing via `/clear-session`

## **Integration Notes**

### **LM Studio Integration**
- **Endpoint:** `http://localhost:1234` (configurable via environment)
- **Model:** Configurable via `LM_STUDIO_MODEL` environment variable
- **Context:** Full conversation history sent with each request

### **Piper TTS Integration**
- **Voice Model:** `en_GB-alba-medium` (configurable via environment)
- **Output:** Base64 encoded WAV audio
- **Processing:** Automatic contraction expansion and punctuation handling

### **Frontend Integration**
- **Session Persistence:** Frontend manages sessionId via localStorage
- **Audio Playback:** Frontend handles base64 audio decoding and playback
- **Lip Sync:** Real-time processing via wawa-lipsync library

## **Development & Debugging**

### **Logging**
The backend provides detailed console logging for:
- Session creation and management
- LM Studio API calls and responses
- TTS generation and processing
- Error conditions and debugging

### **Environment Variables**
```bash
LM_STUDIO_BASE_URL=http://localhost:1234
LM_STUDIO_MODEL=llama-3-8b-lexi-uncensored
PIPER_VOICE=en_GB-alba-medium
VOICES_DIR=../../media/assets/voices
PORT=3000
```

### **Testing**
Use curl or similar tools to test endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Send message
curl -X POST -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test_session"}' \
  http://localhost:3000/chat

# Clear session
curl -X POST -H "Content-Type: application/json" \
  -d '{"sessionId":"test_session"}' \
  http://localhost:3000/clear-session
```

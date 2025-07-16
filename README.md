# 🤖 Brilliant Interface Task Coordinator and Helper

A **100% local** Brilliant Interface Task Coordinator and Helper (B.I.T.C.H) application built with React Three Fiber, featuring real-time 3D avatar interaction, local LLM responses, and high-quality text-to-speech synthesis.

## 🎯 **Project Philosophy**

This project prioritizes **complete local operation** - no cloud dependencies, no data sharing, no internet requirements for core functionality. Your conversations, data, and interactions remain entirely on your machine.

## ✨ **Current Features**

### 🧠 **AI & Language**
- **Local LLM Integration** via [LM Studio](https://lmstudio.ai/)
- **Session Memory System** with persistent conversation history
- **Intelligent Conversation** with context awareness across sessions
- **JSON-structured responses** for coordinated speech, expressions, and animations
- **Smart text processing** to handle contractions and punctuation for optimal TTS
- **AI Identity**: Brilliant Interface Task Coordinator and Helper (B.I.T.C.H.)

### 🎭 **3D Avatar & Animation**
- **Interactive 3D Avatar** built with React Three Fiber
- **Facial Expressions**: default, smile, sad, angry, surprised, funnyFace, crazy, wink
- **Body Animations**: Talking_0/1/2, Crying, Laughing, Rumba, Idle, Terrified, Angry
- **Real-time Lip Sync** using [wawa-lipsync](https://github.com/wawa-lipsync/wawa-lipsync)
- **Smooth transitions** between expressions and animations

### 🔊 **Audio & Speech**
- **Local Text-to-Speech** via [Piper TTS](https://github.com/rhasspy/piper)
- **High-quality voice synthesis** with en_GB-alba-medium model
- **Real-time audio processing** with lip sync coordination
- **Optimized pronunciation** with contraction expansion and punctuation handling

### 🖥️ **User Interface**
- **Futuristic theme** with cyberpunk-inspired design elements
- **Comprehensive Settings Panel** with tabbed organization
- **Real-time chat interface** with persistent message history
- **Backend health monitoring** with visual status indicators
- **Auto-focus management** for seamless user interaction
- **Session memory controls** with clear memory functionality
- **Responsive layout** optimized for desktop interaction

## 🏗️ **Technical Architecture**

### **Frontend** (`r3f-virtual-girlfriend-frontend/`)
- **React 18** with Vite for fast development
- **React Three Fiber** for 3D rendering and avatar control
- **Custom hooks** for chat management and lip sync
- **Tailwind CSS** for styling

### **Backend** (`core/backend/`)
- **Node.js + Express** API server with comprehensive error handling
- **Session Management** with in-memory conversation storage
- **LM Studio integration** for local LLM responses with context
- **Piper TTS integration** for voice synthesis
- **Smart text processing** pipeline for optimal speech output
- **RESTful API endpoints** for chat, health monitoring, and session management

## 📦 **Dependencies & Sources**

### **Core Technologies**
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - 3D rendering
- [LM Studio](https://lmstudio.ai/) - Local LLM hosting
- [Piper TTS](https://github.com/rhasspy/piper) - Local text-to-speech
- [wawa-lipsync](https://github.com/wawa-lipsync/wawa-lipsync) - Real-time lip synchronization

### **AI Models**
- **LLM**: Compatible with any LM Studio supported model (Llama, Mistral, etc.)
- **TTS Voice**: en_GB-alba-medium (British English female voice)
- **Additional voices**: en_US-amy-medium included

### **3D Assets**
- Avatar model and animations (included in project)
- Facial expression morphs and controls
- Environment and lighting setup

## 🚀 **Getting Started**

### **Prerequisites**
1. **Node.js** (v18 or higher)
2. **LM Studio** installed and running
3. **Python 3** with Piper TTS installed
4. **Git** for cloning the repository

### **Installation**
```bash
# Clone the repository
git clone https://github.com/HackingHobbit/Brilliant-Interface-Task-Coordinator-and-Helper.git
cd Brilliant-Interface-Task-Coordinator-and-Helper

# Install backend dependencies
cd r3f-virtual-girlfriend-backend
npm install

# Install frontend dependencies
cd ../r3f-virtual-girlfriend-frontend
npm install
```

### **Setup**
1. **Start LM Studio** and load your preferred model
2. **Configure environment** (copy `.env.example` to `.env` if needed)
3. **Start backend**: `cd r3f-virtual-girlfriend-backend && npm start`
4. **Start frontend**: `cd r3f-virtual-girlfriend-frontend && npm run dev`
5. **Open browser**: Navigate to `http://localhost:5173`

## 🛠️ **Development Journey**

### **Phase 0: Foundation Complete** ✅
*Current stable release with core functionality*
- ✅ **Converted from cloud to 100% local operation**
- ✅ **Fixed critical chat functionality bugs**
- ✅ **Implemented robust text processing for TTS**
- ✅ **Integrated real-time lip sync with audio**
- ✅ **Created coordinated avatar expressions and animations**
- ✅ **Optimized LLM prompt engineering for structured responses**
- ✅ **Resolved pronunciation issues with contractions and punctuation**

### **Technical Challenges Solved**
- **React state management** issues preventing message sending
- **LM Studio response parsing** for JSON structure extraction
- **Piper TTS pronunciation** problems with contractions and quotes
- **Real-time audio-visual synchronization**
- **Cross-component state coordination**

### **Development Timeline Philosophy**
The roadmap follows a **"Smart First, Customizable Second, Advanced Third"** approach:
1. **Build intelligent foundation** (memory, context) before adding features
2. **Enable customization** once the AI can remember preferences
3. **Add advanced capabilities** that leverage the intelligent foundation
4. **Create extensibility** for community contributions

## 🎯 **Roadmap & Future Features**

### **Phase 1: Foundation & UI** 🎨 ✅ **COMPLETED**
*Easy wins that improve user experience immediately*
- ✅ **Settings Menu**
  - Comprehensive tabbed settings panel
  - Appearance, Audio, AI, Behavior, and Debug sections
  - Futuristic theme integration
- ✅ **UI Modernization**
  - Futuristic cyberpunk theme with glow effects
  - Enhanced visual feedback and animations
  - Backend health status indicators
  - Auto-focus management for better UX
- ✅ **Performance Monitoring**
  - Backend health monitoring with visual indicators
  - Real-time status checking and error reporting
- [ ] **Response Modes**
  - Text vs. audio response selection
  - Unobtrusive text display integration

### **Phase 2: Memory & Core Intelligence** 🧠 🚧 **IN PROGRESS**
*Fundamental AI improvements that make conversations truly intelligent*
- ✅ **Short-Term Memory (Session Memory)**
  - Session-based conversation memory with persistent storage
  - Automatic session cleanup and management
  - Clear memory functionality for fresh starts
  - Context-aware responses within conversations
- [ ] **Long-Term Memory System**
  - Facts-based persistent memory across sessions
  - User preferences and personality learning
  - Important information retention and recall
- [ ] **Local Backup Systems**
  - Conversation and memory backup
  - Settings and customization preservation
- [ ] **Advanced Contextual Features**
  - Integration with calendar, weather, system status
  - Enhanced contextual awareness

### **Phase 3: Content & Customization** 🎭
*Expanding available options (benefits from memory system)*
- [ ] **Voice Management**
  - Multiple voice selection from existing models
  - Voice import/addition capabilities
- [ ] **Avatar Customization**
  - Multiple 3D model support
  - Model import functionality
- [ ] **Personality System**
  - Predefined roles and personalities (uses memory for consistency)
  - User-selectable behavior profiles
- [ ] **Multi-Language Support**
  - Support for different languages in TTS
  - Localized UI elements

### **Phase 4: Input Expansion** 🎤👁️
*Adding new input methods (requires Phase 3 memory for context)*
- [ ] **Speech-to-Text (STT)**
  - Fully local voice recognition
  - Real-time conversation capabilities
- [ ] **Basic Vision Recognition**
  - Webcam facial recognition
  - Simple document reading capabilities
- [ ] **Document & Image Understanding**
  - Advanced document analysis
  - Image content recognition and discussion

### **Phase 5: Advanced AI Features** 🤖
*Complex features requiring multiple previous systems*
- [ ] **Emotion Detection & Response**
  - Voice tone analysis (requires STT from Phase 4)
  - Facial expression recognition (requires vision from Phase 4)
  - Adaptive responses (requires memory from Phase 3)
- [ ] **Agentic File System Integration**
  - Local file manipulation and organization
  - Document management capabilities
- [ ] **Web Integration**
  - Web search and scraping (only non-local feature)
  - API integrations for expanded functionality

### **Phase 6: Advanced Customization** ⚡
*Complex creation tools requiring stable foundation*
- [ ] **Custom Animation Creation**
  - Animation editor and creation tools
  - Custom gesture import/export
- [ ] **Voice Cloning**
  - Local voice cloning capabilities
  - Custom voice training and synthesis
- [ ] **Plugin System**
  - Modular architecture for extensions
  - Community-developed plugin support
- [ ] **Accessibility Features**
  - Screen reader support and compliance
  - Keyboard navigation and visual indicators

## 📡 **Backend API Documentation**

The backend server provides several RESTful API endpoints for frontend communication and system management.

### **Base URL**
```
http://localhost:3000
```

### **Endpoints**

#### **GET /**
Basic health check endpoint.
- **Response**: `"Hello World!"`

#### **GET /health**
Comprehensive system health status.
- **Response**:
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

#### **GET /voices**
Available TTS voice models.
- **Response**:
```json
[
  {
    "voice_id": "en_GB-alba-medium",
    "name": "Alba (British English)",
    "category": "local_tts"
  }
]
```

#### **POST /chat**
Main conversation endpoint with session memory support.
- **Request Body**:
```json
{
  "message": "Hello, how are you?",
  "sessionId": "session_1752643558132_86w5zc00v"
}
```
- **Response**:
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

#### **POST /clear-session**
Clear conversation memory for a specific session.
- **Request Body**:
```json
{
  "sessionId": "session_1752643558132_86w5zc00v"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Session cleared successfully"
}
```

### **Error Handling**
All endpoints include comprehensive error handling:
- **500 Internal Server Error**: Server-side errors with descriptive messages
- **400 Bad Request**: Missing required parameters
- **JSON Error Responses**: Structured error information for debugging

### **Session Management**
- **Session IDs**: Unique identifiers for conversation continuity
- **Memory Limit**: 20 exchanges (40 messages) per session
- **Auto-Cleanup**: Sessions expire after 30 minutes of inactivity
- **Persistence**: Frontend manages session ID persistence via localStorage

## 🤝 **Contributing**

This project welcomes contributions! Areas of particular interest:
- Additional voice models and languages
- New avatar models and animations
- Performance optimizations
- UI/UX improvements
- Documentation and tutorials

## 📄 **License**

This project is open source. Please respect the licenses of included dependencies and models.

## 🙏 **Acknowledgments**

Special thanks to the creators and maintainers of:
- The React Three Fiber ecosystem
- LM Studio for making local LLMs accessible
- Piper TTS for high-quality local speech synthesis
- The wawa-lipsync project for real-time lip synchronization
- The open-source AI community for models and tools

---

**Built with ❤️ for privacy, performance, and local AI independence.**

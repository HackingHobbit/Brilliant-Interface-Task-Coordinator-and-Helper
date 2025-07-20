# Brilliant Interface Project Reference Document

## Project Overview

**Project Name:** Brilliant Interface Task Coordinator and Helper (B.I.T.C.H)  
**Type:** AI Assistant with 3D Avatar Interface  
**Architecture:** Full-stack web application with local AI integration  
**Philosophy:** 100% local operation - no cloud dependencies

## Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **3D Rendering:** React Three Fiber
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, custom hooks)
- **Real-time Features:** WebSocket for chat, wawa-lipsync for lip synchronization

### Backend
- **Runtime:** Node.js with Express
- **AI Integration:** OpenAI SDK (configured for LM Studio)
- **Text-to-Speech:** Piper TTS (local)
- **Session Management:** In-memory storage with automatic cleanup
- **File Storage:** JSON-based persistence for AI Persons and memory

### AI Components
- **LLM:** LM Studio (local) - supports Llama, Mistral, etc.
- **TTS:** Piper TTS with multiple voice models
- **Lip Sync:** wawa-lipsync for real-time synchronization
- **Memory:** Short-term (session) and long-term (persistent) memory systems

## Project Structure

```
brilliant-interface/
├── ai/                          # AI system components
│   ├── agents/                  # Identity and role management
│   │   ├── core-identity.json   # Core BITCH identity
│   │   ├── identity-manager.js  # Identity system logic
│   │   └── roles/              # Available roles
│   │       ├── coding-mentor.json
│   │       ├── creative-companion.json
│   │       ├── customer-support.json
│   │       ├── expert-advisor.json
│   │       ├── general-assistant.json
│   │       ├── life-coach.json
│   │       ├── personal-assistant.json
│   │       ├── tutor-educator.json
│   │       └── virtual-girlfriend.json
│   ├── memory/                  # Memory management
│   │   └── memory-manager.js
│   ├── personalities/           # Personality definitions
│   │   ├── creative-thinker.json
│   │   ├── expert-advisor.json
│   │   ├── friendly-helper.json
│   │   ├── humorous-companion.json
│   │   ├── nsfw.json
│   │   └── professional.json
│   └── storage/                 # Data persistence
│       └── ai-persons-store.js
├── config/                      # Configuration files
│   └── models/
│       └── identity-schema.json
├── core/                        # Core application
│   ├── backend/                 # Express server
│   │   ├── index.js            # Main server file
│   │   ├── piper_tts.js        # TTS integration
│   │   └── chat-handler.js     # Chat logic
│   └── frontend/               # React application
│       ├── src/
│       │   ├── components/     # React components
│       │   │   ├── Avatar.jsx
│       │   │   ├── Experience.jsx
│       │   │   ├── IdentitySelector.jsx
│       │   │   ├── SettingsPanel.jsx
│       │   │   └── UI.jsx
│       │   ├── hooks/          # Custom React hooks
│       │   │   ├── useChat.jsx
│       │   │   └── useLipsync.jsx
│       │   └── App.jsx
│       └── public/             # Static assets
│           ├── animations/     # FBX animation files
│           └── models/         # 3D models
├── docs/                       # Documentation
│   ├── AI Personality Architecture.md
│   ├── AI Personality Implementation Plan.md
│   ├── BACKEND_API.md
│   └── PROJECT_REFERENCE.md (this file)
├── media/                      # Media assets
│   ├── assets/
│   │   ├── animations/
│   │   ├── avatars/
│   │   └── voices/
│   └── tts/                    # Piper TTS
└── scripts/                    # Utility scripts

```

## Key Features

### 1. AI Identity System
- **Layered Architecture:**
  - Primary Layer: Fixed core identity ("BITCH")
  - Secondary Layer: Customizable roles
  - Tertiary Layer: Personalities, names, avatars, voices
- **Unique Persistent IDs:** Each AI Person has a UUID for memory continuity
- **User-Given Names:** AI Persons can have custom names (default: "Mary")

### 2. Available Roles (6)
1. **Customer Support Agent** - Professional service representative
2. **Personal Assistant** - Task and schedule management
3. **Tutor/Educator** - Educational guidance and teaching
4. **Expert Advisor** - Specialized knowledge and consultation
5. **Life Coach** - Personal development and motivation
6. **Virtual Girlfriend** - Intimate companion and emotional support

### 3. Available Personalities (6)
1. **Friendly Helper** - Warm and supportive
2. **Professional** - Formal and knowledgeable
3. **Creative Thinker** - Imaginative and innovative
4. **Humorous Companion** - Witty and entertaining
5. **NSFW** - Adult-oriented, flirtatious
6. **Expert Advisor** - Confident and specialized

### 4. Memory System
- **Short-term Memory:** 40 message exchanges per session
- **Long-term Memory:** Persistent storage per AI Person
- **Facts Storage:** Specialized memory for learned information
- **Session Management:** 30-minute timeout with automatic cleanup

### 5. User Interface
- **3D Avatar:** Real-time rendering with expressions and animations
- **Settings Panel:** Comprehensive configuration with tabs:
  - Identity (AI Person management)
  - Visual (Theme and appearance)
  - Audio (Voice and TTS settings)
  - AI Core (Model configuration)
  - Behavior (Feature toggles)
  - Avatar (3D model settings)
  - Advanced (Debug and system settings)
- **Chat Interface:** Real-time messaging with typing indicators
- **Theme Support:** Futuristic (default), Classic, Green Screen

## API Endpoints

### Identity Management
- `GET /identity/roles` - List available roles
- `GET /identity/personalities` - List available personalities
- `GET /identity/current/:sessionId` - Get current identity
- `POST /identity/update` - Update session identity

### AI Person Management
- `GET /api/ai-persons` - List all AI Persons
- `GET /api/ai-persons/:id` - Get specific AI Person
- `POST /api/ai-persons` - Create new AI Person (with name)

### Memory Management
- `POST /memory/facts` - Add fact to AI Person's memory
- `GET /memory/facts/:aiPersonId` - Get facts for AI Person
- `POST /memory/preferences` - Update preferences
- `GET /memory/summary/:aiPersonId` - Get memory summary

### Chat & Session
- `POST /chat` - Send message and receive response
- `POST /clear-session` - Clear session memory
- `GET /health` - Backend health check

## Configuration

### Environment Variables
```bash
# LM Studio
LM_STUDIO_BASE_URL=http://localhost:1234
LM_STUDIO_MODEL=llama-3-8b-lexi-uncensored

# Piper TTS
PIPER_VOICE=en_GB-alba-medium
```

### Default Settings
- **Session Memory:** 20 exchanges (40 messages)
- **Session Timeout:** 30 minutes
- **Default Role:** Personal Assistant
- **Default Personality:** Professional
- **Default Name:** Mary

## Development Workflow

### Starting the Application
```bash
# Backend
cd core/backend
npm start

# Frontend
cd core/frontend
npm run dev
```

### Creating New AI Persons
1. Select role and personality in Settings > Identity
2. Enter a custom name
3. Click "Create New AI Person"
4. The AI Person will have unique memory and identity

### Adding New Roles/Personalities
1. Create JSON file in `ai/agents/roles/` or `ai/personalities/`
2. Follow the existing schema structure
3. Restart backend to load new definitions

## Recent Updates

### Version 2.0 - Identity System Enhancement
- Implemented 6 predefined roles and 6 personalities
- Added user-given names for AI Persons
- Updated frontend to support name input
- Cleaned up deprecated personality files
- Enhanced memory system integration
- Fixed UI layout issues with personality dropdown
- Fixed personality JSON files to use "name" instead of "title"

### Key Changes
1. **Roles:** Replaced generic roles with specific, well-defined roles
2. **Personalities:** Updated from generic to specific personality types, fixed JSON structure
3. **Naming:** AI Persons can now have custom names instead of personality-based names
4. **UI:** Added name input field in Settings panel, fixed personality dropdown styling
5. **Backend:** Updated to support name parameter in AI Person creation
6. **Identity Manager:** Modified to accept custom names via createIdentity method
7. **Bug Fixes:** Fixed all personality JSON files to use "name" field for proper loading

## Testing & Validation

### Identity System Tests
```javascript
// Test script location: scripts/test-identity-system.js
// Tests role loading, personality loading, AI Person creation
```

### Manual Testing Checklist
- [ ] Create AI Person with custom name
- [ ] Switch between roles and personalities
- [ ] Verify memory persistence across sessions
- [ ] Test all 6 roles and 6 personalities
- [ ] Validate UI updates reflect changes

## Future Enhancements

### Planned Features
1. **Voice Cloning** - Custom voice creation
2. **Multi-language Support** - Internationalization
3. **Plugin System** - Extensible architecture
4. **Advanced Memory** - Semantic search and retrieval
5. **Emotion Detection** - Voice and facial analysis

### Architecture Improvements
1. **Database Integration** - Replace JSON storage
2. **Distributed Memory** - Redis/cache layer
3. **API Authentication** - Security layer
4. **WebRTC Integration** - Real-time communication
5. **Model Fine-tuning** - Custom AI training

## Troubleshooting

### Common Issues

1. **LM Studio Connection Failed**
   - Ensure LM Studio is running on port 1234
   - Check model is loaded in LM Studio

2. **Piper TTS No Audio**
   - Verify Python and Piper are installed
   - Check voice model files exist

3. **Memory Not Persisting**
   - Check write permissions on ai/storage/data/
   - Verify AI Person ID is correctly linked

4. **Frontend Not Updating**
   - Clear browser cache
   - Check WebSocket connection
   - Verify backend is running

## Contributing Guidelines

### Code Style
- Use ES6+ JavaScript features
- Follow React best practices
- Maintain consistent indentation (2 spaces)
- Add JSDoc comments for functions

### Git Workflow
1. Create feature branch from main
2. Make atomic commits with clear messages
3. Test thoroughly before PR
4. Update documentation as needed

### Adding Features
1. Discuss in issues first
2. Follow existing patterns
3. Add tests where applicable
4. Update this reference document

## License & Credits

This project is open source. Key dependencies:
- React Three Fiber ecosystem
- LM Studio for local LLMs
- Piper TTS for speech synthesis
- wawa-lipsync for lip synchronization

---

*Last Updated: [Current Date]*  
*Version: 2.0*  
*Maintainer: AI Assistant*

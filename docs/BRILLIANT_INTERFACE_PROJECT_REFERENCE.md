# Brilliant Interface Project Reference Document

## Project Overview

**Project Name**: Brilliant Interface Task Coordinator and Helper (B.I.T.C.H.)  
**Type**: 100% Local AI Assistant with 3D Avatar Interface  
**Technology Stack**: React, Three.js, Node.js, Express, Local LLM, Piper TTS  
**Philosophy**: Complete local operation with no cloud dependencies

## Directory Structure

```
brilliant-interface/
├── ai/                          # AI-related modules
│   ├── agents/                  # Agent configurations
│   │   ├── core-identity.json   # Core identity definition
│   │   ├── identity-manager.js  # Identity management logic
│   │   └── roles/              # Predefined roles
│   ├── llm/                    # LLM integration (future)
│   ├── memory/                 # Memory management
│   │   ├── memory-manager.js   # Memory operations
│   │   └── data/               # Memory storage
│   ├── personalities/          # Personality definitions
│   └── storage/                # AI person storage
│       ├── ai-persons-store.js # Storage operations
│       └── data/               # Persistent data
├── config/                     # Configuration files
│   ├── defaults/               # Default configurations
│   ├── environments/           # Environment configs
│   └── models/                 # Data models
│       └── identity-schema.json # Identity schema
├── core/                       # Core application
│   ├── backend/                # Backend server
│   │   ├── index.js           # Main server file
│   │   ├── chat-handler.js    # Chat processing
│   │   ├── piper_tts.js       # TTS integration
│   │   └── piper_wrapper.py   # Python TTS wrapper
│   ├── frontend/               # React frontend
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   │   ├── Avatar.jsx # 3D avatar component
│   │   │   │   ├── Experience.jsx # 3D scene
│   │   │   │   ├── UI.jsx    # User interface
│   │   │   │   └── SettingsPanel.jsx # Settings
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── utils/         # Utility functions
│   │   └── public/            # Static assets
│   │       ├── models/        # 3D models
│   │       └── animations/    # Animation files
│   └── shared/                # Shared utilities
├── docs/                      # Documentation
│   ├── api/                   # API documentation
│   ├── development/           # Development guides
│   └── setup/                 # Setup instructions
├── media/                     # Media assets
│   ├── assets/                # General assets
│   │   ├── voices/           # Voice models
│   │   └── avatars/          # Avatar assets
│   ├── tts/                  # Text-to-speech
│   │   └── piper1-gpl/       # Piper TTS engine
│   └── wawa-lipsync/         # Lip sync library
├── scripts/                   # Utility scripts
├── services/                  # Service modules
├── tools/                     # Development tools
└── ui/                       # UI extensions
    └── themes/               # UI themes
```

## Key Components

### Frontend Components

#### Avatar.jsx
- **Purpose**: Renders and controls the 3D avatar
- **Features**:
  - Real-time lip sync with wawa-lipsync
  - Facial expressions (default, smile, sad, angry, surprised, funnyFace, crazy)
  - Body animations (Talking_0/1/2, Crying, Laughing, Rumba, Idle, Terrified, Angry)
  - Eye blinking and winking
  - Morph target controls for expressions
  - Audio playback integration

#### Experience.jsx
- **Purpose**: Sets up the 3D scene
- **Features**:
  - Camera controls with zoom functionality
  - Environment lighting
  - Contact shadows
  - Avatar placement

#### UI.jsx
- **Purpose**: Main user interface
- **Features**:
  - Chat input and message handling
  - Theme switching (futuristic/classic)
  - Settings panel integration
  - Backend health monitoring
  - Identity display
  - Control buttons (zoom, green screen, settings)

#### SettingsPanel.jsx
- **Purpose**: Configuration interface
- **Features**:
  - Tabbed interface (Appearance, Audio, AI, Behavior, Debug)
  - Identity management
  - Voice selection
  - Memory controls
  - Theme customization

### Backend Components

#### index.js (Main Server)
- **Endpoints**:
  - `/health` - Backend health check
  - `/chat` - Chat message processing
  - `/clear-session` - Clear session memory
  - `/voices` - List available voices
  - `/identity/*` - Identity management endpoints

#### chat-handler.js
- **Purpose**: Process chat messages
- **Features**:
  - LM Studio integration
  - Session memory management
  - Identity-aware responses
  - Structured JSON responses

#### piper_tts.js
- **Purpose**: Text-to-speech synthesis
- **Features**:
  - Piper TTS integration
  - Voice selection
  - Audio generation
  - Base64 audio encoding

### AI System Components

#### Identity System
- **Layered Architecture**:
  1. **Primary Layer**: Fixed core identity ("BITCH")
  2. **Secondary Layer**: Customizable role
  3. **Tertiary Layer**: Personality, name, avatar, voice

#### Memory System
- **Short-term Memory**: Session-based (40 exchanges)
- **Long-term Memory**: Persistent storage by AI Person ID
- **Facts Memory**: Specialized knowledge store

#### Personalities
- Predefined personalities:
  - Friendly Helper
  - Professional Advisor
  - Creative Thinker
  - Humorous Companion
  - Virtual Girlfriend
  - Energetic Motivator

#### Roles
- Predefined roles:
  - Customer Support Agent
  - Personal Assistant
  - Tutor/Educator
  - Entertainment Host
  - Life Coach
  - Technical Expert

## Configuration Files

### identity-schema.json
```json
{
  "id": "string (UUID)",
  "coreIdentity": "BITCH",
  "role": {
    "name": "string",
    "description": "string"
  },
  "personality": {
    "name": "string",
    "traits": ["array of strings"],
    "avatar": "string",
    "voice": "string"
  }
}
```

## Key Technologies

### Frontend
- **React 18**: UI framework
- **React Three Fiber**: 3D rendering
- **Three.js**: 3D graphics library
- **Tailwind CSS**: Styling
- **Vite**: Build tool
- **wawa-lipsync**: Lip synchronization

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **Python**: For Piper TTS wrapper
- **Piper TTS**: Local text-to-speech
- **LM Studio**: Local LLM hosting

### AI/ML
- **Local LLM**: Via LM Studio
- **Piper TTS**: Neural text-to-speech
- **wawa-lipsync**: Real-time lip sync

## API Endpoints

### Chat API
- **POST /chat**
  - Body: `{ message, sessionId }`
  - Response: `{ text, facialExpression, animation, audio, lipsync }`

### Identity API
- **GET /identity/list**: List all AI Persons
- **GET /identity/current/:sessionId**: Get current identity
- **POST /identity/create**: Create new AI Person
- **PUT /identity/update/:id**: Update AI Person
- **DELETE /identity/delete/:id**: Delete AI Person
- **POST /identity/set-current**: Set current identity

### Session API
- **POST /clear-session**: Clear session memory
- **GET /health**: Backend health check
- **GET /voices**: List available voices

## Development Workflow

### Starting the Application
```bash
# Start backend
cd core/backend
npm start

# Start frontend (in new terminal)
cd core/frontend
npm run dev

# Start LM Studio
# Load your preferred model
```

### Key Files to Modify

#### Adding New Personalities
1. Create JSON file in `ai/personalities/`
2. Define personality traits and prompts
3. Update identity manager if needed

#### Adding New Roles
1. Create JSON file in `ai/agents/roles/`
2. Define role description and behavior
3. Update role selection in settings

#### Customizing Avatar
1. Modify `core/frontend/src/components/Avatar.jsx`
2. Add new expressions in `facialExpressions` object
3. Add new animations to the animations list

#### Adding New Features
1. Backend: Add endpoints in `core/backend/index.js`
2. Frontend: Add UI components in `core/frontend/src/components/`
3. Update hooks in `core/frontend/src/hooks/` as needed

## Common Issues and Solutions

### Audio Not Playing
- Check Piper TTS path in backend
- Verify voice model files exist
- Check browser console for audio errors

### Avatar Not Showing
- Ensure GLB model files are in public/models/
- Check for Three.js errors in console
- Verify Avatar import in Experience.jsx

### Identity Not Saving
- Check ai-persons.json file permissions
- Verify storage directory exists
- Check for errors in identity-manager.js

### LM Studio Connection Issues
- Ensure LM Studio is running
- Check port 1234 is not blocked
- Verify model is loaded in LM Studio

## Testing Checklist

### Frontend Testing
- [ ] Chat input and message sending
- [ ] Avatar rendering and animations
- [ ] Settings panel functionality
- [ ] Theme switching
- [ ] Audio playback
- [ ] Identity selection
- [ ] Memory clearing

### Backend Testing
- [ ] All API endpoints responding
- [ ] Session management working
- [ ] Identity CRUD operations
- [ ] TTS audio generation
- [ ] LM Studio integration

### Integration Testing
- [ ] End-to-end chat flow
- [ ] Audio with lip sync
- [ ] Identity persistence
- [ ] Memory management
- [ ] Error handling

## Future Enhancements

### Planned Features
- Speech-to-text integration
- Vision recognition capabilities
- Advanced memory systems
- Plugin architecture
- Voice cloning
- Custom animation editor
- Multi-language support

### Architecture Improvements
- Modular plugin system
- Enhanced error handling
- Performance optimizations
- Extended API capabilities
- Better state management

## Resources

### Documentation
- [Backend API Documentation](./api/BACKEND_API.md)
- [Project Structure](./development/PROJECT_STRUCTURE.md)
- [Installation Guide](./setup/INSTALLATION.md)
- [AI Personality Architecture](./AI%20Personality%20Architecture.md)
- [Implementation Plan](./AI%20Personality%20Implementation%20Plan.md)

### External Resources
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [LM Studio](https://lmstudio.ai/)
- [Piper TTS](https://github.com/rhasspy/piper)
- [wawa-lipsync](https://github.com/wawa-lipsync/wawa-lipsync)

---

*This reference document provides a comprehensive overview of the Brilliant Interface project structure, components, and development guidelines. Use it as a guide for understanding and extending the application.*

# Brilliant Interface Project Reference Document

## Project Overview

**Project Name**: Brilliant Interface Task Coordinator and Helper (B.I.T.C.H)  
**Type**: Local AI Assistant with 3D Avatar Interface  
**Architecture**: Full-stack web application with AI integration  
**Philosophy**: 100% local operation - no cloud dependencies, complete privacy

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **3D Rendering**: React Three Fiber
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Theme**: Futuristic/Cyberpunk UI with customizable themes

### Backend
- **Runtime**: Node.js with Express
- **Language Model**: LM Studio (local LLM hosting)
- **Text-to-Speech**: Piper TTS (local synthesis)
- **Lip Sync**: wawa-lipsync (real-time synchronization)
- **Storage**: File-based JSON storage (development)

### AI System
- **Identity System**: Layered architecture (Core → Role → Personality)
- **Memory Management**: Short-term (session) and long-term (persistent)
- **Voice Models**: Multiple Piper TTS voices (British/American)
- **Avatar System**: 3D models with expressions and animations

## Project Structure

```
brilliant-interface/
├── ai/                          # AI system components
│   ├── agents/                  # Identity management
│   │   ├── identity-manager.js  # Core identity logic
│   │   └── roles/              # Role definitions
│   ├── memory/                 # Memory management
│   │   └── memory-manager.js   # Memory persistence
│   ├── personalities/          # Personality definitions
│   └── storage/               # AI Person storage
│       └── ai-persons-store.js
├── config/                    # Configuration files
│   └── models/               # Data schemas
│       └── identity-schema.json
├── core/                     # Core application
│   ├── backend/             # Express server
│   │   ├── index.js        # Main server file
│   │   └── piper_tts.js    # TTS integration
│   └── frontend/           # React application
│       └── src/
│           ├── components/ # React components
│           └── hooks/     # Custom React hooks
├── docs/                  # Documentation
├── media/                 # Media assets
│   ├── assets/           # Voices, animations
│   └── tts/             # TTS engine files
└── scripts/             # Utility scripts
```

## Key Features

### 1. AI Identity System
- **Layered Architecture**:
  - Core Identity: Fixed "BITCH"
  - Role Layer: Defines function (assistant, tutor, etc.)
  - Personality Layer: Behavioral traits and presentation
- **Unique AI Persons**: Each with UUID and persistent memory
- **Multiple Personalities**: 6+ predefined options

### 2. Memory System
- **Short-term Memory**: 40 message exchanges per session
- **Long-term Memory**: Persistent across sessions
- **Facts Storage**: Specialized knowledge base
- **Memory Consolidation**: Automatic summarization

### 3. User Interface
- **3D Avatar**: Real-time rendering with expressions
- **Chat Interface**: Persistent message history
- **Settings Panel**: Comprehensive configuration
- **Theme Support**: Futuristic, Classic, Green Screen

### 4. Backend APIs

#### Identity Management
- `GET /identity/roles` - List available roles
- `GET /identity/personalities` - List personalities
- `GET /identity/current/:sessionId` - Get current identity
- `POST /identity/update` - Update identity

#### AI Person Management
- `GET /api/ai-persons` - List all AI Persons
- `GET /api/ai-persons/:id` - Get specific AI Person
- `POST /api/ai-persons` - Create new AI Person
- `PUT /api/ai-persons/:id` - Update AI Person
- `DELETE /api/ai-persons/:id` - Delete AI Person

#### Memory Management
- `POST /memory/facts` - Add fact to memory
- `GET /memory/facts/:aiPersonId` - Get facts
- `POST /memory/preferences` - Update preferences
- `GET /memory/summary/:aiPersonId` - Get memory summary

#### Core Functions
- `POST /chat` - Send message and get response
- `POST /clear-session` - Clear session memory
- `GET /health` - Health check
- `GET /voices` - List available voices

## Configuration

### Environment Variables
```bash
LM_STUDIO_BASE_URL=http://localhost:1234
LM_STUDIO_MODEL=llama-3-8b-lexi-uncensored
PIPER_VOICE=en_GB-alba-medium
```

### Identity Schema
```json
{
  "id": "uuid",
  "coreIdentity": "BITCH",
  "role": {
    "name": "Role Name",
    "description": "Role Description"
  },
  "personality": {
    "name": "Display Name",
    "traits": ["trait1", "trait2"],
    "avatar": "avatar_reference",
    "voice": "voice_reference"
  }
}
```

## Development Guidelines

### Code Style
- ES6+ JavaScript with modules
- Async/await for asynchronous operations
- Comprehensive error handling
- Console logging with emojis for clarity

### State Management
- Session-based conversation tracking
- Persistent AI Person storage
- Memory isolation per AI Person
- Automatic session cleanup (30 minutes)

### Security Considerations
- Local-only operation
- No external API calls (except LM Studio)
- File-based storage (upgrade to DB for production)
- Input validation on all endpoints

## Testing Approach

### Unit Tests
- Identity schema validation
- Memory management functions
- API endpoint validation

### Integration Tests
- Full identity update flow
- Memory persistence
- Chat functionality

### UI/UX Tests
- Settings panel functionality
- Avatar customization
- Theme switching

## Known Issues & Limitations

### Current Limitations
1. File-based storage (not production-ready)
2. Single-user system (no multi-tenancy)
3. Limited voice options
4. Basic memory summarization

### Planned Improvements
1. Database integration
2. Advanced NLP for memory
3. More voice models
4. Plugin system

## Deployment Considerations

### System Requirements
- Node.js 18+
- Python 3.x (for Piper TTS)
- 4GB+ RAM recommended
- LM Studio with loaded model

### Performance Optimization
- Lazy loading for avatars
- Memory pagination
- Session cleanup
- Response caching

## Maintenance

### Regular Tasks
1. Memory storage cleanup
2. Session data pruning
3. Log rotation
4. Model updates

### Monitoring
- Health endpoint checks
- Memory usage tracking
- Response time monitoring
- Error rate tracking

## Future Roadmap

### Phase 1: Foundation ✅
- Basic chat functionality
- Identity system
- Memory management

### Phase 2: Intelligence 🚧
- Enhanced memory system
- Context awareness
- Learning capabilities

### Phase 3: Expansion
- Multi-language support
- Voice cloning
- Vision capabilities

### Phase 4: Advanced Features
- Plugin system
- Web integration
- File system access

## Contributing Guidelines

### Code Contributions
1. Follow existing patterns
2. Add comprehensive comments
3. Include error handling
4. Update documentation

### Testing Requirements
- Unit tests for new features
- Integration test coverage
- UI testing for components
- Performance benchmarks

## Support & Resources

### Documentation
- API Documentation: `/docs/api/BACKEND_API.md`
- Architecture: `/docs/AI Personality Architecture.md`
- Setup Guide: `/docs/setup/INSTALLATION.md`

### Community
- GitHub Issues for bug reports
- Feature requests via discussions
- Code reviews for PRs

---

*Last Updated: [Current Date]*  
*Version: 1.0.0*  
*Status: Active Development*

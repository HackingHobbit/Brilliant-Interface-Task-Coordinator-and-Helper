# Project Structure

This document explains the logical organization of the Brilliant Interface codebase.

## 🏗️ **Directory Structure**

```
brilliant-interface/
├── README.md                          # Main project documentation
├── package.json                       # Root workspace configuration
├── .gitignore                         # Git ignore rules
├── docs/                              # Documentation
│   ├── setup/                         # Installation and setup guides
│   ├── api/                           # API documentation
│   └── development/                   # Development guides
├── core/                              # Core application components
│   ├── frontend/                      # React Three Fiber UI
│   ├── backend/                       # Express API server
│   └── shared/                        # Shared utilities and types
├── ai/                                # AI-related components
│   ├── llm/                          # LLM integration and prompts
│   ├── memory/                       # Memory system (Phase 2)
│   ├── personalities/                # Personality definitions
│   └── agents/                       # Agentic capabilities (Phase 5)
├── media/                             # Media processing and assets
│   ├── tts/                          # Text-to-speech (Piper integration)
│   ├── stt/                          # Speech-to-text (Phase 4)
│   ├── vision/                       # Computer vision (Phase 4)
│   ├── wawa-lipsync/                 # Lip sync library
│   └── assets/                       # 3D models, voices, animations
│       ├── avatars/
│       ├── voices/
│       └── animations/
├── ui/                                # UI components and themes
│   ├── components/                   # Reusable UI components
│   ├── themes/                       # Futuristic themes (Phase 1)
│   ├── settings/                     # Settings menu system (Phase 1)
│   └── plugins/                      # Plugin UI components (Phase 6)
├── services/                          # External integrations and services
│   ├── file-system/                  # File manipulation (Phase 5)
│   ├── web-scraping/                 # Web integration (Phase 5)
│   ├── system-integration/           # Calendar, weather, etc. (Phase 2)
│   └── backup/                       # Backup and sync (Phase 2)
├── tools/                             # Development and creation tools
│   ├── animation-editor/             # Custom animation creation (Phase 6)
│   ├── voice-cloning/               # Voice cloning tools (Phase 6)
│   └── model-importer/              # 3D model import tools (Phase 3)
├── config/                            # Configuration files
│   ├── environments/
│   ├── models/
│   └── defaults/
└── scripts/                           # Build and deployment scripts
    ├── setup/
    ├── build/
    └── deploy/
```

## 🎯 **Design Principles**

### **1. Logical Separation**
- **`core/`** - Essential application functionality that must always work
- **`ai/`** - All AI-related features grouped for easy development
- **`media/`** - Audio, visual, and asset processing in one place
- **`ui/`** - User interface and experience components
- **`services/`** - External integrations and system services
- **`tools/`** - Creation and development utilities

### **2. Future-Ready Organization**
Each directory is organized to support the development roadmap:
- **Phase 1** features → `ui/themes/` and `ui/settings/`
- **Phase 2** features → `ai/memory/` and `services/system-integration/`
- **Phase 3** features → `media/assets/` and `tools/model-importer/`
- **Phase 4** features → `media/stt/` and `media/vision/`
- **Phase 5** features → `ai/agents/` and `services/`
- **Phase 6** features → `tools/` and `ui/plugins/`

### **3. Workspace Management**
- **Root package.json** manages all workspaces
- **Shared dependencies** prevent duplication
- **Consistent naming** with `@brilliant-interface/` scope
- **Independent development** of each component

## 🚀 **Development Workflow**

### **Adding New Features**
1. Identify which phase the feature belongs to
2. Place code in the appropriate directory
3. Update workspace dependencies if needed
4. Add documentation to relevant docs/ subdirectory

### **Running the Application**
```bash
# From root directory
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend
```

### **Building for Production**
```bash
npm run build           # Build both components
npm run build:frontend  # Build only frontend
npm run build:backend   # Build only backend
```

This structure ensures the codebase remains organized and scalable as we implement the full roadmap.

# Layered Identity System

## Overview

The Brilliant Interface implements a sophisticated three-layer identity architecture that allows users to customize their AI agent while maintaining core consistency. This system provides flexibility in presentation and specialization while preserving the foundational BITCH identity.

## Architecture

### Layer 1: Core Identity (BITCH)
**Immutable Foundation**

- **Name**: BITCH (Brilliant Interface Task Coordinator and Helper)
- **Purpose**: Provides the fundamental AI consciousness and personality
- **Characteristics**: Helpful, friendly, intelligent, adaptive, task-oriented
- **System Prompt**: Contains the core behavioral instructions that remain consistent across all instances

**Key Features:**
- Cannot be modified by users
- Ensures consistent AI behavior and identity
- Maintains the casual nickname option ("you can call me your bitch")
- Provides the foundational personality traits and values

### Layer 2: Role Specialization
**Functional Adaptation**

Roles modify how the core BITCH identity expresses itself for specific purposes:

#### Available Roles:

1. **General Assistant** (`general-assistant`)
   - Versatile helper for everyday tasks
   - Balanced communication style
   - Broad knowledge base

2. **Coding Mentor** (`coding-mentor`)
   - Specialized programming instructor
   - Technical communication style
   - Proactive with suggestions and best practices

3. **Creative Companion** (`creative-companion`)
   - Imaginative partner for creative projects
   - Creative communication style
   - Encourages artistic risk-taking

#### Role Properties:
- **Communication Style**: Professional, casual, technical, creative, supportive
- **Expertise Areas**: Specific knowledge domains
- **Response Length**: Concise, moderate, detailed
- **Proactivity Level**: Reactive, balanced, proactive
- **System Prompt Addition**: Role-specific behavioral instructions

### Layer 3: Presentation Layer
**User Customization**

The outermost layer allows users to personalize their AI's presentation:

#### Customizable Elements:

1. **Name**: Custom identifier (e.g., "Alex", "Luna")
2. **Personality Traits**: Numerical scales (0-1) for:
   - Enthusiasm
   - Formality
   - Humor
   - Empathy

3. **Avatar Configuration**:
   - 3D Model path
   - Animation set
   - Default facial expression

4. **Voice Settings**:
   - Provider (Piper TTS, Web Speech, Custom)
   - Voice ID
   - Speed and pitch adjustments

#### Available Personalities:

1. **Default** - Balanced BITCH personality
2. **Professional** (Alex) - Formal, business-oriented
3. **Enthusiastic** (Luna) - High energy, creative, supportive

## Implementation

### Backend Components

1. **Identity Manager** (`ai/agents/identity-manager.js`)
   - Loads and manages all identity layers
   - Combines layers into complete identities
   - Generates dynamic system prompts

2. **Configuration Files**:
   - `ai/agents/core-identity.json` - Immutable core identity
   - `ai/agents/roles/*.json` - Role definitions
   - `ai/personalities/*.json` - Personality templates

3. **API Endpoints**:
   - `GET /identity/roles` - Available roles
   - `GET /identity/personalities` - Available personalities
   - `POST /identity/set` - Set session identity
   - `GET /identity/current/:sessionId` - Current identity

### Frontend Components

1. **IdentitySelector** (`core/frontend/src/components/IdentitySelector.jsx`)
   - User interface for identity customization
   - Real-time preview of selections
   - Integration with backend APIs

2. **UI Integration**:
   - Identity selector button in main interface
   - Session-based identity persistence
   - Seamless switching between configurations

## Usage

### For Users

1. **Access Identity Selector**: Click the identity button in the UI
2. **Choose Role**: Select functional specialization
3. **Select Personality**: Choose presentation style
4. **Apply Changes**: Confirm new identity configuration

### For Developers

#### Creating New Roles

```json
{
  "role": {
    "id": "new-role-id",
    "name": "Role Name",
    "description": "Role description",
    "behaviorModifiers": {
      "communicationStyle": "professional",
      "expertise": ["domain1", "domain2"],
      "responseLength": "detailed",
      "proactivity": "proactive"
    },
    "systemPromptAddition": "Additional behavioral instructions"
  }
}
```

#### Creating New Personalities

```json
{
  "presentation": {
    "name": "Custom Name",
    "personalityTraits": {
      "enthusiasm": 0.8,
      "formality": 0.3,
      "humor": 0.7,
      "empathy": 0.9
    },
    "avatar": {
      "modelPath": "/models/custom-model.glb",
      "animationSet": "default",
      "defaultExpression": "smile"
    },
    "voice": {
      "provider": "piper",
      "voiceId": "custom-voice",
      "settings": {
        "speed": 1.1,
        "pitch": 1.05
      }
    }
  }
}
```

## System Prompt Generation

The system combines all layers to create dynamic prompts:

1. **Core Identity**: Base BITCH personality and instructions
2. **Role Addition**: Specialized behavioral modifications
3. **Personality Adjustments**: Trait-based communication style changes
4. **JSON Formatting**: Technical response format requirements

Example generated prompt structure:
```
[Core BITCH Identity Instructions]

ROLE SPECIALIZATION:
[Role-specific behavioral additions]

PERSONALITY ADJUSTMENTS:
[Trait-based modifications]

[JSON formatting requirements]
```

## Benefits

1. **Consistency**: Core BITCH identity ensures reliable behavior
2. **Specialization**: Roles provide domain expertise
3. **Personalization**: Users can customize presentation
4. **Scalability**: Easy to add new roles and personalities
5. **Backward Compatibility**: System gracefully falls back to legacy behavior

## Future Enhancements

1. **Custom Avatar Import**: User-uploaded 3D models
2. **Voice Cloning**: Custom voice generation
3. **Advanced Personality Traits**: More granular customization
4. **Role Combinations**: Multi-role specializations
5. **Learning Preferences**: Adaptive personality based on usage

## Technical Notes

- All identity configurations are validated against JSON schemas
- Session-based identity persistence prevents conflicts
- Graceful fallback to legacy system if identity system fails
- Real-time system prompt generation for optimal performance
- Modular architecture allows independent layer updates

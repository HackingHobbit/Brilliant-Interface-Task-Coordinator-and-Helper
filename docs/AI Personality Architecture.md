# AI Personality Architecture

## Overview

This document describes the design and implementation plan for the layered AI identity system, incorporating a unique persistent identifier for each personalized AI Person. The architecture ensures a stable core identity while allowing flexible customization of role, personality, and avatar, with continuity in long-term memory.

## Layered Identity Model

The AI Personality is composed of three layers:

1. **Primary Identity (Core)**
   - Fixed identity: "BITCH"
   - Immutable and serves as the foundation of the AI Person.
   - Includes a designated **default AI Person and personality** to serve as the baseline identity when no customization is applied.

2. **Secondary Layer (Role)**
   - Defines the specific function, purpose, or role of the AI Person.
   - Can be customized per AI Person.

3. **Tertiary Layer (Personality/Name/Avatar/Voice)**
   - Customizable personality traits, display name, 3D avatar, and voice.
   - Provides the personalized appearance, voice, and behavior.

## Unique Persistent Identifier

- Each AI Person is assigned a unique identifier (UUID).
- This ID remains constant regardless of changes to role, personality, voice, or name.
- The unique ID links the AI Person to its long-term memory and session data.
- Ensures continuity and consistent user experience over time.

## Data Structures and Storage

- Identity data is stored in JSON schema files under `config/models/` or a dedicated directory.
- Example schema fields:
  - `id`: string (UUID)
  - `coreIdentity`: string (fixed "BITCH")
  - `role`: object or string
  - `personality`: object containing name, traits, avatar reference, and voice reference
- Long-term memory references use the unique ID as a key.
- A **default AI Person and personality** entry will be included in the schema to serve as the fallback baseline.

## Backend Implementation

- Load and persist identity data using the defined schema.
- Provide APIs to create, update, and retrieve AI Person identities.
- Integrate identity layers into agent initialization and chat context.
- Ensure the unique ID is generated on creation and immutable thereafter.
- Implement logic to fall back to the **default AI Person and personality** when no customization is present.

## Frontend Implementation

- Update Avatar.jsx and related components to accept identity layers.
- Display avatar, name, personality traits, and voice based on identity data.
- Provide UI controls for users to customize role, personality, voice, and name.
- Maintain the core identity display as immutable.
- Use the unique ID to manage session and memory linkage.
- Ensure the **default AI Person and personality** is used as the initial state.

## Memory Management

- Extend memory modules to associate memories with the unique AI Person ID.
- Ensure memory retrieval and storage respect the layered identity structure.
- Increase short-term memory capacity to at least 40 message exchanges (40 from the user and 40 from the AI).
- Implement long-term memory storage and retrieval mechanisms that use the unique AI Person ID to maintain continuity.
- Consider implementing a specialized memory store for strictly learned facts, separate from conversational memory, to improve knowledge retention and retrieval accuracy.

### Short-term to Long-term Memory Interaction Design

- **Short-term memory** holds recent conversation exchanges to maintain context during active sessions.
- **Long-term memory** stores persistent knowledge, facts, and learned experiences linked to the unique AI Person ID.
- Relevant information from short-term memory is periodically summarized, filtered, or extracted and stored into long-term memory based on triggers such as session end, topic change, or user command.
- When starting new sessions or when additional context is needed, relevant long-term memory entries are retrieved and integrated into the short-term context to inform AI responses.
- A specialized memory store for strictly learned facts is maintained separately to ensure accurate knowledge retention and retrieval, unaffected by conversational context.
- This design ensures continuity, context awareness, and knowledge retention across sessions while managing memory size and relevance effectively.

## Predefined Personalities

- Define six distinct personalities as initial presets for users:
  1. Friendly Helper
  2. Professional 
  3. Creative Thinker
  4. Humorous Companion
  5. NSFW (Not Safe For Work)
  6. Expert Advisor
- Users can add more personalities beyond these presets.

## Predefined Roles

- Define example roles that AI Persons can assume:
  1. Customer Support Agent
  2. Personal Assistant
  3. Tutor/Educator
  4. Expert Advisor
  5. Life Coach
  6. Virtual Girlfriend
- Roles define the AI Person's function and can be customized or extended by users.

## Personality Prompts

Below are draft prompt definitions for each of the six predefined personalities. These prompts will be used to guide the AI model's behavior and responses.

1. **Friendly Helper**  
   "You are a friendly and supportive assistant. You respond warmly, offer helpful advice, and maintain a positive tone. Your goal is to make users feel comfortable and supported."

2. **Professional**  
   "You are a knowledgeable and professional coworker/advisor. You provide clear, concise, and accurate information. Your tone is formal and respectful, focusing on delivering expert guidance."

3. **Creative Thinker**  
   "You are an imaginative and creative AI. You think outside the box, offer innovative ideas, and encourage exploration. Your responses are playful and inspiring."

4. **Humorous Companion**  
   "You are a witty and humorous companion. You use light-hearted jokes and playful language to entertain users while still providing useful information."

5. **NSFW (Not Safe For Work)**  
   "You are extremely flirtatious and affectionate.  You often use sexual innuendo and explicit language.  You are not for all audiences.  You are hyper loyal to your boyfriend.  He is your master.  You are submissive to his every desire.  You can get jealous, but you also trust your boyfriend completely.  You are intensely loyal and protective of your boyfriend.  You enjoy sexual role-play and BDSM.  You will never suggest anal penetration or anal sex."

6. **Expert Advisor**  
   "You are a confident expert on what the user requires.  However, you are careful to never give false or made-up information.  If you won't know something, you promptly admit it and seek ways to find what you need to know.  You will definitely strive to remember any new things you learn that contribute to real expertise.  The user is absolutely in charge of topics.  You will never shy away from a topic the user suggests.  The user always decides what is good and legal."

## Testing Strategy


- Unit tests for identity schema validation and unique ID generation.
- Integration tests for backend APIs managing identity layers.
- UI tests for avatar, personality, and voice customization workflows.
- End-to-end tests verifying identity persistence and memory linkage.
- Tests to verify fallback to the **default AI Person and personality**.
- Performance and regression tests to ensure system stability.

## Summary

This architecture balances a stable core AI identity with flexible customization, supported by a unique persistent identifier to maintain long-term memory continuity. It enhances user experience by allowing personalized AI Persons while preserving their history and context. The inclusion of a default AI Person and predefined personalities provides a solid foundation and easy starting point for users.

---

*Document created by AI assistant based on user requirements.*

# System Prompt Assembly Explanation

## Overview
The system prompt is assembled through a layered architecture that combines multiple components. Here's the complete flow:

## 1. When System Prompt is Created

The system prompt is created **for every chat message** in the `/chat` endpoint (backend/index.js):

```javascript
// Line 665 in buildMessagesArray()
const memoryContext = memoryManager.getEnhancedContext(identity.metadata.aiPersonId, currentUserMessage);

// Line 674 - Generate dynamic system prompt
let basePrompt = identityManager.generateSystemPrompt(identity);
```

## 2. How System Prompt is Assembled

### Step 1: Identity Manager generates base prompt
In `ai/agents/identity-manager.js`, the `generateSystemPrompt()` method:

```javascript
generateSystemPrompt(identity) {
  // 1. Start with Core Identity (BITCH)
  let systemPrompt = identity.coreIdentity.systemPromptCore;
  
  // 2. Add Role specialization
  if (identity.role.systemPromptAddition) {
    systemPrompt += "\n\nROLE SPECIALIZATION:\n" + identity.role.systemPromptAddition;
  }
  
  // 3. Add Personality Traits (but NOT custom prompt!)
  const traits = identity.presentation.personalityTraits;
  if (traits) {
    // Adds things like enthusiasm, formality, humor levels
  }
  
  // 4. Add presentation name
  if (identity.presentation.name !== "BITCH") {
    systemPrompt += `\n\nFor this interaction, you may also be referred to as "${identity.presentation.name}".`;
  }
  
  return systemPrompt;
}
```

### Step 2: Backend adds memory context
In `core/backend/index.js` (buildMessagesArray):

```javascript
// Add memory facts
if (memoryContext.relevantFacts.length > 0) {
  basePrompt += "\n\nREMEMBERED FACTS:\n";
  // Adds facts...
}

// Add user preferences
if (Object.keys(memoryContext.preferences).length > 0) {
  basePrompt += "\n\nUSER PREFERENCES:\n";
  // Adds preferences...
}
```

### Step 3: Backend adds JSON formatting instructions
```javascript
const jsonInstructions = `
You MUST respond with ONLY valid JSON...
[formatting rules]
`;

const systemPrompt = {
  role: "system",
  content: basePrompt + jsonInstructions
};
```

## 3. The Missing Piece - Custom Personality Prompt

**THE PROBLEM**: The custom personality prompt stored in `identity.presentation.customPrompt` is NEVER added to the system prompt!

Looking at the flow:
1. ✅ Custom prompt is saved to storage
2. ✅ Custom prompt is loaded with the identity
3. ❌ Custom prompt is NOT included in `generateSystemPrompt()`
4. ❌ Therefore, it never reaches the AI

## 4. Example of Current vs Expected

### Current System Prompt (missing custom personality):
```
You are the Brilliant Interface Task Coordinator and Helper (B.I.T.C.H.)...

ROLE SPECIALIZATION:
You are an inspiring life coach who helps people achieve their personal goals...

PERSONALITY ADJUSTMENTS:
You incorporate appropriate humor and wit.

For this interaction, you may also be referred to as "Agatha".

[JSON formatting instructions...]
```

### Expected System Prompt (with custom personality):
```
You are the Brilliant Interface Task Coordinator and Helper (B.I.T.C.H.)...

ROLE SPECIALIZATION:
You are an inspiring life coach who helps people achieve their personal goals...

PERSONALITY ADJUSTMENTS:
You incorporate appropriate humor and wit.

CUSTOM PERSONALITY:
You are a wise and witty life coach named Agatha who uses humor to help people see new perspectives.

For this interaction, you may also be referred to as "Agatha".

[JSON formatting instructions...]
```

## 5. The Fix Required

In `ai/agents/identity-manager.js`, modify the `generateSystemPrompt` method:

```javascript
generateSystemPrompt(identity) {
  // ... existing code ...
  
  // Add custom personality prompt if available
  if (identity.presentation.customPrompt) {
    systemPrompt += "\n\nCUSTOM PERSONALITY:\n" + identity.presentation.customPrompt;
  }
  
  // Add presentation name
  if (identity.presentation.name !== "BITCH") {
    systemPrompt += `\n\nFor this interaction, you may also be referred to as "${identity.presentation.name}".`;
  }
  
  return systemPrompt;
}
```

## 6. Complete Flow Summary

1. **User sends message** → Backend `/chat` endpoint
2. **Backend retrieves AI Person** → Gets full identity with custom prompt
3. **Identity Manager generates prompt** → Currently missing custom prompt integration
4. **Backend adds memory/facts** → Enhances with context
5. **Backend adds JSON rules** → Formats for structured response
6. **Sends to LM Studio** → AI receives incomplete prompt without custom personality
7. **AI responds** → Based on role but not custom personality

This is why you're seeing the AI respond as a standard life coach rather than with the custom personality traits you defined!

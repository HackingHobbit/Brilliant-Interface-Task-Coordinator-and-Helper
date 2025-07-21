# Update Identity Flow - How the Fix Works

## When User Clicks 'Update Identity'

### 1. Frontend Action (SettingsPanel.jsx)
```javascript
const handleUpdateIdentity = async () => {
  const response = await fetch(`${backendUrl}/identity/update`, {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      roleId: selectedRole,
      personalityId: selectedPersonality,
      aiPersonId: selectedAiPerson,
      customPrompt: customPersonalityText  // This is sent!
    })
  });
}
```

### 2. Backend Processing (/identity/update endpoint)
With our fix, the backend now:
```javascript
// Get existing AI Person to preserve custom name
const existingPerson = aiPersonsStore.get(aiPersonId);
const customName = existingPerson.presentation.name;

// Update with preserved name
identity = identityManager.updateAIPersonIdentity(
  aiPersonId, 
  roleId, 
  personalityId, 
  customName  // Custom name preserved!
);

// Apply custom prompt
if (customPrompt !== undefined) {
  identity.presentation.customPrompt = customPrompt;
}

// Save to storage
await aiPersonsStore.set(aiPersonId, identity);
```

### 3. System Prompt Generation (For Next Chat)
When the user sends their next message:
```javascript
// In buildMessagesArray() for /chat endpoint
let basePrompt = identityManager.generateSystemPrompt(identity);
```

With our fix in generateSystemPrompt():
```javascript
// Custom personality is now included!
if (identity.presentation.customPrompt) {
  systemPrompt += "\n\nCUSTOM PERSONALITY:\n" + identity.presentation.customPrompt;
}
```

## Complete Update Flow

1. **User modifies custom personality text** in UI
2. **User clicks "Update Identity"**
3. **Frontend sends** roleId, personalityId, aiPersonId, and customPrompt
4. **Backend preserves** the custom name (our first fix)
5. **Backend saves** the custom prompt to identity.presentation.customPrompt
6. **Storage is updated** with new data
7. **Next chat message** will use the updated identity
8. **System prompt now includes** the custom personality (our second fix)

## Important Notes

- The update takes effect immediately for the current session
- The custom personality affects all future messages
- The changes persist across restarts
- Both custom name AND custom personality are preserved

## Example

If user has:
- Name: "Agatha"
- Custom Personality: "You are a wise and witty life coach..."

After clicking "Update Identity":
1. Name stays "Agatha" ✅ (not "Humorous Companion")
2. Custom personality is saved ✅
3. Next message will include custom personality in prompt ✅
4. AI will respond with the custom personality traits ✅

The system prompt for the next message will include:
```
CUSTOM PERSONALITY:
You are a wise and witty life coach named Agatha who uses humor to help people see new perspectives.

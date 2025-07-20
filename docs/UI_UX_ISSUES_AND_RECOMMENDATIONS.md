 plate# UI/UX Issues and Recommendations - AI Personality System

## Current Issues Identified

### 1. Confusing Name Display
**Issue**: The UI shows personality type (e.g., "NSFW") as the name instead of the user-given name
- Terminal shows: "Created identity: NSFW (Not Safe For Work) as Virtual Girlfriend"
- User expectation: Should show custom name like "Scarlett" or "Amy"

### 2. Role/Personality Changes Not Working as Expected
**Issue**: Changing role and personality doesn't seem to affect the AI's behavior properly
- The AI keeps introducing itself as "BITCH" regardless of personality
- Role changes don't appear to modify behavior significantly

### 3. Confusing Button Placement
**Issue**: "Create New AI Person" and "Update Identity" buttons are confusing
- Users don't understand when to use which button
- The flow between creating vs updating is unclear

### 4. Duplicate Personality Settings
**Issue**: Personality settings appear in both "Identity" and "AI Core" tabs
- Creates confusion about which setting controls what
- No clear indication of the relationship between these settings

### 5. No Custom Prompt Editing
**Issue**: Users cannot see or edit the personality prompts
- No visibility into what each personality actually does
- No way to customize behavior beyond predefined options

## Root Causes

### 1. Identity System Misalignment
The backend is using personality name instead of custom name:
```javascript
// Current behavior
"Created identity: NSFW (Not Safe For Work) as Virtual Girlfriend"

// Expected behavior
"Created identity: Amy as Virtual Girlfriend with NSFW personality"
```

### 2. Prompt System Not Fully Implemented
The personality prompts aren't being properly injected into the LLM context, causing the AI to default to base behavior.

### 3. UI/Backend Disconnect
The frontend shows options that don't fully connect to backend functionality.

## Recommended Solutions

### 1. Fix Name Display Logic
**Backend Changes Needed**:
- Modify `identity-manager.js` to prioritize custom name over personality name
- Update the identity display format to show: "[Custom Name] ([Personality Type])"

### 2. Implement Proper Prompt Injection
**Backend Changes Needed**:
- Ensure personality prompts are properly added to the system prompt
- Add role-specific behavior modifiers to the context
- Make the AI respond according to its assigned personality

### 3. Redesign Identity Tab UI
**Proposed Layout**:
```
Current AI Person: [Dropdown showing "Amy (Virtual Girlfriend)"]

Edit Current AI Person:
- Name: [Input field with current name]
- Role: [Dropdown]
- Personality: [Dropdown]
[Update AI Person] button

--- OR ---

Create New AI Person:
- Name: [Empty input field]
- Role: [Dropdown]
- Personality: [Dropdown]
[Create New AI Person] button
```

### 4. Consolidate Personality Settings
**Remove** personality selection from "AI Core" tab
**Keep** all identity-related settings in the "Identity" tab only

### 5. Add Personality Preview/Edit Feature
**New Feature**:
- Add "View Prompt" button next to personality dropdown
- Show the actual prompt that will be used
- (Future) Allow custom prompt editing

## Immediate Fixes Needed

### 1. Backend: Fix Identity Display
In `identity-manager.js`, update the identity creation to use custom names properly.

### 2. Backend: Fix Prompt Injection
In `chat-handler.js` or `index.js`, ensure personality prompts are added to the system context.

### 3. Frontend: Clarify UI Flow
Update `SettingsPanel.jsx` to have clearer separation between create and update operations.

### 4. Frontend: Remove Duplicate Settings
Remove personality selection from the AI Core tab.

## Example of Expected Behavior

### Creating "Amy" as Virtual Girlfriend with NSFW personality:
1. User enters "Amy" in name field
2. Selects "Virtual Girlfriend" role
3. Selects "NSFW" personality
4. Clicks "Create New AI Person"
5. System shows: "Current AI Person: Amy (Virtual Girlfriend)"
6. AI responds with flirty, intimate behavior matching NSFW personality
7. AI introduces herself as "Amy" not "NSFW"

### Switching to "Professional Assistant":
1. User selects different AI Person from dropdown
2. AI behavior immediately changes to professional
3. Memory is isolated - doesn't remember previous conversations

## Testing Checklist

- [ ] Custom names display correctly in UI
- [ ] AI introduces itself with custom name
- [ ] Personality affects AI behavior
- [ ] Role affects AI responses
- [ ] Memory isolation works between AI Persons
- [ ] UI clearly shows current identity
- [ ] Create vs Update operations are clear
- [ ] No duplicate settings across tabs

## Priority Order

1. **High**: Fix name display (backend + frontend)
2. **High**: Fix prompt injection for personalities
3. **Medium**: Redesign Identity tab UI
4. **Medium**: Remove duplicate settings
5. **Low**: Add prompt preview feature

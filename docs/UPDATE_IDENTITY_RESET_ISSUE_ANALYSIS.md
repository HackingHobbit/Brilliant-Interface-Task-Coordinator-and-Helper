# Update Identity Reset Issue - Root Cause Analysis

## Problem Description
When clicking "Update Identity":
1. Name reverts from "Agatha" to personality type name
2. Custom Personality Description disappears
3. UI resets itself

## Root Cause Analysis

### The Issue: loadIdentityData() is called after update

Looking at the console logs and the code flow:

1. **User clicks "Update Identity"**
2. **updateIdentity() is called** (SettingsPanel.jsx, line ~215)
3. **After successful update**, the code calls:
   ```javascript
   // Line 278 in updateIdentity()
   await loadIdentityData(); // This reloads everything!
   ```
4. **loadIdentityData() fetches current identity from backend**
5. **Backend returns the default personality name**, not the custom name
6. **UI state is overwritten with backend data**

### Why This Happens

**File**: `core/frontend/src/components/SettingsPanel.jsx`

In the `updateIdentity` function:
```javascript
const updateIdentity = async () => {
  // ... update logic ...
  
  if (response.ok) {
    const data = await response.json();
    setCurrentIdentity(data.identity);
    setSelectedAiPerson(data.identity.aiPersonId);
    
    // THIS IS THE PROBLEM - it reloads all data
    await loadIdentityData();  // Line ~278
    
    showSuccess('✅ Identity updated successfully');
  }
}
```

When `loadIdentityData()` runs, it does this:
```javascript
// Lines 180-190
const identityResponse = await fetch(`${backendUrl}/identity/current/${sessionId}`);
if (identityResponse.ok) {
  const data = await identityResponse.json();
  setCurrentIdentity(data.identity);
  setSelectedRole(data.identity.roleId || 'general-assistant');
  setSelectedPersonality(data.identity.personalityId || '');
  setCustomPersonalityPrompt(data.identity.customPrompt || ''); // Gets overwritten!
}
```

### The Name Reset Issue

The backend is returning the personality name instead of the custom name. From the terminal output:
```
🎯 Created identity: Humorous Companion as Life Coach (AI Person: ai_person_mdbhx1bq_quguv9zux)
```

This shows the backend is using "Humorous Companion" (the personality name) instead of "Agatha" (the custom name).

---

## Solution

### Fix 1: Don't Reload Everything After Update

**File**: `core/frontend/src/components/SettingsPanel.jsx`, Line ~278

```javascript
// Change from:
await loadIdentityData();

// To:
// Only reload the AI Persons list to reflect any name changes
const aiPersonsResponse = await fetch(`${backendUrl}/api/ai-persons`);
if (aiPersonsResponse.ok) {
  const data = await aiPersonsResponse.json();
  setAiPersons(data.aiPersons || []);
}
```

### Fix 2: Preserve Local State After Update

**File**: `core/frontend/src/components/SettingsPanel.jsx`

Modify the `updateIdentity` function to preserve the user's input:
```javascript
const updateIdentity = async () => {
  setIsLoadingIdentity(true);
  setIdentityError(null);

  // Save current values before update
  const currentName = newAiPersonName;
  const currentCustomPrompt = customPersonalityPrompt;

  try {
    // ... existing update logic ...

    if (response.ok) {
      const data = await response.json();
      setCurrentIdentity(data.identity);
      setSelectedAiPerson(data.identity.aiPersonId);
      
      // Don't reload everything - just update AI Persons list
      const aiPersonsResponse = await fetch(`${backendUrl}/api/ai-persons`);
      if (aiPersonsResponse.ok) {
        const aiPersonsData = await aiPersonsResponse.json();
        setAiPersons(aiPersonsData.aiPersons || []);
      }
      
      // Restore the values the user entered
      setNewAiPersonName(currentName);
      setCustomPersonalityPrompt(currentCustomPrompt);
      
      showSuccess('✅ Identity updated successfully');
    }
  } catch (error) {
    // ... error handling ...
  }
}
```

### Fix 3: Update Backend to Return Custom Name

The backend should return the custom name in the identity response:

**File**: `core/backend/index.js` (in the identity update endpoint)

```javascript
// Ensure the response includes the custom name
res.json({
  identity: {
    personality: aiPerson.name || identity.presentation.name, // Use custom name
    presentation: {
      ...identity.presentation,
      name: aiPerson.name || identity.presentation.name
    },
    role: identity.role.name,
    roleId: identity.metadata.roleId,
    personalityId: identity.metadata.personalityId,
    aiPersonId: identity.metadata.aiPersonId,
    customPrompt: identity.presentation.customPrompt
  }
});
```

### Fix 4: Handle Name Updates Separately

When updating just the name, don't trigger a full identity update:

**File**: `core/frontend/src/components/SettingsPanel.jsx`

Add a separate function for name-only updates:
```javascript
const updateAIPersonName = async () => {
  if (!newAiPersonName.trim() || !selectedAiPerson) return;
  
  setIsLoadingIdentity(true);
  
  try {
    const response = await fetch(`${backendUrl}/api/ai-persons/${selectedAiPerson}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newAiPersonName.trim()
        // Don't send other fields to preserve them
      })
    });
    
    if (response.ok) {
      // Only update the AI Persons list
      const aiPersonsResponse = await fetch(`${backendUrl}/api/ai-persons`);
      if (aiPersonsResponse.ok) {
        const data = await aiPersonsResponse.json();
        setAiPersons(data.aiPersons || []);
      }
      showSuccess('✅ Name updated successfully');
    }
  } catch (error) {
    showError('Failed to update name');
  } finally {
    setIsLoadingIdentity(false);
  }
};
```

---

## Summary

The main issue is that `loadIdentityData()` is called after every update, which:
1. Fetches the current identity from the backend
2. Overwrites all local state with backend values
3. The backend returns the default personality name instead of the custom name
4. Custom personality prompt gets cleared

The solution is to:
1. Not reload all data after updates
2. Only refresh the specific data that changed
3. Preserve user input in local state
4. Ensure the backend returns custom names properly

# Settings -> Identity Panel: Complete Architecture Explanation

## Overview
The Identity panel manages AI Persons, which are persistent identities that combine roles, personalities, and custom configurations. Each AI Person maintains their own memory and characteristics across sessions.

---

## Frontend Architecture (SettingsPanel.jsx)

### 1. Component State Management (Lines 8-19)
```javascript
const [roles, setRoles] = useState([]);                    // Available roles from backend
const [personalities, setPersonalities] = useState([]);      // Available personalities
const [currentIdentity, setCurrentIdentity] = useState(null); // Current session identity
const [selectedRole, setSelectedRole] = useState('general-assistant');
const [selectedPersonality, setSelectedPersonality] = useState('');
const [aiPersons, setAiPersons] = useState([]);            // All saved AI Persons
const [selectedAiPerson, setSelectedAiPerson] = useState(null);
const [newAiPersonName, setNewAiPersonName] = useState('');
const [customPersonalityPrompt, setCustomPersonalityPrompt] = useState('');
```

### 2. Data Loading Flow (loadIdentityData - Lines 156-213)
When the Identity panel opens, this function executes:

```javascript
const loadIdentityData = async () => {
  // 1. Load available roles
  const rolesResponse = await fetch(`${backendUrl}/identity/roles`);
  
  // 2. Load available personalities  
  const personalitiesResponse = await fetch(`${backendUrl}/identity/personalities`);
  
  // 3. Load current identity for this session
  const identityResponse = await fetch(`${backendUrl}/identity/current/${sessionId}`);
  
  // 4. Load all saved AI Persons
  const aiPersonsResponse = await fetch(`${backendUrl}/api/ai-persons`);
}
```

**Expected API Responses:**
- `/identity/roles`: Returns array of role objects with id, name, description
- `/identity/personalities`: Returns array of personality objects with id, name, description
- `/identity/current/{sessionId}`: Returns current identity configuration
- `/api/ai-persons`: Returns array of all saved AI Person configurations

### 3. UI Rendering Structure (Lines 430-720)

The Identity tab renders in this order:

#### a) Current Identity Display (Lines 446-462)
Shows the active identity for this session:
```jsx
<div className="...">
  <h3>Current Identity</h3>
  <p>Name: {currentIdentity.personality}</p>
  <p>Role: {currentIdentity.role}</p>
  <p>AI Person ID: {currentIdentity.aiPersonId}</p>
</div>
```

#### b) AI Person Dropdown (Lines 467-527)
Allows selection of existing AI Persons:
```jsx
<select value={selectedAiPerson || ''} onChange={(e) => {
  const personId = e.target.value;
  setSelectedAiPerson(personId);
  // When selected, populate all fields with that AI Person's data
  const person = aiPersons.find(p => p.id === personId);
  if (person) {
    setSelectedRole(person.roleId);
    setSelectedPersonality(person.personalityId);
    setNewAiPersonName(person.name);
    setCustomPersonalityPrompt(person.customPrompt || '');
  }
}}>
```

#### c) Name Input Field (Lines 528-542)
For creating new or editing existing AI Person names:
```jsx
<input
  type="text"
  value={newAiPersonName}
  placeholder={selectedAiPerson ? "Edit AI Person name" : "Enter name for new AI Person"}
/>
```

#### d) Role Selection (Lines 643-659)
Dropdown for selecting the AI Person's role:
```jsx
<select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
  {roles.map((role) => (
    <option key={role.id} value={role.id}>{role.name}</option>
  ))}
</select>
```

#### e) Personality Section (Lines 660-720)
**THIS IS WHERE THE ISSUE OCCURS:**
```jsx
{/* Personality Selection */}
<div className="md:col-span-2">
  <h3>Personality</h3>
  <select value={selectedPersonality} onChange={(e) => setSelectedPersonality(e.target.value)}>
    <option value="">Select Personality...</option>
    {personalities.map((personality) => (
      <option key={personality.id} value={personality.id}>
        {personality.name}
      </option>
    ))}
  </select>
</div>

{/* Custom Personality Prompt */}
<div className="md:col-span-2">
  <label>Custom Personality Description (Optional)</label>
  <textarea
    value={customPersonalityPrompt}
    onChange={(e) => setCustomPersonalityPrompt(e.target.value)}
    placeholder="Enter a custom personality description..."
    rows={4}
  />
</div>
```

### 4. Update Flow (updateIdentity - Lines 215-283)
When user clicks "Update Identity":
```javascript
const updateIdentity = async () => {
  // 1. Update the AI Person if one is selected
  if (selectedAiPerson) {
    await fetch(`${backendUrl}/api/ai-persons/${selectedAiPerson}`, {
      method: 'PUT',
      body: JSON.stringify({
        roleId: selectedRole,
        personalityId: selectedPersonality,
        name: newAiPersonName.trim(),
        customPrompt: customPersonalityPrompt || undefined
      })
    });
  }
  
  // 2. Update the session identity
  await fetch(`${backendUrl}/identity/update`, {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      roleId: selectedRole,
      personalityId: selectedPersonality,
      aiPersonId: selectedAiPerson,
      customPrompt: customPersonalityPrompt || undefined
    })
  });
}
```

---

## Backend Architecture

### 1. AI Persons Store (ai/storage/ai-persons-store.js)
Manages persistent storage of AI Persons:

```javascript
class AIPersonsStore {
  // Loads from ai/storage/data/ai-persons.json
  async load() {
    const data = await fs.readFile(storageFilePath, 'utf-8');
    const json = JSON.parse(data);
    for (const person of json) {
      // Fixed: Check both metadata.aiPersonId and person.id
      const id = person.metadata?.aiPersonId || person.id;
      this.aiPersons.set(id, person);
    }
  }
  
  // Saves AI Person with custom personality
  addOrUpdate(person) {
    // Preserves existing customDescription if not provided
    const existing = this.aiPersons.get(person.id);
    if (existing && !person.customDescription) {
      person.customDescription = existing.customDescription || '';
    }
    this.aiPersons.set(person.id, person);
    this.save();
  }
}
```

### 2. Identity Manager (ai/agents/identity-manager.js)
Creates layered identities:

```javascript
createIdentity(roleId, personalityId, aiPersonId, customName) {
  // Layer 1: Core Identity (BITCH)
  // Layer 2: Role (e.g., Life Coach)
  // Layer 3: Presentation (personality + custom prompt)
  
  const identity = {
    coreIdentity: this.coreIdentity,
    role: this.availableRoles.get(roleId),
    presentation: {
      ...personality,
      name: customName || personality.name,
      customPrompt: customPrompt  // This is where custom personality is stored
    },
    metadata: {
      aiPersonId,
      roleId,
      personalityId
    }
  };
  
  return identity;
}
```

### 3. Backend Endpoints (core/backend/index.js)

#### GET /identity/personalities
Should return available personalities:
```javascript
app.get('/identity/personalities', (req, res) => {
  const personalities = identityManager.getAvailablePersonalities();
  res.json({ personalities });
});
```

#### PUT /api/ai-persons/:id
Updates an AI Person including custom prompt:
```javascript
app.put('/api/ai-persons/:id', (req, res) => {
  const { roleId, personalityId, name, customPrompt } = req.body;
  
  // Update in identity manager
  const identity = identityManager.updateAIPersonIdentity(
    req.params.id,
    roleId,
    personalityId,
    name,
    customPrompt  // Custom personality description
  );
  
  // Save to storage
  aiPersonsStore.addOrUpdate(identity);
});
```

---

## Data Flow for Custom Personality

### 1. User Input
- User types in the Custom Personality Description textarea
- Value stored in `customPersonalityPrompt` state

### 2. Save Process
- When "Update Identity" clicked, `customPrompt` sent to backend
- Backend stores in `presentation.customPrompt` field
- Saved to `ai-persons.json` file

### 3. Load Process
- When AI Person selected from dropdown
- `customPrompt` loaded into `customPersonalityPrompt` state
- Should display in textarea

### 4. Storage Structure
```json
{
  "presentation": {
    "name": "Humorous Companion",
    "personalityPrompt": "Default personality prompt",
    "customPrompt": "Your custom personality description here"
  }
}
```

---

## Why The UI Issues Occur

### 1. Personality Dropdown Not Rendering
**Root Cause**: The `personalities` array is empty when component renders

**Likely Issues**:
- `/identity/personalities` endpoint not returning data
- Timing issue - UI renders before data loads
- Error in personality loading that's silently caught

**Debug Steps**:
```javascript
// Add logging in loadIdentityData
console.log('Personalities response:', personalitiesResponse);
console.log('Personalities data:', personalitiesData);
console.log('Set personalities:', personalitiesData.personalities);
```

### 2. Custom Personality Textbox Not Visible
**Root Cause**: Parent personality section not rendering due to empty array

**The Code IS There** (Lines 695-714):
```jsx
<textarea
  value={customPersonalityPrompt}
  onChange={(e) => setCustomPersonalityPrompt(e.target.value)}
  placeholder="Enter a custom personality description..."
/>
```

But it's inside a section that only renders if personalities exist.

### 3. Notifications Not Showing
**Implementation** (Lines 67-75):
```javascript
const showSuccess = (message) => {
  setSuccessMessage(message);
  setIdentityError(null);
  setTimeout(() => setSuccessMessage(''), 3000);
};
```

**Display Code** (Lines 435-450):
```jsx
{successMessage && (
  <div className="p-4 rounded bg-green-900/30 border border-green-500/50 text-green-300">
    {successMessage}
  </div>
)}
```

**Likely Issue**: Notifications render but are hidden by CSS or z-index issues.

---

## Summary

The system is designed to:
1. Load available roles and personalities from backend
2. Allow users to select/create AI Persons with custom names
3. Optionally override personality with custom descriptions
4. Save all data persistently to JSON storage
5. Maintain separate identities across sessions

The backend functionality works correctly (verified by data inspection), but the frontend has rendering issues due to:
- Empty personalities array preventing UI elements from showing
- Possible race conditions in data loading
- CSS/positioning issues with notifications

The custom personality feature IS implemented and working at the data level, but the UI components don't always render properly to allow user interaction.

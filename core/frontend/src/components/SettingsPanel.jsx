  import { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

export const SettingsPanel = ({ isOpen, onClose, theme = 'futuristic', onThemeChange }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const { clearMemory, sessionId } = useChat();
  const [roles, setRoles] = useState([]);
  const [personalities, setPersonalities] = useState([]);
  const [currentIdentity, setCurrentIdentity] = useState(null);
  const [selectedRole, setSelectedRole] = useState('general-assistant');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [aiPersons, setAiPersons] = useState([]);
  const [selectedAiPerson, setSelectedAiPerson] = useState(null);
  const [newAiPersonName, setNewAiPersonName] = useState('');
  const [customPersonalityPrompt, setCustomPersonalityPrompt] = useState('');
  const [isLoadingIdentity, setIsLoadingIdentity] = useState(false);
  const [identityError, setIdentityError] = useState(null);
  const [settings, setSettings] = useState({
    // Appearance & UI
    theme: 'futuristic',
    uiScale: 100,
    showAnimations: true,
    backgroundIntensity: 80,

    // Audio & Voice
    voice: 'en_GB-alba-medium',
    volume: 80,
    speechRate: 1.0,
    enableTTS: true,
    enableSTT: false,
    microphoneDevice: 'default',

    // AI & Models
    llmModel: 'auto',
    llmEndpoint: 'http://localhost:1234',
    personality: 'assistant',
    responseLength: 'medium',
    creativity: 0.7,
    memoryEnabled: true,

    // Behavior & Features
    autoResponse: true,
    textResponsesEnabled: false,
    facialRecognition: false,
    documentProcessing: false,
    webAccess: false,
    fileSystemAccess: false,

    // Advanced
    showDebug: false,
    logLevel: 'info',
    apiTimeout: 30,
    maxTokens: 2048,

    // Avatar & Animation
    avatarModel: 'default',
    lipSyncEnabled: true,
    facialExpressions: true,
    gestureAnimations: true,
    eyeTracking: false
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Handle special cases
    if (key === 'theme' && onThemeChange) {
      onThemeChange(value);
    }

    // Persist settings to localStorage
    localStorage.setItem('brilliantInterfaceSettings', JSON.stringify({
      ...settings,
      [key]: value
    }));

    console.log(`🔧 Setting updated: ${key} = ${value}`);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      const defaultSettings = {
        theme: 'futuristic',
        uiScale: 100,
        showAnimations: true,
        backgroundIntensity: 80,
        voice: 'en_GB-alba-medium',
        volume: 80,
        speechRate: 1.0,
        enableTTS: true,
        enableSTT: false,
        microphoneDevice: 'default',
        llmModel: 'auto',
        llmEndpoint: 'http://localhost:1234',
        personality: 'assistant',
        responseLength: 'medium',
        creativity: 0.7,
        memoryEnabled: true,
        autoResponse: true,
        textResponsesEnabled: false,
        facialRecognition: false,
        documentProcessing: false,
        webAccess: false,
        fileSystemAccess: false,
        showDebug: false,
        logLevel: 'info',
        apiTimeout: 30,
        maxTokens: 2048,
        avatarModel: 'default',
        lipSyncEnabled: true,
        facialExpressions: true,
        gestureAnimations: true,
        eyeTracking: false
      };
      setSettings(defaultSettings);
      localStorage.setItem('brilliantInterfaceSettings', JSON.stringify(defaultSettings));
    }
  };

  const tabs = [
    { id: 'identity', label: theme === 'futuristic' ? 'IDENTITY' : 'Identity', icon: '🎭' },
    { id: 'appearance', label: theme === 'futuristic' ? 'VISUAL' : 'Appearance', icon: '🎨' },
    { id: 'audio', label: theme === 'futuristic' ? 'AUDIO' : 'Audio', icon: '🔊' },
    { id: 'ai', label: theme === 'futuristic' ? 'AI CORE' : 'AI Model', icon: '🤖' },
    { id: 'behavior', label: theme === 'futuristic' ? 'BEHAVIOR' : 'Behavior', icon: '⚙️' },
    { id: 'avatar', label: theme === 'futuristic' ? 'AVATAR' : 'Avatar', icon: '👤' },
    { id: 'advanced', label: theme === 'futuristic' ? 'ADVANCED' : 'Advanced', icon: '🔧' }
  ];

  // Load identity data when panel opens
  useEffect(() => {
    if (isOpen) {
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('brilliantInterfaceSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.warn('Failed to parse saved settings:', e);
        }
      }
      loadIdentityData();
    }
  }, [isOpen, sessionId]);

  const loadIdentityData = async () => {
    setIsLoadingIdentity(true);
    setIdentityError(null);
    
    try {
      const backendUrl = 'http://localhost:3000';
      
      // Load roles
      const rolesResponse = await fetch(`${backendUrl}/identity/roles`);
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.roles || []);
      }
      
      // Load personalities
      const personalitiesResponse = await fetch(`${backendUrl}/identity/personalities`);
      if (personalitiesResponse.ok) {
        const personalitiesData = await personalitiesResponse.json();
        setPersonalities(personalitiesData.personalities || []);
      }
      
      // Load current identity
      let currentAiPersonId = null;
      if (sessionId) {
        const identityResponse = await fetch(`${backendUrl}/identity/current/${sessionId}`);
        if (identityResponse.ok) {
          const data = await identityResponse.json();
          setCurrentIdentity(data.identity);
          setSelectedRole(data.identity.roleId || 'general-assistant');
          setSelectedPersonality(data.identity.personalityId || '');
          setCustomPersonalityPrompt(data.identity.customPrompt || '');
          currentAiPersonId = data.identity.aiPersonId;
        }
      }
      
      // Load all AI Persons
      const aiPersonsResponse = await fetch(`${backendUrl}/api/ai-persons`);
      if (aiPersonsResponse.ok) {
        const data = await aiPersonsResponse.json();
        setAiPersons(data.aiPersons || []);
        
        // Set the selected AI Person based on current identity
        if (currentAiPersonId && data.aiPersons?.some(p => p.id === currentAiPersonId)) {
          setSelectedAiPerson(currentAiPersonId);
        }
      }

      // Load long-term memory summary for current AI Person
      if (currentAiPersonId) {
        const memorySummaryResponse = await fetch(`${backendUrl}/memory/summary/${currentAiPersonId}`);
        if (memorySummaryResponse.ok) {
          const memorySummary = await memorySummaryResponse.json();
          // You can store or display memory summary as needed
          console.log('Loaded memory summary:', memorySummary);
        }
      }
    } catch (error) {
      console.error('Error loading identity data:', error);
      setIdentityError('Failed to load identity data');
    } finally {
      setIsLoadingIdentity(false);
    }
  };

  const updateIdentity = async () => {
    setIsLoadingIdentity(true);
    setIdentityError(null);

    try {
      const backendUrl = 'http://localhost:3000';

      // Validate selectedPersonality before sending update
      if (!selectedPersonality || selectedPersonality.trim() === '') {
        setIdentityError('Please select a valid personality before updating.');
        setIsLoadingIdentity(false);
        return;
      }

      // If we have a selected AI Person, update it instead of creating new
      if (selectedAiPerson) {
        // First update the AI Person itself if needed
        const currentPerson = aiPersons.find(p => p.id === selectedAiPerson);
        if (currentPerson && (currentPerson.roleId !== selectedRole || currentPerson.personalityId !== selectedPersonality || currentPerson.name !== newAiPersonName || currentPerson.customPrompt !== customPersonalityPrompt)) {
          const updateResponse = await fetch(`${backendUrl}/api/ai-persons/${selectedAiPerson}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roleId: selectedRole,
              personalityId: selectedPersonality,
              name: newAiPersonName.trim(),
              customPrompt: customPersonalityPrompt || undefined
            })
          });

          if (!updateResponse.ok) {
            throw new Error('Failed to update AI Person');
          }
        }
      }

      // Then update the session identity
      const response = await fetch(`${backendUrl}/identity/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          roleId: selectedRole,
          personalityId: selectedPersonality,
          aiPersonId: selectedAiPerson,
          customPrompt: customPersonalityPrompt || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentIdentity(data.identity);
        setSelectedAiPerson(data.identity.aiPersonId);
        // Reload AI Persons to reflect any updates
        await loadIdentityData();
        console.log('✅ Identity updated successfully');
      } else {
        throw new Error('Failed to update identity');
      }
    } catch (error) {
      console.error('Error updating identity:', error);
      setIdentityError('Failed to update identity');
    } finally {
      setIsLoadingIdentity(false);
    }
  };

  const createNewAiPerson = async () => {
    if (!newAiPersonName.trim()) {
      setIdentityError('Please enter a name for the new AI Person');
      return;
    }
    
    setIsLoadingIdentity(true);
    setIdentityError(null);
    
    try {
      const backendUrl = 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/ai-persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRole,
          personalityId: selectedPersonality,
          name: newAiPersonName.trim()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setNewAiPersonName(''); // Clear the name input first
        await loadIdentityData(); // Reload to get updated list
        // Set the newly created AI Person as selected after the list is updated
        setTimeout(() => {
          setSelectedAiPerson(data.aiPerson.id);
        }, 100);
        console.log('✅ New AI Person created:', data.aiPerson.id);
      } else {
        throw new Error('Failed to create AI Person');
      }
    } catch (error) {
      console.error('Error creating AI Person:', error);
      setIdentityError('Failed to create AI Person');
    } finally {
      setIsLoadingIdentity(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div className={`relative w-full max-w-5xl ${
        theme === 'futuristic'
          ? 'glass-panel scan-lines'
          : 'bg-white rounded-lg shadow-xl'
      } p-6 max-h-[90vh] overflow-hidden flex flex-col`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${
            theme === 'futuristic' ? 'holo-text' : 'text-gray-900'
          }`}>
            {theme === 'futuristic' ? 'SYSTEM CONFIGURATION' : 'Settings'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={resetToDefaults}
              className={`px-4 py-2 rounded-md transition-all text-sm ${
                theme === 'futuristic'
                  ? 'neon-button'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {theme === 'futuristic' ? 'RESET' : 'Reset'}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-md transition-all ${
                theme === 'futuristic'
                  ? 'neon-button accent'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === tab.id
                  ? theme === 'futuristic'
                    ? 'neon-button accent'
                    : 'bg-blue-500 text-white'
                  : theme === 'futuristic'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Identity Tab */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              {isLoadingIdentity ? (
                <div className="text-center py-8">
                  <div className={`inline-block ${theme === 'futuristic' ? 'cyber-spinner' : ''}`}>
                    Loading identity data...
                  </div>
                </div>
              ) : (
                <>
                  {identityError && (
                    <div className={`p-4 rounded ${
                      theme === 'futuristic' 
                        ? 'bg-red-900/30 border border-red-500/50 text-red-300'
                        : 'bg-red-100 border border-red-300 text-red-700'
                    }`}>
                      {identityError}
                    </div>
                  )}

                  {/* Current Identity Display */}
                  {currentIdentity && (
                    <div className={`p-4 rounded ${
                      theme === 'futuristic'
                        ? 'bg-cyan-900/20 border border-cyan-500/30'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <h3 className={`font-medium mb-2 ${
                        theme === 'futuristic' ? 'text-cyan-300' : 'text-blue-800'
                      }`}>
                        Current Identity
                      </h3>
                      <p className={`text-sm ${
                        theme === 'futuristic' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <strong>Name:</strong> {currentIdentity.personality}<br />
                        <strong>Role:</strong> {currentIdentity.role}<br />
                        <strong>AI Person ID:</strong> {currentIdentity.aiPersonId}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Person Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                      }`}>
                        AI Person
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedAiPerson || ''}
                          onChange={(e) => {
                            const personId = e.target.value;
                            setSelectedAiPerson(personId);
                            // Update role and personality based on selected AI Person
                            if (personId) {
                              const person = aiPersons.find(p => p.id === personId);
                              if (person) {
                                setSelectedRole(person.roleId || 'general-assistant');
                                setSelectedPersonality(person.personalityId || '');
                                setNewAiPersonName(person.name || ''); // Set the name for editing
                                setCustomPersonalityPrompt(person.customPrompt || ''); // Load custom prompt
                              }
                            } else {
                              // Clear custom prompt when no AI Person is selected
                              setCustomPersonalityPrompt('');
                            }
                          }}
                          className={`flex-1 p-3 rounded ${
                            theme === 'futuristic'
                              ? 'cyber-input'
                              : 'border border-gray-300 bg-white'
                          }`}
                        >
                          <option value="">Select AI Person...</option>
                          {aiPersons.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name} ({person.role})
                            </option>
                          ))}
                        </select>
                        {selectedAiPerson && (
                          <button
                            onClick={async () => {
                              if (aiPersons.length <= 1) {
                                setIdentityError('Cannot delete the last AI Person. At least one must exist.');
                                return;
                              }
                              
                              if (confirm(`Are you sure you want to delete this AI Person? This will also delete all associated memories.`)) {
                                setIsLoadingIdentity(true);
                                setIdentityError(null);
                                
                                try {
                                  const backendUrl = 'http://localhost:3000';
                                  const response = await fetch(`${backendUrl}/api/ai-persons/${selectedAiPerson}`, {
                                    method: 'DELETE'
                                  });
                                  
                                  if (response.ok) {
                                    await loadIdentityData();
                                    setSelectedAiPerson(null);
                                    console.log('✅ AI Person deleted successfully');
                                  } else {
                                    const error = await response.json();
                                    throw new Error(error.message || 'Failed to delete AI Person');
                                  }
                                } catch (error) {
                                  console.error('Error deleting AI Person:', error);
                                  setIdentityError(error.message || 'Failed to delete AI Person');
                                } finally {
                                  setIsLoadingIdentity(false);
                                }
                              }
                            }}
                            disabled={aiPersons.length <= 1}
                            className={`p-3 rounded ${
                              theme === 'futuristic'
                                ? 'bg-red-900/30 border border-red-500/50 text-red-300 hover:bg-red-900/50'
                                : 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200'
                            } ${aiPersons.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={aiPersons.length <= 1 ? 'Cannot delete the last AI Person' : 'Delete this AI Person'}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          value={newAiPersonName}
                          onChange={(e) => setNewAiPersonName(e.target.value)}
                          placeholder={selectedAiPerson ? "Edit AI Person name" : "Enter name for new AI Person"}
                          className={`w-full p-2 rounded text-sm ${
                            theme === 'futuristic'
                              ? 'cyber-input'
                              : 'border border-gray-300 bg-white'
                          }`}
                        />
                        {selectedAiPerson ? (
                          <button
                            onClick={async () => {
                              if (!newAiPersonName.trim()) {
                                setIdentityError('Please enter a name');
                                return;
                              }
                              
                              setIsLoadingIdentity(true);
                              setIdentityError(null);
                              
                              try {
                                const backendUrl = 'http://localhost:3000';
                                const response = await fetch(`${backendUrl}/api/ai-persons/${selectedAiPerson}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    roleId: selectedRole,
                                    personalityId: selectedPersonality,
                                    name: newAiPersonName.trim()
                                  })
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  await loadIdentityData();
                                  // Ensure the updated AI Person remains selected
                                  setSelectedAiPerson(data.aiPerson.id);
                                  console.log('✅ AI Person name updated');
                                } else {
                                  throw new Error('Failed to update AI Person name');
                                }
                              } catch (error) {
                                console.error('Error updating AI Person name:', error);
                                setIdentityError('Failed to update AI Person name');
                              } finally {
                                setIsLoadingIdentity(false);
                              }
                            }}
                            disabled={!newAiPersonName.trim() || isLoadingIdentity}
                            className={`w-full p-2 rounded text-sm ${
                              theme === 'futuristic'
                                ? 'neon-button accent'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } ${!newAiPersonName.trim() || isLoadingIdentity ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Update Name
                          </button>
                        ) : (
                          <button
                            onClick={createNewAiPerson}
                            disabled={!newAiPersonName.trim()}
                            className={`w-full p-2 rounded text-sm ${
                              theme === 'futuristic'
                                ? 'neon-button'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            } ${!newAiPersonName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            + Create New AI Person
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                      }`}>
                        Role
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className={`w-full p-3 rounded ${
                          theme === 'futuristic'
                            ? 'cyber-input'
                            : 'border border-gray-300 bg-white'
                        }`}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      {selectedRole && roles.length > 0 && (
                        <p className={`text-xs mt-1 ${
                          theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {roles.find(r => r.id === selectedRole)?.description}
                        </p>
                      )}
                    </div>

                    {/* Personality Selection */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                      }`}>
                        Personality
                      </label>
                      <select
                        value={selectedPersonality}
                        onChange={(e) => setSelectedPersonality(e.target.value)}
                        className={`w-full p-3 rounded ${
                          theme === 'futuristic'
                            ? 'cyber-input'
                            : 'border border-gray-300 bg-white'
                        }`}
                      >
                        <option value="">Select Personality...</option>
                        {personalities.map((personality) => (
                          <option key={personality.id} value={personality.id}>
                            {personality.name}
                          </option>
                        ))}
                      </select>
                      {selectedPersonality && personalities.length > 0 && (
                        <p className={`text-xs mt-1 ${
                          theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {(() => {
                            const personality = personalities.find(p => p.id === selectedPersonality);
                            if (!personality?.personalityTraits) return null;
                            
                            const traits = personality.personalityTraits;
                            const traitDescriptions = [];
                            
                            if (typeof traits.enthusiasm === 'number' && traits.enthusiasm > 0.7) traitDescriptions.push('Enthusiastic');
                            if (typeof traits.formality === 'number') {
                              if (traits.formality > 0.7) traitDescriptions.push('Formal');
                              else if (traits.formality < 0.3) traitDescriptions.push('Casual');
                            }
                            if (typeof traits.humor === 'number' && traits.humor > 0.7) traitDescriptions.push('Humorous');
                            if (typeof traits.empathy === 'number' && traits.empathy > 0.7) traitDescriptions.push('Empathetic');
                            
                            return traitDescriptions.length > 0 ? traitDescriptions.join(', ') : 'Balanced personality';
                          })()}
                        </p>
                      )}
                    </div>

                    {/* Custom Personality Prompt */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                      }`}>
                        Custom Personality Description (Optional)
                      </label>
                      <textarea
                        value={customPersonalityPrompt}
                        onChange={(e) => setCustomPersonalityPrompt(e.target.value)}
                        placeholder="Enter a custom personality description to override the selected personality. This allows you to create unique behaviors and characteristics..."
                        rows={4}
                        className={`w-full p-3 rounded ${
                          theme === 'futuristic'
                            ? 'cyber-input'
                            : 'border border-gray-300 bg-white'
                        }`}
                      />
                      <p className={`text-xs mt-1 ${
                        theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        This will override the selected personality's default prompt. Leave empty to use the default.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                    {/* Update Button */}
                    <div>
                      <button
                        onClick={updateIdentity}
                        disabled={isLoadingIdentity}
                        className={`w-full p-3 rounded font-medium transition-all ${
                          theme === 'futuristic'
                            ? 'neon-button accent pulse-glow'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        } ${isLoadingIdentity ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoadingIdentity ? 'Updating...' : 'Update Identity'}
                      </button>
                      <p className={`text-xs mt-2 ${
                        theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Changes will take effect immediately
                      </p>
                    </div>
                  </div>

                  {/* Personality Details */}
          {selectedPersonality && personalities.length > 0 && (
            <div className={`mt-6 p-4 rounded ${
              theme === 'futuristic'
                ? 'bg-gray-800/50 border border-gray-700'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <h4 className={`font-medium mb-3 ${
                theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-800'
              }`}>
                Personality Details
              </h4>
              {(() => {
                const personality = personalities.find(p => p.id === selectedPersonality);
                if (!personality) return null;

                // Extract personality traits object
                const traits = personality.personalityTraits || {};

                return (
                  <div className="space-y-4">
                    <div>
                      <span className={`text-sm font-medium ${
                        theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Voice Settings:</span>
                      <p className={`text-sm ${
                        theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Voice: {personality.voice?.voiceId || 'Default'}<br />
                        {personality.voice?.settings && (
                          <>Speed: {personality.voice.settings.speed}x, Pitch: {personality.voice.settings.pitch}x</>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${
                        theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Avatar:</span>
                      <p className={`text-sm ${
                        theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Default Expression: {personality.avatar?.defaultExpression || 'smile'}
                      </p>
                    </div>

                    {/* Personality Traits Sliders */}
                    <div>
                      <h5 className={`font-semibold mb-2 ${
                        theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                      }`}>Adjust Personality Traits</h5>
                          {Object.entries(traits).map(([trait, value]) => (
                            <div key={trait} className="mb-3">
                              <label htmlFor={`trait-${trait}`} className={`block text-sm font-medium mb-1 ${
                                theme === 'futuristic' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {trait.charAt(0).toUpperCase() + trait.slice(1)}: {typeof value === 'number' ? value.toFixed(2) : 'N/A'}
                              </label>
                              <input
                                id={`trait-${trait}`}
                                type="range"
                                min={-1}
                                max={1}
                                step={0.01}
                                value={typeof value === 'number' ? value : 0}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value);
                                  // Update personality traits in state
                                  const updatedPersonality = { ...personality };
                                  updatedPersonality.personalityTraits = {
                                    ...updatedPersonality.personalityTraits,
                                    [trait]: newValue
                                  };
                                  // Update personalities state with updated personality
                                  setPersonalities(personalities.map(p => p.id === updatedPersonality.id ? updatedPersonality : p));
                                  // Also update selectedPersonality to trigger re-render
                                  setSelectedPersonality(updatedPersonality.id);
                                }}
                                className="w-full"
                              />
                            </div>
                          ))}

                    </div>
                  </div>
                );
              })()}
            </div>
          )}


                  {/* Memory Information */}
                  <div className={`mt-6 p-4 rounded ${
                    theme === 'futuristic'
                      ? 'bg-purple-900/20 border border-purple-500/30'
                      : 'bg-purple-50 border border-purple-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      theme === 'futuristic' ? 'text-purple-300' : 'text-purple-800'
                    }`}>
                      💾 Memory System
                    </h4>
                    <p className={`text-sm ${
                      theme === 'futuristic' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Each AI Person maintains their own memory including:
                    </p>
                    <ul className={`text-sm mt-2 space-y-1 ${
                      theme === 'futuristic' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <li>• Conversation history and context</li>
                      <li>• Learned facts and information</li>
                      <li>• User preferences and relationships</li>
                      <li>• Experiences across sessions</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="futuristic">Futuristic</option>
                    <option value="classic">Classic</option>
                    <option value="greenScreen">Green Screen</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    UI Scale: {settings.uiScale}%
                  </label>
                  <input
                    type="range"
                    min="75"
                    max="150"
                    step="5"
                    value={settings.uiScale}
                    onChange={(e) => updateSetting('uiScale', parseInt(e.target.value))}
                    className={`w-full ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Background Intensity: {settings.backgroundIntensity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.backgroundIntensity}
                    onChange={(e) => updateSetting('backgroundIntensity', parseInt(e.target.value))}
                    className={`w-full ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showAnimations"
                    checked={settings.showAnimations}
                    onChange={(e) => updateSetting('showAnimations', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="showAnimations" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable animations and effects
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Voice Model
                  </label>
                  <select
                    value={settings.voice}
                    onChange={(e) => updateSetting('voice', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="en_GB-alba-medium">Alba (British Female)</option>
                    <option value="en_US-amy-medium">Amy (American Female)</option>
                    <option value="en_GB-northern_english_male-medium">Northern English Male</option>
                    <option value="en_US-ryan-high">Ryan (American Male)</option>
                    <option value="custom">Custom Voice Model</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Microphone Device
                  </label>
                  <select
                    value={settings.microphoneDevice}
                    onChange={(e) => updateSetting('microphoneDevice', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="default">Default Microphone</option>
                    <option value="builtin">Built-in Microphone</option>
                    <option value="external">External Microphone</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Volume: {settings.volume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                    className={`w-full ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Speech Rate: {settings.speechRate}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.speechRate}
                    onChange={(e) => updateSetting('speechRate', parseFloat(e.target.value))}
                    className={`w-full ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableTTS"
                    checked={settings.enableTTS}
                    onChange={(e) => updateSetting('enableTTS', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="enableTTS" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable Text-to-Speech (Piper TTS)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableSTT"
                    checked={settings.enableSTT}
                    onChange={(e) => updateSetting('enableSTT', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="enableSTT" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable Speech-to-Text (Local STT)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* AI Core Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    LLM Model
                  </label>
                  <select
                    value={settings.llmModel}
                    onChange={(e) => updateSetting('llmModel', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="auto">Auto-detect from LM Studio</option>
                    <option value="llama-3.1-8b">Llama 3.1 8B</option>
                    <option value="llama-3-8b">Llama 3 8B</option>
                    <option value="mistral-7b">Mistral 7B</option>
                    <option value="phi-3-mini">Phi-3 Mini</option>
                    <option value="custom">Custom Model</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    LM Studio Endpoint
                  </label>
                  <input
                    type="text"
                    value={settings.llmEndpoint}
                    onChange={(e) => updateSetting('llmEndpoint', e.target.value)}
                    placeholder="http://localhost:1234"
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Response Length
                  </label>
                  <select
                    value={settings.responseLength}
                    onChange={(e) => updateSetting('responseLength', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="short">Short (1-2 sentences)</option>
                    <option value="medium">Medium (2-4 sentences)</option>
                    <option value="long">Long (4+ sentences)</option>
                    <option value="adaptive">Adaptive</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Creativity: {Math.round(settings.creativity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.creativity}
                    onChange={(e) => updateSetting('creativity', parseFloat(e.target.value))}
                    className={`w-full ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Max Tokens: {settings.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="512"
                    max="8192"
                    step="256"
                    value={settings.maxTokens}
                    onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                    className={`w-full ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="memoryEnabled"
                    checked={settings.memoryEnabled}
                    onChange={(e) => updateSetting('memoryEnabled', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="memoryEnabled" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable AI Memory (Conversation + Facts)
                  </label>
                </div>

                {/* Clear Memory Button */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all conversation memory? This cannot be undone.')) {
                        clearMemory();
                      }
                    }}
                    className={`w-full p-3 rounded font-medium transition-all ${
                      theme === 'futuristic'
                        ? 'bg-red-900/30 border border-red-500/50 text-red-300 hover:bg-red-900/50 hover:border-red-400 hover:text-red-200'
                        : 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    🧹 Clear Session Memory
                  </button>
                  <p className={`text-xs mt-2 ${
                    theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Clears all conversation history and starts a fresh session
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Behavior Tab */}
          {activeTab === 'behavior' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoResponse"
                    checked={settings.autoResponse}
                    onChange={(e) => updateSetting('autoResponse', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="autoResponse" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Auto-generate responses
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="textResponsesEnabled"
                    checked={settings.textResponsesEnabled}
                    onChange={(e) => updateSetting('textResponsesEnabled', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="textResponsesEnabled" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Show text responses (optional)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="facialRecognition"
                    checked={settings.facialRecognition}
                    onChange={(e) => updateSetting('facialRecognition', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="facialRecognition" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable facial/vision recognition
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="documentProcessing"
                    checked={settings.documentProcessing}
                    onChange={(e) => updateSetting('documentProcessing', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="documentProcessing" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Document/image understanding
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="webAccess"
                    checked={settings.webAccess}
                    onChange={(e) => updateSetting('webAccess', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="webAccess" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable web scraping capabilities
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fileSystemAccess"
                    checked={settings.fileSystemAccess}
                    onChange={(e) => updateSetting('fileSystemAccess', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="fileSystemAccess" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable file system access
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Avatar Tab */}
          {activeTab === 'avatar' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Avatar Model
                  </label>
                  <select
                    value={settings.avatarModel}
                    onChange={(e) => updateSetting('avatarModel', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="default">Default 3D Avatar</option>
                    <option value="custom-3d">Custom 3D Model</option>
                    <option value="image-2d">2D Image Avatar</option>
                    <option value="live2d">Live2D Avatar</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lipSyncEnabled"
                    checked={settings.lipSyncEnabled}
                    onChange={(e) => updateSetting('lipSyncEnabled', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="lipSyncEnabled" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable lip synchronization
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="facialExpressions"
                    checked={settings.facialExpressions}
                    onChange={(e) => updateSetting('facialExpressions', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="facialExpressions" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable facial expressions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gestureAnimations"
                    checked={settings.gestureAnimations}
                    onChange={(e) => updateSetting('gestureAnimations', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="gestureAnimations" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable gesture animations
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="eyeTracking"
                    checked={settings.eyeTracking}
                    onChange={(e) => updateSetting('eyeTracking', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="eyeTracking" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Enable eye tracking
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    Log Level
                  </label>
                  <select
                    value={settings.logLevel}
                    onChange={(e) => updateSetting('logLevel', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-700'
                  }`}>
                    API Timeout: {settings.apiTimeout}s
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={settings.apiTimeout}
                    onChange={(e) => updateSetting('apiTimeout', parseInt(e.target.value))}
                    className={`w-full ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showDebug"
                    checked={settings.showDebug}
                    onChange={(e) => updateSetting('showDebug', e.target.checked)}
                    className={`mr-3 ${
                      theme === 'futuristic' ? 'accent-cyan-400' : ''
                    }`}
                  />
                  <label htmlFor="showDebug" className={`text-sm ${
                    theme === 'futuristic' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Show debug information
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className={`text-sm ${
              theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {theme === 'futuristic' ? 'SYSTEM STATUS: OPERATIONAL' : 'Settings will be saved automatically'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded transition-all ${
                  theme === 'futuristic'
                    ? 'neon-button'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {theme === 'futuristic' ? 'APPLY CHANGES' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';

export const SettingsPanel = ({ isOpen, onClose, theme = 'futuristic', onThemeChange }) => {
  const [activeTab, setActiveTab] = useState('appearance');
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

    // TODO: Persist settings to localStorage or backend
    console.log(`🔧 Setting updated: ${key} = ${value}`);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      setSettings({
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
      });
    }
  };

  const tabs = [
    { id: 'appearance', label: theme === 'futuristic' ? 'VISUAL' : 'Appearance', icon: '🎨' },
    { id: 'audio', label: theme === 'futuristic' ? 'AUDIO' : 'Audio', icon: '🔊' },
    { id: 'ai', label: theme === 'futuristic' ? 'AI CORE' : 'AI Model', icon: '🤖' },
    { id: 'behavior', label: theme === 'futuristic' ? 'BEHAVIOR' : 'Behavior', icon: '⚙️' },
    { id: 'avatar', label: theme === 'futuristic' ? 'AVATAR' : 'Avatar', icon: '👤' },
    { id: 'advanced', label: theme === 'futuristic' ? 'ADVANCED' : 'Advanced', icon: '🔧' }
  ];

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
                    Personality
                  </label>
                  <select
                    value={settings.personality}
                    onChange={(e) => updateSetting('personality', e.target.value)}
                    className={`w-full p-3 rounded ${
                      theme === 'futuristic'
                        ? 'cyber-input'
                        : 'border border-gray-300 bg-white'
                    }`}
                  >
                    <option value="assistant">Professional Assistant</option>
                    <option value="friendly">Friendly Companion</option>
                    <option value="romantic">Romantic Partner</option>
                    <option value="mentor">Wise Mentor</option>
                    <option value="playful">Playful Friend</option>
                    <option value="custom">Custom Personality</option>
                  </select>
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

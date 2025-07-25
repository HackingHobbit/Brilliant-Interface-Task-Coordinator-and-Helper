import React, { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { SettingsPanel } from "./SettingsPanel";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, backendStatus, checkBackendHealth, sessionId } = useChat();
  const [theme, setTheme] = useState('futuristic'); // Default to futuristic theme
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentIdentity, setCurrentIdentity] = useState(null);

  // Apply theme to body
  useEffect(() => {
    const body = document.body;
    // Clear existing classes first
    body.className = '';
    // Apply futuristic theme classes
    if (theme === 'futuristic') {
      body.classList.add('futuristic', 'futuristic-bg');
    }
    console.log('🎨 Theme applied:', theme, 'Body classes:', body.className);
  }, [theme]);

  // Force apply theme on mount and set initial focus
  useEffect(() => {
    const body = document.body;
    body.classList.add('futuristic', 'futuristic-bg');
    console.log('🚀 Initial theme applied on mount');
    console.log('🎨 Body computed styles:', window.getComputedStyle(body).background);

    // Set focus to input on page load
    if (input.current) {
      input.current.focus();
    }
  }, []);


  // Fetch current identity
  useEffect(() => {
    const fetchIdentity = async () => {
      if (sessionId) {
        try {
          const response = await fetch(`http://localhost:3000/identity/current/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentIdentity(data.identity);
          }
        } catch (error) {
          console.error('Failed to fetch identity:', error);
        }
      }
    };

    fetchIdentity();
    // Refresh identity when settings close
    if (!showSettings) {
      fetchIdentity();
    }
  }, [sessionId, showSettings]);

  // Handle typing indicator and focus management
  useEffect(() => {
    if (loading) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
      // Refocus input when AI response is complete
      setTimeout(() => {
        if (input.current && !showSettings) {
          input.current.focus();
        }
      }, 500); // Slight delay to ensure response is fully processed
    }
  }, [loading, showSettings]);

  const sendMessage = () => {
    const text = input.current.value;
    console.log("🎯 UI sendMessage called with:", { text, loading, message });
    if (!loading && !message) {
      console.log("✅ Conditions met, calling chat()");
      chat(text);
      input.current.value = "";
      // Refocus input after sending message
      setTimeout(() => {
        if (input.current) {
          input.current.focus();
        }
      }, 100);
    } else {
      console.log("❌ Conditions not met:", { loading, message });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'futuristic' ? 'classic' : 'futuristic');
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    // Focus input when settings panel is dismissed
    setTimeout(() => {
      if (input.current) {
        input.current.focus();
      }
    }, 100);
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex justify-between p-4 flex-col pointer-events-none">
        {/* Header Panel */}
        <div className={`self-start p-6 rounded-lg max-w-none ${theme === 'futuristic' ? 'glass-panel scan-lines' : 'backdrop-blur-md bg-white bg-opacity-50'}`}>
          <h1 className={`font-black text-2xl mb-2 ${theme === 'futuristic' ? 'holo-text' : ''}`}>
            B.I.T.C.H.
          </h1>
          <p className={`${theme === 'futuristic' ? 'text-cyan-300 text-sm font-mono whitespace-nowrap' : ''}`}>
            {theme === 'futuristic' ? 'BRILLIANT INTERFACE TASK COORDINATOR and HELPER' : 'I will always love you ❤️'}
          </p>
          
          {/* Identity Information */}
          {currentIdentity && (
            <div className={`mt-3 pt-3 border-t ${
              theme === 'futuristic' ? 'border-cyan-500/30' : 'border-gray-300'
            }`}>
              <div className={`text-sm space-y-1 ${
                theme === 'futuristic' ? 'text-cyan-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`${theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'}`}>Name:</span>
                  <span className={`font-medium ${theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-800'}`}>
                    {currentIdentity.personality || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${theme === 'futuristic' ? 'text-gray-400' : 'text-gray-500'}`}>Role:</span>
                  <span className={`font-medium ${theme === 'futuristic' ? 'text-cyan-300' : 'text-gray-800'}`}>
                    {currentIdentity.role || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {isTyping && theme === 'futuristic' && (
            <div className="flex items-center mt-3 text-cyan-400 text-xs">
              <div className="cyber-spinner mr-2" style={{width: '16px', height: '16px'}}></div>
              <span className="animate-pulse">AI PROCESSING...</span>
            </div>
          )}
        </div>
        {/* Control Buttons */}
        <div className="w-full flex flex-col items-end justify-center gap-4">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className={`pointer-events-auto p-4 rounded-md transition-all ${theme === 'futuristic' ? 'neon-button pulse-glow' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            title="Settings"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>

          {/* Backend Status Indicator */}
          <div className={`pointer-events-auto p-3 rounded-md transition-all ${
            theme === 'futuristic'
              ? 'neon-border bg-black/30 backdrop-blur-sm'
              : 'bg-gray-800 border border-gray-600'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-all ${
                backendStatus === 'healthy' ? 'bg-green-400 animate-pulse' :
                backendStatus === 'down' ? 'bg-red-400' :
                backendStatus === 'checking' ? 'bg-yellow-400 animate-spin' :
                'bg-gray-400'
              }`}></div>
              <span className={`text-xs font-medium ${
                theme === 'futuristic' ? 'text-cyan-300' : 'text-white'
              }`}>
                {backendStatus === 'healthy' ? 'AI Ready' :
                 backendStatus === 'down' ? 'AI Offline' :
                 backendStatus === 'checking' ? 'Checking...' :
                 'Unknown'}
              </span>
              {backendStatus === 'down' && (
                <button
                  onClick={checkBackendHealth}
                  className={`ml-2 px-2 py-1 text-xs rounded transition-all ${
                    theme === 'futuristic'
                      ? 'neon-button-small text-cyan-300 hover:text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  title="Check backend status"
                >
                  Retry
                </button>
              )}
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`pointer-events-auto p-4 rounded-md transition-all ${
              theme === 'futuristic'
                ? 'neon-button accent pulse-glow'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
            title="Toggle Theme"
          >
            {theme === 'futuristic' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            )}
          </button>

          {/* Camera Zoom Button */}
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className={`pointer-events-auto p-4 rounded-md transition-all ${
              theme === 'futuristic'
                ? 'neon-button'
                : 'bg-pink-500 hover:bg-pink-600 text-white'
            }`}
            title={cameraZoomed ? "Zoom Out" : "Zoom In"}
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          {/* Green Screen Button */}
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className={`pointer-events-auto p-4 rounded-md transition-all ${theme === 'futuristic' ? 'neon-button' : 'bg-pink-500 hover:bg-pink-600 text-white'}`}
            title="Toggle Green Screen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        {/* Chat Input */}
        <div className="flex items-center gap-4 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className={`w-full p-4 rounded-md transition-all ${theme === 'futuristic' ? 'cyber-input' : 'placeholder:text-gray-800 placeholder:italic bg-opacity-50 bg-white backdrop-blur-md'}`}
            placeholder={theme === 'futuristic' ? "ENTER COMMAND..." : "Type a message..."}
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`p-4 px-8 font-semibold uppercase rounded-md transition-all ${theme === 'futuristic' ? `neon-button ${loading || message ? 'opacity-50 cursor-not-allowed' : ''}` : `bg-pink-500 hover:bg-pink-600 text-white ${loading || message ? "cursor-not-allowed opacity-30" : ""}`}`}
          >
            {loading && theme === 'futuristic' ? (
              <div className="flex items-center gap-2">
                <div className="cyber-spinner" style={{width: '20px', height: '20px'}}></div>
                <span>PROC</span>
              </div>
            ) : (
              theme === 'futuristic' ? 'SEND' : 'Send'
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={handleCloseSettings}
        theme={theme}
        onThemeChange={setTheme}
      />
    </>
  );
};

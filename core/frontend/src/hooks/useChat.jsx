import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [backendStatus, setBackendStatus] = useState('unknown'); // 'healthy', 'down', 'checking', 'unknown'

  // Generate a unique session ID for this browser session
  const [sessionId] = useState(() => {
    // Try to get existing session ID from localStorage, or create new one
    let id = localStorage.getItem('brilliant-interface-session-id');
    if (!id) {
      id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('brilliant-interface-session-id', id);
    }
    console.log('🆔 Using session ID:', id);
    return id;
  });

  // Function to check if backend is running
  const checkBackendHealth = async () => {
    try {
      console.log("🔍 Checking backend health...");
      setBackendStatus('checking');

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 3000)
      );

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(`${backendUrl}/health`, { method: "GET" }),
        timeoutPromise
      ]);

      const isHealthy = response.ok;
      setBackendStatus(isHealthy ? 'healthy' : 'down');
      console.log(isHealthy ? "✅ Backend health check passed" : "❌ Backend health check failed");
      return isHealthy;
    } catch (error) {
      console.log("❌ Backend health check failed:", error.message);
      setBackendStatus('down');
      return false;
    }
  };

  // Function to ensure backend is running before processing messages
  const ensureBackendRunning = async () => {
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      console.error("❌ Backend is not running!");
      const errorMessage = `
🚨 Backend Service Not Available

The AI backend is not running. To fix this:

1. Open a terminal in the project directory
2. Run: ./start.sh
   OR
3. Run: cd core/backend && npm start

The backend needs to be running on port 3000 for the AI to respond.
      `.trim();

      alert(errorMessage);
      throw new Error("Backend service is not available");
    } else {
      console.log("✅ Backend is healthy and ready");
    }
  };

  const chat = async (message) => {
    setLoading(true);
    try {
      // Check backend health before processing message
      await ensureBackendRunning();

      console.log("🚀 Sending message to backend:", message);
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId
        }),
      });

      if (!data.ok) {
        throw new Error(`Backend responded with status: ${data.status}`);
      }

      const resp = (await data.json()).messages;
      console.log("📨 Received messages from backend:", resp);
      setMessages((messages) => [...messages, ...resp]);
    } catch (error) {
      console.error("❌ Chat error:", error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  // Function to clear conversation memory
  const clearMemory = async () => {
    console.log('🧹 Starting memory clear process...');

    // Get current session ID from localStorage
    const currentSessionId = localStorage.getItem('brilliant-interface-session-id');

    try {
      // First, clear the backend session
      console.log('🧹 Clearing backend session:', currentSessionId);
      const response = await fetch(`${backendUrl}/clear-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend session cleared:', result.message);
      } else {
        console.warn('⚠️ Failed to clear backend session, but continuing...');
      }
    } catch (error) {
      console.warn('⚠️ Error clearing backend session:', error.message);
    }

    // Clear frontend message history
    setMessages([]);
    setMessage(null);

    // Generate new session ID to start fresh conversation
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('brilliant-interface-session-id', newSessionId);

    console.log('🧹 Frontend cleared, new session ID:', newSessionId);
    console.log('✅ Memory clear process complete!');
  };

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  useEffect(() => {
    console.log("📋 Messages array updated:", messages);
    if (messages.length > 0) {
      console.log("✅ Setting current message:", messages[0]);
      setMessage(messages[0]);
    } else {
      console.log("❌ No messages, setting message to null");
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        backendStatus,
        checkBackendHealth,
        clearMemory,
        sessionId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

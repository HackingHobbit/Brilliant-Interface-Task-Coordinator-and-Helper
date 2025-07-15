import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Lipsync } from "wawa-lipsync";

const LipsyncContext = createContext();

export const LipsyncProvider = ({ children }) => {
  const lipsyncManager = useRef(new Lipsync());
  const [currentViseme, setCurrentViseme] = useState("viseme_sil");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);

  const connectAudio = (audioElement) => {
    try {
      if (audioRef.current === audioElement) {
        return; // Already connected
      }
      
      audioRef.current = audioElement;
      lipsyncManager.current.connectAudio(audioElement);
      console.log("Audio connected to lip sync manager");
    } catch (error) {
      console.error("Failed to connect audio:", error);
    }
  };

  const startAnalysis = () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    const analyze = () => {
      if (!isAnalyzing) return;
      
      lipsyncManager.current.processAudio();
      const viseme = lipsyncManager.current.viseme;

      if (viseme !== currentViseme) {
        console.log("Viseme changed:", viseme);
        setCurrentViseme(viseme);
      }
      
      animationFrameRef.current = requestAnimationFrame(analyze);
    };
    
    analyze();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setCurrentViseme("viseme_sil");
  };

  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, []);

  return (
    <LipsyncContext.Provider
      value={{
        connectAudio,
        startAnalysis,
        stopAnalysis,
        currentViseme,
        isAnalyzing,
      }}
    >
      {children}
    </LipsyncContext.Provider>
  );
};

export const useLipsync = () => {
  const context = useContext(LipsyncContext);
  if (!context) {
    throw new Error("useLipsync must be used within a LipsyncProvider");
  }
  return context;
};

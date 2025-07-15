import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import { LipsyncProvider } from "./hooks/useLipsync";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <LipsyncProvider>
        <App />
      </LipsyncProvider>
    </ChatProvider>
  </React.StrictMode>
);

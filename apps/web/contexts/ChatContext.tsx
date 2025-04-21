"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// Define types for our chat context
type ChatObject = {
  info?: string;
  payload?: any;
};

interface ChatState {
  inputValue: string;
  editedJson: string;
  object: ChatObject | null;
  history: {
    timestamp: number;
    prompt: string;
    response: ChatObject | null;
  }[];
}

interface ChatContextType {
  chatState: ChatState;
  updateInputValue: (value: string) => void;
  updateEditedJson: (value: string) => void;
  updateObject: (value: ChatObject | null) => void;
  addToHistory: (prompt: string, response: ChatObject | null) => void;
  clearChat: () => void;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial state
const initialState: ChatState = {
  inputValue: "",
  editedJson: "",
  object: null,
  history: [],
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatState, setChatState] = useState<ChatState>(initialState);

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("chatState");
      
      if (savedState) {
        const parsedState = JSON.parse(savedState) as ChatState;
        setChatState(parsedState);
        if (parsedState.object) {
          toast.info("Loaded previous conversation");
        }
      }
    } catch (error) {
      console.error("Failed to load chat state from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem("chatState", JSON.stringify(chatState));
    } catch (error) {
      console.error("Failed to save chat state to localStorage:", error);
    }
  }, [chatState]);

  // Handlers for updating state
  const updateInputValue = (value: string) => {
    setChatState(prev => ({ ...prev, inputValue: value }));
  };

  const updateEditedJson = (value: string) => {
    setChatState(prev => ({ ...prev, editedJson: value }));
  };

  const updateObject = (value: ChatObject | null) => {
    setChatState(prev => ({ ...prev, object: value }));
  };

  const addToHistory = (prompt: string, response: ChatObject | null) => {
    setChatState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        {
          timestamp: Date.now(),
          prompt,
          response
        }
      ]
    }));
  };

  const clearChat = () => {
    setChatState(initialState);
    toast.info("Chat history cleared");
  };

  return (
    <ChatContext.Provider value={{
      chatState,
      updateInputValue,
      updateEditedJson,
      updateObject,
      addToHistory,
      clearChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook for using the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

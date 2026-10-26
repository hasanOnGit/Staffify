import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import aiService from "../services/ai.service";
import toast from "react-hot-toast";

const AiAssistantContext = createContext(null);

export function AiAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hello! I am your **Staffify AI Copilot**. I have real-time access to our verified database across Employees, Attendance, Leaves, Payroll, Performance, Recruitment, and Helpdesk. Ask me any question, request comparative analysis, or tell me an action to draft for you.",
      timestamp: new Date(),
      kpis: [],
      records: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState([]);
  const [conversations, setConversations] = useState([]);

  const location = useLocation();

  // Load capabilities once
  useEffect(() => {
    aiService
      .getCapabilities()
      .then((data) => setCapabilities(data || []))
      .catch((err) => console.warn("Failed to load AI capabilities:", err.message));
  }, []);

  // Load conversation list when opened
  const loadConversations = useCallback(async () => {
    try {
      const data = await aiService.getConversations();
      setConversations(data || []);
    } catch (err) {
      console.warn("Failed to load conversations:", err.message);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  // Global Keyboard shortcut: Ctrl + J or Cmd + K toggles the assistant
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key.toLowerCase() === "j") || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        // Only trigger if not actively typing inside a form input
        const tag = e.target?.tagName?.toLowerCase();
        if (tag === "input" && e.target.type === "text" && !e.target.closest("#ai-copilot-drawer")) {
          // If in topbar search, allow default
        } else {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const openAssistant = (initialPrompt = "") => {
    setIsOpen(true);
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  };

  const closeAssistant = () => setIsOpen(false);
  const toggleAssistant = () => setIsOpen((prev) => !prev);

  // Send a message
  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const query = text.trim();
    const tempUserMsgId = "USER-" + Date.now();

    // Append user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: tempUserMsgId,
        role: "user",
        content: query,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);

    try {
      const res = await aiService.sendMessage(
        query,
        activeConversationId,
        location.pathname
      );

      if (res.success) {
        setActiveConversationId(res.conversationId);
        setMessages((prev) => [
          ...prev,
          {
            id: res.messageId || "ASST-" + Date.now(),
            role: "assistant",
            logId: res.logId || null,
            content: res.message,
            summary: res.summary || "",
            description: res.description || "",
            suggestedFollowUps: res.suggestedFollowUps || [],
            timestamp: new Date(),
            records: res.records || [],
            columns: res.columns || [],
            kpis: res.kpis || [],
            actionDraft: res.actionDraft || null,
            citations: res.citations || [],
            context: res.context || {},
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "ERR-" + Date.now(),
            role: "assistant",
            content: res.error || "Unable to complete request.",
            timestamp: new Date(),
            error: res.error,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "ERR-" + Date.now(),
          role: "assistant",
          content: err.response?.data?.error || "Error contacting database assistant. Please check network connection.",
          timestamp: new Date(),
          error: err.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Confirm and execute an action draft
  const confirmAction = async (actionDraft) => {
    if (!actionDraft || !actionDraft.actionType) return;
    setLoading(true);

    try {
      const res = await aiService.confirmAction(
        actionDraft.actionType,
        actionDraft,
        activeConversationId
      );

      if (res.success) {
        toast.success(res.message || "Action executed successfully!");
        setMessages((prev) => [
          ...prev,
          {
            id: "ACT-CONFIRM-" + Date.now(),
            role: "assistant",
            content: res.message,
            timestamp: new Date(),
            actionResult: res,
          },
        ]);
      } else {
        toast.error(res.error || "Action execution failed");
        setMessages((prev) => [
          ...prev,
          {
            id: "ACT-ERR-" + Date.now(),
            role: "assistant",
            content: "Action execution failed: " + res.error,
            timestamp: new Date(),
            error: res.error,
          },
        ]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed to execute");
    } finally {
      setLoading(false);
    }
  };

  // Start fresh chat session
  const clearConversation = () => {
    setActiveConversationId(null);
    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content:
          "Starting a fresh session! What application data or analysis would you like to explore?",
        timestamp: new Date(),
        kpis: [],
        records: [],
      },
    ]);
  };

  return (
    <AiAssistantContext.Provider
      value={{
        isOpen,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        activeConversationId,
        setActiveConversationId,
        messages,
        loading,
        capabilities,
        conversations,
        sendMessage,
        confirmAction,
        clearConversation,
      }}
    >
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const context = useContext(AiAssistantContext);
  if (!context) {
    throw new Error("useAiAssistant must be used within an AiAssistantProvider");
  }
  return context;
}

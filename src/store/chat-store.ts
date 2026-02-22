import { create } from "zustand";
import { NodeExecution } from "@/lib/workflow-executor";

// ─── Message Types ──────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  executions?: NodeExecution[];
  totalDuration?: number;
  isStreaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isExecuting: boolean;
  activeExecutions: NodeExecution[];
  executionTab: "chat" | "execution";

  // Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (updates: Partial<ChatMessage>) => void;
  setExecuting: (executing: boolean) => void;
  addActiveExecution: (execution: NodeExecution) => void;
  updateActiveExecution: (execution: NodeExecution) => void;
  clearActiveExecutions: () => void;
  setExecutionTab: (tab: "chat" | "execution") => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "system",
      content: "Welcome to AgentFlow! 🚀\nBuild your workflow and test it here. Send a message to execute the workflow.",
      timestamp: Date.now(),
    },
  ],
  isOpen: false,
  isExecuting: false,
  activeExecutions: [],
  executionTab: "chat",

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  updateLastAssistantMessage: (updates) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "assistant") {
          msgs[i] = { ...msgs[i], ...updates };
          break;
        }
      }
      return { messages: msgs };
    }),

  setExecuting: (executing) => set({ isExecuting: executing }),

  addActiveExecution: (execution) =>
    set((s) => ({ activeExecutions: [...s.activeExecutions, execution] })),

  updateActiveExecution: (execution) =>
    set((s) => ({
      activeExecutions: s.activeExecutions.map((e) =>
        e.nodeId === execution.nodeId ? execution : e
      ),
    })),

  clearActiveExecutions: () => set({ activeExecutions: [] }),

  setExecutionTab: (tab) => set({ executionTab: tab }),

  clearMessages: () =>
    set({
      messages: [
        {
          id: "welcome",
          role: "system",
          content: "Chat cleared. Send a new message to run the workflow again.",
          timestamp: Date.now(),
        },
      ],
    }),
}));

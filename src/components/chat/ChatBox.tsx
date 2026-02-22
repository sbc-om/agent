"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore, ChatMessage } from "@/store/chat-store";
import { useWorkflowStore } from "@/store/workflow-store";
import { executeWorkflow, NodeExecution } from "@/lib/workflow-executor";
import { getIcon } from "@/lib/icons";
import ExecutionTrace from "./ExecutionTrace";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isOpen,
    isExecuting,
    activeExecutions,
    executionTab,
    closeChat,
    addMessage,
    updateLastAssistantMessage,
    setExecuting,
    addActiveExecution,
    updateActiveExecution,
    clearActiveExecutions,
    setExecutionTab,
    clearMessages,
  } = useChatStore();

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const workflowName = useWorkflowStore((s) => s.workflowName);

  const CloseIcon = getIcon("X");
  const SendIcon = getIcon("Send");
  const TrashIcon = getIcon("Trash2");
  const BotIcon = getIcon("Bot");
  const MaxIcon = getIcon("Maximize");
  const CopyIcon = getIcon("Copy");
  const CheckIcon = getIcon("Eye");

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeExecutions]);

  // Auto-focus input
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isExecuting) return;

    setInput("");

    // Add user message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    // Start execution
    setExecuting(true);
    clearActiveExecutions();

    // Add placeholder assistant message
    const assistantMsg: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
      executions: [],
    };
    addMessage(assistantMsg);

    // Execute workflow
    const result = await executeWorkflow(
      nodes,
      edges,
      trimmed,
      (exec: NodeExecution) => {
        addActiveExecution(exec);
      },
      (exec: NodeExecution) => {
        updateActiveExecution(exec);
      }
    );

    // Update assistant message with result
    updateLastAssistantMessage({
      content: result.finalOutput,
      isStreaming: false,
      executions: result.executions,
      totalDuration: result.totalDuration,
    });

    setExecuting(false);
  }, [input, isExecuting, nodes, edges, addMessage, setExecuting, clearActiveExecutions, updateLastAssistantMessage, addActiveExecution, updateActiveExecution]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[460px] h-[640px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BotIcon size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{workflowName}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
              <span className={`w-1.5 h-1.5 rounded-full ${isExecuting ? "bg-yellow-400 animate-pulse" : "bg-emerald-400"}`} />
              {isExecuting ? "Executing..." : `${nodes.length} nodes · Ready`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearMessages}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear chat"
          >
            <TrashIcon size={15} />
          </button>
          <button
            onClick={closeChat}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <CloseIcon size={15} />
          </button>
        </div>
      </div>

      {/* ─── Tab Bar ─────────────────────────────────────────── */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <button
          onClick={() => setExecutionTab("chat")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors relative ${
            executionTab === "chat"
              ? "text-indigo-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          💬 Chat
          {executionTab === "chat" && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setExecutionTab("execution")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors relative ${
            executionTab === "execution"
              ? "text-indigo-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          ⚡ Executions
          {activeExecutions.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] bg-indigo-100 text-indigo-600 rounded-full">
              {activeExecutions.length}
            </span>
          )}
          {executionTab === "execution" && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ─── Content Area ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {executionTab === "chat" ? (
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onCopy={copyMessage}
                CopyIcon={CopyIcon}
                BotIcon={BotIcon}
                CheckIcon={CheckIcon}
              />
            ))}

            {/* Streaming execution indicator */}
            {isExecuting && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <BotIcon size={14} className="text-indigo-500" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-gray-400">
                      {activeExecutions.length > 0
                        ? `Running ${activeExecutions[activeExecutions.length - 1]?.nodeLabel}...`
                        : "Processing..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <ExecutionTrace executions={activeExecutions} />
        )}
      </div>

      {/* ─── Input Area ──────────────────────────────────────── */}
      <div className="border-t border-gray-100 p-3 bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={nodes.length > 0 ? "Type your message..." : "Add nodes to the workflow first..."}
              disabled={isExecuting}
              rows={1}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-gray-50 resize-none max-h-24 text-gray-700 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              dir="auto"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isExecuting}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0
              ${
                input.trim() && !isExecuting
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-200"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            <SendIcon size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-gray-300">
            Enter to send · Shift+Enter new line
          </span>
          <span className="text-[10px] text-gray-300">
            {nodes.length} nodes · {edges.length} connections
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────
interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: (content: string) => void;
  CopyIcon: React.FC<{ size: number; className?: string }>;
  BotIcon: React.FC<{ size: number; className?: string }>;
  CheckIcon: React.FC<{ size: number; className?: string }>;
}

function MessageBubble({ message, onCopy, CopyIcon, BotIcon, CheckIcon }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-500 text-xs px-4 py-2.5 rounded-xl max-w-[90%] text-center leading-relaxed whitespace-pre-line border border-indigo-100/50">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%] shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
            {message.content}
          </p>
          <div className="text-[10px] text-white/50 mt-1 text-left">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex items-start gap-3 group">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <BotIcon size={14} className="text-indigo-500" />
      </div>
      <div className="max-w-[85%]">
        <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-100">
          {message.content ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap" dir="auto">
              {message.content}
            </p>
          ) : (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
          )}
        </div>

        {/* Execution summary */}
        {message.executions && message.executions.length > 0 && (
          <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              {message.executions.length} nodes executed
              {message.totalDuration && (
                <span className="text-emerald-400">
                  · {(message.totalDuration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {message.executions.map((exec) => (
                <span
                  key={exec.nodeId}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: exec.nodeColor }}
                  />
                  {exec.nodeLabel}
                  {exec.duration && (
                    <span className="text-emerald-400">
                      {exec.duration < 1000
                        ? `${exec.duration}ms`
                        : `${(exec.duration / 1000).toFixed(1)}s`}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-[10px] text-gray-300">
            {formatTime(message.timestamp)}
          </span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
            title="Copy"
          >
            {copied ? (
              <CheckIcon size={11} className="text-emerald-400" />
            ) : (
              <CopyIcon size={11} className="text-gray-300 hover:text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

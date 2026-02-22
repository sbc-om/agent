import { NodeDefinition, NodeCategory } from "@/types";

export const nodeDefinitions: NodeDefinition[] = [
  // ─── Triggers ──────────────────────────────────────────────
  {
    type: "chatTrigger",
    label: "Chat Trigger",
    description: "When chat message received",
    category: "triggers",
    icon: "MessageCircle",
    color: "#7c3aed",
    inputs: 0,
    outputs: 1,
    configFields: [
      {
        key: "allowedOrigins",
        label: "Allowed Origins",
        type: "text",
        placeholder: "*",
      },
    ],
  },
  {
    type: "webhookTrigger",
    label: "Webhook Trigger",
    description: "When webhook is called",
    category: "triggers",
    icon: "Webhook",
    color: "#7c3aed",
    inputs: 0,
    outputs: 1,
    configFields: [
      {
        key: "method",
        label: "HTTP Method",
        type: "select",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "DELETE", value: "DELETE" },
        ],
        defaultValue: "POST",
      },
      { key: "path", label: "Path", type: "text", placeholder: "/webhook" },
    ],
  },
  {
    type: "scheduleTrigger",
    label: "Schedule Trigger",
    description: "Runs on a schedule",
    category: "triggers",
    icon: "Clock",
    color: "#7c3aed",
    inputs: 0,
    outputs: 1,
    configFields: [
      {
        key: "cron",
        label: "Cron Expression",
        type: "text",
        placeholder: "0 * * * *",
      },
    ],
  },

  // ─── AI ────────────────────────────────────────────────────
  {
    type: "aiAgent",
    label: "AI Agent",
    description: "Tools Agent",
    category: "ai",
    icon: "Bot",
    color: "#ea580c",
    inputs: 1,
    outputs: 1,
    configFields: [
      {
        key: "agentType",
        label: "Agent Type",
        type: "select",
        options: [
          { label: "Tools Agent", value: "tools" },
          { label: "ReAct Agent", value: "react" },
          { label: "Plan & Execute", value: "plan-execute" },
        ],
        defaultValue: "tools",
      },
      {
        key: "systemPrompt",
        label: "System Prompt",
        type: "textarea",
        placeholder: "You are a helpful assistant...",
      },
      {
        key: "maxIterations",
        label: "Max Iterations",
        type: "number",
        defaultValue: 10,
      },
    ],
  },
  {
    type: "openaiModel",
    label: "OpenAI Chat Model",
    description: "GPT-4, GPT-3.5, etc.",
    category: "ai",
    icon: "Brain",
    color: "#ea580c",
    inputs: 0,
    outputs: 1,
    configFields: [
      {
        key: "model",
        label: "Model",
        type: "select",
        options: [
          { label: "GPT-4o", value: "gpt-4o" },
          { label: "GPT-4o Mini", value: "gpt-4o-mini" },
          { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
          { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
        ],
        defaultValue: "gpt-4o",
      },
      {
        key: "temperature",
        label: "Temperature",
        type: "number",
        defaultValue: 0.7,
      },
      {
        key: "apiKey",
        label: "API Key",
        type: "text",
        placeholder: "sk-...",
      },
    ],
  },
  {
    type: "anthropicModel",
    label: "Anthropic Model",
    description: "Claude 3.5, Claude 3, etc.",
    category: "ai",
    icon: "Sparkles",
    color: "#ea580c",
    inputs: 0,
    outputs: 1,
    configFields: [
      {
        key: "model",
        label: "Model",
        type: "select",
        options: [
          { label: "Claude 4 Sonnet", value: "claude-sonnet-4-20250514" },
          { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet" },
          { label: "Claude 3 Opus", value: "claude-3-opus" },
          { label: "Claude 3 Haiku", value: "claude-3-haiku" },
        ],
        defaultValue: "claude-sonnet-4-20250514",
      },
      {
        key: "temperature",
        label: "Temperature",
        type: "number",
        defaultValue: 0.7,
      },
    ],
  },
  {
    type: "windowMemory",
    label: "Window Buffer Memory",
    description: "Stores recent conversation",
    category: "ai",
    icon: "Database",
    color: "#ea580c",
    inputs: 0,
    outputs: 1,
    configFields: [
      {
        key: "windowSize",
        label: "Window Size",
        type: "number",
        defaultValue: 5,
      },
    ],
  },

  // ─── Tools ─────────────────────────────────────────────────
  {
    type: "serpApi",
    label: "SerpAPI",
    description: "Google Search tool",
    category: "tools",
    icon: "Search",
    color: "#0284c7",
    inputs: 0,
    outputs: 1,
    configFields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "text",
        placeholder: "Enter SerpAPI key",
      },
    ],
  },
  {
    type: "httpRequest",
    label: "HTTP Request",
    description: "Make HTTP requests",
    category: "tools",
    icon: "Globe",
    color: "#0284c7",
    inputs: 1,
    outputs: 1,
    configFields: [
      {
        key: "method",
        label: "Method",
        type: "select",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "DELETE", value: "DELETE" },
        ],
        defaultValue: "GET",
      },
      { key: "url", label: "URL", type: "text", placeholder: "https://..." },
    ],
  },
  {
    type: "codeExecutor",
    label: "Code Executor",
    description: "Run custom code",
    category: "tools",
    icon: "Code",
    color: "#0284c7",
    inputs: 1,
    outputs: 1,
    configFields: [
      {
        key: "language",
        label: "Language",
        type: "select",
        options: [
          { label: "JavaScript", value: "javascript" },
          { label: "Python", value: "python" },
        ],
        defaultValue: "javascript",
      },
      {
        key: "code",
        label: "Code",
        type: "textarea",
        placeholder: "// Your code here",
      },
    ],
  },
  {
    type: "callWorkflow",
    label: "Call Workflow",
    description: "Call another workflow",
    category: "tools",
    icon: "Workflow",
    color: "#0284c7",
    inputs: 1,
    outputs: 1,
    configFields: [
      {
        key: "workflowId",
        label: "Workflow ID",
        type: "text",
        placeholder: "Enter workflow ID",
      },
    ],
  },

  // ─── Flow Control ──────────────────────────────────────────
  {
    type: "ifCondition",
    label: "If Condition",
    description: "Branch based on condition",
    category: "flow",
    icon: "GitBranch",
    color: "#16a34a",
    inputs: 1,
    outputs: 2,
    configFields: [
      {
        key: "field",
        label: "Value (Field)",
        type: "select",
        options: [
          { label: "User Message", value: "message" },
          { label: "Message Length", value: "message.length" },
          { label: "Previous Output", value: "output" },
        ],
        defaultValue: "message",
      },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        options: [
          { label: "Equals (==)", value: "equals" },
          { label: "Not Equals (!=)", value: "not_equals" },
          { label: "Contains", value: "contains" },
          { label: "Not Contains", value: "not_contains" },
          { label: "Greater Than (>)", value: "greater" },
          { label: "Less Than (<)", value: "less" },
          { label: "Starts With", value: "starts_with" },
          { label: "Ends With", value: "ends_with" },
          { label: "Is Empty", value: "is_empty" },
          { label: "Is Not Empty", value: "is_not_empty" },
          { label: "Regex Match", value: "regex" },
        ],
        defaultValue: "equals",
      },
      {
        key: "value",
        label: "Compare Value",
        type: "text",
        placeholder: "e.g. 5, hello, true...",
      },
    ],
  },
  {
    type: "switchNode",
    label: "Switch",
    description: "Route to multiple outputs",
    category: "flow",
    icon: "Route",
    color: "#16a34a",
    inputs: 1,
    outputs: 3,
    configFields: [
      {
        key: "field",
        label: "Field to Match",
        type: "text",
        placeholder: "status",
      },
    ],
  },
  {
    type: "mergeNode",
    label: "Merge",
    description: "Merge multiple inputs",
    category: "flow",
    icon: "Merge",
    color: "#16a34a",
    inputs: 2,
    outputs: 1,
    configFields: [
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: [
          { label: "Append", value: "append" },
          { label: "Merge by Index", value: "index" },
          { label: "Merge by Key", value: "key" },
        ],
        defaultValue: "append",
      },
    ],
  },

  // ─── Actions ───────────────────────────────────────────────
  {
    type: "sendMessage",
    label: "Send Message",
    description: "Send a response message",
    category: "actions",
    icon: "Send",
    color: "#dc2626",
    inputs: 1,
    outputs: 0,
    configFields: [
      {
        key: "messageType",
        label: "Message Type",
        type: "select",
        options: [
          { label: "Success", value: "success" },
          { label: "Error", value: "error" },
          { label: "Info", value: "info" },
        ],
        defaultValue: "success",
      },
      {
        key: "message",
        label: "Message",
        type: "textarea",
        placeholder: "Response message...",
      },
    ],
  },
  {
    type: "emailAction",
    label: "Send Email",
    description: "Send an email",
    category: "actions",
    icon: "Mail",
    color: "#dc2626",
    inputs: 1,
    outputs: 1,
    configFields: [
      { key: "to", label: "To", type: "text", placeholder: "email@..." },
      { key: "subject", label: "Subject", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
  },

  // ─── Data ──────────────────────────────────────────────────
  {
    type: "setVariable",
    label: "Set Variable",
    description: "Set a workflow variable",
    category: "data",
    icon: "Variable",
    color: "#ca8a04",
    inputs: 1,
    outputs: 1,
    configFields: [
      { key: "name", label: "Variable Name", type: "text" },
      { key: "value", label: "Value", type: "text" },
    ],
  },
  {
    type: "jsonParse",
    label: "JSON Parse",
    description: "Parse JSON data",
    category: "data",
    icon: "FileJson",
    color: "#ca8a04",
    inputs: 1,
    outputs: 1,
    configFields: [
      {
        key: "field",
        label: "Field",
        type: "text",
        placeholder: "data.result",
      },
    ],
  },
];

export const categoryInfo: Record<
  NodeCategory,
  { label: string; icon: string }
> = {
  triggers: { label: "Triggers", icon: "Zap" },
  ai: { label: "AI / LLM", icon: "Brain" },
  tools: { label: "Tools", icon: "Wrench" },
  flow: { label: "Flow Control", icon: "GitBranch" },
  actions: { label: "Actions", icon: "Play" },
  data: { label: "Data", icon: "Database" },
};

export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return nodeDefinitions.find((n) => n.type === type);
}

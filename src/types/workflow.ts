import { Node, Edge } from "@xyflow/react";

// ─── Node Categories ────────────────────────────────────────────────
export type NodeCategory =
  | "triggers"
  | "ai"
  | "tools"
  | "flow"
  | "actions"
  | "data";

// ─── Node Definition (palette items) ─────────────────────────────────
export interface NodeDefinition {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
  icon: string; // lucide icon name
  color: string;
  inputs: number;
  outputs: number;
  configFields: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "select" | "number" | "textarea" | "toggle";
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
}

// ─── Workflow Node Data ──────────────────────────────────────────────
export interface WorkflowNodeData {
  label: string;
  type: string;
  description: string;
  icon: string;
  color: string;
  config: Record<string, unknown>;
  inputs: number;
  outputs: number;
  [key: string]: unknown;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

// ─── Workflow ────────────────────────────────────────────────────────
export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

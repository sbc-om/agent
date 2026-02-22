import { create } from "zustand";
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { WorkflowNode, WorkflowEdge, WorkflowNodeData } from "@/types";
import { getNodeDefinition } from "@/lib/node-definitions";

interface WorkflowState {
  // Workflow metadata
  workflowId: string;
  workflowName: string;
  isActive: boolean;

  // Nodes & Edges
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  // UI State
  selectedNodeId: string | null;
  isSidebarOpen: boolean;
  isPanelOpen: boolean;

  // Actions
  setWorkflowName: (name: string) => void;
  toggleActive: () => void;

  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void;
  updateNodeLabel: (id: string, label: string) => void;

  selectNode: (id: string | null) => void;
  toggleSidebar: () => void;
  togglePanel: () => void;

  clearWorkflow: () => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: uuidv4(),
  workflowName: "My AI Agent Workflow",
  isActive: false,

  nodes: [],
  edges: [],

  selectedNodeId: null,
  isSidebarOpen: true,
  isPanelOpen: false,

  setWorkflowName: (name) => set({ workflowName: name }),
  toggleActive: () => set((s) => ({ isActive: !s.isActive })),

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set((s) => ({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#6366f1", strokeWidth: 2 },
        },
        s.edges
      ),
    })),

  addNode: (type, position) => {
    const def = getNodeDefinition(type);
    if (!def) return;

    const newNode: WorkflowNode = {
      id: uuidv4(),
      type: "workflowNode",
      position,
      data: {
        label: def.label,
        type: def.type,
        description: def.description,
        icon: def.icon,
        color: def.color,
        config: {},
        inputs: def.inputs,
        outputs: def.outputs,
      } as WorkflowNodeData,
    };

    set((s) => ({
      nodes: [...s.nodes, newNode],
    }));
  },

  deleteNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      isPanelOpen: s.selectedNodeId === id ? false : s.isPanelOpen,
    })),

  updateNodeConfig: (id, config) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
          : n
      ),
    })),

  updateNodeLabel: (id, label) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label } } : n
      ),
    })),

  selectNode: (id) =>
    set({
      selectedNodeId: id,
      isPanelOpen: id !== null,
    }),

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),

  clearWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isPanelOpen: false,
    }),

  exportWorkflow: () => {
    const { workflowId, workflowName, nodes, edges } = get();
    return JSON.stringify(
      {
        id: workflowId,
        name: workflowName,
        nodes,
        edges,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importWorkflow: (json) => {
    try {
      const data = JSON.parse(json);
      set({
        workflowId: data.id || uuidv4(),
        workflowName: data.name || "Imported Workflow",
        nodes: data.nodes || [],
        edges: data.edges || [],
        selectedNodeId: null,
        isPanelOpen: false,
      });
    } catch (e) {
      console.error("Failed to import workflow:", e);
    }
  },
}));

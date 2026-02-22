"use client";

import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/store/workflow-store";
import WorkflowNodeComponent from "@/components/nodes/WorkflowNode";
import { getIcon } from "@/lib/icons";

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const nodeTypes = useMemo(
    () => ({
      workflowNode: WorkflowNodeComponent,
    }),
    []
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const type = e.dataTransfer.getData("application/agentflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const PlusIcon = getIcon("Plus");
  const MouseIcon = getIcon("MousePointerClick");
  const ArrowIcon = getIcon("ArrowRight");

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "#6366f1", strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
        <Controls
          className="!bg-white !border-gray-200 !rounded-lg !shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-white !border-gray-200 !rounded-lg !shadow-lg"
          nodeColor={(node) => {
            const data = node.data as Record<string, unknown>;
            return (data.color as string) || "#6366f1";
          }}
          maskColor="rgb(243, 244, 246, 0.7)"
        />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <PlusIcon size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              Start Building Your Agent
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Drag nodes from the sidebar or click on them to add to the canvas.
              Connect nodes to create your workflow.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <MouseIcon size={14} />
                <span>Click to add</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowIcon size={14} />
                <span>Drag to connect</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

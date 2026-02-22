"use client";

import { memo, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { WorkflowNodeData } from "@/types";
import { getIcon } from "@/lib/icons";
import { useWorkflowStore } from "@/store/workflow-store";

function WorkflowNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as WorkflowNodeData;
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const Icon = getIcon(nodeData.icon);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectNode(id);
    },
    [id, selectNode]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNode(id);
    },
    [id, deleteNode]
  );

  return (
    <div
      onClick={handleClick}
      className={`
        relative group bg-white rounded-lg shadow-sm border transition-all duration-200 cursor-pointer
        min-w-[180px] max-w-[220px]
        hover:shadow-md
        ${selected ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"}
      `}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] hover:bg-red-600 z-10"
      >
        ×
      </button>

      {/* Node content */}
      <div className="px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${nodeData.color}12` }}
          >
            <Icon size={16} style={{ color: nodeData.color }} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-800 truncate">
              {nodeData.label}
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              {nodeData.description}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-connections indicator */}
      {nodeData.type === "aiAgent" && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: nodeData.color }}
            />
            Chat Model
            <span className="text-red-400 ml-0.5">*</span>
            <span className="mx-1">·</span>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: nodeData.color }}
            />
            Memory
            <span className="mx-1">·</span>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: nodeData.color }}
            />
            Tool
          </div>
        </div>
      )}

      {/* Input handles */}
      {nodeData.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white hover:!bg-indigo-400 transition-colors"
        />
      )}

      {/* Output handles */}
      {nodeData.outputs === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white hover:!bg-indigo-400 transition-colors"
        />
      )}

      {/* Multiple outputs (e.g., If condition: true/false) */}
      {nodeData.outputs === 2 && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: "35%" }}
            className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: "65%" }}
            className="!w-3 !h-3 !bg-red-400 !border-2 !border-white"
          />
          <span className="absolute right-5 text-[9px] text-emerald-500 font-medium" style={{ top: "28%" }}>
            true
          </span>
          <span className="absolute right-5 text-[9px] text-red-400 font-medium" style={{ top: "58%" }}>
            false
          </span>
        </>
      )}

      {nodeData.outputs >= 3 &&
        Array.from({ length: nodeData.outputs }).map((_, i) => (
          <Handle
            key={i}
            type="source"
            position={Position.Right}
            id={`output-${i}`}
            style={{
              top: `${((i + 1) / (nodeData.outputs + 1)) * 100}%`,
            }}
            className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white hover:!bg-indigo-400 transition-colors"
          />
        ))}
    </div>
  );
}

export default memo(WorkflowNodeComponent);

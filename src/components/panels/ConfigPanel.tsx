"use client";

import { useMemo } from "react";
import { useWorkflowStore } from "@/store/workflow-store";
import { getNodeDefinition } from "@/lib/node-definitions";
import { getIcon } from "@/lib/icons";
import { WorkflowNodeData } from "@/types";

export default function ConfigPanel() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const isPanelOpen = useWorkflowStore((s) => s.isPanelOpen);
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useWorkflowStore((s) => s.updateNodeLabel);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  if (!isPanelOpen || !selectedNode) return null;

  const nodeData = selectedNode.data as WorkflowNodeData;
  const definition = getNodeDefinition(nodeData.type);
  const NodeIcon = getIcon(nodeData.icon);
  const CloseIcon = getIcon("X");
  const TrashIcon = getIcon("Trash2");
  const SettingsIcon = getIcon("Settings");

  const handleConfigChange = (key: string, value: unknown) => {
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SettingsIcon size={14} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Node Settings
            </span>
          </div>
          <button
            onClick={() => selectNode(null)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <CloseIcon size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${nodeData.color}15` }}
          >
            <NodeIcon size={20} style={{ color: nodeData.color }} />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={nodeData.label}
              onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
              className="font-semibold text-gray-800 bg-transparent border-none outline-none text-sm w-full focus:ring-0 p-0"
            />
            <div className="text-[11px] text-gray-400">{nodeData.description}</div>
          </div>
        </div>
      </div>

      {/* Config fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {definition?.configFields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              {field.label}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                value={(nodeData.config[field.key] as string) || ""}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-gray-50 text-gray-700 placeholder-gray-400"
              />
            )}

            {field.type === "number" && (
              <input
                type="number"
                value={(nodeData.config[field.key] as number) ?? field.defaultValue ?? ""}
                onChange={(e) =>
                  handleConfigChange(field.key, parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-gray-50 text-gray-700"
              />
            )}

            {field.type === "select" && (
              <select
                value={(nodeData.config[field.key] as string) || (field.defaultValue as string) || ""}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-gray-50 text-gray-700"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "textarea" && (
              <textarea
                value={(nodeData.config[field.key] as string) || ""}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-gray-50 resize-none text-gray-700 placeholder-gray-400"
              />
            )}

            {field.type === "toggle" && (
              <button
                onClick={() =>
                  handleConfigChange(
                    field.key,
                    !nodeData.config[field.key]
                  )
                }
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${nodeData.config[field.key] ? "bg-indigo-500" : "bg-gray-300"}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                    ${nodeData.config[field.key] ? "translate-x-6" : "translate-x-0.5"}
                  `}
                />
              </button>
            )}
          </div>
        ))}

        {(!definition?.configFields || definition.configFields.length === 0) && (
          <div className="text-center text-sm text-gray-400 py-8">
            No configuration options available for this node.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            deleteNode(selectedNode.id);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <TrashIcon size={14} />
          Delete Node
        </button>
      </div>
    </div>
  );
}

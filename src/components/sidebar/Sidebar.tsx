"use client";

import { useState, useMemo } from "react";
import { nodeDefinitions, categoryInfo } from "@/lib/node-definitions";
import { NodeCategory } from "@/types";
import { getIcon } from "@/lib/icons";
import { useWorkflowStore } from "@/store/workflow-store";

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(["triggers", "ai", "tools", "flow", "actions", "data"])
  );
  const isSidebarOpen = useWorkflowStore((s) => s.isSidebarOpen);
  const addNode = useWorkflowStore((s) => s.addNode);

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodeDefinitions;
    const q = searchQuery.toLowerCase();
    return nodeDefinitions.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const groupedNodes = useMemo(() => {
    const groups: Record<string, typeof nodeDefinitions> = {};
    for (const node of filteredNodes) {
      if (!groups[node.category]) groups[node.category] = [];
      groups[node.category].push(node);
    }
    return groups;
  }, [filteredNodes]);

  const toggleCategory = (cat: NodeCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleAddNode = (type: string) => {
    // Add node near center with some randomness
    const x = 400 + Math.random() * 200;
    const y = 200 + Math.random() * 200;
    addNode(type, { x, y });
  };

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/agentflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  if (!isSidebarOpen) return null;

  const SearchIcon = getIcon("Search");
  const ChevronRight = getIcon("ChevronRight");
  const ChevronDown = getIcon("ChevronDown");

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
          Nodes
        </h2>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-gray-50 transition-all text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(categoryInfo).map(([category, info]) => {
          const nodes = groupedNodes[category];
          if (!nodes || nodes.length === 0) return null;

          const isExpanded = expandedCategories.has(category as NodeCategory);
          const CatIcon = getIcon(info.icon);

          return (
            <div key={category} className="mb-1">
              <button
                onClick={() => toggleCategory(category as NodeCategory)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-gray-400" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
                <CatIcon size={14} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {info.label}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {nodes.length}
                </span>
              </button>

              {isExpanded && (
                <div className="ml-2 space-y-0.5 mt-0.5">
                  {nodes.map((node) => {
                    const NodeIcon = getIcon(node.icon);
                    return (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                        onClick={() => handleAddNode(node.type)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab hover:bg-gray-50 active:cursor-grabbing transition-all group border border-transparent hover:border-gray-200"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${node.color}15` }}
                        >
                          <NodeIcon size={16} style={{ color: node.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {node.label}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {node.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useWorkflowStore } from "@/store/workflow-store";
import { getIcon } from "@/lib/icons";

export default function Toolbar() {
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const isActive = useWorkflowStore((s) => s.isActive);
  const toggleActive = useWorkflowStore((s) => s.toggleActive);
  const isSidebarOpen = useWorkflowStore((s) => s.isSidebarOpen);
  const toggleSidebar = useWorkflowStore((s) => s.toggleSidebar);
  const clearWorkflow = useWorkflowStore((s) => s.clearWorkflow);
  const exportWorkflow = useWorkflowStore((s) => s.exportWorkflow);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PanelOpen = getIcon("PanelLeftOpen");
  const PanelClose = getIcon("PanelLeftClose");
  const Download = getIcon("Download");
  const Upload = getIcon("Upload");
  const RotateCcw = getIcon("RotateCcw");
  const Share = getIcon("Share2");
  const Tag = getIcon("Tag");
  const Save = getIcon("Save");

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      importWorkflow(json);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 flex-shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelClose size={18} className="text-gray-500" />
          ) : (
            <PanelOpen size={18} className="text-gray-500" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
            AgentFlow
          </span>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* Workflow name */}
        {isEditing ? (
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            autoFocus
            className="text-sm font-medium text-gray-700 bg-gray-50 border border-indigo-300 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-200"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            {workflowName}
          </button>
        )}

        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <Tag size={12} />
          <span>+ Add tag</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Active/Inactive toggle */}
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs text-gray-500">
            {isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={toggleActive}
            className={`
              w-10 h-5 rounded-full transition-colors relative
              ${isActive ? "bg-emerald-500" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${isActive ? "translate-x-5" : "translate-x-0.5"}
              `}
            />
          </button>
        </div>

        <button
          onClick={() => {/* share functionality */}}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Share size={13} />
          Share
        </button>

        <div className="h-6 w-px bg-gray-200" />

        <button
          onClick={handleExport}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Export workflow"
        >
          <Download size={16} className="text-gray-500" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Import workflow"
        >
          <Upload size={16} className="text-gray-500" />
        </button>

        <button
          onClick={clearWorkflow}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Clear workflow"
        >
          <RotateCcw size={16} className="text-gray-500" />
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Save size={13} />
          Save
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </header>
  );
}

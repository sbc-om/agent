"use client";

import { NodeExecution } from "@/lib/workflow-executor";
import { getIcon } from "@/lib/icons";

interface ExecutionTraceProps {
  executions: NodeExecution[];
}

export default function ExecutionTrace({ executions }: ExecutionTraceProps) {
  if (executions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl">⚡</span>
        </div>
        <p className="text-sm font-medium text-gray-500">No executions yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Send a message to execute the workflow
        </p>
      </div>
    );
  }

  const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
  const successCount = executions.filter((e) => e.status === "success").length;
  const errorCount = executions.filter((e) => e.status === "error").length;

  return (
    <div className="p-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center border border-emerald-100">
          <div className="text-lg font-bold text-emerald-600">{successCount}</div>
          <div className="text-[10px] text-emerald-500">Success</div>
        </div>
        <div className="bg-red-50 rounded-xl px-3 py-2 text-center border border-red-100">
          <div className="text-lg font-bold text-red-600">{errorCount}</div>
          <div className="text-[10px] text-red-500">Errors</div>
        </div>
        <div className="bg-indigo-50 rounded-xl px-3 py-2 text-center border border-indigo-100">
          <div className="text-lg font-bold text-indigo-600">
            {totalDuration < 1000
              ? `${totalDuration}ms`
              : `${(totalDuration / 1000).toFixed(1)}s`}
          </div>
          <div className="text-[10px] text-indigo-500">Total Time</div>
        </div>
      </div>

      {/* Execution steps */}
      <div className="space-y-1">
        {executions.map((exec, index) => (
          <ExecutionStep key={exec.nodeId} execution={exec} index={index} isLast={index === executions.length - 1} />
        ))}
      </div>
    </div>
  );
}

function ExecutionStep({
  execution,
  index,
  isLast,
}: {
  execution: NodeExecution;
  index: number;
  isLast: boolean;
}) {
  const NodeIcon = getIcon(execution.nodeIcon);

  const statusColors = {
    idle: "bg-gray-200",
    running: "bg-yellow-400 animate-pulse",
    success: "bg-emerald-400",
    error: "bg-red-400",
  };

  const statusBg = {
    idle: "bg-gray-50 border-gray-200",
    running: "bg-yellow-50 border-yellow-200",
    success: "bg-white border-gray-200",
    error: "bg-red-50 border-red-200",
  };

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[19px] top-[44px] w-0.5 h-4 bg-gray-200" />
      )}

      <div
        className={`rounded-xl border px-3 py-2.5 transition-all ${statusBg[execution.status]}`}
      >
        <div className="flex items-center gap-3">
          {/* Step number & icon */}
          <div className="relative">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${execution.nodeColor}15` }}
            >
              <NodeIcon size={16} style={{ color: execution.nodeColor }} />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[execution.status]}`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-mono">#{index + 1}</span>
              <span className="text-sm font-medium text-gray-700 truncate">
                {execution.nodeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-gray-400">{execution.nodeType}</span>
              {execution.duration && (
                <>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">
                    {execution.duration < 1000
                      ? `${execution.duration}ms`
                      : `${(execution.duration / 1000).toFixed(1)}s`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              execution.status === "success"
                ? "bg-emerald-100 text-emerald-600"
                : execution.status === "running"
                ? "bg-yellow-100 text-yellow-600"
                : execution.status === "error"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {execution.status === "success"
              ? "✓ Done"
              : execution.status === "running"
              ? "⟳ Running"
              : execution.status === "error"
              ? "✗ Error"
              : "—"}
          </span>
        </div>

        {/* Output preview */}
        {Boolean(execution.output) && execution.status === "success" && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <details className="group">
              <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                View output ▸
              </summary>
              <pre className="mt-1.5 text-[10px] text-gray-500 bg-gray-50 rounded-lg p-2 overflow-x-auto max-h-32 overflow-y-auto font-mono leading-relaxed">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

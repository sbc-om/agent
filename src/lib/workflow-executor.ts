import { WorkflowNode, WorkflowEdge, WorkflowNodeData } from "@/types";
import { getNodeDefinition } from "@/lib/node-definitions";

// ─── Execution Types ────────────────────────────────────────────────
export type ExecutionStatus = "idle" | "running" | "success" | "error";

export interface NodeExecution {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  nodeIcon: string;
  nodeColor: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  input?: unknown;
  output?: unknown;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  executions: NodeExecution[];
  finalOutput: string;
  totalDuration: number;
  error?: string;
}

// ─── Topological Sort (BFS) to find execution order ──────────────────
function getExecutionOrder(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of adjacency.get(current) || []) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return order.map((id) => nodeMap.get(id)!).filter(Boolean);
}

// ─── Simulate node execution ────────────────────────────────────────
function simulateNodeOutput(
  node: WorkflowNode,
  input: unknown,
  userMessage: string
): { output: unknown; delay: number } {
  const data = node.data as WorkflowNodeData;
  const config = data.config || {};

  switch (data.type) {
    case "chatTrigger":
    case "webhookTrigger":
    case "scheduleTrigger":
      return {
        output: { message: userMessage, timestamp: new Date().toISOString() },
        delay: 300,
      };

    case "aiAgent":
      return {
        output: {
          response: generateAIResponse(userMessage, config),
          tokensUsed: Math.floor(Math.random() * 500) + 100,
          model: config.agentType || "tools",
        },
        delay: 1500 + Math.random() * 1000,
      };

    case "openaiModel":
      return {
        output: {
          model: config.model || "gpt-4o",
          response: `[${config.model || "GPT-4o"}] Processing: "${userMessage.slice(0, 50)}..."`,
          tokens: { prompt: Math.floor(Math.random() * 200) + 50, completion: Math.floor(Math.random() * 300) + 100 },
        },
        delay: 1200 + Math.random() * 800,
      };

    case "anthropicModel":
      return {
        output: {
          model: config.model || "claude-sonnet-4-20250514",
          response: `[Claude] Analyzing: "${userMessage.slice(0, 50)}..."`,
          tokens: { input: Math.floor(Math.random() * 200) + 50, output: Math.floor(Math.random() * 300) + 100 },
        },
        delay: 1000 + Math.random() * 1000,
      };

    case "windowMemory":
      return {
        output: {
          memoryStored: true,
          windowSize: config.windowSize || 5,
          messagesInBuffer: Math.floor(Math.random() * 5) + 1,
        },
        delay: 200,
      };

    case "serpApi":
      return {
        output: {
          results: [
            { title: `Search result for: ${userMessage.slice(0, 30)}`, url: "https://example.com/1", snippet: "Relevant information found..." },
            { title: "Related article", url: "https://example.com/2", snippet: "Additional context..." },
          ],
          totalResults: Math.floor(Math.random() * 1000000),
        },
        delay: 800 + Math.random() * 500,
      };

    case "httpRequest":
      return {
        output: {
          status: 200,
          data: { success: true, message: "Request completed" },
          headers: { "content-type": "application/json" },
        },
        delay: 500 + Math.random() * 500,
      };

    case "codeExecutor":
      return {
        output: {
          result: "Code executed successfully",
          language: config.language || "javascript",
          executionTime: `${Math.floor(Math.random() * 100)}ms`,
        },
        delay: 400 + Math.random() * 300,
      };

    case "callWorkflow":
      return {
        output: {
          workflowId: config.workflowId || "sub-workflow-1",
          status: "completed",
          result: { processed: true },
        },
        delay: 1000 + Math.random() * 500,
      };

    case "ifCondition": {
      const field = (config.field as string) || "message";
      const operator = (config.operator as string) || "equals";
      const compareValue = (config.value as string) || "";

      // Resolve field value
      let fieldValue: string;
      if (field === "message") {
        fieldValue = userMessage;
      } else if (field === "message.length") {
        fieldValue = String(userMessage.length);
      } else if (field === "output") {
        fieldValue = input ? JSON.stringify(input) : "";
      } else {
        fieldValue = userMessage;
      }

      // Evaluate condition
      const condResult = evaluateCondition(fieldValue, operator, compareValue);

      return {
        output: {
          field,
          operator,
          compareValue,
          actualValue: fieldValue,
          result: condResult,
          branch: condResult ? "true" : "false",
        },
        delay: 150,
      };
    }

    case "switchNode":
      return {
        output: {
          matchedRoute: 0,
          field: config.field || "status",
          value: "active",
        },
        delay: 150,
      };

    case "mergeNode":
      return {
        output: {
          mergedItems: 2,
          mode: config.mode || "append",
        },
        delay: 200,
      };

    case "sendMessage":
      return {
        output: {
          sent: true,
          type: config.messageType || "success",
          message: config.message || generateAIResponse(userMessage, config),
        },
        delay: 300,
      };

    case "emailAction":
      return {
        output: {
          sent: true,
          to: config.to || "user@example.com",
          subject: config.subject || "Notification",
        },
        delay: 600,
      };

    case "setVariable":
      return {
        output: {
          variable: config.name || "var1",
          value: config.value || userMessage,
          set: true,
        },
        delay: 100,
      };

    case "jsonParse":
      return {
        output: {
          parsed: true,
          field: config.field || "data",
          result: { key: "value" },
        },
        delay: 100,
      };

    default:
      return {
        output: { processed: true },
        delay: 300,
      };
  }
}

// ─── Condition Evaluator ─────────────────────────────────────────────
function evaluateCondition(fieldValue: string, operator: string, compareValue: string): boolean {
  const fv = fieldValue.trim();
  const cv = compareValue.trim();

  switch (operator) {
    case "equals":
      // Try numeric comparison first
      if (!isNaN(Number(fv)) && !isNaN(Number(cv))) {
        return Number(fv) === Number(cv);
      }
      return fv.toLowerCase() === cv.toLowerCase();

    case "not_equals":
      if (!isNaN(Number(fv)) && !isNaN(Number(cv))) {
        return Number(fv) !== Number(cv);
      }
      return fv.toLowerCase() !== cv.toLowerCase();

    case "contains":
      return fv.toLowerCase().includes(cv.toLowerCase());

    case "not_contains":
      return !fv.toLowerCase().includes(cv.toLowerCase());

    case "greater":
      return Number(fv) > Number(cv);

    case "less":
      return Number(fv) < Number(cv);

    case "starts_with":
      return fv.toLowerCase().startsWith(cv.toLowerCase());

    case "ends_with":
      return fv.toLowerCase().endsWith(cv.toLowerCase());

    case "is_empty":
      return fv === "";

    case "is_not_empty":
      return fv !== "";

    case "regex":
      try {
        return new RegExp(cv, "i").test(fv);
      } catch {
        return false;
      }

    default:
      return false;
  }
}

// ─── AI Response Generator ──────────────────────────────────────────
function generateAIResponse(userMessage: string, config: Record<string, unknown>): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! 👋 I'm your intelligent assistant. How can I help you?";
  }
  if (msg.includes("help")) {
    return "Sure! I can help you with:\n• Answering questions\n• Searching for information\n• Processing data\n• Running automated tasks\n\nWhat would you like me to do?";
  }
  if (msg.includes("workflow")) {
    return "Your workflow has been executed successfully! ✅ All nodes were processed correctly and the final output is ready.";
  }
  if (msg.includes("search")) {
    return "Search completed! 🔍 Relevant results found. Information has been gathered and processed from reliable sources.";
  }
  if (msg.includes("code")) {
    return "```javascript\nconst result = await processData(input);\nconsole.log('Processed:', result);\n```\nCode executed successfully! ✅";
  }
  if (msg.includes("test")) {
    return "Workflow test completed successfully! ✅\n\n📊 Results:\n• All nodes: Passed\n• Execution time: Fast\n• Errors: None\n• Status: Ready for production";
  }

  const responses = [
    `Your message received: "${userMessage}"\n\nProcessing completed successfully. Do you have any other questions?`,
    `Based on your input, analysis is complete and results are ready. ✅\n\nSummary: Processing "${userMessage.slice(0, 40)}..." completed successfully.`,
    `Operation executed successfully! 🎯\n\nInput data processed and output generated. All workflow steps worked correctly.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// ─── Main Executor ──────────────────────────────────────────────────
export async function executeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  userMessage: string,
  onNodeStart: (execution: NodeExecution) => void,
  onNodeComplete: (execution: NodeExecution) => void
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const executions: NodeExecution[] = [];

  if (nodes.length === 0) {
    return {
      success: false,
      executions: [],
      finalOutput: "No nodes in the workflow. Please add nodes first.",
      totalDuration: 0,
      error: "Empty workflow",
    };
  }

  // Build adjacency map: nodeId -> outgoing edges
  const outEdges = new Map<string, WorkflowEdge[]>();
  const inEdges = new Map<string, WorkflowEdge[]>();
  for (const edge of edges) {
    if (!outEdges.has(edge.source)) outEdges.set(edge.source, []);
    outEdges.get(edge.source)!.push(edge);
    if (!inEdges.has(edge.target)) inEdges.set(edge.target, []);
    inEdges.get(edge.target)!.push(edge);
  }

  // Find start nodes (no incoming edges)
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const startNodes = nodes.filter((n) => !inEdges.has(n.id) || inEdges.get(n.id)!.length === 0);

  // Track which nodes should be skipped (wrong branch)
  const skippedNodes = new Set<string>();
  const executedNodes = new Set<string>();
  const nodeOutputs = new Map<string, unknown>();

  // BFS execution following branches
  const queue: { nodeId: string; input: unknown }[] = startNodes.map((n) => ({
    nodeId: n.id,
    input: null,
  }));

  while (queue.length > 0) {
    const { nodeId, input } = queue.shift()!;
    if (executedNodes.has(nodeId) || skippedNodes.has(nodeId)) continue;

    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // Check if all incoming edges are from executed or skipped nodes
    const incoming = inEdges.get(nodeId) || [];
    const allInputsReady = incoming.every(
      (e) => executedNodes.has(e.source) || skippedNodes.has(e.source)
    );
    if (!allInputsReady) {
      // Re-queue and continue with other nodes
      queue.push({ nodeId, input });
      continue;
    }

    // If any incoming edge is from a skipped node and there's no other executed source, skip this node
    if (incoming.length > 0) {
      const hasExecutedSource = incoming.some((e) => executedNodes.has(e.source));
      if (!hasExecutedSource) {
        skippedNodes.add(nodeId);
        // Propagate skip to downstream nodes
        const downstream = outEdges.get(nodeId) || [];
        for (const edge of downstream) {
          queue.push({ nodeId: edge.target, input: null });
        }
        continue;
      }
    }

    const data = node.data as WorkflowNodeData;
    const execution: NodeExecution = {
      nodeId: node.id,
      nodeLabel: data.label,
      nodeType: data.type,
      nodeIcon: data.icon,
      nodeColor: data.color,
      status: "running",
      startTime: Date.now(),
    };

    onNodeStart(execution);

    const resolvedInput = input ?? nodeOutputs.get(
      incoming.find((e) => executedNodes.has(e.source))?.source || ""
    );

    const { output, delay } = simulateNodeOutput(node, resolvedInput, userMessage);

    await new Promise((resolve) => setTimeout(resolve, delay));

    execution.status = "success";
    execution.endTime = Date.now();
    execution.duration = execution.endTime - execution.startTime;
    execution.input = resolvedInput;
    execution.output = output;

    executedNodes.add(nodeId);
    nodeOutputs.set(nodeId, output);
    executions.push(execution);
    onNodeComplete(execution);

    // Determine next nodes based on branching
    const downstream = outEdges.get(nodeId) || [];

    if (data.type === "ifCondition") {
      const condOutput = output as Record<string, unknown>;
      const branch = condOutput.branch as string; // "true" or "false"

      for (const edge of downstream) {
        const handleId = edge.sourceHandle || "";
        if (handleId === branch) {
          // This branch is taken
          queue.push({ nodeId: edge.target, input: output });
        } else {
          // This branch is NOT taken - skip all downstream
          skippedNodes.add(edge.target);
          // Recursively mark downstream of skipped nodes
          const skipQueue = [edge.target];
          while (skipQueue.length > 0) {
            const skipId = skipQueue.shift()!;
            skippedNodes.add(skipId);
            const skipDownstream = outEdges.get(skipId) || [];
            for (const se of skipDownstream) {
              if (!skippedNodes.has(se.target)) {
                skipQueue.push(se.target);
              }
            }
          }
        }
      }
    } else {
      // Normal nodes: follow all downstream edges
      for (const edge of downstream) {
        queue.push({ nodeId: edge.target, input: output });
      }
    }
  }

  // Extract final output message from the last executed node
  let finalOutput = "";
  const lastExec = executions[executions.length - 1];
  if (lastExec?.output) {
    const out = lastExec.output as Record<string, unknown>;
    finalOutput =
      (out.response as string) ||
      (out.message as string) ||
      (out.result as string) ||
      JSON.stringify(out, null, 2);
  }

  return {
    success: true,
    executions,
    finalOutput,
    totalDuration: Date.now() - startTime,
  };
}

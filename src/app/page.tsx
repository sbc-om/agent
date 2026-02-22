"use client";

import dynamic from "next/dynamic";
import Toolbar from "@/components/toolbar/Toolbar";
import Sidebar from "@/components/sidebar/Sidebar";
import ConfigPanel from "@/components/panels/ConfigPanel";
import ChatBox from "@/components/chat/ChatBox";
import ChatTrigger from "@/components/chat/ChatTrigger";

const Canvas = dynamic(() => import("@/components/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading canvas...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Canvas />
        <ConfigPanel />
      </div>
      <ChatBox />
      <ChatTrigger />
    </div>
  );
}

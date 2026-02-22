"use client";

import { useChatStore } from "@/store/chat-store";
import { getIcon } from "@/lib/icons";

export default function ChatTrigger() {
  const { isOpen, toggleChat } = useChatStore();
  const MessageIcon = getIcon("MessageCircle");

  if (isOpen) return null;

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-xl hover:from-orange-600 hover:to-red-600 transition-all hover:scale-105 hover:shadow-2xl group"
    >
      <MessageIcon size={18} className="group-hover:animate-bounce" />
      <span className="font-semibold text-sm">Chat</span>
    </button>
  );
}

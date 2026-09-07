import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../interfaces/chat";

interface MessagesProps {
  messages: ChatMessage[];
  currentSocketId?: string;
}

export default function Messages({ messages, currentSocketId }: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="w-full flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent text-xs"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-white/30 text-[11px] italic">
          No hay mensajes en este canal
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderId === currentSocketId;
          const isSystem = msg.channel === "system";
          const isTeam = msg.channel === "team";

          const teamColor =
            msg.senderTeam === "red"
              ? "text-red-400"
              : msg.senderTeam === "blue"
              ? "text-blue-400"
              : "text-slate-300";

          const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] leading-relaxed"
              >
                <span className="font-bold mr-1">⚓ [SISTEMA]:</span>
                <span>{msg.message}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col px-2 py-1 rounded-lg backdrop-blur-sm transition-colors ${
                isMe
                  ? "bg-slate-800/40 border border-slate-700/40"
                  : "bg-slate-900/30 border border-slate-800/20"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] leading-none mb-0.5">
                <span className="text-slate-500 font-mono">{timeStr}</span>
                {isTeam ? (
                  <span className="px-1 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold uppercase tracking-wider text-[9px]">
                    EQUIPO
                  </span>
                ) : (
                  <span className="px-1 py-0.2 rounded bg-slate-700/30 border border-slate-600/30 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    TODOS
                  </span>
                )}
                <span className={`font-bold ${teamColor}`}>
                  {msg.senderName}
                  {isMe && <span className="text-amber-400 ml-1 text-[9px]">(Tú)</span>}
                </span>
              </div>
              <p className="text-slate-100 text-xs break-words pl-1 leading-snug">
                {msg.message}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}

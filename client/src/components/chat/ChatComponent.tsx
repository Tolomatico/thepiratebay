import { useState, useEffect, useRef } from "react";
import { useNetwork } from "../../context/NetworkContext";
import { useUser } from "../../context/UserContext";
import type { ChatMessage } from "../../interfaces/chat";
import Messages from "./Messages";
import TextInput from "./TextInput";

export default function ChatComponent() {
  const network = useNetwork();
  const { username } = useUser();
  const [channel, setChannel] = useState<"all" | "team">("all");
  const [isMinimized, setIsMinimized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "sys-init",
      senderId: "system",
      senderName: "Sistema",
      message: `¡Bienvenido al combate, ${username || "Capitán"}! Pulsa ENTER para escribir en el chat.`,
      channel: "system",
      timestamp: Date.now(),
    },
  ]);

  // Escuchar mensajes entrantes desde el servidor
  useEffect(() => {
    const handleIncomingMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), msg]);
    };

    network.onChatMessage(handleIncomingMessage);
    return () => {
      network.offChatMessage(handleIncomingMessage);
    };
  }, [network]);

  // Manejo de la tecla ENTER global para enfocar el chat si no hay otro input activo
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
          return;
        }
        e.preventDefault();
        setIsMinimized(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleSendMessage = (text: string) => {
    network.sendChatMessage(text, channel);
  };

  const handleToggleChannel = () => {
    setChannel((prev) => (prev === "all" ? "team" : "all"));
  };

  // Filtrado de mensajes visibles según el canal seleccionado (o mostrar todos con su etiqueta)
  const visibleMessages = messages.filter((m) => {
    if (m.channel === "system") return true;
    if (channel === "team") return m.channel === "team";
    return true; // en 'all' se muestran todos los mensajes recibidos
  });

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto ${
        isMinimized
          ? "w-[200px] h-[36px] bg-slate-950/40 opacity-70 hover:opacity-100"
          : "w-[300px] h-[220px] sm:w-[360px] sm:h-[260px] opacity-85 hover:opacity-100"
      }`}
    >
      {/* Header con tabs de canal y botón minimizar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-slate-900/60 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <span>💬</span>
            <span className="uppercase tracking-wider">Chat</span>
          </span>

          {!isMinimized && (
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={() => setChannel("all")}
                className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase transition-colors cursor-pointer ${
                  channel === "all"
                    ? "bg-blue-500/30 text-blue-200 border border-blue-400/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setChannel("team")}
                className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase transition-colors cursor-pointer ${
                  channel === "team"
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Equipo
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMinimized((prev) => !prev)}
          className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-all cursor-pointer"
          title={isMinimized ? "Expandir chat" : "Minimizar chat"}
        >
          {isMinimized ? "▲" : "▼"}
        </button>
      </div>

      {/* Cuerpo del chat */}
      {!isMinimized && (
        <>
          <Messages
            messages={visibleMessages}
            currentSocketId={network.socket?.id}
          />
          <div className="p-2 border-t border-white/5 bg-black/20">
            <TextInput
              channel={channel}
              onToggleChannel={handleToggleChannel}
              onSendMessage={handleSendMessage}
              inputRef={inputRef}
            />
          </div>
        </>
      )}
    </div>
  );
}

import { useState, type KeyboardEvent, type RefObject } from "react";

interface TextInputProps {
  channel: "all" | "team";
  onToggleChannel: () => void;
  onSendMessage: (text: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function TextInput({
  channel,
  onToggleChannel,
  onSendMessage,
  inputRef,
}: TextInputProps) {
  const [message, setMessage] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Si presiona Tab dentro del input, alterna canal sin perder el foco
    if (e.key === "Tab") {
      e.preventDefault();
      onToggleChannel();
      return;
    }

    // Si presiona Enter, envía el mensaje
    if (e.key === "Enter") {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage("");
      }
      inputRef?.current?.blur();
      return;
    }

    // Si presiona Escape, desenfoca el input
    if (e.key === "Escape") {
      e.preventDefault();
      inputRef?.current?.blur();
    }
  };

  return (
    <div className="flex items-center gap-1.5 w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 shadow-inner focus-within:border-amber-500/60 transition-colors">
      {/* Botón de alternar canal */}
      <button
        type="button"
        onClick={onToggleChannel}
        title="Clic o pulsa TAB para cambiar de canal (Todos / Equipo)"
        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
          channel === "team"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            : "bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30"
        }`}
      >
        {channel === "team" ? "EQUIPO" : "TODOS"}
      </button>

      {/* Input de texto */}
      <input
        ref={inputRef}
        type="text"
        maxLength={150}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          channel === "team"
            ? "Mensaje al equipo... (Enter para enviar)"
            : "Mensaje a todos... (Enter para enviar)"
        }
        className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-xs px-2 py-1 outline-none font-sans"
      />

      {/* Botón enviar */}
      {message.trim() && (
        <button
          type="button"
          onClick={() => {
            if (message.trim()) {
              onSendMessage(message);
              setMessage("");
              inputRef?.current?.blur();
            }
          }}
          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          ➤
        </button>
      )}
    </div>
  );
}

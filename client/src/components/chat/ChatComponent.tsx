import Messages from "./Messages";
import TextInput from "./TextInput";

export default function ChatComponent() {
    return (
        <div className="group flex flex-col w-[300px] h-[220px] sm:w-[360px] sm:h-[260px] rounded-2xl overflow-hidden border border-white/10 bg-black/25 backdrop-blur-md shadow-2xl transition-colors duration-300 hover:bg-black/35">
            <div className="px-4 pt-3 pb-2 border-b border-white/10">
                <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">
                    Chat
                </span>
            </div>
            <Messages />
            <div className="p-2">
                <TextInput />
            </div>
        </div>
    )
}

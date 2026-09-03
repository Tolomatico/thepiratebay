import { useState } from "react"

export default function Messages() {
    const [messages] = useState<string[]>([])
    return (
        <div className="w-full h-full overflow-y-auto px-3 py-2">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-white/30 text-xs">No hay mensajes</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {messages.map((message, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                            <p className="text-white/80 text-sm">{message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


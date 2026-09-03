import { useState } from "react"

export default function TextInput() {

  const [message, setMessage] = useState("")
  return (
    <input
      className="w-full px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/90 placeholder:text-white/30 outline-none focus:bg-white/10 focus:border-white/20 transition-colors"
      placeholder="Escribe un mensaje..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={() => { }}
    />
  )
}

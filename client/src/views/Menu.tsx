import { useState } from "react"


interface MenuProps {
  onPlay: ( username:string) => void
}
export default function Menu({ onPlay }: MenuProps) {
  const [username, setUsername] = useState<string>("")
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="flex flex-col items-center gap-3 bg-gray-800 bg-opacity-90 border-2 border-gray-700 rounded-md shadow-lg p-10">
        <h1 className="text-6xl text-gray-100 uppercase tracking-widest font-bold drop-shadow-md text-center">Battleship</h1>
        <label htmlFor="username">Nombre</label>
        <input
        id="username"
        name="username"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
         type="text" 
         placeholder="Ingresa tu nombre"
          className="px-4 py-2 bg-gray-700 text-gray-100 border-2 border-gray-700 rounded-sm focus:outline-none focus:border-green-700" />
      { username.trim().length > 0 &&  <button
          onClick={() => onPlay(username)}
          className="w-48  px-16 py-5 bg-green-700 hover:bg-green-800 text-gray-100 font-bold uppercase tracking-wider text-xl rounded-sm border-2 border-green-900 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        >
          Play
        </button>}
      </div>
    </div>
  )
}

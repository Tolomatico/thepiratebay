import { useState } from "react";

interface GuestFormProps {
  initialName?: string;
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

const PIRATE_TITLES = [
  "Capitán Drake",
  "Barbanegra",
  "Anne Bonny",
  "Corsario Morgan",
  "Barba de Plata",
  "Calicó Jack",
  "Capitán Flint",
  "Lobo de Mar",
  "Viento Negro",
  "Krakenslayer",
  "Sirena Letal",
  "Jack Sparrow",
];

export default function GuestForm({
  initialName = "",
  onSubmit,
  isLoading = false,
}: GuestFormProps) {
  const [guestName, setGuestName] = useState<string>(() => {
    return initialName || localStorage.getItem("pirate_username") || "";
  });

  const getRandomPirateName = () => {
    const randomName = PIRATE_TITLES[Math.floor(Math.random() * PIRATE_TITLES.length)];
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    return `${randomName}_${randomSuffix}`;
  };

  const handleRandomize = () => {
    setGuestName(getRandomPirateName());
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = guestName.trim() || getRandomPirateName();
    onSubmit(finalName);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-0.5">
          <label
            htmlFor="guest-alias"
            className="text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            Alias de Capitán
          </label>
          <button
            type="button"
            onClick={handleRandomize}
            disabled={isLoading}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <span>🎲</span>
            <span className="underline underline-offset-2">Nombre Aleatorio</span>
          </button>
        </div>

        <div className="relative">
          <input
            id="guest-alias"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ej. Capitán_Barbanegra"
            maxLength={24}
            disabled={isLoading}
            className="w-full px-4 py-3.5 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base transition-all placeholder:text-slate-600 disabled:opacity-60"
          />
          {guestName && !isLoading && (
            <button
              type="button"
              onClick={() => setGuestName("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm px-1 py-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold uppercase tracking-wider text-sm sm:text-base rounded-xl cursor-pointer shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>⚔️</span>
        <span>{isLoading ? "Zarpando..." : "Zarpar a la Batalla"}</span>
      </button>

      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
        <span className="text-amber-400 text-base leading-none mt-0.5">💡</span>
        <span>
          El modo invitado te permite jugar al instante sin registro. Podrás vincular tu
          cuenta luego para guardar tu oro, nivel y estadísticas.
        </span>
      </div>
    </form>
  );
}

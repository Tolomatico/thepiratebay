import { useState, useMemo } from "react";
import {
  UPGRADE_CATEGORIES,
  INITIAL_UPGRADES,
  type ShipUpgrade,
  type UpgradeCategory,
} from "./upgradesData";
import { useUser } from "../../context/UserContext";

interface ShipUpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShipUpgradesModal({ isOpen, onClose }: ShipUpgradesModalProps) {
  const { level, shipType, setShipType } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<UpgradeCategory["id"]>("casco");
  const [upgrades, setUpgrades] = useState<ShipUpgrade[]>(INITIAL_UPGRADES);
  const [upgradePoints, setUpgradePoints] = useState<number>(() => {
    // Puntos basados en el nivel del jugador (ej. nivel * 2)
    return Math.max(2, level * 2);
  });
  const [activeShipTab, setActiveShipTab] = useState<string>(shipType || "pirate");
  const [recentlyUpgradedId, setRecentlyUpgradedId] = useState<string | null>(null);

  // Filtrar mejoras por la categoría seleccionada
  const filteredUpgrades = useMemo(() => {
    return upgrades.filter((u) => u.category === selectedCategory);
  }, [upgrades, selectedCategory]);

  // Estadísticas acumuladas calculadas
  const computedStats = useMemo(() => {
    let extraHp = 0;
    let extraDamage = 0;
    let reloadReduction = 0;
    let extraSpeedPercent = 0;

    for (const u of upgrades) {
      if (u.id === "casco_roble") extraHp += u.currentRank * 40;
      if (u.id === "art_calibre") extraDamage += u.currentRank * 12;
      if (u.id === "art_recarga") reloadReduction += u.currentRank * 0.2;
      if (u.id === "vela_lino") extraSpeedPercent += u.currentRank * 5;
    }

    const baseHp = activeShipTab === "fragate" ? 800 : 600;
    const baseDamage = 50;
    const baseReload = 2.5;

    return {
      hp: baseHp + extraHp,
      baseHp,
      extraHp,
      damage: baseDamage + extraDamage,
      baseDamage,
      extraDamage,
      reloadTime: Math.max(1.0, baseReload - reloadReduction).toFixed(1),
      extraSpeedPercent,
    };
  }, [upgrades, activeShipTab]);

  if (!isOpen) return null;

  const handleUpgrade = (item: ShipUpgrade) => {
    if (upgradePoints < item.costPoints) return;
    if (item.currentRank >= item.maxRank) return;
    if (level < item.minLevel) return;

    setUpgradePoints((prev) => prev - item.costPoints);
    setUpgrades((prev) =>
      prev.map((u) => {
        if (u.id !== item.id) return u;
        const newRank = u.currentRank + 1;
        return {
          ...u,
          currentRank: newRank,
          currentEffect: `Rango ${newRank}: +${newRank * 20}% Eficiencia`,
        };
      })
    );

    setRecentlyUpgradedId(item.id);
    setTimeout(() => setRecentlyUpgradedId(null), 1200);
  };

  const handleResetBuild = () => {
    setUpgrades(INITIAL_UPGRADES);
    setUpgradePoints(Math.max(3, level * 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans select-none overflow-hidden">
      {/* Luces de ambiente */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Contenedor Modal */}
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/95 via-[#0a1324]/95 to-[#060c17]/98 shadow-2xl shadow-black/90 backdrop-blur-2xl overflow-hidden">
        
        {/* Cabecera Superior */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-pirate text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-cyan-200 to-blue-200 tracking-wider">
                  Astillero Real & Mejoras de Navío
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                  Árbol de Talentos
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Forja piezas de artillería, refuerza el roble del casco y desbloquea ventajas marítimas según tu nivel de Capitán.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Medalla de Nivel */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-amber-400 text-sm">⭐</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase text-slate-400 font-bold leading-none">Rango</span>
                <span className="text-xs font-black text-amber-200 leading-none mt-0.5">Nivel {level}</span>
              </div>
            </div>

            {/* Puntos Disponibles */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <span className="text-cyan-400 text-sm animate-pulse">🔹</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase text-cyan-300/80 font-bold leading-none">Puntos de Astillero</span>
                <span className="text-xs font-black text-cyan-200 leading-none mt-0.5">{upgradePoints} Disponibles</span>
              </div>
            </div>

            {/* Botón Reset */}
            <button
              onClick={handleResetBuild}
              className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              title="Restablecer puntos gastados"
            >
              🔄 Reset
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 flex items-center justify-center text-slate-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Panel de Resumen del Barco Seleccionado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-6 py-3.5 bg-slate-950/40 border-b border-slate-800/60">
          {/* Selector de Casco Activo */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
              Navío en Astillero
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setActiveShipTab("pirate");
                  setShipType("pirate");
                }}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeShipTab === "pirate"
                    ? "bg-amber-500/20 border border-amber-500/50 text-amber-200 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ⛵ Balandra
              </button>
              <button
                onClick={() => {
                  setActiveShipTab("fragate");
                  setShipType("fragate");
                }}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeShipTab === "fragate"
                    ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🚢 Fragata
              </button>
            </div>
          </div>

          {/* Stat 1: Blindaje / HP */}
          <div className="flex flex-col justify-center px-4 py-2 bg-slate-900/40 rounded-xl border border-slate-800/70">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <span>❤️</span> Blindaje de Casco
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                {computedStats.hp} HP {computedStats.extraHp > 0 && `(+${computedStats.extraHp})`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (computedStats.hp / 1000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Stat 2: Potencia de Fuego */}
          <div className="flex flex-col justify-center px-4 py-2 bg-slate-900/40 rounded-xl border border-slate-800/70">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <span>💥</span> Salva de Cañón
              </span>
              <span className="text-amber-300 font-bold font-mono">
                {computedStats.damage} Daño {computedStats.extraDamage > 0 && `(+${computedStats.extraDamage})`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (computedStats.damage / 90) * 100)}%` }}
              />
            </div>
          </div>

          {/* Stat 3: Recarga y Agilidad */}
          <div className="flex flex-col justify-center px-4 py-2 bg-slate-900/40 rounded-xl border border-slate-800/70">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <span>⏱️</span> Recarga & Nudos
              </span>
              <span className="text-cyan-300 font-bold font-mono">
                {computedStats.reloadTime}s {computedStats.extraSpeedPercent > 0 && `(+${computedStats.extraSpeedPercent}% vel)`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (2.5 / Number(computedStats.reloadTime)) * 65)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Barra de Pestañas de Categoría */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 overflow-x-auto border-b border-slate-800/40 bg-slate-950/20">
          {UPGRADE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const countInCat = upgrades.filter((u) => u.category === cat.id).length;
            const spentInCat = upgrades
              .filter((u) => u.category === cat.id)
              .reduce((acc, curr) => acc + curr.currentRank, 0);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-indigo-600/30 border border-cyan-500/50 text-cyan-200 shadow-lg shadow-cyan-950/50"
                    : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                    isSelected ? "bg-cyan-500/30 text-cyan-200" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {spentInCat}/{countInCat * 4}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cuadrícula Scrolleable de Mejoras */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUpgrades.map((item) => {
              const isLockedByLevel = level < item.minLevel;
              const isMaxRank = item.currentRank >= item.maxRank;
              const canAfford = upgradePoints >= item.costPoints && !isLockedByLevel && !isMaxRank;
              const isRecentlyUpgraded = recentlyUpgradedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
                    isRecentlyUpgraded
                      ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-[1.01]"
                      : isLockedByLevel
                      ? "border-slate-800/80 bg-slate-950/40 opacity-60"
                      : item.currentRank > 0
                      ? "border-slate-700/80 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/80 shadow-md"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/50"
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                            isLockedByLevel
                              ? "bg-slate-900 border-slate-800 text-slate-600"
                              : item.currentRank > 0
                              ? "bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                              : "bg-slate-900 border-slate-700 text-slate-300"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-100">{item.name}</h3>
                          </div>
                          <p className="text-[11px] font-mono text-cyan-300/90 font-semibold mt-0.5">
                            {item.statBonus}
                          </p>
                        </div>
                      </div>

                      {/* Insignia de Nivel Requerido */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border whitespace-nowrap ${
                          isLockedByLevel
                            ? "bg-red-950/40 text-red-400 border-red-800/50"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {isLockedByLevel ? `🔒 Nv. ${item.minLevel}` : item.badge}
                      </span>
                    </div>

                    {/* Descripción y Lore Pirata */}
                    <p className="text-xs text-slate-300/90 font-normal leading-relaxed mb-2">
                      {item.description}
                    </p>
                    <p className="text-[11px] italic text-slate-400/80 mb-4 border-l-2 border-slate-700/60 pl-2">
                      {item.flavorQuote}
                    </p>
                  </div>

                  {/* Pie de Tarjeta: Pips de Rango y Botón de Acción */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-3">
                    {/* Efecto Actual vs Siguiente */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Estado:{" "}
                        <strong className={item.currentRank > 0 ? "text-cyan-300" : "text-slate-400"}>
                          {item.currentEffect}
                        </strong>
                      </span>
                      {!isMaxRank && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span>Siguiente:</span>
                          <span className="truncate max-w-[150px]">{item.nextEffect}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {/* Pips de Rango (Estrellas / Puntos) */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: item.maxRank }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                              idx < item.currentRank
                                ? "bg-gradient-to-tr from-cyan-400 to-blue-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                : "bg-slate-800 border border-slate-700"
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-mono text-slate-400 ml-1.5">
                          {item.currentRank}/{item.maxRank}
                        </span>
                      </div>

                      {/* Botón de Mejora */}
                      <button
                        disabled={!canAfford}
                        onClick={() => handleUpgrade(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          isMaxRank
                            ? "bg-slate-800/50 text-slate-400 border border-slate-700/50 cursor-not-allowed"
                            : isLockedByLevel
                            ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                            : canAfford
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 transform hover:scale-105 active:scale-95"
                            : "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-70"
                        }`}
                      >
                        {isMaxRank
                          ? "✓ Rango Máximo"
                          : isLockedByLevel
                          ? `Bloqueado (Nv. ${item.minLevel})`
                          : `Mejorar (${item.costPoints} ${item.costPoints === 1 ? "Pto" : "Ptos"})`}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de Estado Inferior */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💡</span>
            <span>
              Las mejoras se aplican automáticamente a tus partidas. Puedes restablecer tus puntos en cualquier momento.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Aceptar & Zarpar
          </button>
        </div>
      </div>
    </div>
  );
}

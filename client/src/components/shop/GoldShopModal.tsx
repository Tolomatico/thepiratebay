import { useState, useMemo } from "react";
import {
  SHOP_CATEGORIES,
  INITIAL_SHOP_ITEMS,
  RARITY_STYLES,
  type ShopItem,
  type ShopCategory,
} from "./shopData";
import { useUser } from "../../context/UserContext";

interface GoldShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoldShopModal({ isOpen, onClose }: GoldShopModalProps) {
  const { gold, setGold } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory["id"]>("navios");
  const [items] = useState<ShopItem[]>(INITIAL_SHOP_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("todas");
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(() => {
    return new Set<string>(["ship_shadow_sloop"]);
  });
  const [equippedIds, setEquippedIds] = useState<Set<string>>(() => {
    return new Set<string>(["ship_shadow_sloop"]);
  });
  const [purchaseSuccessItem, setPurchaseSuccessItem] = useState<ShopItem | null>(null);

  // Filtrado de items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRarity = selectedRarity === "todas" || item.rarity === selectedRarity;
      return matchCat && matchSearch && matchRarity;
    });
  }, [items, selectedCategory, searchQuery, selectedRarity]);

  if (!isOpen) return null;

  const handleBuy = (item: ShopItem) => {
    if (gold < item.price) return;

    setGold(gold - item.price);
    setPurchasedIds((prev) => new Set(prev).add(item.id));
    setPurchaseSuccessItem(item);
    setTimeout(() => setPurchaseSuccessItem(null), 2000);
  };

  const handleEquip = (itemId: string) => {
    setEquippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddTestGold = () => {
    setGold(gold + 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans select-none overflow-hidden">
      {/* Luces de ambiente dorado y místico */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Contenedor Modal */}
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900/98 via-[#0e111a]/95 to-[#080a10]/98 shadow-2xl shadow-black/90 backdrop-blur-2xl overflow-hidden">
        
        {/* Cabecera Superior */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900/40 to-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-600/30 border border-amber-500/40 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              🪙
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-pirate text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 tracking-wider">
                  Mercado Negro & Bazar del Corsario
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/60 shadow-sm">
                  Tienda de Oro
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Gasta tus doblones obtenidos en combate en naves exclusivas, municiones alquímicas y cosméticos legendarios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Saldo de Oro */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/50 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="text-xl animate-bounce">🪙</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase text-amber-300/80 font-bold leading-none">Doblones Disponibles</span>
                <span className="text-sm font-black text-amber-200 leading-none mt-1 font-mono">
                  {gold.toLocaleString()} <span className="text-amber-400 font-sans text-xs">Oro</span>
                </span>
              </div>
            </div>

            {/* Botón de Pruebas: +500 Oro */}
            <button
              onClick={handleAddTestGold}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-100 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Añadir 500 de oro para probar compras"
            >
              <span>➕</span>
              <span>+500 Oro (Test)</span>
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

        {/* Notificación Flotante de Compra */}
        {purchaseSuccessItem && (
          <div className="bg-emerald-950/90 border-y border-emerald-500/50 px-6 py-2.5 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 animate-pulse">
            <span>🎉</span>
            <span>¡Has adquirido "{purchaseSuccessItem.name}" por {purchaseSuccessItem.price} de Oro!</span>
          </div>
        )}

        {/* Barra de Filtros y Categorías */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-slate-800/60 bg-slate-950/40">
          {/* Pestañas de Categoría */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {SHOP_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const countInCat = items.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-700/30 border border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/40"
                      : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                      isSelected ? "bg-amber-500/30 text-amber-200" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {countInCat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtros Secundarios: Búsqueda y Rareza */}
          <div className="flex items-center gap-2.5">
            {/* Buscador */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar artículo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-48 px-3 py-1.5 pl-8 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-all"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">🔍</span>
            </div>

            {/* Filtro de Rareza */}
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 transition-all"
            >
              <option value="todas">Todas las Rarezas</option>
              <option value="comun">Común</option>
              <option value="raro">Raro</option>
              <option value="epico">Épico</option>
              <option value="legendario">Legendario</option>
            </select>
          </div>
        </div>

        {/* Cuadrícula Scrolleable de Artículos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <span className="text-4xl mb-2">⚓</span>
              <p className="text-sm font-semibold">No se encontraron artículos en esta categoría con los filtros actuales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const rarityStyle = RARITY_STYLES[item.rarity];
                const isPurchased = purchasedIds.has(item.id);
                const isEquipped = equippedIds.has(item.id);
                const canAfford = gold >= item.price;

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md ${rarityStyle.border} ${rarityStyle.bg} ${rarityStyle.glow} hover:scale-[1.01] hover:border-amber-400/60`}
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner">
                            {item.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-slate-100">{item.name}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full border ${rarityStyle.badge}`}>
                                {rarityStyle.label}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descripción y Lore Pirata */}
                      <p className="text-xs text-slate-300/90 font-normal leading-relaxed mb-2.5">
                        {item.description}
                      </p>
                      <p className="text-[11px] italic text-slate-400/80 mb-3 border-l-2 border-amber-500/30 pl-2">
                        {item.lore}
                      </p>

                      {/* Lista de Perks / Ventajas */}
                      <div className="space-y-1 mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                        {item.perks.map((perk, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                            <span className="text-emerald-400 text-xs">✓</span>
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pie de Tarjeta: Precio y Botón de Compra */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      {/* Precio en Oro */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🪙</span>
                        <span className="font-mono text-sm font-black text-amber-300">
                          {item.price.toLocaleString()} <span className="text-xs font-sans text-amber-400/80">Oro</span>
                        </span>
                      </div>

                      {/* Botón de Acción */}
                      {isPurchased ? (
                        <button
                          onClick={() => handleEquip(item.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            isEquipped
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          }`}
                        >
                          {isEquipped ? "✓ Equipado" : "Equipar"}
                        </button>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => handleBuy(item)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            canAfford
                              ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 transform hover:scale-105 active:scale-95"
                              : "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-70"
                          }`}
                        >
                          {canAfford ? "Comprar" : `Falta ${item.price - gold} Oro`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Barra Inferior */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💰</span>
            <span>
              Gana más oro hundiendo barcos enemigos y logrando victorias en las partidas multijugador.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Volver a Navegar
          </button>
        </div>
      </div>
    </div>
  );
}

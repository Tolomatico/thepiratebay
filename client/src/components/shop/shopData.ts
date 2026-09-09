export interface ShopItem {
  id: string;
  name: string;
  category: "navios" | "velas" | "municion" | "consumibles";
  rarity: "comun" | "raro" | "epico" | "legendario";
  price: number;
  icon: string;
  badge?: string;
  description: string;
  perks: string[];
  stock?: string;
  lore: string;
}

export interface ShopCategory {
  id: "navios" | "velas" | "municion" | "consumibles";
  name: string;
  icon: string;
  description: string;
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "navios",
    name: "Astillero & Barcos",
    icon: "🚢",
    description: "Cascos navales legendarios con propiedades únicas de peso, salud y capacidad de fuego.",
  },
  {
    id: "velas",
    name: "Velas & Cosméticos",
    icon: "🎨",
    description: "Personaliza el aspecto de tu barco para sembrar el pavor entre las flotas rivales.",
  },
  {
    id: "municion",
    name: "Munición Especial",
    icon: "💣",
    description: "Bolas de cañón alquímicas, metralla incendiaria y proyectiles de efectos místicos.",
  },
  {
    id: "consumibles",
    name: "Consumibles & Ron",
    icon: "🧪",
    description: "Suministros de un solo uso para reparar en combate, ocultarse o duplicar recompensas.",
  },
];

export const RARITY_STYLES = {
  comun: {
    label: "Común",
    border: "border-slate-700",
    bg: "bg-slate-800/40",
    badge: "bg-slate-800 text-slate-300 border-slate-700",
    glow: "",
  },
  raro: {
    label: "Raro",
    border: "border-blue-500/50",
    bg: "bg-blue-950/20",
    badge: "bg-blue-950 text-blue-300 border-blue-700/60",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
  },
  epico: {
    label: "Épico",
    border: "border-purple-500/50",
    bg: "bg-purple-950/25",
    badge: "bg-purple-950 text-purple-300 border-purple-700/60",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
  },
  legendario: {
    label: "Legendario",
    border: "border-amber-500/60",
    bg: "bg-amber-950/25",
    badge: "bg-amber-950 text-amber-300 border-amber-500/60",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
  },
};

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // Navíos
  {
    id: "ship_shadow_sloop",
    name: "Balandra 'Sombra de Mar'",
    category: "navios",
    rarity: "raro",
    price: 350,
    icon: "⛵",
    badge: "Velocista",
    description: "Casco ligero de cedro negro con velamen optimizado para giros cerrados y escape táctico.",
    perks: ["+15% Velocidad de viraje", "-10% Radio de detección", "600 HP base"],
    lore: "«Nadie la ve llegar hasta que sus cañones ya cantan en la niebla.»",
  },
  {
    id: "ship_vengeance_frigate",
    name: "Fragata Corsaria 'La Venganza'",
    category: "navios",
    rarity: "epico",
    price: 800,
    icon: "🚢",
    badge: "Equilibrado",
    description: "El terror de las rutas comerciales. Dos cubiertas completas con cañones gemelos de bronce.",
    perks: ["800 HP blindado", "+10 Daño por salva", "Batería doble de costado"],
    lore: "«Construida con los restos de tres galeones apresados en Port Royal.»",
  },
  {
    id: "ship_san_telmo",
    name: "Bergantín de Tres Palos 'San Telmo'",
    category: "navios",
    rarity: "epico",
    price: 1200,
    icon: "⚓",
    badge: "Navío de Línea",
    description: "Una obra maestra de carpintería naval que combina gran velocidad punta con sólida resistencia.",
    perks: ["750 HP base", "+20% Velocidad con viento en popa", "-0.3s Recarga"],
    lore: "«Bendecido por los vientos alisios y temido por los gobernadores.»",
  },
  {
    id: "ship_el_dorado",
    name: "Galeón Acorazado 'El Dorado'",
    category: "navios",
    rarity: "legendario",
    price: 2000,
    icon: "👑",
    badge: "Fortaleza Flotante",
    description: "Forrado con láminas de oro y hierro fundido. Una fortaleza marítima casi indestructible.",
    perks: ["1,100 HP acorazado", "+20 Daño directo", "-15% Daño por embestida"],
    lore: "«Hunde las aguas con su solo peso y sus bodegas nunca están vacías.»",
  },
  {
    id: "ship_flying_dutchman",
    name: "Navío Espectral 'Holandés Menor'",
    category: "navios",
    rarity: "legendario",
    price: 3500,
    icon: "👻",
    badge: "Maldición Eterna",
    description: "Emerge de las profundidades con velamen rasgado y una estela verde fosforescente.",
    perks: ["Regenera 5 HP/s pasivamente", "Efecto de bruma fantasmagórica", "Proyectiles ectoplásmicos"],
    lore: "«El mar no lo quiere, y la muerte tampoco se atreve a reclamarlo.»",
  },

  // Velas & Cosméticos
  {
    id: "sail_skull",
    name: "Velas de Calavera Sangrienta",
    category: "velas",
    rarity: "raro",
    price: 250,
    icon: "💀",
    description: "Lienzo teñido en rojo carmesí con el blasón de la Jolly Roger estampado a mano.",
    perks: ["Cosmético distintivo", "Estela roja al navegar"],
    lore: "«La señal universal de que no se tomarán prisioneros.»",
  },
  {
    id: "sail_royal_gold",
    name: "Velas de Terciopelo Real & Oro",
    category: "velas",
    rarity: "epico",
    price: 450,
    icon: "⚜️",
    description: "Bordadas con hilo de oro puro para capitanes que celebran su incalculable botín.",
    perks: ["Brillo dorado al sol", "Insignia de nobleza pirata"],
    lore: "«Saquear a la corona y vestir sus propios colores con orgullo.»",
  },
  {
    id: "sail_abyss_green",
    name: "Velas Esmeralda de los Abismos",
    category: "velas",
    rarity: "epico",
    price: 500,
    icon: "🟢",
    description: "Brillan en la penumbra marina con luminiscencia de algas de fosa profunda.",
    perks: ["Luminiscencia nocturna", "Aura verde marina"],
    lore: "«Tejidas por los náufragos que desafiaron las profundidades.»",
  },
  {
    id: "sail_figurehead_mermaid",
    name: "Mascarón de Proa: Sirena Encantada",
    category: "velas",
    rarity: "raro",
    price: 300,
    icon: "🧜‍♀️",
    description: "Talla en madera sagrada que calma el oleaje e intimida a los capitanes supersticiosos.",
    perks: ["Detalle 3D en proa", "Efecto de agua en calma alrededor"],
    lore: "«Su canto conduce al tesoro o al fondo de las rocas.»",
  },

  // Munición Especial
  {
    id: "ammo_greek_fire",
    name: "Fuego Griego (Balas Incendiarias)",
    category: "municion",
    rarity: "raro",
    price: 180,
    icon: "🔥",
    badge: "20 Usos",
    description: "Bolas de cañón huecas rellenas de brea y nafta que prenden fuego continuo al barco enemigo.",
    perks: ["+15 Daño por segundo por 4s", "Provoca humo espeso en el objetivo"],
    lore: "«Ni toda el agua del océano puede apagar esta llama maldita.»",
  },
  {
    id: "ammo_chain_shot",
    name: "Salva Encadenada Rompe-Velas",
    category: "municion",
    rarity: "comun",
    price: 120,
    icon: "⛓️",
    badge: "15 Usos",
    description: "Eslabones dobles forjados para desgarrar mástiles y dejar al enemigo a la deriva.",
    perks: ["Ralentiza un 30% la velocidad enemiga", "Ideal para abordajes"],
    lore: "«Córtale las piernas a la bestia antes de sacarle los dientes.»",
  },
  {
    id: "ammo_golden_shot",
    name: "Balas Doradas de Doblón",
    category: "municion",
    rarity: "epico",
    price: 350,
    icon: "✨",
    badge: "25 Usos",
    description: "Proyectiles fundidos en oro que sueltan destellos deslumbrantes y tintineo de monedas al detonar.",
    perks: ["+10% Oro extra por cada impacto acertado", "Efecto de fuegos artificiales dorados"],
    lore: "«Disparar dinero para cosechar fortunas enteras.»",
  },
  {
    id: "ammo_kraken_void",
    name: "Balas del Vacío Abisal",
    category: "municion",
    rarity: "legendario",
    price: 600,
    icon: "🌌",
    badge: "10 Usos",
    description: "Imbuidas con magia del Kraken. Crean una micro-vorágine que atrae temporalmente al rival.",
    perks: ["+30 Daño explosivo de área", "Distorsiona la trayectoria enemiga"],
    lore: "«El eco de un rugido antiguo atrapado en plomo negro.»",
  },

  // Consumibles & Auxilio Náutico
  {
    id: "item_rum_repair",
    name: "Barril de Ron Viejo Capitán",
    category: "consumibles",
    rarity: "comun",
    price: 80,
    icon: "🍾",
    badge: "3 Cargas",
    description: "Trago reconstituyente para la tripulación. Repara al instante 200 puntos de salud en mitad del tiroteo.",
    perks: ["Restaura 200 HP de emergencia", "Uso con tecla rápida [1]"],
    lore: "«Un buen trago cura cualquier astilla en el costado.»",
  },
  {
    id: "item_smoke_bomb",
    name: "Bomba de Humo de Retirada",
    category: "consumibles",
    rarity: "raro",
    price: 110,
    icon: "💨",
    badge: "2 Cargas",
    description: "Crea una densa cortina de niebla artificial que impide el fijado de cañones durante 6 segundos.",
    perks: ["Oculta el barco en el minimapa", "Uso con tecla rápida [2]"],
    lore: "«El arte del corsario sabio: saber cuándo desvanecerse en el aire.»",
  },
  {
    id: "item_banner_fortune",
    name: "Estandarte del Corsario Afortunado",
    category: "consumibles",
    rarity: "epico",
    price: 250,
    icon: "🚩",
    badge: "1 Partida",
    description: "Ondea en el palo mayor bendiciendo a tu tripulación con el doble de recompensa en oro al finalizar.",
    perks: ["x2 Oro ganado en la siguiente partida", "Se consume al terminar el combate"],
    lore: "«La fortuna sonríe a los audaces que izan su bandera al viento.»",
  },
  {
    id: "item_wind_blessing",
    name: "Frasco de Viento de Tempestad",
    category: "consumibles",
    rarity: "raro",
    price: 150,
    icon: "🌪️",
    badge: "2 Cargas",
    description: "Viento comprimido en una botella alquímica que otorga un turbo del 40% de velocidad durante 5s.",
    perks: ["+40% Impulso instantáneo", "Permite esquivar salvas de cañón"],
    lore: "«Un vendaval en la palma de la mano listo para descorchar.»",
  },
];

import React from 'react';
import { SHIPS } from '../interfaces/player';
import type { ShipType } from '../interfaces/player';

interface ShipSelectorProps {
  selectedShip: ShipType;
  onSelect: (ship: ShipType) => void;
}

const ShipSelector: React.FC<ShipSelectorProps> = ({ selectedShip, onSelect }) => {
  const shipTypes: ShipType[] = ['pirate', 'fragate'];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl px-2 sm:px-4">
      <h2 className="text-lg sm:text-xl font-bold text-gray-200 uppercase tracking-wider text-center mb-2">
        Selecciona tu Barco
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {shipTypes.map((type) => {
          const ship = SHIPS[type];
          const isSelected = selectedShip === type;
          
          return (
            <div
              key={type}
              onClick={() => onSelect(type)}
              className={`relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer border-2 ${
                isSelected 
                  ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-gray-800/80 md:scale-105 z-10' 
                  : 'border-gray-700 bg-gray-800/40 hover:border-gray-500 hover:bg-gray-800/60'
              }`}
            >
              <div className="h-36 sm:h-48 overflow-hidden relative">
                <img 
                  src={`/ui/ships/${type}.png`} 
                  alt={type} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                  <h3 className="text-base sm:text-lg md:text-2xl font-black text-white uppercase italic tracking-tighter">
                    {type === 'pirate' ? '🏴‍☠️ El Temido Pirata' : '⚓ Man-o-War Inglés'}
                  </h3>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full uppercase">
                    Seleccionado
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400">
                      <span className="truncate">Resistencia (HP)</span>
                      <span className="text-gray-200">{ship.health}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${(ship.health / 800) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400">
                      <span className="truncate">Velocidad</span>
                      <span className="text-gray-200">{ship.speed * 1000} kts</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${(ship.speed / 0.06) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400">
                      <span className="truncate">Poder de Fuego</span>
                      <span className="text-gray-200">{ship.damage}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${(ship.damage / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed italic">
                  {type === 'pirate' 
                    ? "Rápido y ágil, ideal para maniobras rápidas y ataques relámpago. Menos blindado."
                    : "Un gigante de los mares. Lento pero capaz de resistir gran daño y golpear con fuerza."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipSelector;

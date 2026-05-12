import React from 'react';
import type { Team } from '../interfaces/player';

interface TeamSelectorProps {
  selectedTeam: Team;
  onSelect: (team: Team) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ selectedTeam, onSelect }) => {

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md px-2">
      <label className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] text-center">
        Elegir Bando
      </label>
      <div className="flex gap-2 sm:gap-4 w-full">
        <button
          onClick={() => onSelect('red')}
          className={`flex-1 py-3 px-3 sm:py-4 sm:px-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 font-bold uppercase tracking-wider text-xs sm:text-sm ${
            selectedTeam === 'red'
              ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
          }`}
        >
          <span className="text-lg sm:text-2xl">🔴</span>
          <span className="hidden sm:inline">Imperio Rojo</span>
        </button>
        <button
          onClick={() => onSelect('blue')}
          className={`flex-1 py-3 px-3 sm:py-4 sm:px-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 font-bold uppercase tracking-wider text-xs sm:text-sm ${
            selectedTeam === 'blue'
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
          }`}
        >
          <span className="text-lg sm:text-2xl">🔵</span>
          <span className="hidden sm:inline">Armada Azul</span>
        </button>
      </div>
    </div>
  );
};

export default TeamSelector;

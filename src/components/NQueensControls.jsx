import { Bluetooth, ArrowLeft } from 'lucide-react'; // Added ArrowLeft for the back icon
import React, { useState } from 'react';
import NQueensplay from './NQueensplay';

const NQueensControls = ({ gridSize, setGridSize, speed, setSpeed, onClear, onVisualize, isVisualizing }) => {
  const [playclick, SetPlayclick] = useState(false);

  if (playclick) {
    return (
      <div className="w-full max-w-5xl flex flex-col items-start gap-4 mb-8">
        <button 
          onClick={() => SetPlayclick(false)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e2e] text-cyan-400 border border-gray-700 hover:border-cyan-500/50 rounded-lg shadow-lg transition-all text-sm font-bold tracking-wider uppercase"
        >
          <ArrowLeft size={16} /> Back to Controls
        </button>
        
        <NQueensplay />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-[#1e1e2e] p-6 rounded-xl border border-gray-700 shadow-2xl mb-8 gap-6 w-full max-w-4xl">
      <div className="flex items-center gap-8 w-full md:w-auto">
        <div className="flex flex-col">
          <label className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Grid Size: {gridSize}x{gridSize}
          </label>
          <input 
            type="range" 
            min='4' 
            max='8' 
            value={gridSize} 
            onChange={(e) => { setGridSize(Number(e.target.value)) }} 
            disabled={isVisualizing} 
            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Speed: {speed}ms
          </label>
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={520 - speed}
            onChange={(e) => setSpeed(520 - Number(e.target.value))}
            disabled={isVisualizing}
            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      

      <div className="flex gap-4">
        <button
          onClick={onClear}
          disabled={isVisualizing}
          className="px-4 py-2 text-sm font-medium text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
        >
          Clear Board
        </button>

        <button
          onClick={onVisualize}
          disabled={isVisualizing}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-2 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          START RECURSION
        </button>
      </div>
    </div>
  );
};

export default NQueensControls;
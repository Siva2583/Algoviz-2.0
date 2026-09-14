import React from 'react';

const SearchControls = ({
  arraySize,
  setArraySize,
  speed,
  setSpeed,
  target,
  setTarget,
  onGenerateArray,
  onVisualize,
  isSearching
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between bg-[#1e1e2e] p-6 rounded-xl border border-gray-700 shadow-2xl mb-8 gap-6 w-full max-w-5xl">
      
      {/* Sliders */}
      <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto">
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Array Size: {arraySize}</label>
          <input
            type="range"
            min="10"
            max="50"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isSearching}
            className="w-full sm:w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Speed: {speed}ms</label>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={1550 - speed} 
            onChange={(e) => setSpeed(1550 - Number(e.target.value))}
            disabled={isSearching}
            className="w-full sm:w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {/* Target Input & Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto">
        <div className="flex flex-col">
          <label className="text-gray-400 text-[10px] font-bold mb-1 uppercase">Target Number</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            disabled={isSearching}
            className="w-24 px-3 py-2 bg-[#181825] text-white border border-gray-600 rounded-lg outline-none focus:border-cyan-400 text-center font-mono"
            placeholder="?"
          />
        </div>

        <button
          onClick={onGenerateArray}
          disabled={isSearching}
          className="px-4 py-2 text-sm font-medium text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
        >
          Reset Sorted
        </button>

        <button
          onClick={onVisualize}
          disabled={isSearching}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-2 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          SEARCH
        </button>
      </div>
    </div>
  );
};

export default SearchControls;
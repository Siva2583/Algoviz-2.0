import React from 'react';

const SortingControls = ({
  arraySize,
  setArraySize,
  onGenerateArray,
  selectedAlgo,
  setSelectedAlgo,
  onVisualize,
  isSorting,
  animationSpeed,
  setanimationSpeed,
  algoOptions = []
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-[#1A1A1A] p-4 rounded-lg border border-gray-700 shadow-lg mb-6 gap-4">
      
      {/* 1. Array Configuration */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <label className="text-gray-400 text-xs mb-1">Array Size: {arraySize}</label>
          <input
            type="range"
            min="10"
            max="100"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isSorting}
            className="w-32 accent-cyan-400 cursor-pointer"
          />
        </div>
        
        <button
          onClick={onGenerateArray}
          disabled={isSorting}
          className="text-cyan-400 border border-cyan-400 px-3 py-1 rounded text-sm hover:bg-cyan-400 hover:text-black transition disabled:opacity-50"
        >
          New Array
        </button>
      </div>
      <div>
        {/*Slider*/}
        <label>Speed:{animationSpeed}</label>
        <input type="range" min="1" max="100" value={animationSpeed} onChange={(e)=>{setanimationSpeed(Number(e.target.value))}} disabled={isSorting}></input>

      </div>

      {/* 2. Algorithm Selector & Visualize Button */}
      <div className="flex items-center gap-4">
        <select
          value={selectedAlgo}
          onChange={(e) => setSelectedAlgo(e.target.value)}
          disabled={isSorting}
          className="bg-black text-white border border-gray-600 rounded px-3 py-2 outline-none focus:border-cyan-400"
        >
          {algoOptions.map((algo) => (
            <option key={algo} value={algo}>{algo} Sort</option>
          ))}
        </select>

        <button
          onClick={onVisualize}
          disabled={isSorting}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold px-6 py-2 rounded shadow-[0_0_10px_rgba(0,234,255,0.4)] hover:shadow-[0_0_20px_rgba(0,234,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
        >
          VISUALIZE
        </button>
      </div>
    </div>
  );
};

export default SortingControls;
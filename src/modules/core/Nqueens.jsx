import ModuleFrame from '../../lab/ModuleFrame';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { nQueensAnimation } from './algorithm/sorting/algorithms/nQueens';
import NQueensplay from '../../components/NQueensplay';
import { nQueensData } from './tutorials/nqueensData';
import TutorialTab from './tutorials/TutorialTab';

const NQueens = () => {
  const [mainTab, setMainTab] = useState('visualize'); 
  const [playclick, setPlayclick] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [speed, setSpeed] = useState(600);
  const [board, setBoard] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const speedRef = useRef(600);
  const [currentAction, setCurrentAction] = useState('none');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [logs, setLogs] = useState(["Select size and start!"]);

  const resetBoard = useCallback(() => {
    const newBoard = Array(gridSize).fill().map(() => Array(gridSize).fill({
      hasQueen: false,
      status: 'default'
    }));
    setBoard(newBoard);
    setLogs(["Select size and start!"]);
    setCurrentAction('none');
  }, [gridSize]);

  useEffect(() => { resetBoard(); }, [resetBoard]);

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };
  
  const updateCell = (row, col, updates) => {
    setBoard(prev => {
      const newBoard = prev.map(r => r.slice());
      newBoard[row][col] = { ...newBoard[row][col], ...updates };
      return newBoard;
    });
  };

  const smartWait = async (ms) => {
    let timePassed = 0;
    const step = 20;
    
    while (timePassed < ms) {
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      await new Promise(resolve => setTimeout(resolve, step));
      timePassed += step;
    }
  };
  const handleSpeedChange = (e) => {
        const curspeed = Number(e.target.value);
        setSpeed(curspeed);
        speedRef.current = 2300 - curspeed;
    };

  const handleVisualize = async () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    resetBoard();
    setLogs(["Calculating..."]); 

    const animations = nQueensAnimation(gridSize);
    
    for (let i = 0; i < animations.length; i++) {
      const { type, row, col, conflictRow, conflictCol, conflictType } = animations[i];
      
      await smartWait(speedRef.current);

      if (type === 'inspect') {
        setCurrentAction('inspect');
        setLogs(prev => [...prev, `🔍 Inspecting [${row}, ${col}]...`]);
        updateCell(row, col, { status: 'inspect' });
        setTimeout(() => updateCell(row, col, { status: 'default' }), speedRef.current * 1.2);
        
      } 
      else if (type === 'conflict') {
        setCurrentAction('conflict');
        setLogs(prev => [...prev, `❌ ${conflictType} Conflict! Attacked by Queen at [${conflictRow}, ${conflictCol}]`]);
        updateCell(row, col, { status: 'conflict' });
        updateCell(conflictRow, conflictCol, { status: 'attacker' });
        
        setTimeout(() => {
          updateCell(row, col, { status: 'default' });
          updateCell(conflictRow, conflictCol, { status: 'safe' });
        }, speedRef.current * 0.8);
      } 
      else if (type === 'place') {
        setCurrentAction('place');
        setLogs(prev => [...prev, `✅ Placed Queen at [${row}, ${col}]`]);
        updateCell(row, col, { hasQueen: true, status: 'safe' });
      } 
      else if (type === 'remove') {
        setCurrentAction('remove');
        setLogs(prev => [...prev, `⏪ Backtracking from [${row}, ${col}]`]);
        updateCell(row, col, { hasQueen: false, status: 'default' });
      }
    }
    setLogs(prev => [...prev, `🎉 Solution Found for N=${gridSize}!`]);
    setIsVisualizing(false);
    setCurrentAction('none');
  };

  return (
    <ModuleFrame activeTab={mainTab} onTabChange={setMainTab} running={isVisualizing} paused={isPaused}>
            {mainTab === 'visualize' ? (
            <div className="flex flex-col w-full max-w-[1400px] items-center">
                <div className="av-module-toolbar flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-6 gap-4 shadow-lg w-full">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
                            <span className="text-gray-400 font-bold mr-2 text-sm">N =</span>
                            <input
                                type="number"
                                min="4"
                                max="8"
                                disabled={isVisualizing}
                                aria-label="Board size" value={gridSize}
                                onChange={(e) => setGridSize(Number(e.target.value))}
                                className="bg-transparent text-cyan-300 font-mono focus:outline-none w-10 font-bold text-center"
                            />
                        </div>

                        <button
                            onClick={() => setPlayclick(!playclick)}
                            disabled={isVisualizing}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 border ${
                                playclick
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30'
                            }`}
                        >
                            {playclick ? '🎯 Mode: Playground' : ' Mode: Visualizer'}
                        </button>

                        <button onClick={resetBoard} disabled={isVisualizing} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                            🔄 Reset
                        </button>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-center gap-2">
                        <div className="text-gray-400 font-bold tracking-widest text-sm uppercase">O(N!) Backtracking</div>
                        <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
                            <span className="text-[10px] text-gray-500 font-bold tracking-wider">SLOW</span>
                            <input type="range" step={50} min={300} max={2000} aria-label="Playback speed" value={speed} onChange={handleSpeedChange} className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"/>
                            <span className="text-[10px] text-cyan-500 font-bold tracking-wider">FAST</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePause}
                            disabled={!isVisualizing || playclick}
                            className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${(!isVisualizing || playclick) ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : isPaused ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' : 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600'}`}
                        >
                            {isPaused ? '▶ Resume' : 'Ⅱ Pause'}
                        </button>
                        <button
                            onClick={handleVisualize}
                            disabled={(isVisualizing && !isPaused) || playclick}
                            className={`av-run-button px-6 py-2 rounded-lg font-bold transition-all ${((isVisualizing && !isPaused) || playclick) ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}
                        >
                            ▶ Run algorithm
                        </button>
                    </div>
                </div>
                {playclick ? (
                    <div className="w-full flex justify-center mt-4">
                        <NQueensplay />
                    </div>
                ) : (
                    <div className='av-queens-layout flex flex-col xl:flex-row w-full gap-6 px-0'>
                        <div className='w-full xl:w-1/3 h-[500px] bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col'>
                            <h3 className="text-cyan-400 font-bold mb-4 border-b border-gray-700 pb-2 shrink-0">
                                Console
                            </h3>
                            <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
                                {logs.map((log, index) => {
                                    const isLatestStep = index === logs.length - 1;
                                    return (
                                        <p 
                                            key={index} 
                                            className={`text-sm font-mono transition-colors duration-300 ${
                                                isLatestStep ? 'text-green-400 font-bold' : 'text-gray-500'
                                            }`}
                                        >
                                            <span className="text-gray-600 mr-2">[{index + 1}]</span>
                                            {log}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center items-center">
                            <div 
                                className="av-queens-board grid bg-gray-800 border-4 border-gray-700 rounded-lg shadow-2xl"
                                style={{
                                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                                    width: 'min(85vw, 500px)',
                                    height: 'min(85vw, 500px)',
                                }}
                            >
                                {board.map((row, rIdx) => (
                                    row.map((cell, cIdx) => {
                                        const isBlack = (rIdx + cIdx) % 2 === 1;
                                        const baseColor = isBlack ? 'bg-gray-800' : 'bg-gray-600';
                                        
                                        let cellColor = baseColor;
                                        if (cell.status === 'inspect') cellColor = 'bg-yellow-500/50';
                                        if (cell.status === 'conflict') cellColor = 'bg-red-500/60 transition-colors duration-75';
                                        if (cell.status === 'attacker') cellColor = 'bg-orange-500/80 shadow-[inset_0_0_15px_rgba(255,165,0,1)]';

                                        return (
                                            <div 
                                                key={`${rIdx}-${cIdx}`}
                                                className={`aspect-square overflow-hidden flex items-center justify-center text-3xl sm:text-4xl transition-colors duration-200 ${cellColor}`}
                                            >
                                                {cell.hasQueen && (
                                                    <span className="animate-bounce-short drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                                                        ♛
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                ))}
                            </div>
                        </div>
                        <div className="w-full xl:w-1/4 h-[500px] bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col relative">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 shrink-0">
                                <h3 className="text-purple-400 font-bold">Live Execution</h3>
                            </div>
                            
                            <div className="overflow-y-auto flex-1 font-mono text-[13px] leading-relaxed custom-scrollbar p-3 bg-[#0d1117] rounded border border-gray-700 shadow-inner">
                                <div className="flex justify-between bg-gray-800/80 p-2 rounded mb-3 text-xs border border-gray-700">
                                    <span className="text-cyan-400">N: <span className="text-white">{gridSize}</span></span>
                                    <span className="text-purple-400">Row: <span className="text-white">{currentAction !== 'none' ? 'Live' : '-'}</span></span>
                                    <span className="text-pink-400">Action: <span className="text-white uppercase">{currentAction}</span></span>
                                </div>
                                
                                <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'none' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="text-pink-500">function</span> <span className="text-blue-400">solve</span>(row) {"{"}
                                </div>

                                <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'inspect' ? 'bg-yellow-500/20 text-yellow-300 font-bold border-l-2 border-yellow-400' : 'text-gray-600'}`}>
                                    {"  "}<span className="text-pink-500">for</span> (col = 0; col &lt; N; col++) {"{"} <br/>
                                    {"    "}check(cols, d1, d2);
                                </div>

                                <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'conflict' ? 'bg-red-500/20 text-red-300 font-bold border-l-2 border-red-400' : 'text-gray-600'}`}>
                                    {"    "}<span className="text-pink-500">if</span> (attacked) <span className="text-pink-500">continue</span>;
                                </div>

                                <div className={`transition-all duration-200 px-2 rounded mt-1 ${currentAction === 'place' ? 'bg-green-500/20 text-green-300 font-bold border-l-2 border-green-400' : 'text-gray-600'}`}>
                                    {"    "}board[row][col] = 'Q'; <br/>
                                    {"    "}markArrays();
                                </div>

                                <div className={`transition-all duration-200 px-2 rounded mt-1 ${currentAction === 'none' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {"    "}<span className="text-pink-500">if</span> (solve(row + 1)) <span className="text-pink-500">return true</span>;
                                </div>

                                <div className={`transition-all duration-200 px-2 rounded mt-1 ${currentAction === 'remove' ? 'bg-orange-500/20 text-orange-300 font-bold border-l-2 border-orange-400' : 'text-gray-600'}`}>
                                    {"    "}board[row][col] = '.'; <br/>
                                    {"    "}unmarkArrays();
                                </div>

                                <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'none' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {"  }\n  "}<span className="text-pink-500">return false</span>; <br/>
                                    {"}"}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        ) : (
            <TutorialTab data={nQueensData.nqueens} />
        )}
    </ModuleFrame>
  );
};

export default NQueens;
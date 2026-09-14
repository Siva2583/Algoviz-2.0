import ModuleFrame from '../../lab/ModuleFrame';
import React, { useState, useRef } from 'react';
import { generateFastSlowAnimations } from '../core/algorithm/sorting/algorithms/fastSlowLogic';
import TutorialTab from '../core/tutorials/TutorialTab';
import { fastSlowData } from '../core/tutorials/fastslowpointerData';

const FastSlowPointers = () => {
  const [inputStr, setInputStr] = useState("0,1,0,3,12,0,8");
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedDisplay, setSpeedDisplay] = useState(600);
  const [activeTabInfo, setactiveTabInfo] = useState('objective');
  const [activeTab,setactiveTab]=useState('visualize');
  const [currentArray, setCurrentArray] = useState(inputStr.split(',').filter(Boolean));
  const [activePointers, setActivePointers] = useState({ slow: null, fast: null });
  const [currentAction, setCurrentAction] = useState('none');
  const [actionMessage, setActionMessage] = useState('AWAITING EXECUTION...');
 
  const speedRef = useRef(600);
  const isPausedRef = useRef(false);

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setInputStr(val);
    setCurrentArray(val.split(',').filter(Boolean));
  };

  const generateRandom = () => {
    const arr = Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 99) + 1));
    const newStr = arr.join(',');
    setInputStr(newStr);
    setCurrentArray(arr);
  };

  const handleSpeedChange = (e) => {
    const r = Number(e.target.value);
    setSpeedDisplay(r);
    speedRef.current = 1100 - r;
  };

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  const smartWait = async (ms) => {
    let timePassed = 0;
    const step = 20;
    while (timePassed < ms) {
      while (isPausedRef.current) {
        await new Promise(r => setTimeout(r, 50));
      }
      await new Promise(r => setTimeout(r, step));
      timePassed += step;
    }
  };

  const handleVisualize = async () => {
    if (isVisualizing) return;
    
    setIsVisualizing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentArray(inputStr.split(',').filter(Boolean));
    setActivePointers({ slow: 0, fast: 0 });
    setCurrentAction('none');
    setActionMessage('STARTING ENGINE...');

    const animations = generateFastSlowAnimations(inputStr);

    for (let i = 0; i < animations.length; i++) {
      const frame = animations[i];
      await smartWait(speedRef.current);

      setActivePointers({ slow: frame.slow, fast: frame.fast });
      setCurrentAction(frame.type);
      setActionMessage(frame.message);

      if (frame.type === 'swap') {
        setCurrentArray(frame.currentArray);
      }
    }

    await smartWait(speedRef.current);
    setCurrentAction('complete');
    setIsVisualizing(false);
    setActivePointers({ slow: null, fast: null });
  };

  return (
    <ModuleFrame activeTab={activeTab} onTabChange={setactiveTab} running={isVisualizing} paused={isPaused}>
            {activeTab === 'visualize' ? (
                <>
      <div className="av-module-toolbar flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-4 gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            disabled={isVisualizing} 
            aria-label="Input values" value={inputStr} 
            onChange={handleInputChange} 
            placeholder="eg:-0,1,2"
            className={`bg-gray-900 border px-4 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-48
            ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}
          />
          <button onClick={generateRandom} disabled={isVisualizing} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">↻ Random input</button>
        </div>
        
        <div className="hidden md:flex flex-col items-center gap-2">
          <div className="text-gray-400 font-bold tracking-widest text-sm">FAST & SLOW POINTERS MODULE</div>
          <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
            <span className="text-[10px] text-gray-500 font-bold tracking-wider">SLOW</span>
            <input type="range" step={50} min={100} max={1000} aria-label="Playback speed" value={speedDisplay} onChange={handleSpeedChange} className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"/>
            <span className="text-[10px] text-cyan-500 font-bold tracking-wider">FAST</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePause}
            disabled={!isVisualizing}
            className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${!isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : isPaused ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' : 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600'}`}
          >
            {isPaused ? '▶ Resume' : 'Ⅱ Pause'}
          </button>
          <button onClick={handleVisualize} disabled={isVisualizing && !isPaused} className={`av-run-button px-6 py-2 rounded-lg font-bold transition-all ${isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}>
            ▶ Run algorithm
          </button>
        </div>
      </div>

      <div className="av-module-stage flex flex-col xl:flex-row flex-1 gap-4 overflow-hidden">
        <div className="w-full xl:w-3/4 bg-gray-800/40 border border-gray-700 rounded-xl p-6 flex flex-col relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-xl font-bold text-gray-300">Move Zeroes (Fast & Slow)</h2>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 w-3/5 shadow-inner">
              <div className="flex gap-2 mb-2 border-b border-gray-700 pb-2">
                <button onClick={() => setactiveTabInfo('objective')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'objective' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-400'}`}>Objective</button>
                <button onClick={() => setactiveTabInfo('technique')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'technique' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-500 hover:text-gray-400'}`}>Technique</button>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed min-h-[40px]">
                {activeTabInfo === 'objective' && <p><strong className="text-gray-300">Goal:</strong> Move all <span className="text-cyan-400 font-mono">0</span>s to the very end of the array while maintaining the exact relative order of the non-zero numbers. Must be done <strong className="text-gray-300">in-place</strong>.</p>}
                {activeTabInfo === 'technique' && <p><strong className="text-gray-300">The Parking Lot:</strong> The <span className="text-pink-400 font-bold">Fast pointer</span> scouts ahead for cars (non-zero numbers). The <span className="text-cyan-400 font-bold">Slow pointer</span> anchors on the first available empty spot (<span className="text-gray-500 font-mono">0</span>). When Fast finds a car, they swap!</p>}
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex gap-3 mb-16">
              {currentArray.map((char, idx) => {
                const isSlow = activePointers.slow === idx;
                const isFast = activePointers.fast === idx;
                const isBoth = isSlow && isFast;
                
                let glowClass = char === '0' ? 'border-gray-700 text-gray-600 bg-gray-800' : 'border-gray-500 text-gray-300 bg-gray-800';
                
                if (isBoth) {
                  glowClass = "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] z-10";
                } else if (isFast) {
                  glowClass = "bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.4)] z-10 scale-110 -translate-y-1";
                } else if (isSlow) {
                  glowClass = "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] z-10";
                }

                if (currentAction === 'swap' && (isFast || isSlow)) {
                  glowClass = "bg-yellow-500/20 border-yellow-400 text-yellow-300 scale-110 -translate-y-2 shadow-[0_0_20px_rgba(250,204,21,0.5)] z-20";
                }

                return (
                  <div key={idx} className="flex flex-col items-center">
                    
                    <div className={`w-14 h-16 border-2 rounded flex items-center justify-center text-xl font-mono font-bold shadow-lg transition-all duration-300 relative ${glowClass}`}>
                      {char}
                      {isSlow && !isBoth && <div className="absolute -bottom-8 text-cyan-400 text-sm font-bold tracking-widest transition-all duration-300">SLOW</div>}
                      {isFast && !isBoth && <div className="absolute -top-8 text-red-400 text-sm font-bold tracking-widest transition-all duration-300">FAST</div>}
                      {isBoth && <div className="absolute -bottom-8 text-purple-400 text-sm font-bold tracking-widest transition-all duration-300">S/F</div>}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-10">{idx}</span>
                  </div>
                );
              })}
            </div>
            
            <div className={`h-24 w-full max-w-md bg-gray-900/80 border rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300 ${currentAction === 'swap' ? 'border-yellow-500/50' : 'border-gray-700'}`}>
              <p className={`font-mono text-sm tracking-widest transition-colors ${currentAction === 'none' ? 'text-gray-500' : 'text-gray-200'}`}>
                {actionMessage}
              </p>
            </div> 
          </div>
        </div>

        <div className="w-full xl:w-1/4 bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 shrink-0">
            <h3 className="text-indigo-400 font-bold">Live Algorithm</h3>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-900 rounded border border-gray-700">O(N) Time</span>
          </div>
          
          <div className="overflow-y-auto flex-1 font-mono text-[13px] leading-relaxed custom-scrollbar p-3 bg-[#0d1117] rounded border border-gray-700 shadow-inner">
             
            <div className={`transition-all duration-200 px-2 rounded text-gray-400`}>
              <span className="text-pink-500">function</span> <span className="text-blue-400">moveZeroes</span>(arr) {"{"}
            </div>

            <div className={`transition-all duration-200 px-2 rounded mt-2 ${currentAction === 'eval' || currentAction === 'move_slow' ? 'bg-cyan-500/10 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'text-gray-600'}`}>
              {"  "}<span className="text-pink-500">let</span> slow = 0;
            </div>

            <div className={`transition-all duration-200 px-2 rounded mt-2 ${currentAction !== 'none' ? 'bg-pink-500/10 text-pink-300 font-bold border-l-2 border-pink-400' : 'text-gray-600'}`}>
              {"  "}<span className="text-pink-500">for</span> (<span className="text-pink-500">let</span> fast = 0; fast &lt; arr.length; fast++) {"{"}
            </div>

            <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'ignore' || currentAction === 'eval' ? 'text-gray-300' : 'text-gray-600'}`}>
              {"    "}<span className="text-pink-500">if</span> (arr[fast] !== 0) {"{"}
            </div>

            <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'swap' || currentAction === 'match' ? 'bg-yellow-500/20 text-yellow-300 font-bold border-l-2 border-yellow-400' : 'text-gray-600'}`}>
              {"      "}swap(arr[slow], arr[fast]);
            </div>

            <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'move_slow' ? 'bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'text-gray-600'}`}>
              {"      "}slow++;
            </div>

            <div className={`transition-all duration-200 px-2 rounded text-gray-600`}>
              {"    }"} <br/>
              {"  }"}
            </div>

            <div className={`transition-all duration-200 px-2 rounded mt-2 ${currentAction === 'complete' ? 'bg-green-500/20 text-green-300 font-bold border-l-2 border-green-400' : 'text-gray-600'}`}>
              {"  "}<span className="text-pink-500">return</span> arr; <br/>
              {"}"}
            </div>

          </div>
        </div>
      </div>
    </>
            ) : (
                <TutorialTab data={fastSlowData.moveZeroes} />
            )}
        </ModuleFrame>
    );
};

export default FastSlowPointers;
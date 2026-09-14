import ModuleFrame from '../../lab/ModuleFrame';
import React, { useState, useRef } from 'react';
import { generateTwoPointersAnimations } from '../core/algorithm/sorting/algorithms/twoPointersLogic';
import TutorialTab from '../core/tutorials/TutorialTab';
import { twoPointersData } from '../core/tutorials/twopointersData';

const TwoPointers = () => {
  const [inputStr, setInputStr] = useState("ALGORITHM");
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedDisplay, setSpeedDisplay] = useState(600); 
  const speedRef = useRef(600);
  const [activeTab,setActiveTab]=useState('visualize');
  const [currentArray, setCurrentArray] = useState(inputStr.split(''));
  const [activePointers, setActivePointers] = useState({ L: null, R: null });
  const [currentAction, setCurrentAction] = useState('none');
  const [actionMessage, setActionMessage] = useState('AWAITING EXECUTION...');
  const isPausedRef = useRef(false);
  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12);
    setInputStr(val);
    setCurrentArray(val.split(''));
  };
  const handleSpeedChange = (e) => {
    const rawValue = Number(e.target.value);
    const newDelay = 1100 - rawValue; 
    setSpeedDisplay(rawValue);
    speedRef.current = newDelay;
  };

  const generateRandom = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    const length = Math.floor(Math.random() * 5) + 6;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputStr(result);
    setCurrentArray(result.split(''));
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
    setCurrentArray(inputStr.split(''));
    setActivePointers({ L: null, R: null });
    setCurrentAction('none');
    setActionMessage('STARTING ENGINE...');

    const animations = generateTwoPointersAnimations(inputStr);

    for (let i = 0; i < animations.length; i++) {
      const frame = animations[i];
      
      await smartWait(speedRef.current);

      if (frame.type === 'select') {
        setActivePointers({ L: frame.L, R: frame.R });
        setCurrentAction('select');
        setActionMessage(frame.message);
      } 
      else if (frame.type === 'swap') {
        setCurrentArray(frame.currentArray);
        setCurrentAction('swap');
        setActionMessage(frame.message);
      } 
      else if (frame.type === 'move') {
        setActivePointers({ L: frame.L, R: frame.R });
        setCurrentAction('move');
        setActionMessage(frame.message);
      } 
      else if (frame.type === 'meet' || frame.type === 'complete') {
        setActivePointers({ L: frame.L, R: frame.R });
        setCurrentAction('complete');
        setActionMessage(frame.message);
      }
    }

    await smartWait(speedRef.current);
    setCurrentAction('none');
    setIsVisualizing(false);
    setActivePointers({ L: null, R: null });
  };

  return (
    <ModuleFrame activeTab={activeTab} onTabChange={setActiveTab} running={isVisualizing} paused={isPaused}>
            {activeTab === 'visualize' ? (
                <>
      <div className="av-module-toolbar flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-4 gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              aria-label="Input text" value={inputStr}
              onChange={handleInputChange}
              disabled={isVisualizing}
              placeholder="Enter string..."
              className={`bg-gray-900 border px-4 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-48
                ${inputStr.length === 12 ? 'border-red-500/50 focus:ring-red-500' : 'border-gray-600 focus:ring-cyan-500'}
                ${isVisualizing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            {inputStr.length === 12 && (
              <span className="absolute -bottom-5 left-1 text-[10px] text-red-400 font-bold">Max 12 chars reached</span>
            )}
          </div>
          <button 
            onClick={generateRandom}
            disabled={isVisualizing}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            ↻ Random input
          </button>
        </div>

        {/* Center: Title & Speed Control */}
        <div className="hidden md:flex flex-col items-center gap-2">
          <div className="text-gray-400 font-bold tracking-widest text-sm">
            PLAYBACK SPEED
          </div>
          
          {/* THE NEW SPEED SLIDER */}
          <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
             <span className="text-[10px] text-gray-500 font-bold tracking-wider">SLOW</span>
             <input 
               type="range" 
               min="100" 
               max="1000" 
               step="50"
               aria-label="Playback speed" value={speedDisplay}
               onChange={handleSpeedChange}
               className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
             />
             <span className="text-[10px] text-cyan-500 font-bold tracking-wider">FAST</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={togglePause}
            disabled={!isVisualizing}
            className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${
              !isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' :
              isPaused ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' : 
              'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600'
            }`}
          >
            {isPaused ? '▶ Resume' : 'Ⅱ Pause'}
          </button>

          <button 
             onClick={handleVisualize}
             disabled={isVisualizing && !isPaused}
             className={`av-run-button px-6 py-2 rounded-lg font-bold transition-all ${
               isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
             }`}
           >
             ▶ Run algorithm
           </button>
        </div>
      </div>

      <div className="av-module-stage flex flex-col xl:flex-row flex-1 gap-4 overflow-hidden">
        <div className="w-full xl:w-3/4 bg-gray-800/40 border border-gray-700 rounded-xl p-6 flex flex-col relative overflow-hidden">
            <h2 className="text-xl font-bold text-gray-300 mb-8">
               String Reversal (Opposite Ends)
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex gap-2 mb-16">
                {currentArray.map((char, idx) => {
                  let isL = activePointers.L === idx;
                  let isR = activePointers.R === idx;
                  let isActive = isL || isR;
                  let glowClass = "bg-gray-800 border-gray-600 text-gray-200";
                  
                  if (isActive) {
                    if (currentAction === 'swap') {
                      glowClass = "bg-yellow-500/20 border-yellow-400 text-yellow-300 scale-110 -translate-y-2 shadow-[0_0_20px_rgba(250,204,21,0.4)] z-10";
                    } else if (isL) {
                      glowClass = "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]";
                    } else if (isR) {
                      glowClass = "bg-pink-500/20 border-pink-400 text-red-300 shadow-[0_0_15px_rgba(244,114,182,0.3)]";
                    }
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-12 h-16 border-2 rounded flex items-center justify-center text-2xl font-mono font-bold transition-all duration-300 relative ${glowClass}`}>
                        {char}
                        {isL && <div className="absolute -bottom-8 text-cyan-400 text-xl font-bold transition-all duration-300">^</div>}
                        {isR && <div className="absolute -bottom-8 text-pink-400 text-xl font-bold transition-all duration-300">^</div>}
                      </div>
                      <span className="text-[10px] text-gray-500 mt-8">{idx}</span>
                    </div>
                  );
                })}
              </div>

              <div className={`h-24 w-full max-w-md bg-gray-900/80 border rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300 ${
                currentAction === 'swap' ? 'border-yellow-500/50' : 'border-gray-700'
              }`}>
                 <p className={`font-mono text-sm tracking-widest transition-colors ${
                   currentAction === 'none' ? 'text-gray-500' : 'text-gray-200'
                 }`}>
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
             
            <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'none' ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="text-pink-500">function</span> <span className="text-blue-400">reverseString</span>(str) {"{"}
            </div>

            <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'none' ? 'text-gray-400' : 'text-gray-600'}`}>
              {"  "}<span className="text-pink-500">let</span> L = 0; <br/>
              {"  "}<span className="text-pink-500">let</span> R = str.length - 1;
            </div>

            <div className={`transition-all duration-200 px-2 rounded mt-2 ${currentAction === 'select' ? 'bg-cyan-500/10 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'text-gray-600'}`}>
              {"  "}<span className="text-pink-500">while</span> (L &lt; R) {"{"}
            </div>

            <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'swap' ? 'bg-yellow-500/20 text-yellow-300 font-bold border-l-2 border-yellow-400' : 'text-gray-600'}`}>
              {"    "}swap(str[L], str[R]);
            </div>

            <div className={`transition-all duration-200 px-2 rounded ${currentAction === 'move' ? 'bg-purple-500/20 text-purple-300 font-bold border-l-2 border-purple-400' : 'text-gray-600'}`}>
              {"    "}L++; <br/>
              {"    "}R--;
            </div>

            <div className={`transition-all duration-200 px-2 rounded mt-1 ${currentAction === 'select' ? 'bg-cyan-500/10 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'text-gray-600'}`}>
              {"  }"}
            </div>

            <div className={`transition-all duration-200 px-2 rounded mt-2 ${currentAction === 'complete' ? 'bg-green-500/20 text-green-300 font-bold border-l-2 border-green-400' : 'text-gray-600'}`}>
              {"  "}<span className="text-pink-500">return</span> str; <br/>
              {"}"}
            </div>

          </div>
        </div>
        </div>
            </>
      
    ):(
  <TutorialTab data={twoPointersData.twoPointers} />

)
}</ModuleFrame>
  );
};

      

export default TwoPointers;
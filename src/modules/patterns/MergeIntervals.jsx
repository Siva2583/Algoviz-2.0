import ModuleFrame from '../../lab/ModuleFrame';
import React, { useState, useEffect, useRef } from 'react';
import { generateMergeIntervals } from '../core/algorithm/sorting/algorithms/MergeIntervalsLogic';
import TutorialTab from '../core/tutorials/TutorialTab';
import { mergeIntervalsData } from '../core/tutorials/mergeIntervalsData';

const MergeIntervals = () => {
    const [inputStr, setInputStr] = useState("[[1,3],[2,6],[8,10],[15,18]]");
    const [isPaused, setIsPaused] = useState(false);
    const [isVisualizing, setIsVisualizing] = useState(false);
    const isPausedRef = useRef(false);
    const [activeTabInfo, setActiveTabInfo] = useState('objective');
    const [activeTab,setActiveTab]=useState('visualize');
    const [speedDisplay, setSpeedDisplay] = useState(600);
    const speedRef = useRef(600);
    const [actionMessage, setActionMessage] = useState("AWAITING FOR THE USER TO START....");
    const [currentAction, setCurrentAction] = useState("STARTING....");
    
    const [currentFrame, setCurrentFrame] = useState({
        intervals: [], merged: [], activeId: null, compareTargetId: null, fadingId: null, stretchingId: null
    });

    useEffect(() => {
        if (!isVisualizing) {
            try {
                const arr = JSON.parse(inputStr);
                const initialIntervals = arr.map((interval, index) => ({
                    id: `block-${index}`,
                    start: interval[0],
                    end: interval[1]
                }));
                setCurrentFrame({
                    intervals: initialIntervals, merged: [], activeId: null, compareTargetId: null, fadingId: null, stretchingId: null
                });
            } catch {
                // Keep the last valid preview while the user edits incomplete JSON.
            }
        }
    }, [inputStr, isVisualizing]);

    const handleInputChange = (e) => {
        setInputStr(e.target.value);
    };

    const generateRandom = () => {
        const arr = [];
        let start = 1;
        for(let i=0; i<6; i++) {
            let s = start + Math.floor(Math.random() * 3);
            let e = s + Math.floor(Math.random() * 4) + 1;
            arr.push([s, e]);
            start = s + 2; 
        }
        arr.sort(() => Math.random() - 0.5);
        setInputStr(JSON.stringify(arr));
    };

    const togglePause = () => {
        isPausedRef.current = !(isPausedRef.current);
        setIsPaused(isPausedRef.current);
    };

    const handleSpeedChange = (e) => {
        const curspeed = Number(e.target.value);
        setSpeedDisplay(curspeed);
        speedRef.current = 2100 - curspeed;
    };

    const smartWait = async (ms) => {
        let step = 20;
        let timePassed = 0;
        while(timePassed < ms) {
            while(isPausedRef.current) {
                await new Promise(r => setTimeout(r, 50));
            }
            await new Promise(r => setTimeout(r, step));
            timePassed += step;
        }
    };

    const handleVisualize = async () => {
        if(isVisualizing) {
            return;
        }
        try {
            const parsed = JSON.parse(inputStr);
            setActionMessage("Starting Visualization....");
            setIsVisualizing(true);
            setCurrentAction('start');
            setIsPaused(false);
            isPausedRef.current = false;
            
            const animations = generateMergeIntervals(parsed);
            
            for(let i=0; i<animations.length; i++) {
                let frame = animations[i];
                await smartWait(speedRef.current);
                setCurrentAction(frame.type);
                setCurrentFrame(frame);
                setActionMessage(frame.msg);
            }
            setIsVisualizing(false);
        } catch {
            alert("Invalid JSON array format. Please use [[start,end],[start,end]]");
            setIsVisualizing(false);
        }
    }

    const getMaxDomain = () => {
        try {
            const arr = JSON.parse(inputStr);
            let max = 20;
            arr.forEach(interval => { if(interval[1] > max) max = interval[1]; });
            return max + 2;
        } catch {
            return 20;
        }
    };

    const maxDomain = getMaxDomain();
    const getLeft = (val) => `${(val / maxDomain) * 100}%`;
    const getWidth = (start, end) => `${((end - start) / maxDomain) * 100}%`;

    return (
    <ModuleFrame activeTab={activeTab} onTabChange={setActiveTab} running={isVisualizing} paused={isPaused}>
            {activeTab === 'visualize' ? (
                <>
            <div className='av-module-toolbar flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-4 gap-4 shadow-lg'>
            <div className='flex items-center gap-2'>
                <input type='text' onChange={handleInputChange} disabled={isVisualizing} placeholder='[[1,3],[2,6]]' aria-label="Input values" value={inputStr}
                className={`bg-gray-900 border px-4 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-64
                    ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}>
                </input>
                <button onClick={generateRandom} disabled={isVisualizing} className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50'>
                    ↻ Random input
                </button>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2">
            <div className="text-gray-400 font-bold tracking-widest text-sm">MERGE INTERVALS (GREEDY)</div>
            <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
              <span className="text-[10px] text-gray-500 font-bold tracking-wider">SLOW</span>
              <input type="range" step={50} min={100} max={2000} aria-label="Playback speed" value={speedDisplay} onChange={handleSpeedChange} className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"/>
              <span className="text-[10px] text-cyan-500 font-bold tracking-wider">FAST</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
          <button 
            onClick={togglePause}
            disabled={!isVisualizing}
            className={`px-2 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${!isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : isPaused ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' : 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600'}`}
          >
            {isPaused ? '▶ Resume' : 'Ⅱ Pause'}
          </button>
          <button 
             onClick={handleVisualize}
             disabled={isVisualizing && !isPaused}
             className={`av-run-button px-4 py-2 rounded-lg font-bold transition-all ${isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}
           >
             ▶ Run algorithm
           </button>
        </div>
      </div>
      <div className="av-module-stage flex flex-col xl:flex-row flex-1 gap-4 overflow-hidden">
        
        <div className="w-full xl:w-3/4 bg-gray-800/40 border border-gray-700 rounded-xl p-6 flex flex-col relative overflow-y-auto">
          
          <div className="flex justify-between items-start mb-6 shrink-0">
            <h2 className="text-xl font-bold text-gray-300">Greedy Overlap Architecture</h2>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 w-3/5 shadow-inner">
              <div className="flex gap-2 mb-2 border-b border-gray-700 pb-2">
                <button onClick={() => setActiveTabInfo('objective')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'objective' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-400'}`}>Objective</button>
                <button onClick={() => setActiveTabInfo('technique')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'technique' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-500 hover:text-gray-400'}`}>Technique</button>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed min-h-[40px]">
                {activeTabInfo === 'objective' && <p><strong className="text-gray-300">Goal:</strong> To find all overlapping intervals and merge them into a continuous schedule.</p>}
                {activeTabInfo === 'technique' && <p><strong className="text-gray-300">Sorting & Greedy Sweep:</strong> Sort by start time in O(N log N). Then, linearly sweep in O(N), stretching the merged boundary if current start &lt;= previous end.</p>}
              </div>
            </div>
        </div>
        
        <div className="flex justify-center gap-6 mb-8">
             <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg">
                <span className="text-xs text-gray-500 font-bold tracking-widest">INPUT SETS</span>
                <span className="text-2xl font-mono font-bold text-gray-300">{currentFrame.intervals.length}</span>
             </div>
             <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg">
                <span className="text-xs text-gray-500 font-bold tracking-widest">MERGED</span>
                <span className={`text-2xl font-mono font-bold transition-colors ${currentFrame.merged.length > 0 ? 'text-green-400' : 'text-cyan-400'}`}>{currentFrame.merged.length}</span>
             </div>
             <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg min-w-[150px]">
                <span className="text-xs text-gray-500 font-bold tracking-widest">STATUS</span>
                <span className="text-lg font-mono font-bold text-pink-400 mt-1">{currentAction === 'meld' ? 'OVERLAP!' : currentAction.toUpperCase()}</span>
             </div>
         </div>
         <div 
            className='flex-1 relative w-full bg-gray-900/40 border border-gray-700 rounded-xl overflow-hidden shadow-inner px-4 transition-all duration-500'
            style={{ minHeight: `${Math.max(400, currentFrame.intervals.length * 55 + 150)}px` }}
         >
            
            {currentFrame.intervals.map((interval, idx) => (
                <div
                    key={`input-${interval.id}`}
                    className={`absolute h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all duration-500 ease-in-out border
                        ${interval.id === currentFrame.activeId ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-20 scale-105' : 'bg-gray-700/60 border-gray-500 text-gray-300 z-10'}
                        ${interval.id === currentFrame.compareTargetId ? 'border-yellow-400 text-yellow-300 ring-2 ring-yellow-400/50' : ''}
                    `}
                    style={{
                        left: getLeft(interval.start),
                        width: getWidth(interval.start, interval.end),
                        top: `${idx * 45 + 20}px`,
                        opacity: interval.id === currentFrame.fadingId ? 0 : 1,
                        transform: interval.id === currentFrame.fadingId ? 'translateY(60px) scale(0.95)' : 'none'
                    }}
                >
                    [{interval.start}, {interval.end}]
                </div>
            ))}

            {currentFrame.merged.map((interval) => (
                <div
                    key={`merged-${interval.id}`}
                    className={`absolute h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono transition-all duration-500 ease-in-out border
                        ${interval.id === currentFrame.stretchingId ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.5)] z-30 scale-105' : 'bg-green-500/20 border-green-500 text-green-200 shadow-[0_0_10px_rgba(34,197,94,0.3)] z-20'}
                    `}
                    style={{
                        left: getLeft(interval.start),
                        width: getWidth(interval.start, interval.end),
                        bottom: '60px' /* Pushed up slightly for breathing room */
                    }}
                >
                    [{interval.start}, {interval.end}]
                </div>
            ))}

            <div className="absolute bottom-6 w-full border-t-2 border-gray-700/80">
                {[...Array(maxDomain + 1)].map((_, i) => (
                    <div key={`tick-${i}`} className="absolute h-3 border-l-2 border-gray-700" style={{ left: getLeft(i) }}>
                        <span className="absolute top-4 -left-1.5 text-[10px] font-mono text-gray-600">{i}</span>
                    </div>
                ))}
            </div>

         </div>
         <div className="mt-4 h-16 w-full bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0">
             <p className="font-mono text-sm tracking-widest text-gray-200">
               {actionMessage}
             </p>
          </div>
        </div>
          
        <div className="w-full xl:w-1/4 bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex flex-col">
            <h3 className="text-indigo-400 font-bold mb-4">Live Algorithm</h3>
            <div className="flex-1 bg-[#0d1117] rounded border border-gray-700 overflow-y-auto font-mono text-[13px] leading-relaxed p-2 text-gray-500">
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'sort' ? 'bg-pink-500/10 border-l-2 border-pink-400 text-pink-200' : 'pl-3'}`}>
                    intervals.sort((a,b) =&gt; a[0] - b[0]);
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'initial' || currentAction === 'sort' ? 'bg-blue-500/10 border-l-2 border-blue-400 text-blue-200' : 'pl-3'}`}>
                    <span className="text-pink-500">const</span> merged = [intervals[0]];
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'compare' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                    <span className="text-pink-500">for</span> (<span className="text-pink-500">let</span> i = 1; i &lt; n; i++) {"{"}<br/>
                    &nbsp;&nbsp;<span className="text-pink-500">let</span> curr = intervals[i];<br/>
                    &nbsp;&nbsp;<span className="text-pink-500">let</span> prev = merged.last();
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'compare' ? 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-200' : 'pl-3'}`}>
                    &nbsp;&nbsp;<span className="text-pink-500">if</span> (curr[0] &lt;= prev[1]) {"{"}
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'meld' ? 'bg-yellow-500/10 border-l-2 border-yellow-400 text-yellow-200' : 'pl-3'}`}>
                    &nbsp;&nbsp;&nbsp;&nbsp;prev[1] = Math.max(prev[1], curr[1]);
                </div>
                
                <div className="px-2 py-1 my-1 pl-3">
                    &nbsp;&nbsp;{"}"} <span className="text-pink-500">else</span> {"{"}
                </div>

                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'drop' ? 'bg-green-500/10 border-l-2 border-green-400 text-green-200' : 'pl-3'}`}>
                    &nbsp;&nbsp;&nbsp;&nbsp;merged.push(curr);
                </div>
                
                <div className="px-2 py-1 my-1 pl-3">
                    &nbsp;&nbsp;{"}"}<br/>
                    {"}"}
                </div>

                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'complete' ? 'bg-green-500/20 border-l-2 border-green-400 text-green-200 font-bold' : 'pl-3'}`}>
                    <span className="text-pink-500">return</span> merged;
                </div>

            </div>
        </div>
        </div>
    </>
            ) : (
                <TutorialTab data={mergeIntervalsData.mergeIntervals} />
            )}
        </ModuleFrame>
    );
};
export default MergeIntervals;
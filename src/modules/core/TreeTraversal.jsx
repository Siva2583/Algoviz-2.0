import ModuleFrame from '../../lab/ModuleFrame';
import React, { useState, useEffect, useRef } from 'react';
import { generatePostOrder, generateInOrder, generatePreOrder } from './algorithm/sorting/algorithms/treeTraversalsLogic';
import TutorialTab from './tutorials/TutorialTab';
import { treeTraversalData } from './tutorials/treeTraversalData';
const TreeTraversal = () => {
    const [inputStr, setInputStr] = useState("10,5,15,2,7,12,20"); 
    const [selectedAlgo, setSelectedAlgo] = useState("inorder");
    const [isPaused, setIsPaused] = useState(false);
    const [isVisualizing, setIsVisualizing] = useState(false);
    const isPausedRef = useRef(false);
    const [speedDisplay, setSpeedDisplay] = useState(600);
    const speedRef = useRef(600);
    const [actionMessage, setActionMessage] = useState("AWAITING FOR THE USER TO START....");
    const [stats, setStats] = useState({ processed: 0, stackDepth: 0, maxDepth: 0 });
    const[activeTab,setActiveTab]=useState('visualize');
    const [currentFrame, setCurrentFrame] = useState({
        array: [], 
        activeIndex: null, 
        processedIndices: [], 
        outputArray: [], 
        codeLine: 'start',
        currentStats: { processed: 0, stackDepth: 0, maxDepth: 0 }
    });

    useEffect(() => {
        if (!isVisualizing) {
            const arr = inputStr.split(',').filter(Boolean).map((val, idx) => ({
                id: `node-${idx}-${val}`,
                val: Number(val)
            }));
            setCurrentFrame({ 
                array: arr, activeIndex: null, processedIndices: [], outputArray: [],
                codeLine: 'start', currentStats: { processed: 0, stackDepth: 0, maxDepth: 0 }
            });
            setStats({ processed: 0, stackDepth: 0, maxDepth: 0 });
        }
    // Input changes initialize the preview; completion must preserve the final frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputStr]);

    const handleInputChange = (e) => setInputStr(e.target.value.replace(/[^0-9,]/g, ''));

    const generateRandom = () => {
        const arr = Array.from({ length: 7 }, () => Math.floor(Math.random() * 99 + 1));
        setInputStr(arr.join(','));
    };

    const togglePause = () => {
        isPausedRef.current = !isPausedRef.current;
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
            while(isPausedRef.current) await new Promise(r => setTimeout(r, 50));
            await new Promise(r => setTimeout(r, step));
            timePassed += step;
        }
    };

    const handleVisualize = async () => {
        if(isVisualizing) return;
        
        setIsVisualizing(true);
        setIsPaused(false);
        isPausedRef.current = false;
        setActionMessage(`Starting ${selectedAlgo.toUpperCase()} Traversal...`);
        
        const parsedArray = inputStr.split(',').filter(Boolean).map(Number);
        let animations = [];

        if (selectedAlgo === 'preorder') animations = generatePreOrder(parsedArray);
        else if (selectedAlgo === 'inorder') animations = generateInOrder(parsedArray);
        else if (selectedAlgo === 'postorder') animations = generatePostOrder(parsedArray);

        
        for(let i=0; i<animations.length; i++) {
            await smartWait(speedRef.current);
            setCurrentFrame(animations[i]);
            setActionMessage(animations[i].msg);
            if (animations[i].currentStats) setStats(animations[i].currentStats);
        }
        
        
        setIsVisualizing(false);
    };

    return (
    <ModuleFrame activeTab={activeTab} onTabChange={setActiveTab} running={isVisualizing} paused={isPaused}>
            {activeTab === 'visualize' ? (
                <>
            
            <div className='av-module-toolbar flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-4 gap-4 shadow-lg'>
                <div className='flex items-center gap-2'>
                    <input 
                        type='text' onChange={handleInputChange} disabled={isVisualizing} aria-label="Input values" value={inputStr}
                        className={`bg-gray-900 border px-4 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-48
                            ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}
                    />
                    
                    <select 
                        aria-label="Algorithm" value={selectedAlgo} onChange={(e) => setSelectedAlgo(e.target.value)} disabled={isVisualizing}
                        className="bg-gray-900 border border-gray-600 text-cyan-300 px-4 py-2 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                        <option value="preorder">Pre-Order (Root, L, R)</option>
                        <option value="inorder">In-Order (L, Root, R)</option>
                        <option value="postorder">Post-Order (L, R, Root)</option>
                    </select>

                    <button onClick={generateRandom} disabled={isVisualizing} className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50'>
                        ↻ Random input
                    </button>
                </div>
                
                <div className="hidden md:flex flex-col items-center gap-2">
                    <div className="text-gray-400 font-bold tracking-widest text-sm uppercase">O(N) DFS TRAVERSALS</div>
                    <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider">SLOW</span>
                        <input type="range" step={50} min={100} max={2000} aria-label="Playback speed" value={speedDisplay} onChange={handleSpeedChange} className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"/>
                        <span className="text-[10px] text-cyan-500 font-bold tracking-wider">FAST</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={togglePause} disabled={!isVisualizing} className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${!isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : isPaused ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' : 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600'}`}>
                        {isPaused ? '▶ Resume' : 'Ⅱ Pause'}
                    </button>
                    <button onClick={handleVisualize} disabled={isVisualizing && !isPaused} className={`av-run-button px-6 py-2 rounded-lg font-bold transition-all ${isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}>
                        ▶ Run algorithm
                    </button>
                </div>
            </div>

            <div className="av-module-stage flex flex-col xl:flex-row flex-1 gap-4 overflow-hidden">
                <div className="w-full xl:w-3/4 bg-gray-800/40 border border-gray-700 rounded-xl p-6 flex flex-col relative">
                    <div className="flex justify-between items-start mb-6 shrink-0">
                        <h2 className="text-xl font-bold text-gray-300 capitalize">{selectedAlgo} DFS Execution</h2>
                        <div className="bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-2 shadow-inner">
                            <span className="text-pink-400 font-mono text-sm">Time: O(N) | Space: O(H)</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 mb-8">
                        <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg w-32">
                            <span className="text-xs text-gray-500 font-bold tracking-widest">PROCESSED</span>
                            <span className="text-2xl font-mono font-bold text-green-400">{stats.processed}</span>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg w-32">
                            <span className="text-xs text-gray-500 font-bold tracking-widest">STACK SIZE</span>
                            <span className="text-2xl font-mono font-bold text-cyan-400">{stats.stackDepth}</span>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg w-32">
                            <span className="text-xs text-gray-500 font-bold tracking-widest">MAX DEPTH</span>
                            <span className="text-2xl font-mono font-bold text-pink-400">{stats.maxDepth}</span>
                        </div>
                    </div>

                    <div className="flex-1 relative w-full bg-[#0a0a0f] border border-gray-700 rounded-xl overflow-hidden shadow-inner min-h-[350px]">
                        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                            {currentFrame.array.map((_, i) => {
                                const leftChild = 2 * i + 1;
                                const rightChild = 2 * i + 2;
                                const n = currentFrame.array.length;
                                
                                const getCoords = (idx) => {
                                    const level = Math.floor(Math.log2(idx + 1));
                                    const pos = (idx + 1) - Math.pow(2, level);
                                    return {
                                        x: `${((2 * pos + 1) / Math.pow(2, level + 1)) * 100}%`,
                                        y: level * 80 + 30 + 30 
                                    };
                                };

                                const parent = getCoords(i);
                                let lines = [];

                                if (leftChild < n) {
                                    const child = getCoords(leftChild);
                                    lines.push(<line key={`edge-l-${i}`} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y} stroke="#374151" strokeWidth="3" />);
                                }
                                if (rightChild < n) {
                                    const child = getCoords(rightChild);
                                    lines.push(<line key={`edge-r-${i}`} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y} stroke="#374151" strokeWidth="3" />);
                                }
                                return lines;
                            })}
                        </svg>

                        {currentFrame.array.map((item, index) => {
                            const isActive = currentFrame.activeIndex === index;
                            const isProcessed = currentFrame.processedIndices.includes(index);
                            
                            const level = Math.floor(Math.log2(index + 1));
                            const pos = (index + 1) - Math.pow(2, level);
                            const leftPercent = ((2 * pos + 1) / Math.pow(2, level + 1)) * 100;
                            const topPx = level * 80 + 30;

                            let style = 'bg-gray-800/80 border-gray-600 text-gray-400';
                            if (isProcessed) {
                                style = 'bg-green-500/20 border-green-500 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)] z-10';
                            } else if (isActive) {
                                style = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.6)] z-20 scale-110 ring-4 ring-cyan-500/30';
                            }

                            return (
                                <div
                                    key={item.id}
                                    className={`absolute w-14 h-14 -ml-7 rounded-full flex items-center justify-center text-xl font-mono font-bold transition-all duration-300 ease-in-out border-2 ${style}`}
                                    style={{ left: `${leftPercent}%`, top: `${topPx}px` }}
                                >
                                    {item.val}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 bg-gray-900/60 border border-gray-700 rounded-xl p-4 shadow-inner shrink-0 min-h-[90px]">
                        <div className="text-xs text-gray-500 font-bold tracking-widest mb-2 uppercase">Traversal Output</div>
                        <div className="flex gap-2 overflow-x-auto pb-1 items-center h-12">
                            {currentFrame.outputArray.map((val, idx) => (
                                <div key={idx} className="w-10 h-10 shrink-0 bg-green-500/20 border-2 border-green-500 text-green-200 flex items-center justify-center rounded-lg font-mono font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)] animate-pulse">
                                    {val}
                                </div>
                            ))}
                            {currentFrame.outputArray.length === 0 && (
                                <span className="text-gray-600 font-mono text-sm italic">Waiting for nodes to be processed...</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 h-12 w-full bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                        <p className="font-mono text-sm tracking-widest text-gray-200">
                            {actionMessage}
                        </p>
                    </div>
                </div>
                
                <div className="w-full xl:w-1/4 bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex flex-col gap-4">
                    
                    {/* TOP 50%: LIVE ALGORITHM */}
                    <div className="flex-1 flex flex-col min-h-[200px]">
                        <h3 className="text-indigo-400 font-bold mb-2">Live Algorithm</h3>
                        <div className="flex-1 bg-[#0d1117] rounded border border-gray-700 overflow-y-auto font-mono text-[13px] leading-loose p-3 text-gray-500 shadow-inner">
                            <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'start' ? 'bg-blue-500/10 border-l-2 border-blue-400 text-blue-200' : 'pl-3'}`}>
                                <span className="text-pink-500">function</span> traverse(node) {"{"}
                            </div>
                            <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'base_case' ? 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-200' : 'pl-3'}`}>
                                &nbsp;&nbsp;<span className="text-pink-500">if</span> (!node) <span className="text-pink-500">return</span>;
                            </div>

                            {selectedAlgo === 'preorder' && (
                                <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'process' ? 'bg-green-500/20 border-l-2 border-green-400 text-green-200 font-bold' : 'pl-3'}`}>
                                    &nbsp;&nbsp;output.push(node.val); <span className="text-gray-500 text-xs italic">// Root</span>
                                </div>
                            )}
                            
                            <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'left' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                                &nbsp;&nbsp;traverse(node.left);
                            </div>

                            {selectedAlgo === 'inorder' && (
                                <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'process' ? 'bg-green-500/20 border-l-2 border-green-400 text-green-200 font-bold' : 'pl-3'}`}>
                                    &nbsp;&nbsp;output.push(node.val); <span className="text-gray-500 text-xs italic">// Root</span>
                                </div>
                            )}

                            <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'right' ? 'bg-orange-500/10 border-l-2 border-orange-400 text-orange-200' : 'pl-3'}`}>
                                &nbsp;&nbsp;traverse(node.right);
                            </div>

                            {selectedAlgo === 'postorder' && (
                                <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'process' ? 'bg-green-500/20 border-l-2 border-green-400 text-green-200 font-bold' : 'pl-3'}`}>
                                    &nbsp;&nbsp;output.push(node.val); <span className="text-gray-500 text-xs italic">// Root</span>
                                </div>
                            )}
                            <div className="px-2 py-0.5 my-0.5 pl-3">{"}"}</div>
                        </div>
                    </div>

                    {/* BOTTOM 50%: CALL STACK */}
                    <div className="flex-1 flex flex-col min-h-[220px]">
                        <h3 className="text-purple-400 font-bold mb-2 text-sm uppercase tracking-wider">Call Stack (LIFO)</h3>
                        <div className="flex-1 bg-[#0d1117] border-x-4 border-b-4 border-t-0 border-gray-700 rounded-b-xl p-3 flex flex-col justify-end overflow-hidden relative shadow-inner">
                            <div className="w-full flex flex-col-reverse gap-2">
                                {currentFrame.callStack && currentFrame.callStack.map((call, idx) => (
                                    <div 
                                        key={`${idx}-${call}`} 
                                        className="w-full bg-purple-500/20 border-2 border-purple-500/50 text-purple-200 text-center py-2 rounded-lg text-sm font-mono font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
                                    >
                                        {call}
                                    </div>
                                ))}
                            </div>
                            {(!currentFrame.callStack || currentFrame.callStack.length === 0) && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-sm tracking-widest uppercase">
                                    Stack Empty
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                </div>
            </>
      
    ):(
  <TutorialTab data={treeTraversalData[selectedAlgo]} />

)
}</ModuleFrame>
  );
};

export default TreeTraversal;
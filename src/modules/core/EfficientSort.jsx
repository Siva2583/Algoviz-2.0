import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuickSort } from './algorithm/sorting/algorithms/quickSort';
import { generateMergeSort } from './algorithm/sorting/algorithms/mergeSort';
import { generateHeapSort } from './algorithm/sorting/algorithms/heapSort';
import { sortingData } from './tutorials/sortingTutorialsData';
import TutorialTab from './tutorials/TutorialTab';

const EfficientSorts = () => {
    const navigate = useNavigate();
    const [inputStr, setInputStr] = useState("14,8,6,2,4,10,12");
    const [selectedAlgo, setSelectedAlgo] = useState("quick");
    const [isPaused, setIsPaused] = useState(false);
    const [isVisualizing, setIsVisualizing] = useState(false);
    const isPausedRef = useRef(false);
    const [speedDisplay, setSpeedDisplay] = useState(600);
    const speedRef = useRef(600);
    const [actionMessage, setActionMessage] = useState("AWAITING FOR THE USER TO START....");
    const [activeTab, setActiveTab] = useState('visualize');
    
    const [stats, setStats] = useState({ passes: 0, comps: 0, swaps: 0 });
    const [currentFrame, setCurrentFrame] = useState({
        array: [], 
        activeIndices: [], 
        sortedIndices: [], 
        isSwapping: false,
        pivotIndex: null,
        subArrayRange: [],
        codeLine: 'start',
        currentStats: { passes: 0, comps: 0, swaps: 0 }
    });

    useEffect(() => {
        if (!isVisualizing) {
            const arr = inputStr.split(',').filter(Boolean).map((val, idx) => ({
                id: `block-${idx}-${val}`,
                val: Number(val)
            }));
            setCurrentFrame({ 
                array: arr, activeIndices: [], sortedIndices: [], 
                isSwapping: false, pivotIndex: null, subArrayRange: [],
                codeLine: 'start', currentStats: { passes: 0, comps: 0, swaps: 0 }
            });
            setStats({ passes: 0, comps: 0, swaps: 0 });
        }
    // Input changes initialize the preview; completion must preserve the final frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputStr]);

    const handleInputChange = (e) => setInputStr(e.target.value.replace(/[^0-9,]/g, ''));

    const generateRandom = () => {
        const arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 99 + 1));
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
        setActionMessage(`Starting ${selectedAlgo.toUpperCase()} Sort...`);
        
        const parsedArray = inputStr.split(',').filter(Boolean).map(Number);
        let animations = [];

        if (selectedAlgo === 'quick') animations = generateQuickSort(parsedArray);
        else if (selectedAlgo === 'merge') animations = generateMergeSort(parsedArray);
        else if (selectedAlgo === 'heap') animations = generateHeapSort(parsedArray);

        
        for(let i=0; i<animations.length; i++) {
            await smartWait(speedRef.current);
            setCurrentFrame(animations[i]);
            setActionMessage(animations[i].msg);
            if (animations[i].currentStats) setStats(animations[i].currentStats);
        }
        setIsVisualizing(false);
    };

    const BLOCK_WIDTH = 64; 
    const GAP = 16;
    const getLeft = (index) => `${index * (BLOCK_WIDTH + GAP) + 40}px`;

    return (
        
        <div className="flex flex-col min-h-screen bg-[#0a0a0f] text-gray-200 font-sans p-4">
            <div className="flex justify-between items-start mb-6">
                <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 px-4 py-2 bg-[#080808] border border-gray-800 rounded-md hover:border-[#ffbf00]/30 transition-all duration-300 font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    >
                        <span className="text-[#ffbf00] font-bold group-hover:-translate-x-1 transition-transform duration-300">
                            {'<'}
                        </span>
                        <span className="text-gray-400 text-sm group-hover:text-white transition-colors duration-300">
                            cd ..
                        </span>
                        <span className="text-gray-600 text-xs tracking-widest border-l border-gray-800 pl-3 ml-1 group-hover:border-[#ffbf00]/50 transition-colors duration-300">
                            /ROOT
                        </span>
                    </button>
                <div className="flex flex-col w-72 max-w-full">
                    <div className="flex bg-[#080808] border border-gray-800 rounded-md p-1 relative shadow-[0_0_15px_rgba(0,0,0,0.8)] font-mono">
                        
                        <div 
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#ffbf00]/10 border border-[#ffbf00]/50 rounded-sm transition-all duration-300 ease-in-out"
                            style={{ left: activeTab === 'visualize' ? '4px' : 'calc(50% + 2px)' }}
                        ></div>

                        <button
                            onClick={() => setActiveTab('visualize')}
                            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
                                activeTab === 'visualize' ? 'text-[#ffbf00]' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <span className="text-xs opacity-50">[0]</span> VISUALIZE
                        </button>
                        <button
                            onClick={() => setActiveTab('tutorial')}
                            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
                                activeTab === 'tutorial' ? 'text-[#ffbf00]' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <span className="text-xs opacity-50">[1]</span> TUTORIAL
                        </button>
                    </div>
                    <div className="w-full relative h-8 font-mono text-[#ffbf00] font-bold overflow-hidden">
                        <div 
                            className="absolute transition-all duration-300 flex flex-col items-center"
                            style={{ left: activeTab === 'visualize' ? '25%' : '75%', transform: 'translateX(-50%)' }}
                        >
                            <span className="text-lg leading-none -mt-1">^</span>
                            <span className="text-[10px] leading-none uppercase tracking-widest mt-1">head_ptr</span>
                        </div>
                    </div>
                </div>
            </div>
            {activeTab === 'visualize' ? (
                <>
                    <div className='flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-4 gap-4 shadow-lg'>
                        <div className='flex items-center gap-2'>
                            <input 
                                type='text' onChange={handleInputChange} disabled={isVisualizing} value={inputStr}
                                className={`bg-gray-900 border px-4 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-48
                                    ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}
                            />
                            
                            <select 
                                value={selectedAlgo} onChange={(e) => setSelectedAlgo(e.target.value)} disabled={isVisualizing}
                                className="bg-gray-900 border border-gray-600 text-cyan-300 px-4 py-2 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                            >
                                <option value="quick">Quick Sort (Pivot)</option>
                                <option value="merge">Merge Sort (Divide)</option>
                                <option value="heap">Heap Sort (Tree)</option>
                            </select>

                            <button onClick={generateRandom} disabled={isVisualizing} className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50'>
                                🎲 Random
                            </button>
                        </div>
                        
                        <div className="hidden md:flex flex-col items-center gap-2">
                            <div className="text-gray-400 font-bold tracking-widest text-sm uppercase">O(N log N) ARCHITECTURES</div>
                            <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
                                <span className="text-[10px] text-gray-500 font-bold tracking-wider">SLOW</span>
                                <input type="range" step={50} min={100} max={2000} value={speedDisplay} onChange={handleSpeedChange} className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"/>
                                <span className="text-[10px] text-cyan-500 font-bold tracking-wider">FAST</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button onClick={togglePause} disabled={!isVisualizing} className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${!isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : isPaused ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' : 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600'}`}>
                                {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
                            </button>
                            <button onClick={handleVisualize} disabled={isVisualizing && !isPaused} className={`px-6 py-2 rounded-lg font-bold transition-all ${isVisualizing ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}>
                                ▶ START
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row flex-1 gap-4 overflow-hidden">
                        <div className="w-full xl:w-3/4 bg-gray-800/40 border border-gray-700 rounded-xl p-6 flex flex-col relative">
                            <div className="flex justify-between items-start mb-6 shrink-0">
                                <h2 className="text-xl font-bold text-gray-300 capitalize">{selectedAlgo} Sort Execution</h2>
                                <div className="bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-2 shadow-inner">
                                    <span className="text-pink-400 font-mono text-sm">Time: O(N log N) | Space: {selectedAlgo === 'merge' ? 'O(N)' : 'O(log N)'}</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 mb-8">
                                <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg w-32">
                                    <span className="text-xs text-gray-500 font-bold tracking-widest">RECURSIONS</span>
                                    <span className="text-2xl font-mono font-bold text-gray-300">{stats.passes}</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg w-32">
                                    <span className="text-xs text-gray-500 font-bold tracking-widest">COMPS</span>
                                    <span className="text-2xl font-mono font-bold text-cyan-400">{stats.comps}</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg w-32">
                                    <span className="text-xs text-gray-500 font-bold tracking-widest">SWAPS</span>
                                    <span className="text-2xl font-mono font-bold text-pink-400">{stats.swaps}</span>
                                </div>
                            </div>

                            {selectedAlgo === 'heap' ? (
                                <div className="flex-1 relative w-full bg-[#0a0a0f] border border-gray-700 rounded-xl overflow-hidden shadow-inner min-h-[400px]">
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
                                                    y: level * 90 + 40 + 40 
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
                                        const isActive = currentFrame.activeIndices.includes(index);
                                        const isSorted = currentFrame.sortedIndices.includes(index);
                                        const isSwapping = isActive && currentFrame.isSwapping;
                                        
                                        const level = Math.floor(Math.log2(index + 1));
                                        const pos = (index + 1) - Math.pow(2, level);
                                        const leftPercent = ((2 * pos + 1) / Math.pow(2, level + 1)) * 100;
                                        const topPx = level * 90 + 40;

                                        let style = 'bg-gray-800/80 border-gray-600 text-gray-400';
                                        if (isSorted) {
                                            style = 'bg-green-500/20 border-green-500 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)] z-10 scale-90';
                                        } else if (isSwapping) {
                                            style = 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.5)] z-30 scale-110';
                                        } else if (isActive) {
                                            style = 'bg-orange-500/20 border-orange-400 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.4)] z-20 scale-105';
                                        }

                                        return (
                                            <div
                                                key={item.id}
                                                className={`absolute w-16 h-16 -ml-8 rounded-full flex items-center justify-center text-xl font-mono font-bold transition-all duration-300 ease-in-out border-2 ${style}`}
                                                style={{ left: `${leftPercent}%`, top: `${topPx}px` }}
                                            >
                                                {item.val}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className='flex-1 relative w-full bg-gray-900/40 border border-gray-700 rounded-xl overflow-hidden shadow-inner min-h-[300px]'>
                                    {currentFrame.array.map((item, index) => {
                                        const isActive = currentFrame.activeIndices.includes(index);
                                        const isSorted = currentFrame.sortedIndices.includes(index);
                                        const isSwapping = isActive && currentFrame.isSwapping;
                                        const isPivot = currentFrame.pivotIndex === index;
                                        
                                        const inSubArray = currentFrame.subArrayRange.length === 0 || 
                                                          (index >= currentFrame.subArrayRange[0] && index <= currentFrame.subArrayRange[1]);

                                        let style = inSubArray ? 'bg-gray-700/80 border-gray-500 text-gray-300 scale-95' : 'bg-gray-900/50 border-gray-800 text-gray-600 scale-90 opacity-40';
                                        
                                        if (isSorted) {
                                            style = 'bg-green-500/20 border-green-500 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)] z-10';
                                        } else if (isSwapping) {
                                            style = 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.5)] z-30 scale-110';
                                        } else if (isPivot) {
                                            style = 'bg-orange-500/20 border-orange-400 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.4)] z-25 scale-105 ring-2 ring-orange-400/50';
                                        } else if (isActive) {
                                            style = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-20 scale-105';
                                        }

                                        return (
                                            <div
                                                key={item.id}
                                                className={`absolute w-16 h-20 rounded-xl flex items-center justify-center text-2xl font-mono font-bold transition-all duration-300 ease-in-out border-2 ${style}`}
                                                style={{ left: getLeft(index), top: `calc(100px + ${item.yOffset || 0}px)` }}
                                            >
                                                {item.val}
                                                {isPivot && <span className="absolute -top-6 text-xs text-orange-400 font-bold">PIVOT</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-4 h-16 w-full bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                                <p className="font-mono text-sm tracking-widest text-gray-200">
                                    {actionMessage}
                                </p>
                            </div>
                        </div>
                        
                        <div className="w-full xl:w-1/4 bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex flex-col">
                            <h3 className="text-indigo-400 font-bold mb-4">Live Algorithm</h3>
                            <div className="flex-1 bg-[#0d1117] rounded border border-gray-700 overflow-y-auto font-mono text-[13px] leading-relaxed p-2 text-gray-500 shadow-inner">
                                
                                {selectedAlgo === 'quick' && (
                                    <>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'start' ? 'bg-blue-500/10 border-l-2 border-blue-400 text-blue-200' : 'pl-3'}`}>
                                            <span className="text-pink-500">function</span> quickSort(arr, low, high) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'base_case' ? 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">if</span> (low &gt;= high) <span className="text-pink-500">return</span>;
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'partition' ? 'bg-orange-500/10 border-l-2 border-orange-400 text-orange-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">let</span> pi = partition(arr, low, high);
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'recurse_left' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;quickSort(arr, low, pi - 1);
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'recurse_right' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;quickSort(arr, pi + 1, high);
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">{"}"}</div>

                                        <div className="px-2 py-1 my-1 pl-3 mt-4 border-t border-gray-700/50 pt-3">
                                            <span className="text-gray-500">// Lomuto Partition Scheme</span>
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">
                                            <span className="text-pink-500">function</span> partition(arr, low, high) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'partition' ? 'bg-orange-500/10 border-l-2 border-orange-400 text-orange-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">let</span> pivot = arr[high];<br/>
                                            &nbsp;&nbsp;<span className="text-pink-500">let</span> i = low - 1;
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'compare' ? 'bg-indigo-500/10 border-l-2 border-indigo-400 text-indigo-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">for</span> (<span className="text-pink-500">let</span> j = low; j &lt; high; j++) {"{"}<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-500">if</span> (arr[j] &lt;= pivot) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'swap' ? 'bg-pink-500/10 border-l-2 border-pink-400 text-pink-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i++;<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap(arr, i, j);
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">
                                            &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>&nbsp;&nbsp;{"}"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'swap' ? 'bg-green-500/10 border-l-2 border-green-400 text-green-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;swap(arr, i + 1, high);<br/>
                                            &nbsp;&nbsp;<span className="text-pink-500">return</span> i + 1;
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">{"}"}</div>
                                    </>
                                )}
                                
                                {selectedAlgo === 'merge' && (
                                    <>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'start' ? 'bg-blue-500/10 border-l-2 border-blue-400 text-blue-200' : 'pl-3'}`}>
                                            <span className="text-pink-500">function</span> mergeSort(arr, l, r) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'base_case' ? 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">if</span> (l &gt;= r) <span className="text-pink-500">return</span>;
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'mid' ? 'bg-orange-500/10 border-l-2 border-orange-400 text-orange-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">let</span> m = Math.floor((l + r) / 2);
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'recurse_left' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;mergeSort(arr, l, m);
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'recurse_right' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;mergeSort(arr, m + 1, r);
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'merge_call' ? 'bg-yellow-500/10 border-l-2 border-yellow-400 text-yellow-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;merge(arr, l, m, r);
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">{"}"}</div>

                                        <div className="px-2 py-1 my-1 pl-3 mt-4 border-t border-gray-700/50 pt-3">
                                            <span className="text-gray-500">// Conquer / Merge Logic</span>
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">
                                            <span className="text-pink-500">function</span> merge(arr, l, m, r) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'buffer' ? 'bg-gray-500/20 border-l-2 border-gray-400 text-gray-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-gray-500">// Copy to temp arrays L[] and R[]</span>
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'compare' ? 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">while</span> (i &lt; n1 && j &lt; n2) {"{"}<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-500">if</span> (L[i] &lt;= R[j]) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'write_left' ? 'bg-green-500/10 border-l-2 border-green-400 text-green-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;arr[k] = L[i]; i++;
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'write_right' ? 'bg-pink-500/10 border-l-2 border-pink-400 text-pink-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;{"}"} <span className="text-pink-500">else</span> {"{"}<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;arr[k] = R[j]; j++;<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;{"}"}
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">&nbsp;&nbsp;{"}"}</div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'write_rem' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-gray-500">// Copy remaining elements</span>
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">{"}"}</div>
                                    </>
                                )}

                                {selectedAlgo === 'heap' && (
                                    <>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'start' ? 'bg-blue-500/10 border-l-2 border-blue-400 text-blue-200' : 'pl-3'}`}>
                                            <span className="text-pink-500">function</span> heapSort(arr) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'build_heap' ? 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-gray-500">// Build max heap</span><br/>
                                            &nbsp;&nbsp;<span className="text-pink-500">for</span> (<span className="text-pink-500">let</span> i = n/2 - 1; i &gt;= 0; i--) {"{"}<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;heapify(arr, n, i);<br/>
                                            &nbsp;&nbsp;{"}"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'extract' ? 'bg-orange-500/10 border-l-2 border-orange-400 text-orange-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-gray-500">// Extract elements</span><br/>
                                            &nbsp;&nbsp;<span className="text-pink-500">for</span> (<span className="text-pink-500">let</span> i = n - 1; i &gt; 0; i--) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'swap_root' ? 'bg-pink-500/10 border-l-2 border-pink-400 text-pink-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;swap(arr, 0, i);
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'heapify_root' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;heapify(arr, i, 0);
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">
                                            &nbsp;&nbsp;{"}"}<br/>{"}"}
                                        </div>

                                        <div className="px-2 py-1 my-1 pl-3 mt-4 border-t border-gray-700/50 pt-3">
                                            <span className="text-gray-500">// Sink-Down (Heapify) Logic</span>
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">
                                            <span className="text-pink-500">function</span> heapify(arr, size, i) {"{"}
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'pointers' ? 'bg-yellow-500/10 border-l-2 border-yellow-400 text-yellow-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">let</span> max = i;<br/>
                                            &nbsp;&nbsp;<span className="text-pink-500">let</span> left = 2i + 1, right = 2i + 2;
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'compare_children' ? 'bg-indigo-500/10 border-l-2 border-indigo-400 text-indigo-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">if</span> (left &lt; size && arr[left] &gt; arr[max])<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;max = left;<br/>
                                            &nbsp;&nbsp;<span className="text-pink-500">if</span> (right &lt; size && arr[right] &gt; arr[max])<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;max = right;
                                        </div>
                                        <div className={`transition-all duration-300 px-2 py-0.5 my-0.5 rounded ${currentFrame.codeLine === 'swap_heapify' ? 'bg-green-500/10 border-l-2 border-green-400 text-green-200' : 'pl-3'}`}>
                                            &nbsp;&nbsp;<span className="text-pink-500">if</span> (max !== i) {"{"}<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;swap(arr, i, max);<br/>
                                            &nbsp;&nbsp;&nbsp;&nbsp;heapify(arr, size, max);<br/>
                                            &nbsp;&nbsp;{"}"}
                                        </div>
                                        <div className="px-2 py-0.5 my-0.5 pl-3">{"}"}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <TutorialTab data={sortingData[selectedAlgo]} />
            )}
        </div>
    );
};

export default EfficientSorts;

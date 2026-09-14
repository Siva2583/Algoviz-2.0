import ModuleFrame from '../../lab/ModuleFrame';
import React,{useState,useEffect,useRef} from 'react';
import { generateWindow } from '../core/algorithm/sorting/algorithms/SlidingWindow';
import TutorialTab from '../core/tutorials/TutorialTab';
import { slidingWindowData } from '../core/tutorials/slidingWindowData';
const SlidingWindow=()=>{
    const [inputStr,setInputStr]=useState("4,6,2,8,10,12,14");
    const [targetsum,Settargetsum]=useState('20');
    const [curindexa,setCurIndexa]=useState(0);
    const [curindexb,setCurIndexb]=useState(0);
    const [isPaused,setIsPaused]=useState(false);
    const [isVisualizing,setIsVisualizing]=useState(false);
    const isPausedRef=useRef(false);
    const [activeTab,setActiveTab]=useState('visualize');
    const [activeTabInfo,setActiveTabInfo]=useState('objective');
    const [speedDisplay,setSpeedDisplay]=useState(600);
    const speedRef=useRef(600);
    const [actionMessage,setActionMessage]=useState("AWAITING FOR THE USER TO START....");
    const [currentAction,setCurrentAction]=useState("STARTING....");
    const [currentArray,setCurrentArray]=useState(inputStr.split(',').filter(Boolean).map(Number));
    const [currentSum, setCurrentSum] = useState(0);
    const [bestSize, setBestSize] = useState(Number.MAX_VALUE);
    useEffect(() => {
        if (!isVisualizing) {
          const arr = inputStr.split(',').filter(Boolean).map(Number);
          setCurrentArray(arr);
        }
      }, [inputStr, isVisualizing]);
    
      const handleInputChange = (e) => {
        const val = e.target.value.replace(/[^0-9,-]/g, '');
        setInputStr(val);
      };
    
      const handleTargetSumChange = (e) => {
        const val = e.target.value.replace(/[^0-9-]/g, '');
        Settargetsum(val);
      };
      const generateRandom = () => {
        const arr=[]
        let i=0;
        while(arr.length<7){
            arr[i++]=Math.floor(Math.random()*99+1);
        }
        setInputStr(arr.join(','));
        let l=Math.floor(Math.random() * arr.length)
        let r=Math.floor(Math.random() * arr.length)
        let lf=Math.min(r,l);
        let rf=Math.max(r,l);
        let sum=0;
        while(lf<=rf){
            sum+=arr[lf++];
        }
        Settargetsum(sum);
      };
      const togglePause=()=>{
        isPausedRef.current=!(isPausedRef.current);
        setIsPaused(isPausedRef.current);
    };
    const handleSpeedChange=(e)=>{
    const curspeed=Number(e.target.value);
    setSpeedDisplay(curspeed);
    speedRef.current=2100-curspeed;
};
    const smartWait=async(ms)=>{
        let step=20;
        let timePassed=0;
        while(timePassed<ms){
            while(isPausedRef.current){
                await new Promise(r=>setTimeout(r,50));
            }
            await new Promise(r=>setTimeout(r,step));
            timePassed+=step;
        }
    };
    const handleVisualize=async()=>{
        if(isVisualizing){
                return;
              }
        setCurrentSum(0);
        setBestSize(Number.MAX_VALUE);
        setActionMessage("Starting Visualization....");
        setIsVisualizing(true);
        setCurrentAction('start');
        setCurIndexa(-1);
        setCurIndexb(-1);
        const curarr=inputStr.split(',').filter(Boolean).map(Number);
        setCurrentArray(curarr);
        setIsPaused(false);
        isPausedRef.current = false;
        const animations=generateWindow(inputStr,targetsum);
        for(let i=0;i<animations.length;i++){
            let frame=animations[i];
            await smartWait(speedRef.current);
            setCurrentAction(frame.type);
            setCurrentSum(frame.sum);
            setCurIndexa(frame.L);
            setCurIndexb(frame.R);
            setActionMessage(frame.msg);
            if(frame.bestSize !== undefined){
              setBestSize(frame.bestSize);
            } 
            
        }
        setIsVisualizing(false);
    }
    return (
    <ModuleFrame activeTab={activeTab} onTabChange={setActiveTab} running={isVisualizing} paused={isPaused}>
            {activeTab === 'visualize' ? (
                <>
            <div className='av-module-toolbar flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-4 gap-4 shadow-lg'>
            <div className='flex items-center gap-2'>
                <input type='text' onChange={handleInputChange} disabled={isVisualizing} placeholder='Array..' aria-label="Input values" value={inputStr}
                className={`bg-gray-900 border px-4 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-48
                    ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}>
                </input>
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-2">
                    <span className='text-xs font-bold text-gray-500'>Target Sum</span>
                    <input type='text' onChange={handleTargetSumChange} aria-label="Target sum" value={targetsum} placeholder='Enter start index' disabled={isVisualizing}
                    className={`bg-gray-900 border px-3 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-32
                    ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}
                    />
                </div>
                <button onClick={generateRandom} disabled={isVisualizing} className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50'>
                    ↻ Random input
                </button>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2">
            <div className="text-gray-400 font-bold tracking-widest text-sm">SLIDING WINDOW</div>
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
            <h2 className="text-xl font-bold text-gray-300">Dynamic-Window Architecture</h2>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 w-3/5 shadow-inner">
              <div className="flex gap-2 mb-2 border-b border-gray-700 pb-2">
                <button onClick={() => setActiveTabInfo('objective')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'objective' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-400'}`}>Objective</button>
                <button onClick={() => setActiveTabInfo('technique')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'technique' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-500 hover:text-gray-400'}`}>Technique</button>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed min-h-[40px]">
                {activeTabInfo === 'objective' && <p><strong className="text-gray-300">Goal:</strong> To find the least size subarray who's sum results in target sum</p>}
                {activeTabInfo === 'technique' && <p><strong className="text-gray-300">Sliding Window:</strong>Imagine a dynamic sliding window along the array such that all element's sum in the window results in target sum given.... </p>}
              </div>
            </div>
        </div>
        {/*THE SCORE - CARD LIES HERE BITCH*/}
        <div className="flex justify-center gap-6 mb-12">
             <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg">
                <span className="text-xs text-gray-500 font-bold tracking-widest">TARGET</span>
                <span className="text-2xl font-mono font-bold text-gray-300">{targetsum}</span>
             </div>
             <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg">
                <span className="text-xs text-gray-500 font-bold tracking-widest">CURRENT SUM</span>
                <span className={`text-2xl font-mono font-bold transition-colors ${currentSum >= Number(targetsum) ? 'text-green-400' : 'text-cyan-400'}`}>{currentSum}</span>
             </div>
             <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl flex flex-col items-center shadow-lg">
                <span className="text-xs text-gray-500 font-bold tracking-widest">BEST SIZE (MINI)</span>
                <span className="text-2xl font-mono font-bold text-pink-400">{bestSize === Number.MAX_VALUE ? '?' : bestSize}</span>
             </div>
         </div>
         <div className='flex-1 flex flex-nowrap items-center justify-center gap-2 overflow-x-auto pb-8 px-4'>
          {currentArray.map((num,idx)=>{
            const isRunning=curindexa!==-1 && curindexb!==-1;
            const inWindow=idx>=curindexa && idx<=curindexb && isRunning;
            const isL=isRunning && idx===curindexa;
            const isR=isRunning && idx===curindexb;
            let style='bg-gray-900/50 border-gray-700 text-gray-600 scale-95 opacity-60';
            if(inWindow){
              style='bg-cyan-500/10 border-cyan-500/50 text-cyan-200 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.2)]';
            }
            if (inWindow && currentSum >= Number(targetsum)) {
                   style = 'bg-green-500/20 border-green-500 text-green-200 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)] z-10';
            }
            if (isL && currentAction === 'shrink_left') {
                style = 'bg-red-500/20 border-red-500 text-red-200 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)] z-10';
            }
            let borders = 'border-2';
            if (inWindow && !isL && !isR)
              borders = 'border-y-2 border-x-0 border-y-amber-400';

            if (inWindow && isL && curindexa !== curindexb)
              borders = 'border-y-2 border-y-amber-400 border-l-4 border-r-0 border-l-amber-400 rounded-l-xl rounded-r-none';

            if (inWindow && isR && curindexa !== curindexb)
              borders = 'border-y-2 border-y-amber-400 border-r-4 border-l-0 border-r-amber-400 rounded-r-xl rounded-l-none';

            if (inWindow && isL && isR)
              borders = 'border-2 border-x-4 border-amber-400 rounded-xl';
            return(
              <div key={idx} className="flex flex-col items-center gap-2 relative">
                      <span className="text-xs font-mono text-gray-500 mb-2">arr[{idx}]</span>
                      <div className={`w-16 h-20 flex items-center justify-center text-2xl font-mono font-bold transition-all duration-300 ${style} ${borders}`}>
                         {num}
                      </div>
                      
                      {/* Pointer Indicators */}
                      <div className="h-6 mt-2 relative w-full flex justify-center">
                         {isL && <span className="absolute text-xs font-bold text-pink-400">L</span>}
                         {isR && <span className="absolute text-xs font-bold text-pink-400 mt-4">R</span>}
                      </div>
                   </div>

            );

          })}

         </div>
         <div className="mt-auto h-16 w-full bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner">
             <p className="font-mono text-sm tracking-widest text-gray-200">
               {actionMessage}
             </p>
          </div>
          </div>
          {/* RIGHT PANEL: ALGORITHM (25%) */}
        {/* RIGHT PANEL: ALGORITHM (25%) */}
        <div className="w-full xl:w-1/4 bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex flex-col">
            <h3 className="text-indigo-400 font-bold mb-4">Live Algorithm</h3>
            <div className="flex-1 bg-[#0d1117] rounded border border-gray-700 overflow-y-auto font-mono text-[13px] leading-relaxed p-2 text-gray-500">
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'start' ? 'bg-blue-500/10 border-l-2 border-blue-400 text-blue-200' : 'pl-3'}`}>
                    <span className="text-pink-500">let</span> L = 0, sum = 0, mini = <span className="text-orange-400">Infinity</span>;
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'expand_right' ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-3'}`}>
                    <span className="text-pink-500">for</span> (<span className="text-pink-500">let</span> R = 0; R &lt; arr.length; R++) {"{"}<br/>
                    &nbsp;&nbsp;sum += arr[R];
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'check_condition' ? 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-200' : 'pl-3'}`}>
                    &nbsp;&nbsp;<span className="text-pink-500">while</span> (sum &gt;= target) {"{"}
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'record_best' ? 'bg-green-500/10 border-l-2 border-green-400 text-green-200' : 'pl-3'}`}>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-500">if</span> (sum === target) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mini = Math.min(mini, R - L + 1);<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{"}"}
                </div>
                
                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'shrink_left' ? 'bg-red-500/10 border-l-2 border-red-400 text-red-200' : 'pl-3'}`}>
                    &nbsp;&nbsp;&nbsp;&nbsp;sum -= arr[L];<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;L++;
                </div>
                
                <div className="px-2 py-1 my-1 pl-3">
                    &nbsp;&nbsp;{"}"}<br/>
                    {"}"}
                </div>

                <div className={`transition-all duration-300 px-2 py-1 my-1 rounded ${currentAction === 'result' ? 'bg-green-500/20 border-l-2 border-green-400 text-green-200 font-bold' : 'pl-3'}`}>
                    <span className="text-pink-500">return</span> mini === <span className="text-orange-400">Infinity</span> ? 0 : mini;
                </div>

            </div>
        </div>
        </div>
        </>
            ) : (
                <TutorialTab data={slidingWindowData.slidingWindow} />
            )}
        </ModuleFrame>
    );
};
export default SlidingWindow;
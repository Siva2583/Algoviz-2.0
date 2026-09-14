import ModuleFrame from '../../lab/ModuleFrame';
import React,{useState,useEffect,useRef} from 'react';
import { generatePrefix } from '../core/algorithm/sorting/algorithms/prefixSumLogic';
import TutorialTab from '../core/tutorials/TutorialTab';
import { prefixSumData } from '../core/tutorials/prefixSumData';
const PrefixSum=()=>{
    const [inputStr,setInputStr]=useState("2,4,6,8,10,12,14");
    const [targetL,setTargetL]=useState(0);
    const [targetR,setTargetR]=useState(4);
    const [curindex,setCurIndex]=useState(0);
    const [isPaused,setIsPaused]=useState(false);
    const [isVisualizing,setIsVisualizing]=useState(false);
    const isPausedRef=useRef(false);
    const [activeTabInfo,setActiveTabInfo]=useState('objective');
    const [activeTab,setActiveTab]=useState('visualize');
    const [speedDisplay,setSpeedDisplay]=useState(600);
    const [prefixArray, setPrefixArray] = useState([]);
    const speedRef=useRef(600);
    const [actionMessage,setActionMessage]=useState("AWAITING FOR THE USER TO START....");
    const [currentAction,setCurrentAction]=useState("STARTING....");
    const [currentArray,setCurrentArray]=useState(inputStr.split(',').filter(Boolean).map(Number));
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
    
      const handleTargetLChange = (e) => {
        const val = e.target.value.replace(/[^0-9-]/g, '');
        setTargetL(val);
      };
      const handleTargetRChange = (e) => {
        const val = e.target.value.replace(/[^0-9-]/g, '');
        setTargetR(val);
      };
    
      const generateRandom = () => {
        const arr=[]
        let i=0;
        while(arr.length<6){
            arr[i++]=Math.floor(Math.random()*99+1);
        }
        setInputStr(arr.join(','));
        let l=Math.floor(Math.random() * arr.length)
        let r=Math.floor(Math.random() * arr.length)
        setTargetL(String(Math.min(r,l)));
        setTargetR(String(Math.max(r,l)));
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
    const handleVisualize= async()=>{
      if(isVisualizing){
        return;
      }
      setActionMessage("Starting Visualization....");
      setIsVisualizing(true);
      setCurrentAction('start');
      setCurIndex('-1');
      setPrefixArray([]);
      const curarr=inputStr.split(',').filter(Boolean).map(Number);
      setCurrentArray(curarr);
      setIsPaused(false);
      const animations=generatePrefix(inputStr,targetL,targetR);
      for(let i=0;i<animations.length;i++){
        let frame=animations[i];
        await smartWait(speedRef.current);
        setCurrentAction(frame.type);
        setActionMessage(frame.msg);
        if (frame.currentPrefixArray) {
            setPrefixArray(frame.currentPrefixArray);
        }
        if (frame.activeIndex !== undefined) {
            setCurIndex(frame.activeIndex);
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
            <span className='text-xs font-bold text-gray-500'>Statrt Index</span>
            <input type='text' onChange={handleTargetLChange} aria-label="Left range index" value={targetL} placeholder='Enter start index' disabled={isVisualizing}
            className={`bg-gray-900 border px-3 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-32
              ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}
            />
          </div>
          <div className='flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-2'>
            <span className='text-xs font-bold text-gray-500'>End Index</span>
            <input type='text' onChange={handleTargetRChange} aria-label="Right range index" value={targetR} placeholder='Enter end index' disabled={isVisualizing}
            className={`bg-gray-900 border px-3 py-2 rounded-lg font-mono text-cyan-300 focus:outline-none focus:ring-2 transition-all w-32
              ${isVisualizing ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 focus:ring-cyan-500'}`}
            />
          </div>
          <button onClick={generateRandom} disabled={isVisualizing} className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50'>
            ↻ Random input
          </button>
          </div>
          <div className="hidden md:flex flex-col items-center gap-2">
            <div className="text-gray-400 font-bold tracking-widest text-sm">PREFIX SUM MODULE</div>
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
            <h2 className="text-xl font-bold text-gray-300">Dual-Track Architecture</h2>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 w-3/5 shadow-inner">
              <div className="flex gap-2 mb-2 border-b border-gray-700 pb-2">
                <button onClick={() => setActiveTabInfo('objective')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'objective' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-400'}`}>Objective</button>
                <button onClick={() => setActiveTabInfo('technique')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTabInfo === 'technique' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-500 hover:text-gray-400'}`}>Technique</button>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed min-h-[40px]">
                {activeTabInfo === 'objective' && <p><strong className="text-gray-300">Goal:</strong> To reduce Range Sum Query Time Complexity from O(N) to <strong className="text-green-400">O(1)</strong> time.</p>}
                {activeTabInfo === 'technique' && <p><strong className="text-gray-300">Prefix Sum:</strong> Pre-calculate the running total. To find a sub-array sum, take the total at R and subtract the unwanted "trash" before L.</p>}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-nowrap items-start justify-center gap-6 mt-8 overflow-x-auto pt-10 pb-20 px-4">
             {currentArray.map((topNum, idx) => {
                
                const isTopActive = currentAction === 'calc_sum' && idx === curindex;
                const isFirstDrop = currentAction === 'drop_box' && idx === 0;
                const isPhase2 = ['start_query', 'grab_total', 'grab_trash', 'subtract', 'result'].includes(currentAction);
                const isTarget = idx >= targetL && idx <= targetR;
                const isTopDimmed = isPhase2 && !isTarget;
                const bottomNum = prefixArray[idx];
                const hasBottom = bottomNum !== undefined;

                const isJustDropped = currentAction === 'drop_box' && idx === 0;
                const isPrevSum = currentAction === 'calc_sum' && idx === curindex - 1;
                const isNewSum = currentAction === 'commit_sum' && idx === curindex;
                
                const isTotal = isPhase2 && idx == targetR && currentAction !== 'start_query';
                const isTrash = isPhase2 && idx == targetL - 1 && targetL > 0 && currentAction !== 'start_query';
                const isSubtractingTrash = currentAction === 'subtract' && isTrash;

                let bottomStyle = 'bg-gray-800 border-gray-600 text-gray-300';
                
                if (isJustDropped || isNewSum) bottomStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10';
                else if (isPrevSum) bottomStyle = 'bg-purple-500/20 border-purple-400 text-purple-300 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10';
                else if (isTotal) bottomStyle = 'bg-green-500/20 border-green-400 text-green-300 scale-110 shadow-[0_0_20px_rgba(74,222,128,0.5)] z-20';
                else if (isTrash && !isSubtractingTrash) bottomStyle = 'bg-red-500/20 border-red-400 text-red-300 scale-110 shadow-[0_0_20px_rgba(248,113,113,0.5)] z-20';
                else if (isPhase2) bottomStyle = 'bg-gray-900/40 border-gray-700 text-gray-600 scale-90 opacity-50';
                if (isSubtractingTrash) bottomStyle += ' translate-y-24 scale-50 opacity-0 pointer-events-none z-0';

                return (
                   <div key={idx} className="flex flex-col gap-16 relative">
                    
                       <div className="flex flex-col items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">arr[{idx}]</span>
                          <div className={`w-16 h-16 border-2 flex items-center justify-center text-xl font-mono font-bold rounded-lg transition-all duration-500 
                            ${isTopDimmed ? 'opacity-30 bg-gray-900 border-gray-700 text-gray-600' : 'bg-gray-800 border-cyan-500/50 text-cyan-100'} 
                            ${isTopActive || isFirstDrop ? 'bg-blue-500/20 border-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10' : ''}`}>
                             {topNum}
                          </div>
                       </div>

                       {isTopActive && idx > 0 && (
                          <svg className="absolute w-24 h-24 top-20 -left-[3.25rem] z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                             <line x1="10" y1="80" x2="80" y2="10" stroke="#a855f7" strokeWidth="3" strokeDasharray="6,6" className="animate-pulse" />
                          </svg>
                       )}
                       {isFirstDrop && (
                          <div className="absolute w-1 h-12 bg-cyan-400 top-24 left-1/2 -translate-x-1/2 animate-pulse rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                       )}
                       <div className="flex flex-col items-center gap-2">
                          {hasBottom ? (
                             <div className={`w-16 h-16 border-2 flex items-center justify-center text-xl font-mono font-bold rounded-lg transition-all duration-700 relative ${bottomStyle}`}>
                                {bottomNum}
                                {isTotal && <span className="absolute -top-6 text-[10px] text-green-400 tracking-widest font-bold whitespace-nowrap">TOTAL</span>}
                                {isTrash && !isSubtractingTrash && <span className="absolute -top-6 text-[10px] text-red-400 tracking-widest font-bold whitespace-nowrap">TRASH</span>}
                             </div>
                          ) : (
                             <div className="w-16 h-16 border-2 border-dashed border-gray-700/50 rounded-lg bg-gray-900/30"></div>
                          )}
                          <span className="text-xs font-mono text-gray-500">P[{idx}]</span>
                       </div>

                   </div>
                )
             })}
          
          </div>
          <div className={`mt-auto h-16 w-full bg-gray-900/80 border rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300
            ${currentAction === 'result' ? 'border-green-500/50' : currentAction === 'grab_trash' ? 'border-red-500/50' : currentAction === 'calc_sum' ? 'border-purple-500/50' : 'border-gray-700'}
          `}>
            <p className={`font-mono text-sm tracking-widest transition-colors ${currentAction === 'none' ? 'text-gray-500' : 'text-gray-200'}`}>
              {actionMessage}
            </p>
          </div>

        </div>

        <div className="w-full xl:w-1/4 bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex flex-col">

            <h3 className="text-indigo-400 font-bold mb-4">Live Algorithm</h3>

            <div className="flex-1 bg-[#0d1117] rounded border border-gray-700">

                <div className="overflow-y-auto h-full font-mono text-[13px] leading-relaxed custom-scrollbar p-4 text-gray-600">

                <div className="text-pink-500">function <span className="text-blue-400">buildPrefix</span>(arr) {"{"}</div>
                <div className={`transition-all duration-300 my-2 px-2 rounded ${['start_build', 'drop_box', 'calc_sum', 'commit_sum'].includes(currentAction) ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-200' : 'pl-2'}`}>
                  <span className="text-pink-500">let</span> P = <span className="text-pink-500">new</span> Array(arr.length);<br/>
                  P[0] = arr[0];<br/>
                  <span className="text-pink-500">for</span> (<span className="text-pink-500">let</span> i = 1; i &lt; arr.length; i++) {"{"}<br/>
                  &nbsp;&nbsp;P[i] = P[i-1] + arr[i];<br/>
                  {"}"}<br/>
                  <span className="text-pink-500">return</span> P;
                </div>
                <div>{"}"}</div>
                <br/>
                <div className="text-pink-500">function <span className="text-blue-400">rangeQuery</span>(P, L, R) {"{"}</div>
               
                <div className={`transition-all duration-300 my-2 px-2 rounded ${['start_query', 'grab_total', 'grab_trash', 'subtract', 'result'].includes(currentAction) ? 'bg-green-500/10 border-l-2 border-green-400 text-green-200' : 'pl-2'}`}>

                  <span className="text-gray-500">// O(1) Time Math</span><br/>

                  <span className="text-pink-500">if</span> (L === 0) <span className="text-pink-500">return</span> P[R];<br/>

                  <span className="text-pink-500">return</span> P[R] - P[L - 1];

                </div><div>{"}"}</div>
              </div>
            </div>
            </div>
        </div>
        </>
            ) : (
                <TutorialTab data={prefixSumData.prefixSum} />
            )}
        </ModuleFrame>
    );
};
export default PrefixSum; 


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { CORE_MODULES, PATTERN_MODULES } from '../constants';
import Algocards from './Algocards'; 
import '../styles/global.css';

const CardsGrid = () => {
  const { activeMode } = useMode();
  const navigate = useNavigate(); 
  const [visitorCount, setVisitorCount] = useState("...");

  const currentModules = activeMode === 'algo' ? CORE_MODULES : PATTERN_MODULES;

  useEffect(() => {
    const fetchCount = async () => {
      const hasVisited = localStorage.getItem('algoviz_visited');

      try {
        if (!hasVisited) {
          const res = await fetch('https://countapi.mileshilliard.com/api/v1/hit/algoviz-siva-2026');
          const data = await res.json();
          setVisitorCount(data.value);
          localStorage.setItem('algoviz_visited', 'true');
        } else {
          const res = await fetch('https://countapi.mileshilliard.com/api/v1/get/algoviz-siva-2026');
          const data = await res.json();
          setVisitorCount(data.value);
        }
      } catch {
        setVisitorCount("Live");
      }
    };

    fetchCount();
  }, []);

  return (
    <>
      <div className="grid-container">
        <div className={`cards-wrapper ${activeMode === 'algo' ? 'grid-algo' : 'grid-pattern'}`}>
          {currentModules.map((module) => (
            <div 
              key={module.id}
              onClick={() => navigate(module.path)} 
              style={{ cursor: 'pointer' }} 
            >
              <Algocards 
                title={module.title}
                desc={module.desc} 
                path={module.path}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mt-12 border-t border-gray-800/80 bg-[#050508] p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-50">
          
          <div className="text-gray-500 font-mono text-xs tracking-widest flex items-center gap-2">
              <span className="text-[#ffbf00]">©</span> 
              2026 SIVA CHARAN K.G. 
              <span className="text-gray-700 hidden md:inline">|</span> 
              <span className="hidden md:inline text-gray-600">ALL RIGHTS RESERVED</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 opacity-60">
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-cyan-400 font-mono tracking-wider">REACT</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-green-400 font-mono tracking-wider">JAVASCRIPT</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-blue-400 font-mono tracking-wider">TAILWIND</span>
          </div>

          <div className="flex items-center gap-3 bg-[#0a0a0f] border border-gray-800 px-4 py-1.5 rounded-md shadow-inner">
              <div className="flex items-center gap-2 border-r border-gray-800 pr-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">System Online</span>
              </div>
              <div className="flex items-center gap-2 pl-1">
                  <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Visits</span>
                  <span className="text-sm font-mono text-[#ffbf00] font-bold tracking-wider">{visitorCount}</span>
              </div>
          </div>
      </div>
    </>
  );
};

export default CardsGrid;
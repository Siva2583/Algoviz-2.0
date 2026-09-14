import React from 'react';
import { useMode } from '../context/ModeContext';

const ModeToggle = () => {
  const { activeMode, setActiveMode } = useMode();

  return (
    <div className={`dll-toggle ${activeMode === 'algo' ? 'algo-mode' : 'pattern-mode'}`}>
      
      <div 
        className={`dll-node ${activeMode === 'algo' ? 'active-algo' : ''}`}
        onClick={() => setActiveMode('algo')}
      >
        <span>Algo Visualizer</span>
      </div>
      <div className="dll-arrows">
         <div className="arrow-line arrow-top">&larr;</div>
         
         <div className="arrow-line arrow-bottom">&rarr;</div>
      </div>

      <div 
        className={`dll-node ${activeMode === 'pattern' ? 'active-pattern' : ''}`}
        onClick={() => setActiveMode('pattern')}
      >
        <span>Pattern Visualizer</span>
      </div>

    </div>
  );
};

export default ModeToggle;
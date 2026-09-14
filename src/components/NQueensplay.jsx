import React, { useState } from 'react';

  const ArrayDisplay = ({ title, data }) => (
    <div className="flex flex-col items-center mx-2 mt-4 w-full">
      <span className="font-bold mb-3 text-slate-300 text-xs tracking-widest uppercase">{title}</span>
      <div className="flex gap-1 flex-wrap justify-center">
        {data.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 mb-1">{idx}</span>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border font-mono text-xs sm:text-sm shadow-sm rounded transition-colors
              ${val !== -1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800/80 border-slate-700/50 text-slate-500'}`}>
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );


const NQueensplay= () => {
  const [n, setN] = useState(4);
  const [queens, setQueens] = useState([]);
  const [errorCell, setErrorCell] = useState(null);

  const cols = new Array(n).fill(-1);
  const d1 = new Array(2 * n).fill(-1);
  const d2 = new Array(2 * n).fill(-1);

  queens.forEach(({ row, col }) => {
    cols[col] = row;
    d1[row + col] = row;
    d2[col - row + n] = row;
  });

  const handleCellClick = (row, col) => {
    const isQueenHere = queens.some(q => q.row === row && q.col === col);
    if (isQueenHere) {
      setQueens(queens.filter(q => !(q.row === row && q.col === col)));
      setErrorCell(null);
      return;
    }

    if (cols[col] !== -1 || d1[row + col] !== -1 || d2[col - row + n] !== -1) {
      setErrorCell({ row, col });
      setTimeout(() => setErrorCell(null), 400);
      return;
    }

    setQueens([...queens, { row, col }]);
    setErrorCell(null);
  };

  const renderLines = () => {
    return queens.map((q, idx) => {
      const cx = (q.col + 0.5) * (100 / n);
      const cy = (q.row + 0.5) * (100 / n);

      return (
        <g key={idx} stroke="rgba(148, 163, 184, 0.4)" strokeWidth="0.5" strokeDasharray="1.5,1.5">
          <line x1={cx} y1="-50" x2={cx} y2="150" />
          <line x1="-50" y1={cy} x2="150" y2={cy} />
          <line x1={cx - 150} y1={cy - 150} x2={cx + 150} y2={cy + 150} />
          <line x1={cx - 150} y1={cy + 150} x2={cx + 150} y2={cy - 150} />
        </g>
      );
    });
  };


  return (
    <div className="flex flex-col items-center p-6 sm:p-10 bg-[#16181d] rounded-2xl shadow-2xl w-full max-w-5xl mx-auto font-sans text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-8 px-2 border-b border-slate-700/50 pb-6 gap-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">N-Queens Array Visualizer</h2>
        <div className="flex gap-6 text-xs sm:text-sm font-mono tracking-wider">
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-slate-400 uppercase text-[10px] sm:text-xs mb-1">Queens</span>
            <span className="text-white font-bold">{queens.length} / {n}</span>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-slate-400 uppercase text-[10px] sm:text-xs mb-1">State</span>
            <span className="text-emerald-400 font-bold">{queens.length === n ? 'Solved!' : 'Placing...'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mb-8 w-full px-2 justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-slate-300 text-sm tracking-wide">Board Size (N):</label>
          <input 
            type="range" 
            min="4" 
            max="8" 
            value={n} 
            onChange={(e) => {
              setN(parseInt(e.target.value));
              setQueens([]);
            }}
            className="cursor-pointer w-24 sm:w-32 accent-indigo-500"
          />
          <span className="text-indigo-400 font-mono font-bold w-4">{n}</span>
        </div>
        <button 
          onClick={() => setQueens([])}
          className="px-4 py-2 bg-slate-800/50 text-rose-400 border border-slate-700/50 hover:border-rose-500/50 rounded-lg hover:bg-rose-500/10 font-semibold shadow-sm transition-all text-xs uppercase tracking-widest"
        >
          Clear Board
        </button>
      </div>

      <div className="relative w-full max-w-[500px] aspect-square rounded-xl border-2 border-slate-700/80 overflow-hidden bg-[#1a1c23] shadow-2xl mb-12">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {renderLines()}
        </svg>

        <div className="absolute inset-0 grid z-20" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>
          {Array.from({ length: n * n }).map((_, i) => {
            const row = Math.floor(i / n);
            const col = i % n;
            const isBlack = (row + col) % 2 === 1;
            const hasQueen = queens.find(q => q.row === row && q.col === col);
            const isError = errorCell && errorCell.row === row && errorCell.col === col;

            return (
              <div 
                key={i}
                onClick={() => handleCellClick(row, col)}
                className={`
                  relative flex items-center justify-center cursor-pointer transition-all duration-300
                  ${isBlack ? 'bg-slate-800/40' : 'bg-transparent'}
                  ${isError ? 'bg-rose-500/30' : 'hover:bg-indigo-500/10'}
                `}
              >
                {hasQueen && (
                  <div className="absolute flex flex-col items-center justify-center z-30 animate-in zoom-in duration-200">
                    <div className="bg-slate-900 border border-indigo-500/50 text-indigo-300 text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mb-1 shadow-lg tracking-wider">
                      R{hasQueen.row}
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-500/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] border-2 border-indigo-400">
                       <span className="text-indigo-100 text-lg sm:text-2xl drop-shadow-md">♛</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-900/50 p-6 sm:p-8 rounded-xl border border-slate-800/80">
        <ArrayDisplay title="Columns" data={cols} />
        <ArrayDisplay title="Major Diagonal ( \ )" data={d1} />
        <ArrayDisplay title="Minor Diagonal ( / )" data={d2} />
      </div>
    </div>
  );
};

export default NQueensplay;
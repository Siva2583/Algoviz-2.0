
import React from 'react';

const Algocards = ({ title, desc, path }) => {
  
  return (
    <div 
      className="algo-card" 
      onClick={() => console.log(`Navigating to: ${path}`)}
    >
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      
      <p className="card-desc">{desc}</p>
      
      <div className="card-footer">
        <span className="visualize-btn">Visualize &rarr;</span>
      </div>
    </div>
  );
};

export default Algocards;
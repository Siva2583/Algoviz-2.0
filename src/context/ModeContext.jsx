import React, { createContext, useState, useContext } from 'react';
const ModeContext = createContext();
export const ModeProvider = ({ children }) => {
  const [activeMode, setActiveMode] = useState('algo');

  return (
    <ModeContext.Provider value={{ activeMode, setActiveMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
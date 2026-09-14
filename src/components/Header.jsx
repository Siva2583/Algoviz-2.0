import React from 'react';
import ModeToggle from './ModeToggle';
import Logo from '../pages/logo.png';
import '../styles/global.css';

const Header = () => {
  return (
    <nav className="navbar flex items-center w-full px-6 py-4 border-b border-gray-800/50">
      <div className="flex-1 flex items-center gap-3 justify-start font-mono text-xs md:text-sm">
        <a 
            href="https://github.com/Siva2583" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 px-3 py-1.5 rounded bg-[#0a0a0f] border border-gray-800 hover:border-gray-600"
        >
            <span className="text-[#ffbf00]">{'{'}</span> GitHub <span className="text-[#ffbf00]">{'}'}</span>
        </a>
        
        <a 
            href="https://www.linkedin.com/in/siva-charan-kg-72a900284/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 px-3 py-1.5 rounded bg-[#0a0a0f] border border-gray-800 hover:border-blue-500/50"
        >
            <span className="text-blue-500 font-bold">in</span> LinkedIn
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ModeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-end">
        <img src={Logo} alt="AlgoViz Logo" className="nav-logo" />
      </div>
    </nav>
  );
};

export default Header;
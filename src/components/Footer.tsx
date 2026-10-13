import React from 'react';
import { Film, Code2, Heart } from 'lucide-react';

interface FooterProps {
  onOpenPythonHub: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPythonHub, onNavigateSection }) => {
  return (
    <footer className="w-full border-t border-neutral-800/80 bg-neutral-950 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Film className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            CineMatch AI
          </span>
          <span className="text-xs text-neutral-500 ml-2">
            · Movie Recommendation System
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
          <button
            onClick={() => onNavigateSection('discover')}
            className="hover:text-white transition-colors"
          >
            Discover
          </button>
          <button
            onClick={() => onNavigateSection('recommendations')}
            className="hover:text-white transition-colors"
          >
            Recommendations
          </button>
          <button
            onClick={() => onNavigateSection('trending')}
            className="hover:text-white transition-colors"
          >
            Trending
          </button>
          <button
            onClick={() => onNavigateSection('ml-architecture')}
            className="hover:text-white transition-colors"
          >
            ML Architecture
          </button>
          <button
            onClick={onOpenPythonHub}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Code2 className="w-3 h-3" />
            <span>Python Project Hub</span>
          </button>
        </div>

        {/* Portfolio Credit */}
        <div className="text-xs text-neutral-500 font-mono">
          Portfolio Project · TMDB 5000 Content-Based Model
        </div>
      </div>
    </footer>
  );
};

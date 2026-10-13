import React from 'react';
import { Film, Code2, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenPythonHub: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPythonHub, onNavigateSection }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Film className="w-4 h-4" />
          </div>
          <span>CineMatch AI</span>
        </a>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onNavigateSection('discover')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Discover
          </button>
          <button
            onClick={() => onNavigateSection('recommendations')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Recommendations
          </button>
          <button
            onClick={() => onNavigateSection('trending')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Trending
          </button>
          <button
            onClick={() => onNavigateSection('ml-architecture')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            ML Architecture
          </button>
          <button
            onClick={onOpenPythonHub}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 text-left flex items-center gap-1.5"
          >
            <span>Python & GitHub Hub</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenPythonHub}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/10"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Codebase</span>
          </button>
        </div>
      </div>
    </header>
  );
};

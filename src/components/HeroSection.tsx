import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Film, ArrowRight, Check } from 'lucide-react';
import { Movie } from '../types/movie';

interface HeroSectionProps {
  movies: Movie[];
  selectedMovie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onGenerateRecommendations: () => void;
  isLoading: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  movies,
  selectedMovie,
  onSelectMovie,
  onGenerateRecommendations,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState(selectedMovie.title);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(selectedMovie.title);
  }, [selectedMovie]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const quickPicks = [
    "Inception",
    "The Dark Knight",
    "Interstellar",
    "Pulp Fiction",
    "The Matrix",
    "Parasite",
    "Spirited Away"
  ];

  return (
    <section id="discover" className="relative pt-12 pb-20 px-6 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[250px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* Subtle kicker without pill enclosure */}
        <div className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
          Machine Learning · Content-Based Filtering
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Favorite Movie</span>
        </h1>

        {/* Value proposition prose */}
        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Powered by real TF-IDF text vectorization and cosine similarity on TMDB 5000 metadata. Select any title to uncover stylistically and thematically similar masterpieces.
        </p>

        {/* Interactive Search & Recommend Box */}
        <div className="pt-4 max-w-2xl mx-auto" ref={dropdownRef}>
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-2xl backdrop-blur-xl">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search by movie title, director, or genre..."
                className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onGenerateRecommendations();
              }}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-semibold text-sm rounded-lg transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading ? (
                <span>Computing Vectors...</span>
              ) : (
                <>
                  <span>Recommend Movies</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Dropdown Results */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-neutral-900/95 border border-neutral-800 rounded-xl shadow-2xl z-50 divide-y divide-neutral-800/60 backdrop-blur-xl">
                {filteredMovies.length === 0 ? (
                  <div className="p-4 text-xs text-neutral-400 text-center">
                    No movies found matching "{searchQuery}". Try "Inception", "Nolan", or "Action".
                  </div>
                ) : (
                  filteredMovies.slice(0, 10).map((m) => {
                    const isSelected = m.id === selectedMovie.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSelectMovie(m);
                          setSearchQuery(m.title);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-neutral-800/70 transition-colors flex items-center justify-between gap-3 ${
                          isSelected ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-sm font-medium text-white flex items-center gap-2">
                            <span>{m.title}</span>
                            <span className="text-xs text-neutral-500">({m.release_year})</span>
                          </div>
                          <div className="text-xs text-neutral-400 truncate mt-0.5">
                            {m.director} · {m.genres.join(', ')}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Picks for First-Time Users */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400">
            <span className="text-neutral-500 font-medium mr-1">Quick picks:</span>
            {quickPicks.map((pick) => {
              const movieObj = movies.find(m => m.title.toLowerCase() === pick.toLowerCase());
              if (!movieObj) return null;
              const active = selectedMovie.id === movieObj.id;
              return (
                <button
                  key={pick}
                  type="button"
                  onClick={() => {
                    onSelectMovie(movieObj);
                    setSearchQuery(movieObj.title);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {pick}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions / Micro-guidance banner */}
        <div className="pt-2 text-xs text-neutral-500 max-w-lg mx-auto">
          Tip: Pick any movie from our TMDB dataset above, or click on any recommendation card below to pivot recommendations around it.
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Flame, Star, ArrowUpRight } from 'lucide-react';
import { Movie } from '../types/movie';
import { MoviePoster } from './MoviePoster';

interface TrendingSectionProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenMovieModal: (movie: Movie) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  movies,
  onSelectMovie,
  onOpenMovieModal
}) => {
  const [activeCategory, setActiveCategory] = useState<'top_rated' | 'popular'>('top_rated');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const categories = [
    { id: 'top_rated', label: 'Highest Rated' },
    { id: 'popular', label: 'Most Popular' }
  ];

  const genres = ['All', 'Action', 'Science Fiction', 'Drama', 'Crime', 'Animation'];

  // Sort and filter movies
  let displayMovies = [...movies];
  if (selectedGenre !== 'All') {
    displayMovies = displayMovies.filter(m => m.genres.includes(selectedGenre));
  }

  if (activeCategory === 'top_rated') {
    displayMovies.sort((a, b) => b.vote_average - a.vote_average || b.vote_count - a.vote_count);
  } else {
    displayMovies.sort((a, b) => b.popularity - a.popularity || b.vote_count - a.vote_count);
  }

  const topMovies = displayMovies.slice(0, 8);

  return (
    <section id="trending" className="py-12 px-6 max-w-7xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-amber-500 font-semibold mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Curated TMDB Showcase
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Trending & Essential Cinema
          </h2>
        </div>

        {/* Category Segmented Control (Allowed functional tab buttons) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as 'top_rated' | 'popular')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeCategory === cat.id
                  ? 'bg-neutral-800 text-amber-300 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedGenre === g
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {topMovies.map((movie) => (
          <div
            key={movie.id}
            className="group flex flex-col bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden transition-all duration-200"
          >
            <div
              className="relative cursor-pointer overflow-hidden"
              onClick={() => onOpenMovieModal(movie)}
            >
              <MoviePoster src={movie.poster_path} alt={movie.title} />

              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 text-[11px] font-mono font-semibold text-amber-400 rounded flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                {movie.vote_average.toFixed(1)}
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3
                  onClick={() => onOpenMovieModal(movie)}
                  className="text-sm font-semibold text-white line-clamp-1 group-hover:text-amber-400 transition-colors cursor-pointer"
                  title={movie.title}
                >
                  {movie.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1 font-mono">
                  <span>{movie.release_year}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{movie.genres[0]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{movie.runtime}m</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectMovie(movie);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full mt-2 py-1.5 px-2.5 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Find Similar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

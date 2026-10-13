import React from 'react';
import { X, Star, Calendar, Clock, Film, Sparkles, User, Tag } from 'lucide-react';
import { Movie } from '../types/movie';
import { MoviePoster } from './MoviePoster';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  isOpen,
  onClose,
  onSelectMovie
}) => {
  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-neutral-950/70 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full transition-colors border border-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Poster */}
            <div className="w-full sm:w-48 shrink-0">
              <MoviePoster src={movie.poster_path} alt={movie.title} className="shadow-2xl" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {movie.title}
                </h2>
                
                {/* Unboxed Metadata (Zero-Pill Discipline) */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-2 font-mono">
                  <span>{movie.release_year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{movie.runtime} minutes</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {movie.vote_average.toFixed(1)} / 10
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-500">({movie.vote_count.toLocaleString()} votes)</span>
                </div>

                <div className="text-xs text-neutral-300 mt-2">
                  <span className="text-neutral-500">Genres: </span>
                  {movie.genres.join(' · ')}
                </div>
              </div>

              {/* Director & Cast */}
              <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500 font-medium">Director: </span>
                  <span className="text-white font-semibold">{movie.director}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-medium">Starring: </span>
                  <span className="text-neutral-300">{movie.cast.join(', ')}</span>
                </div>
              </div>

              {/* Overview */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Synopsis
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {movie.overview}
                </p>
              </div>

              {/* Keywords */}
              {movie.keywords.length > 0 && (
                <div className="pt-2 border-t border-neutral-800">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-neutral-500" />
                    Thematic Keywords
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-neutral-800 text-[11px] text-neutral-300 rounded font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-500">
              Explore similar content vectors using CineMatch AI
            </span>
            <button
              onClick={() => {
                onSelectMovie(movie);
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find Movies Similar to This</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

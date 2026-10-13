import React, { useState } from 'react';
import { Star, SlidersHorizontal, ChevronRight, Info, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { Movie, RecommendationResult, FilterOptions } from '../types/movie';
import { MoviePoster } from './MoviePoster';

interface RecommendationsSectionProps {
  seedMovie: Movie;
  recommendations: RecommendationResult[];
  filterOptions: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onSelectMovie: (movie: Movie) => void;
  onOpenMovieModal: (movie: Movie) => void;
  isLoading: boolean;
  genreList: string[];
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  seedMovie,
  recommendations,
  filterOptions,
  onFilterChange,
  onSelectMovie,
  onOpenMovieModal,
  isLoading,
  genreList
}) => {
  const [expandedExplainId, setExpandedExplainId] = useState<number | null>(null);

  const toggleExplain = (id: number) => {
    setExpandedExplainId(prev => (prev === id ? null : id));
  };

  return (
    <section id="recommendations" className="py-12 px-6 max-w-7xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-amber-500 font-semibold mb-1">
            Top 10 Content-Based Matches
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Movies Similar to <span className="text-amber-400">{seedMovie.title}</span>
          </h2>
        </div>

        {/* Selected Movie Reference Snippet */}
        <div className="flex items-center gap-3 text-xs text-neutral-400 bg-neutral-900/80 border border-neutral-800 px-3.5 py-2 rounded-lg">
          <span className="text-neutral-500">Seed:</span>
          <span className="font-semibold text-white">{seedMovie.title}</span>
          <span aria-hidden="true">·</span>
          <span>{seedMovie.director}</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400 flex items-center gap-1 font-mono">
            <Star className="w-3 h-3 fill-amber-400" />
            {seedMovie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Interactive Controls & Filters Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Genre Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="text-xs font-medium text-neutral-300">Genre:</span>
          <select
            value={filterOptions.selectedGenre}
            onChange={(e) => onFilterChange({ selectedGenre: e.target.value })}
            className="bg-neutral-800 border border-neutral-700/80 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            {genreList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Min Rating Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-300">Min Rating:</span>
          <input
            type="range"
            min="6.0"
            max="8.5"
            step="0.1"
            value={filterOptions.minRating}
            onChange={(e) => onFilterChange({ minRating: parseFloat(e.target.value) })}
            className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-medium text-amber-400 min-w-8">
            ★ {filterOptions.minRating.toFixed(1)}+
          </span>
        </div>

        {/* Vectorizer Method Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-400">Model:</span>
          <div className="inline-flex rounded-lg bg-neutral-800 p-0.5 border border-neutral-700/70">
            <button
              onClick={() => onFilterChange({ vectorizerMethod: 'tfidf' })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterOptions.vectorizerMethod === 'tfidf'
                  ? 'bg-neutral-900 text-amber-300 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              TF-IDF (Sublinear)
            </button>
            <button
              onClick={() => onFilterChange({ vectorizerMethod: 'count' })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterOptions.vectorizerMethod === 'count'
                  ? 'bg-neutral-900 text-amber-300 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              CountVectorizer
            </button>
          </div>
        </div>

        {/* Reset / Clear Filters */}
        {(filterOptions.selectedGenre !== 'All' || filterOptions.minRating > 6.0) && (
          <button
            onClick={() => onFilterChange({ selectedGenre: 'All', minRating: 6.0 })}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 ml-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-3 animate-pulse"
            >
              <div className="aspect-[2/3] bg-neutral-800 rounded-lg w-full" />
              <div className="h-4 bg-neutral-800 rounded w-3/4" />
              <div className="h-3 bg-neutral-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-16 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
          <Info className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No Recommendations Match Current Filters</h3>
          <p className="text-sm text-neutral-400">
            Try resetting your minimum rating threshold or switching the genre filter to "All" to view more matches.
          </p>
          <button
            onClick={() => onFilterChange({ selectedGenre: 'All', minRating: 6.0 })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-lg transition-colors"
          >
            Clear Active Filters
          </button>
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {recommendations.map((rec) => {
            const isExplainExpanded = expandedExplainId === rec.movie.id;
            const matchPercentage = Math.round(rec.similarityScore * 100);

            return (
              <div
                key={rec.movie.id}
                className="group flex flex-col bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 rounded-xl overflow-hidden transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1"
              >
                {/* Poster Container */}
                <div
                  className="relative cursor-pointer overflow-hidden"
                  onClick={() => onOpenMovieModal(rec.movie)}
                >
                  <MoviePoster src={rec.movie.poster_path} alt={rec.movie.title} />

                  {/* Rank Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 text-[11px] font-mono font-semibold text-amber-400 rounded">
                    #{rec.rank}
                  </div>

                  {/* Cosine Similarity Score Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 text-[11px] font-mono font-semibold text-emerald-400 rounded">
                    {matchPercentage}% Match
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Title */}
                    <h3
                      onClick={() => onOpenMovieModal(rec.movie)}
                      className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors cursor-pointer"
                      title={rec.movie.title}
                    >
                      {rec.movie.title}
                    </h3>

                    {/* Unboxed Metadata (Zero-Pill Discipline) */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1 font-mono">
                      <span>{rec.movie.release_year}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {rec.movie.vote_average.toFixed(1)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{rec.movie.runtime}m</span>
                    </div>

                    {/* Genre Text */}
                    <div className="text-[11px] text-neutral-400 line-clamp-1 mt-1">
                      {rec.movie.genres.slice(0, 2).join(' · ')}
                    </div>

                    {/* Short Overview */}
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                      {rec.movie.overview}
                    </p>
                  </div>

                  {/* Explainability Accordion */}
                  <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleExplain(rec.movie.id)}
                      className="w-full flex items-center justify-between text-[11px] font-medium text-neutral-400 hover:text-amber-400 transition-colors py-1"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Why recommended?
                      </span>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isExplainExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {isExplainExpanded && (
                      <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg text-[11px] text-neutral-300 space-y-1.5 animate-fadeIn">
                        {rec.directorMatch && (
                          <div className="text-amber-300 font-medium">
                            ✓ Directorial match: {rec.movie.director}
                          </div>
                        )}
                        {rec.sharedGenres.length > 0 && (
                          <div>
                            <span className="text-neutral-500">Shared genres: </span>
                            <span className="text-neutral-300">{rec.sharedGenres.join(', ')}</span>
                          </div>
                        )}
                        {rec.sharedCast.length > 0 && (
                          <div>
                            <span className="text-neutral-500">Shared cast: </span>
                            <span className="text-neutral-300">{rec.sharedCast.join(', ')}</span>
                          </div>
                        )}
                        {rec.topMatchingTerms.length > 0 && (
                          <div>
                            <span className="text-neutral-500">Top TF-IDF tokens: </span>
                            <span className="font-mono text-[10px] text-neutral-400">
                              {rec.topMatchingTerms.slice(0, 3).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pivot Recommendation Button */}
                    <button
                      type="button"
                      onClick={() => onSelectMovie(rec.movie)}
                      className="w-full py-1.5 px-2 bg-neutral-800/70 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 text-xs font-semibold rounded-md transition-colors text-center"
                    >
                      Pivot from this movie
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

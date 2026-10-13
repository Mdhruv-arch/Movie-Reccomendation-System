import React, { useState, useMemo, useEffect } from 'react';
import { MOVIES_DATASET, GENRE_LIST } from './data/movies';
import { ContentRecommendationEngine } from './ml/recommendationEngine';
import { Movie, RecommendationResult, FilterOptions, MLFeatureExplanation } from './types/movie';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { RecommendationsSection } from './components/RecommendationsSection';
import { TrendingSection } from './components/TrendingSection';
import { MLArchitectureSection } from './components/MLArchitectureSection';
import { PythonHubModal } from './components/PythonHubModal';
import { MovieModal } from './components/MovieModal';
import { Footer } from './components/Footer';

export default function App() {
  // Initialize Content-based ML engine
  const engine = useMemo(() => {
    return new ContentRecommendationEngine(MOVIES_DATASET);
  }, []);

  // Application state
  const [selectedMovie, setSelectedMovie] = useState<Movie>(MOVIES_DATASET[0]); // Defaults to Inception
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    selectedGenre: 'All',
    minRating: 6.0,
    minYear: 1940,
    maxYear: 2026,
    vectorizerMethod: 'tfidf',
    sortBy: 'similarity'
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [mlExplanation, setMlExplanation] = useState<MLFeatureExplanation | null>(null);

  // Modals state
  const [isPythonHubOpen, setIsPythonHubOpen] = useState<boolean>(false);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);

  // Run recommendation computation
  const computeRecommendations = (
    movie: Movie,
    filters: FilterOptions
  ) => {
    setIsLoading(true);

    // Simulate brief vector transformation for user feedback
    setTimeout(() => {
      const recResult = engine.recommend(movie.id, 10, {
        method: filters.vectorizerMethod,
        selectedGenre: filters.selectedGenre,
        minRating: filters.minRating,
        minYear: filters.minYear,
        maxYear: filters.maxYear
      });

      // Sort if required
      let results = [...recResult.results];
      if (filters.sortBy === 'rating') {
        results.sort((a, b) => b.movie.vote_average - a.movie.vote_average);
      } else if (filters.sortBy === 'popularity') {
        results.sort((a, b) => b.movie.popularity - a.movie.popularity);
      }

      setRecommendations(results);

      // Compute explainability payload
      const explanation = engine.getMLExplanation(movie.id, filters.vectorizerMethod);
      setMlExplanation(explanation);

      setIsLoading(false);
    }, 120);
  };

  // Re-run recommendation on movie or filter change
  useEffect(() => {
    computeRecommendations(selectedMovie, filterOptions);
  }, [selectedMovie, filterOptions]);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Contract compliant navigation */}
      <Header
        onOpenPythonHub={() => setIsPythonHubOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          movies={MOVIES_DATASET}
          selectedMovie={selectedMovie}
          onSelectMovie={handleSelectMovie}
          onGenerateRecommendations={() => {
            computeRecommendations(selectedMovie, filterOptions);
            handleNavigateSection('recommendations');
          }}
          isLoading={isLoading}
        />

        {/* Top 10 Recommendations Section */}
        <RecommendationsSection
          seedMovie={selectedMovie}
          recommendations={recommendations}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onSelectMovie={(movie) => {
            handleSelectMovie(movie);
            handleNavigateSection('recommendations');
          }}
          onOpenMovieModal={(movie) => setModalMovie(movie)}
          isLoading={isLoading}
          genreList={GENRE_LIST}
        />

        {/* Trending & Critically Acclaimed Section */}
        <TrendingSection
          movies={MOVIES_DATASET}
          onSelectMovie={(movie) => {
            handleSelectMovie(movie);
            handleNavigateSection('recommendations');
          }}
          onOpenMovieModal={(movie) => setModalMovie(movie)}
        />

        {/* ML Engine Architecture & Portfolio Explainability Section */}
        <MLArchitectureSection
          explanation={mlExplanation}
          seedMovie={selectedMovie}
          onOpenPythonHub={() => setIsPythonHubOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenPythonHub={() => setIsPythonHubOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Python Code Hub Modal */}
      <PythonHubModal
        isOpen={isPythonHubOpen}
        onClose={() => setIsPythonHubOpen(false)}
      />

      {/* Full Movie Detail Modal */}
      <MovieModal
        movie={modalMovie}
        isOpen={Boolean(modalMovie)}
        onClose={() => setModalMovie(null)}
        onSelectMovie={(movie) => {
          handleSelectMovie(movie);
          handleNavigateSection('recommendations');
        }}
      />
    </div>
  );
}

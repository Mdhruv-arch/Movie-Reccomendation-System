export interface Movie {
  id: number;
  title: string;
  release_year: number;
  genres: string[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime: number; // minutes
  director: string;
  cast: string[];
  keywords: string[];
  overview: string;
  poster_path: string;
  backdrop_path?: string;
}

export interface RecommendationResult {
  movie: Movie;
  similarityScore: number; // 0.0 to 1.0
  rank: number;
  sharedGenres: string[];
  sharedKeywords: string[];
  sharedCast: string[];
  directorMatch: boolean;
  topMatchingTerms: string[];
}

export interface FilterOptions {
  selectedGenre: string;
  minRating: number;
  minYear: number;
  maxYear: number;
  vectorizerMethod: 'tfidf' | 'count';
  sortBy: 'similarity' | 'rating' | 'popularity';
}

export interface MLFeatureExplanation {
  seedMovie: Movie;
  seedTokens: string[];
  vocabularySize: number;
  vectorizerType: 'TF-IDF Vectorizer' | 'CountVectorizer';
  totalMoviesProcessed: number;
  sampleMatrix: {
    targetMovieTitle: string;
    score: number;
    topIntersectingFeatures: { term: string; seedWeight: number; targetWeight: number }[];
  }[];
}

import { Movie, RecommendationResult, MLFeatureExplanation } from '../types/movie';

// Standard English stop words to filter out during tokenization
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m',
  'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t',
  'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t',
  'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves', 'the', 'also', 'whose', 'becomes', 'must', 'take', 'two', 'takes', 'one'
]);

/**
 * Clean entity string by removing spaces and punctuation to form atomic tokens.
 * E.g., "Christopher Nolan" -> "christophernolan"
 * This avoids spurious matches like matching Christopher Nolan with Christopher Walken.
 */
function cleanEntity(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Tokenize and normalize free text (like overview and keywords).
 */
function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Create the unified feature "soup" for a movie.
 * Mimics TMDB 5000 feature engineering in Python/scikit-learn.
 */
export function createMovieSoup(movie: Movie): string {
  // Director weighted 2x to prioritize stylistic and directorial consistency
  const directorToken = cleanEntity(movie.director);
  const directorTokens = directorToken ? [directorToken, directorToken] : [];

  // Top cast members (spaces stripped)
  const castTokens = (movie.cast || []).slice(0, 4).map(cleanEntity).filter(Boolean);

  // Genres (spaces stripped e.g. "sciencefiction")
  const genreTokens = (movie.genres || []).map(cleanEntity).filter(Boolean);

  // Keywords (both concatenated atomic format and split words for semantic breadth)
  const keywordTokens: string[] = [];
  (movie.keywords || []).forEach(kw => {
    keywordTokens.push(cleanEntity(kw));
    keywordTokens.push(...tokenizeText(kw));
  });

  // Overview tokenized and stop words removed
  const overviewTokens = tokenizeText(movie.overview || '');

  // Combine into single text soup
  const allTokens = [
    ...genreTokens,
    ...genreTokens, // Weight genres 2x
    ...directorTokens,
    ...castTokens,
    ...keywordTokens,
    ...overviewTokens
  ];

  return allTokens.filter(Boolean).join(' ');
}

export class ContentRecommendationEngine {
  private movies: Movie[] = [];
  private movieIndexMap: Map<number, number> = new Map();
  private movieTitleMap: Map<string, number> = new Map();
  private vocabulary: string[] = [];
  private vocabIndexMap: Map<string, number> = new Map();
  private idfWeights: number[] = [];
  private tfidfVectors: Float32Array[] = [];
  private countVectors: Float32Array[] = [];
  private isTrained: boolean = false;

  constructor(movies: Movie[]) {
    this.train(movies);
  }

  /**
   * Train the vectorizer and compute feature representations.
   */
  public train(rawMovies: Movie[]): void {
    // 1. Data Cleaning: Filter out nulls/duplicates
    const seenIds = new Set<number>();
    const cleaned: Movie[] = [];

    for (const m of rawMovies) {
      if (!m || !m.id || !m.title) continue;
      if (seenIds.has(m.id)) continue;
      seenIds.add(m.id);
      cleaned.push(m);
    }

    this.movies = cleaned;
    this.movieIndexMap.clear();
    this.movieTitleMap.clear();

    const soups: string[][] = [];
    const docFrequency: Map<string, number> = new Map();

    // 2. Build feature soups and compute document frequencies
    this.movies.forEach((movie, idx) => {
      this.movieIndexMap.set(movie.id, idx);
      this.movieTitleMap.set(movie.title.toLowerCase().trim(), idx);

      const soup = createMovieSoup(movie);
      const tokens = soup.split(/\s+/).filter(Boolean);
      soups.push(tokens);

      const uniqueTokensInDoc = new Set(tokens);
      uniqueTokensInDoc.forEach(term => {
        docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
      });
    });

    const N = this.movies.length;
    // 3. Build vocabulary (terms appearing in at least 1 document)
    this.vocabulary = Array.from(docFrequency.keys());
    this.vocabIndexMap.clear();
    this.vocabulary.forEach((term, idx) => {
      this.vocabIndexMap.set(term, idx);
    });

    // 4. Calculate IDF weights: smooth_idf formula: log((1 + N) / (1 + df)) + 1
    const vocabSize = this.vocabulary.length;
    this.idfWeights = new Array(vocabSize);
    for (let i = 0; i < vocabSize; i++) {
      const term = this.vocabulary[i];
      const df = docFrequency.get(term) || 1;
      this.idfWeights[i] = Math.log((1 + N) / (1 + df)) + 1.0;
    }

    // 5. Build TF-IDF and Count Vectors
    this.tfidfVectors = [];
    this.countVectors = [];

    for (let i = 0; i < N; i++) {
      const tokens = soups[i];
      const termCounts: Map<number, number> = new Map();
      tokens.forEach(term => {
        const termIdx = this.vocabIndexMap.get(term);
        if (termIdx !== undefined) {
          termCounts.set(termIdx, (termCounts.get(termIdx) || 0) + 1);
        }
      });

      // Count Vector (standard Bag-of-Words)
      const countVec = new Float32Array(vocabSize);
      let countNormSq = 0;
      termCounts.forEach((count, termIdx) => {
        countVec[termIdx] = count;
        countNormSq += count * count;
      });
      // Normalize count vector for cosine similarity
      const countNorm = Math.sqrt(countNormSq);
      if (countNorm > 0) {
        for (let j = 0; j < vocabSize; j++) {
          countVec[j] /= countNorm;
        }
      }
      this.countVectors.push(countVec);

      // TF-IDF Vector (sublinear term frequency scaling: 1 + log(tf))
      const tfidfVec = new Float32Array(vocabSize);
      let tfidfNormSq = 0;
      termCounts.forEach((count, termIdx) => {
        const tf = 1.0 + Math.log(count);
        const weight = tf * this.idfWeights[termIdx];
        tfidfVec[termIdx] = weight;
        tfidfNormSq += weight * weight;
      });

      // L2 Normalize
      const tfidfNorm = Math.sqrt(tfidfNormSq);
      if (tfidfNorm > 0) {
        for (let j = 0; j < vocabSize; j++) {
          tfidfVec[j] /= tfidfNorm;
        }
      }
      this.tfidfVectors.push(tfidfVec);
    }

    this.isTrained = true;
  }

  /**
   * Calculate cosine similarity between two normalized vectors.
   * Since vectors are L2-normalized, cosine_similarity is dot product u . v
   */
  private cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
    let dot = 0;
    const len = vecA.length;
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Recommend movies similar to a given movie ID or title.
   */
  public recommend(
    movieIdOrTitle: number | string,
    topK: number = 10,
    options?: {
      method?: 'tfidf' | 'count';
      selectedGenre?: string;
      minRating?: number;
      minYear?: number;
      maxYear?: number;
    }
  ): { results: RecommendationResult[]; seedMovie: Movie | null; error?: string } {
    if (!this.isTrained || this.movies.length === 0) {
      return { results: [], seedMovie: null, error: 'Recommendation model is not initialized.' };
    }

    let seedIdx: number | undefined;

    if (typeof movieIdOrTitle === 'number') {
      seedIdx = this.movieIndexMap.get(movieIdOrTitle);
    } else {
      const cleaned = movieIdOrTitle.toLowerCase().trim();
      seedIdx = this.movieTitleMap.get(cleaned);
      if (seedIdx === undefined) {
        // Partial search fallback
        seedIdx = this.movies.findIndex(m => m.title.toLowerCase().includes(cleaned));
      }
    }

    if (seedIdx === undefined || seedIdx === -1) {
      return {
        results: [],
        seedMovie: null,
        error: `Movie "${movieIdOrTitle}" was not found in the dataset.`
      };
    }

    const seedMovie = this.movies[seedIdx];
    const method = options?.method || 'tfidf';
    const vectors = method === 'count' ? this.countVectors : this.tfidfVectors;
    const seedVector = vectors[seedIdx];

    const candidates: { idx: number; score: number }[] = [];

    // Calculate similarity against all movies except seed movie
    for (let i = 0; i < this.movies.length; i++) {
      if (i === seedIdx) continue; // Exclude selected movie itself

      const candidateMovie = this.movies[i];

      // Apply genre filter if set
      if (options?.selectedGenre && options.selectedGenre !== 'All') {
        if (!candidateMovie.genres.includes(options.selectedGenre)) {
          continue;
        }
      }

      // Apply minimum rating filter if set
      if (options?.minRating && candidateMovie.vote_average < options.minRating) {
        continue;
      }

      // Apply year range filter if set
      if (options?.minYear && candidateMovie.release_year < options.minYear) {
        continue;
      }
      if (options?.maxYear && candidateMovie.release_year > options.maxYear) {
        continue;
      }

      const score = this.cosineSimilarity(seedVector, vectors[i]);
      candidates.push({ idx: i, score });
    }

    // Sort descending by cosine similarity score
    candidates.sort((a, b) => b.score - a.score);

    const topCandidates = candidates.slice(0, topK);

    // Build rich explainability for each recommendation
    const results: RecommendationResult[] = topCandidates.map((cand, rankIndex) => {
      const candidateMovie = this.movies[cand.idx];
      const candVector = vectors[cand.idx];

      // Find shared genres
      const sharedGenres = (seedMovie.genres || []).filter(g =>
        (candidateMovie.genres || []).includes(g)
      );

      // Find shared keywords
      const sharedKeywords = (seedMovie.keywords || []).filter(k =>
        (candidateMovie.keywords || []).some(ck => ck.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(ck.toLowerCase()))
      );

      // Find shared cast
      const sharedCast = (seedMovie.cast || []).filter(c =>
        (candidateMovie.cast || []).includes(c)
      );

      // Director match
      const directorMatch =
        Boolean(seedMovie.director) &&
        Boolean(candidateMovie.director) &&
        seedMovie.director.toLowerCase() === candidateMovie.director.toLowerCase();

      // Top matching feature tokens based on coordinate elementwise product
      const tokenOverlap: { term: string; product: number }[] = [];
      const len = seedVector.length;
      for (let t = 0; t < len; t++) {
        const prod = seedVector[t] * candVector[t];
        if (prod > 0.0001) {
          tokenOverlap.push({ term: this.vocabulary[t], product: prod });
        }
      }
      tokenOverlap.sort((a, b) => b.product - a.product);
      const topMatchingTerms = tokenOverlap.slice(0, 5).map(item => item.term);

      return {
        movie: candidateMovie,
        similarityScore: Math.round(cand.score * 1000) / 1000,
        rank: rankIndex + 1,
        sharedGenres,
        sharedKeywords,
        sharedCast,
        directorMatch,
        topMatchingTerms
      };
    });

    return { results, seedMovie };
  }

  /**
   * Generate inspectable ML model details for portfolio & explainability tab.
   */
  public getMLExplanation(
    movieId: number,
    method: 'tfidf' | 'count' = 'tfidf'
  ): MLFeatureExplanation | null {
    const seedIdx = this.movieIndexMap.get(movieId);
    if (seedIdx === undefined) return null;

    const seedMovie = this.movies[seedIdx];
    const vectors = method === 'count' ? this.countVectors : this.tfidfVectors;
    const seedVector = vectors[seedIdx];

    // Find top weighted tokens for this movie
    const weightedTokens: { term: string; weight: number }[] = [];
    for (let i = 0; i < seedVector.length; i++) {
      if (seedVector[i] > 0.01) {
        weightedTokens.push({ term: this.vocabulary[i], weight: seedVector[i] });
      }
    }
    weightedTokens.sort((a, b) => b.weight - a.weight);

    // Get top 5 recommendations for matrix sample
    const recs = this.recommend(movieId, 5, { method });

    const sampleMatrix = recs.results.map(r => {
      const targetIdx = this.movieIndexMap.get(r.movie.id)!;
      const targetVec = vectors[targetIdx];

      const intersecting: { term: string; seedWeight: number; targetWeight: number }[] = [];
      for (let i = 0; i < seedVector.length; i++) {
        if (seedVector[i] > 0.005 && targetVec[i] > 0.005) {
          intersecting.push({
            term: this.vocabulary[i],
            seedWeight: Math.round(seedVector[i] * 1000) / 1000,
            targetWeight: Math.round(targetVec[i] * 1000) / 1000
          });
        }
      }
      intersecting.sort((a, b) => (b.seedWeight * b.targetWeight) - (a.seedWeight * a.targetWeight));

      return {
        targetMovieTitle: r.movie.title,
        score: r.similarityScore,
        topIntersectingFeatures: intersecting.slice(0, 4)
      };
    });

    return {
      seedMovie,
      seedTokens: weightedTokens.slice(0, 16).map(item => item.term),
      vocabularySize: this.vocabulary.length,
      vectorizerType: method === 'count' ? 'CountVectorizer' : 'TF-IDF Vectorizer',
      totalMoviesProcessed: this.movies.length,
      sampleMatrix
    };
  }

  public getAllMovies(): Movie[] {
    return this.movies;
  }

  public getMovieById(id: number): Movie | undefined {
    const idx = this.movieIndexMap.get(id);
    return idx !== undefined ? this.movies[idx] : undefined;
  }
}

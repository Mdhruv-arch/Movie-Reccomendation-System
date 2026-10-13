import React from 'react';
import { Database, Binary, GitFork, Calculator, ShieldAlert, Award, FileCode } from 'lucide-react';
import { Movie, MLFeatureExplanation } from '../types/movie';

interface MLArchitectureSectionProps {
  explanation: MLFeatureExplanation | null;
  seedMovie: Movie;
  onOpenPythonHub: () => void;
}

export const MLArchitectureSection: React.FC<MLArchitectureSectionProps> = ({
  explanation,
  seedMovie,
  onOpenPythonHub
}) => {
  return (
    <section id="ml-architecture" className="py-16 px-6 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="text-xs uppercase tracking-wider text-amber-500 font-semibold mb-1">
          Machine Learning Architecture
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How CineMatch AI Works Under the Hood
        </h2>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          An architectural breakdown of the content-based recommendation pipeline, vector space mechanics, and data preprocessing steps suitable for ML engineering discussions.
        </p>
      </div>

      {/* 4-Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1 */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div className="text-xs text-blue-400 font-mono font-medium">Step 01</div>
          <h3 className="text-sm font-bold text-white">Feature Ingestion & Soup</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Extracts genres, plot keywords, top 4 cast members, director, and overview from TMDB metadata into an entity-collapsed text representation.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <GitFork className="w-4 h-4" />
          </div>
          <div className="text-xs text-purple-400 font-mono font-medium">Step 02</div>
          <h3 className="text-sm font-bold text-white">Entity Normalization</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Collapses multi-word entities (e.g. "Christopher Nolan" &rarr; "christophernolan") to eliminate false token overlaps across distinct people.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Binary className="w-4 h-4" />
          </div>
          <div className="text-xs text-amber-400 font-mono font-medium">Step 03</div>
          <h3 className="text-sm font-bold text-white">Sparse Vectorization</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Constructs sparse feature vectors with sublinear TF scaling <code className="font-mono text-[11px] text-amber-300">1+log(tf)</code> and smooth inverse document frequency weights.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div className="text-xs text-emerald-400 font-mono font-medium">Step 04</div>
          <h3 className="text-sm font-bold text-white">Cosine Metric Space</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Computes inner product between normalized vectors to determine angular similarity, invariant to document length.
          </p>
        </div>
      </div>

      {/* Live Feature Inspector for Selected Movie */}
      {explanation && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div>
              <div className="text-xs text-amber-500 font-mono font-semibold uppercase">Live Feature Inspector</div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Feature Weights for: <span className="text-amber-300">{seedMovie.title}</span>
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              <div>
                <span className="text-neutral-500">Vocabulary Size:</span>{' '}
                <span className="text-white">{explanation.vocabularySize.toLocaleString()} terms</span>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span className="text-neutral-500">Model:</span>{' '}
                <span className="text-amber-400">{explanation.vectorizerType}</span>
              </div>
            </div>
          </div>

          {/* Tokens extracted */}
          <div>
            <div className="text-xs font-semibold text-neutral-300 mb-2">
              High-Weight Extracted Tokens (Seed Feature Soup):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {explanation.seedTokens.map((token, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-neutral-800/90 border border-neutral-700/60 rounded text-xs font-mono text-neutral-200"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          {/* Pairwise Coordinate Intersections */}
          <div>
            <div className="text-xs font-semibold text-neutral-300 mb-3">
              Top Intersecting Feature Coordinates (Why Top Matches Scored High):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {explanation.sampleMatrix.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]" title={item.targetMovieTitle}>
                      {item.targetMovieTitle}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      {Math.round(item.score * 100)}% Match
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-neutral-800/70">
                    {item.topIntersectingFeatures.length === 0 ? (
                      <span className="text-[11px] text-neutral-500">Shared broad semantic dimensions</span>
                    ) : (
                      item.topIntersectingFeatures.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-neutral-300">{feat.term}</span>
                          <span className="font-mono text-neutral-500">
                            {feat.seedWeight.toFixed(2)} &times; {feat.targetWeight.toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Honest Scientific Evaluation Note (Anti-fabrication requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mathematical Foundation */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            Mathematical Foundation
          </div>
          <h4 className="text-base font-bold text-white">Cosine Similarity & Vector Geometry</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Content vectors are mapped to high-dimensional space. The similarity score represents the cosine of the angle between two multi-dimensional unit vectors:
          </p>
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono text-amber-300 overflow-x-auto">
            cos(&theta;) = (u &middot; v) / (||u|| &times; ||v||)
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Because vectors are L2-normalized during vectorization, the cosine similarity reduces to an ultra-efficient dot product u &middot; v, executing in sub-millisecond time.
          </p>
        </div>

        {/* Valid Evaluation in Content-Based Systems */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Real Evaluation Methodology
          </div>
          <h4 className="text-base font-bold text-white">Why No Single "99% Accuracy" Number?</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Content-based recommendation is an unsupervised information retrieval problem without ground-truth single labels. In industry, models are evaluated with:
          </p>
          <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside">
            <li><strong className="text-neutral-200">Precision@K & Recall@K</strong>: Proportion of recommended items that a user interacted with.</li>
            <li><strong className="text-neutral-200">Mean Reciprocal Rank (MRR)</strong>: How high up the first relevant item appears.</li>
            <li><strong className="text-neutral-200">Intra-List Diversity (ILD)</strong>: Ensuring recommendations aren't 10 identical sequels.</li>
          </ul>
        </div>
      </div>

      {/* Python Code CTA */}
      <div className="bg-gradient-to-r from-amber-500/10 via-neutral-900 to-amber-500/10 border border-amber-500/20 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-base sm:text-lg font-bold text-white">Need the Python & Streamlit Code for your GitHub?</h4>
          <p className="text-xs text-neutral-400 max-w-xl">
            Get the complete, runnable Python project files (<code className="text-amber-300 font-mono">app.py</code>, <code className="text-amber-300 font-mono">model_training.py</code>, <code className="text-amber-300 font-mono">requirements.txt</code>, <code className="text-amber-300 font-mono">README.md</code>) ready to run locally or push to GitHub.
          </p>
        </div>
        <button
          onClick={onOpenPythonHub}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-md shadow-amber-500/20 flex items-center gap-2"
        >
          <FileCode className="w-4 h-4" />
          <span>Open Python Hub</span>
        </button>
      </div>
    </section>
  );
};

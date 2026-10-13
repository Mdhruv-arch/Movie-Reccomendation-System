import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface MoviePosterProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'poster' | 'backdrop';
}

export const MoviePoster: React.FC<MoviePosterProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'poster'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const aspectClass = aspectRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-[16/9]';

  if (hasError || !src) {
    return (
      <div
        className={`relative w-full ${aspectClass} bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 flex flex-col items-center justify-center p-4 text-center border border-neutral-800 rounded-lg overflow-hidden ${className}`}
      >
        <Film className="w-10 h-10 text-neutral-600 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-neutral-300 line-clamp-2 px-1">
          {alt}
        </span>
        <span className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">
          TMDB Cinema
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800/80 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
          <Film className="w-6 h-6 text-neutral-700" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

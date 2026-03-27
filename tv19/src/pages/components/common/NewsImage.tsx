import React, { useState, useEffect } from 'react';
import { scrapeFallbackImage } from '../../../services/newsService';

// Fallback images
import generalFallback from '../../../assets/fallbacks/general.png';
import entFallback from '../../../assets/fallbacks/entertainment.png';
import politicsFallback from '../../../assets/fallbacks/politics.png';
import sportsFallback from '../../../assets/fallbacks/sports.png';
import businessFallback from '../../../assets/fallbacks/business.png';
import techFallback from '../../../assets/fallbacks/tech.png';



interface NewsImageProps {
  src: string | null | undefined;
  alt: string;
  category?: string;
  articleUrl?: string;
  className?: string;
}

const categoryFallbacks: Record<string, string> = {
  entertainment: entFallback,
  politics: politicsFallback,
  sports: sportsFallback,
  business: businessFallback,
  finance: businessFallback,
  technology: techFallback,
  tech: techFallback,
  top: generalFallback,
};

const NewsImage: React.FC<NewsImageProps> = ({ src, alt, category, articleUrl, className }) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [hasError, setHasError] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const fallback = (category && categoryFallbacks[category.toLowerCase()]) || generalFallback;

  useEffect(() => {
    setCurrentSrc(src || null);
    setHasError(!src);
  }, [src]);

  const handleError = async () => {
    if (hasError) return; // Prevent infinite loops
    
    setHasError(true);

    // If we have an article URL, try to scrape a better image
    if (articleUrl && !isScraping) {
      setIsScraping(true);
      try {
        const scraped = await scrapeFallbackImage(articleUrl, currentSrc || '');
        if (scraped) {
          setCurrentSrc(scraped);
          setHasError(false);
        }
      } catch (err) {
        console.warn('Silent image recovery failed:', err);
      } finally {
        setIsScraping(false);
      }
    }
  };

  return (
    <img
      src={!hasError && currentSrc ? currentSrc : fallback}
      alt={alt}
      className={`${className} ${hasError ? 'fallback-img' : ''}`}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default NewsImage;

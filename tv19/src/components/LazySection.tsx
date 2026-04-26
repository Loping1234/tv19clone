import React, { useRef, useState, useEffect } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  /** How far before the section enters the viewport to start rendering (default: 200px) */
  rootMargin?: string;
  /** Minimum height for the placeholder to prevent layout shifts */
  minHeight?: number;
}

/**
 * Lazy-loads a section only when it scrolls close to the viewport.
 * Prevents below-fold news sections from firing API calls on initial page load.
 * Once rendered, the section stays mounted (no unloading on scroll-out).
 */
const LazySection: React.FC<LazySectionProps> = ({
  children,
  rootMargin = '300px',
  minHeight = 200,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Once visible, never unload
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? undefined : minHeight }}>
      {isVisible ? children : null}
    </div>
  );
};

export default LazySection;

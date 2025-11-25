import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  threshold = 0.01,
  rootMargin = '50px',
  onLoad,
  onError,
  ...props
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;

    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const imgSrc = img.dataset.src;

              if (imgSrc) {
                // Preload image before setting src
                const imageLoader = new Image();
                imageLoader.src = imgSrc;
                imageLoader.onload = () => {
                  setImageSrc(imgSrc);
                  setImageLoaded(true);
                  onLoad?.();
                };
                imageLoader.onerror = () => {
                  setHasError(true);
                  onError?.();
                };
              }

              observer.unobserve(img);
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold, rootMargin, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      data-src={src}
      alt={alt}
      className={`transition-opacity duration-300 ${
        imageLoaded ? 'opacity-100' : 'opacity-70'
      } ${hasError ? 'opacity-50' : ''} ${className}`}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

export default LazyImage;

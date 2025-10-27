import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'https://via.placeholder.com/300x400?text=Loading...',
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    let observer;
    if (imageRef && !isInView) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );
      observer.observe(imageRef);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [imageRef, isInView]);

  useEffect(() => {
    if (isInView && src) {
      // Convert to optimized image path
      const optimizedSrc = src.replace('/images/', '/images-optimized/').replace('/image/', '/image-optimized/');
      
      const img = new Image();
      img.onload = () => {
        setImageSrc(optimizedSrc);
        setIsLoaded(true);
      };
      img.onerror = () => {
        // Fallback to original if optimized doesn't exist
        setImageSrc(src);
        setIsLoaded(true);
        if (onError) onError();
      };
      img.src = optimizedSrc;
    }
  }, [isInView, src, onError]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-70' : 'opacity-100'} transition-opacity duration-300`}
      {...props}
    />
  );
};

export default LazyImage;





import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext();

export const useLenis = () => {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error('useLenis must be used within a LenisProvider');
  }
  return context;
};

export const LenisProvider = ({ children }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Animation frame loop
    function raf(time) {
      lenisRef.current.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  const scrollTo = (target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  };

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.5 });
    }
  };

  const scrollToBottom = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(document.body.scrollHeight, { duration: 1.5 });
    }
  };

  const value = {
    lenis: lenisRef.current,
    scrollTo,
    scrollToTop,
    scrollToBottom,
  };

  return (
    <LenisContext.Provider value={value}>
      {children}
    </LenisContext.Provider>
  );
};






import { useEffect, useState } from 'react';

export const WindowSize: { [id: string]: number } = {
  DEFAULT: 0,
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

export default function useWindowBreakpoint() {
  const [windowBreakpoint, setWindowBreakpoint] = useState('DEFAULT');

  function handleResize() {
    const width = window.innerWidth;

    let windowSize = 'DEFAULT';
    if (width) {
      if (width >= WindowSize.xxl) {
        windowSize = 'xxl';
      } else if (width >= WindowSize.xl) {
        windowSize = 'xl';
      } else if (width >= WindowSize.lg) {
        windowSize = 'lg';
      } else if (width >= WindowSize.md) {
        windowSize = 'md';
      } else if (width >= WindowSize.sm) {
        windowSize = 'sm';
      } else {
        windowSize = 'DEFAULT';
      }
    }

    setWindowBreakpoint(windowSize);
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowBreakpoint;
}

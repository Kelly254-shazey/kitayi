import { useEffect, useState } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  direction: 'up' | 'down' | 'idle';
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    isAtTop: true,
    isAtBottom: false,
    direction: 'idle',
  });

  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const x = window.scrollX;
      const y = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const isAtTop = y < 50;
      const isAtBottom = y + windowHeight >= documentHeight - 50;

      let direction: 'up' | 'down' | 'idle' = 'idle';
      if (y > lastY) {
        direction = 'down';
      } else if (y < lastY) {
        direction = 'up';
      }

      setScrollPosition({
        x,
        y,
        isAtTop,
        isAtBottom,
        direction,
      });

      setLastY(y);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastY]);

  return scrollPosition;
}

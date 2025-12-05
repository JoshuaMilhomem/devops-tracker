import { useEffect, useRef, useState } from 'react';

export function useDraggable(initialRight = 24, initialBottom = 24) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (ref.current) {
      const { innerWidth, innerHeight } = window;
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        x: innerWidth - rect.width - initialRight,
        y: innerHeight - rect.height - initialBottom,
      });
    }
  }, [initialRight, initialBottom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;

      const { innerWidth, innerHeight } = window;
      const elWidth = ref.current?.offsetWidth || 0;
      const elHeight = ref.current?.offsetHeight || 0;

      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + elWidth > innerWidth) newX = innerWidth - elWidth;
      if (newY + elHeight > innerHeight) newY = innerHeight - elHeight;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return { ref, position, handleMouseDown, isDragging };
}

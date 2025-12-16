import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { useDocumentPiP } from '@/hooks/use-document-pip';
import { useDraggable } from '@/hooks/use-draggable';
import { calculateTotalMs } from '@/lib/time-utils';
import type { Task } from '@/types';

import { HeroContent, type HeroContentProps } from './active-task-hero-content';

interface ActiveTaskHeroProps {
  task: Task;
  onEdit: (task: Task) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onComplete: (id: string) => void;
  onClose: () => void;
}

export function ActiveTaskHero({
  task,
  onEdit,
  onPause,
  onResume,
  onComplete,
  onClose,
}: ActiveTaskHeroProps) {
  const [manualMinimized, setManualMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pipIsCompact, setPipIsCompact] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setManualMinimized(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { ref, position, handleMouseDown, isDragging } = useDraggable(24, 24);

  const { pipWindow, openPiP, closePiP } = useDocumentPiP({
    width: manualMinimized ? 300 : 400,
    height: manualMinimized ? 120 : 400,
  });

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pipWindow) return;
    const handlePipResize = () => {
      const isSmall = pipWindow.innerHeight < 250;
      setPipIsCompact(isSmall);
    };
    handlePipResize();
    pipWindow.addEventListener('resize', handlePipResize);
    return () => pipWindow.removeEventListener('resize', handlePipResize);
  }, [pipWindow]);

  const elapsed = calculateTotalMs(task.intervals);

  useEffect(() => {
    if (!task && pipWindow) closePiP();
  }, [task, pipWindow, closePiP]);

  const effectiveIsMinimized = pipWindow ? pipIsCompact : isMobile ? true : manualMinimized;

  const contentProps: HeroContentProps = {
    task,
    elapsed,
    isMinimized: effectiveIsMinimized,
    disableMaximize: isMobile,
    onPause,
    onResume,
    onComplete,
    onEdit,
    onClose,
    onToggleMinimize: () => {
      if (!pipWindow) setManualMinimized(!manualMinimized);
    },
    onTogglePip: () => (pipWindow ? closePiP() : openPiP()),
  };

  if (pipWindow) {
    return createPortal(
      <div className="h-full w-full flex flex-col bg-slate-950 overflow-hidden">
        <HeroContent {...contentProps} inPip={true} disableMaximize={pipIsCompact} />
      </div>,
      pipWindow.document.body
    );
  }

  const mobileStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 'calc(1rem + env(safe-area-inset-bottom, 10px))',
    left: '1rem',
    right: '1rem',
    width: 'auto',
    zIndex: 100,
  };

  const desktopStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 100,
    width: manualMinimized ? 'auto' : '100%',
    maxWidth: '400px',
    touchAction: 'none',
    transition: isDragging ? 'none' : 'width 0.3s ease',
  };

  return (
    <div
      ref={!isMobile ? ref : undefined}
      style={isMobile ? mobileStyle : desktopStyle}
      className={`${!isMobile && isDragging ? 'scale-[1.02] shadow-2xl cursor-grabbing' : ''} ${isMobile ? 'max-w-md mx-auto' : ''}`}
    >
      <HeroContent
        {...contentProps}
        dragHandleProps={!isMobile ? { onMouseDown: handleMouseDown } : undefined}
      />
    </div>
  );
}

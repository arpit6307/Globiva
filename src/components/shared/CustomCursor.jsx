import React, { useState, useEffect, useRef } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const requestRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    // Hover detection over interactive tags
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, select, input, textarea, [role="button"], .clickable-brutal, [onClick]'
      );
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovered(true));
        el.addEventListener('mouseleave', () => setIsHovered(false));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    addHoverListeners();

    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
    };
  }, [isVisible]);

  // Spring animation trail for outer ring (Fast snappy tracking)
  useEffect(() => {
    const animateTrail = () => {
      setTrail((prevTrail) => {
        const dx = position.x - prevTrail.x;
        const dy = position.y - prevTrail.y;
        return {
          // Responsive friction (0.24 is faster and cleaner for snapping click alignment)
          x: prevTrail.x + dx * 0.24,
          y: prevTrail.y + dy * 0.24
        };
      });
      requestRef.current = requestAnimationFrame(animateTrail);
    };
    requestRef.current = requestAnimationFrame(animateTrail);
    return () => cancelAnimationFrame(requestRef.current);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
      
      {/* 1. Core Center Dot: INSTANT tracking (No CSS transition lag ensures 100% click precision) */}
      <div 
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        className="fixed w-1.5 h-1.5 rounded-full bg-brand-red -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />

      {/* 2. Minimalist Outer Ring (Snappy scale-up on hover and scale-down on click) */}
      <div 
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : isClicked ? 0.75 : 1})`
        }}
        className={`fixed w-7 h-7 border-2 rounded-full pointer-events-none transition-transform duration-150 ease-out ${
          isHovered 
            ? 'border-brand-red bg-brand-red/5' 
            : 'border-ink-black bg-transparent'
        }`}
      />

    </div>
  );
};

export default CustomCursor;

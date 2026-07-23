import React, { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse details
    const mouse = {
      x: null,
      y: null,
      radius: 150 // Range of hover interaction
    };

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const particles = [];
    const particleCount = 35; // Kept clean and elegant

    const colors = [
      '255, 33, 79',   // Globiva Red
      '255, 185, 0',   // Warning Yellow
      '0, 180, 216',   // Neon Cyan
      '247, 37, 133'   // Neon Pink
    ];

    for (let i = 0; i < particleCount; i++) {
      const baseRadius = Math.random() * 3 + 2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius: baseRadius,
        currentRadius: baseRadius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        pushX: 0,
        pushY: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.05,
        glowIntensity: 0
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Apply velocity & drift
        p.x += p.vx + p.pushX;
        p.y += p.vy + p.pushY;

        // Apply friction to push velocity
        p.pushX *= 0.93;
        p.pushY *= 0.93;

        // Boundary wrapping
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        // Mouse distance evaluation
        let isHovered = false;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            isHovered = true;
            const force = (mouse.radius - distance) / mouse.radius;
            const pushDirX = dx / distance;
            const pushDirY = dy / distance;

            // Push particle away from cursor
            p.pushX += pushDirX * force * 1.8;
            p.pushY += pushDirY * force * 1.8;

            // Expand size and increase glow intensity when mouse is close
            p.currentRadius = p.baseRadius + force * 12;
            p.glowIntensity = force;
          }
        }

        // Return to base size smoothly if not hovered
        if (!isHovered) {
          p.currentRadius += (p.baseRadius - p.currentRadius) * 0.1;
          p.glowIntensity += (0 - p.glowIntensity) * 0.1;
        }

        p.angle += p.spinSpeed;

        // Render Concentric Neon HUD Ring Orb
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Active shadow glow effect
        if (p.glowIntensity > 0.05) {
          ctx.shadowBlur = p.glowIntensity * 20;
          ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        }

        // 1. Draw solid center core dot
        ctx.fillStyle = `rgba(${p.color}, ${0.4 + p.glowIntensity * 0.6})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.currentRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw outer orbital rings
        ctx.strokeStyle = `rgba(${p.color}, ${0.25 + p.glowIntensity * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Draw secondary dashed hud marks
        ctx.strokeStyle = `rgba(${p.color}, ${0.15 + p.glowIntensity * 0.4})`;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, p.currentRadius * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none"
    />
  );
};

export default ParticleBackground;

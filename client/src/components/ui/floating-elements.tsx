import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FloatingElementProps {
  className?: string;
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
  type?: 'bubbles' | 'shapes' | 'particles';
  color?: 'blue' | 'purple' | 'mixed';
  interactive?: boolean;
}

/**
 * A fun animated background element that adds visual interest to the UI
 * while maintaining a calm, relaxing feel.
 */
export function FloatingElements({
  className,
  density = 'medium',
  speed = 'medium',
  type = 'bubbles',
  color = 'mixed',
  interactive = true
}: FloatingElementProps) {
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const densityMap = {
      low: 10,
      medium: 15,
      high: 25
    };

    const speedMap = {
      slow: { min: 15, max: 25 },
      medium: { min: 10, max: 20 },
      fast: { min: 5, max: 15 }
    };

    const count = densityMap[density];
    const newElements = [];

    for (let i = 0; i < count; i++) {
      // Random position
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = Math.random() * 2 + 0.5; // Between 0.5 and 2.5rem
      const delay = Math.random() * 5; // Stagger animations
      const duration = Math.random() * (speedMap[speed].max - speedMap[speed].min) + speedMap[speed].min;
      
      // Random color based on color prop
      let bgColor = '';
      if (color === 'blue') {
        const opacity = Math.random() * 0.2 + 0.05; // Between 0.05 and 0.25
        bgColor = `rgba(59, 130, 246, ${opacity})`;
      } else if (color === 'purple') {
        const opacity = Math.random() * 0.2 + 0.05;
        bgColor = `rgba(139, 92, 246, ${opacity})`;
      } else {
        // Mixed colors - blues and purples
        const isBlue = Math.random() > 0.5;
        const opacity = Math.random() * 0.2 + 0.05;
        bgColor = isBlue 
          ? `rgba(59, 130, 246, ${opacity})` 
          : `rgba(139, 92, 246, ${opacity})`;
      }

      // Element shape based on type
      let shape: React.ReactNode;
      if (type === 'bubbles') {
        shape = (
          <div 
            key={i}
            className={cn(
              'absolute rounded-full blur-sm transition-transform',
              hoveredIdx === i && interactive ? 'scale-150 opacity-70' : ''
            )}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}rem`,
              height: `${size}rem`,
              background: bgColor,
              animation: `float ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              transform: `translateY(0px) scale(${hoveredIdx === i ? 1.5 : 1})`,
            }}
            onMouseEnter={() => interactive && setHoveredIdx(i)}
            onMouseLeave={() => interactive && setHoveredIdx(null)}
          />
        );
      } else if (type === 'shapes') {
        // Random shape
        const shapes = ['rounded-full', 'rounded-md', 'rounded-sm rotate-45'];
        const shapeClass = shapes[Math.floor(Math.random() * shapes.length)];
        
        shape = (
          <div 
            key={i}
            className={cn(
              'absolute blur-sm transition-transform',
              shapeClass,
              hoveredIdx === i && interactive ? 'scale-150 opacity-70' : ''
            )}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}rem`,
              height: `${size}rem`,
              background: bgColor,
              animation: `float ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              transform: `translateY(0px) scale(${hoveredIdx === i ? 1.5 : 1})`,
            }}
            onMouseEnter={() => interactive && setHoveredIdx(i)}
            onMouseLeave={() => interactive && setHoveredIdx(null)}
          />
        );
      } else if (type === 'particles') {
        const baseSize = size * 0.6; // Smaller for particles
        shape = (
          <div 
            key={i}
            className={cn(
              'absolute rounded-full blur-[0.5px] transition-transform',
              hoveredIdx === i && interactive ? 'scale-150 opacity-70' : ''
            )}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${baseSize}rem`,
              height: `${baseSize}rem`,
              background: bgColor,
              animation: `pulse ${duration}s ease-in-out infinite, float ${duration * 1.5}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              transform: `translateY(0px) scale(${hoveredIdx === i ? 1.5 : 1})`,
            }}
            onMouseEnter={() => interactive && setHoveredIdx(i)}
            onMouseLeave={() => interactive && setHoveredIdx(null)}
          />
        );
      }

      newElements.push(shape);
    }

    setElements(newElements);

    // Add keyframes for floating animation
    if (!document.getElementById('floating-keyframes')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'floating-keyframes';
      styleElement.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Clean up the injected styles on component unmount
      const styleElement = document.getElementById('floating-keyframes');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, [density, speed, type, color, interactive, hoveredIdx]);

  return (
    <div 
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none z-0',
        interactive && 'pointer-events-auto',
        className
      )}
      aria-hidden="true"
    >
      {elements}
    </div>
  );
}
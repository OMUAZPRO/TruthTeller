import React from 'react';
import { cn } from '@/lib/utils';

interface FunLoaderProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  text?: string;
  type?: 'dots' | 'spinner' | 'progress' | 'bounce';
  colorClass?: string;
}

/**
 * A fun, entertaining loading component with multiple animation types
 */
export function FunLoader({
  className,
  size = 'medium',
  text = 'Verifying news...',
  type = 'dots',
  colorClass = 'text-blue-500'
}: FunLoaderProps) {
  const sizeClasses = {
    small: 'text-sm gap-1',
    medium: 'text-base gap-2',
    large: 'text-lg gap-3'
  };

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={cn('flex items-center justify-center', sizeClasses[size])}>
            <div className={cn('animate-bounce delay-100 h-2 w-2 rounded-full', colorClass)} />
            <div className={cn('animate-bounce delay-200 h-2 w-2 rounded-full', colorClass)} />
            <div className={cn('animate-bounce delay-300 h-2 w-2 rounded-full', colorClass)} />
          </div>
        );
      
      case 'spinner':
        return (
          <div className="relative flex items-center justify-center">
            <div className={cn(
              'border-t-2 rounded-full animate-spin',
              colorClass.replace('text-', 'border-'),
              {
                'h-4 w-4 border-2': size === 'small',
                'h-6 w-6 border-2': size === 'medium',
                'h-8 w-8 border-3': size === 'large',
              }
            )} />
            <div className={cn(
              'absolute border-t-2 rounded-full animate-ping opacity-20',
              colorClass.replace('text-', 'border-'),
              {
                'h-4 w-4 border-2': size === 'small',
                'h-6 w-6 border-2': size === 'medium',
                'h-8 w-8 border-3': size === 'large',
              }
            )} />
          </div>
        );
      
      case 'progress':
        return (
          <div className={cn(
            'relative overflow-hidden bg-gray-200 rounded-full',
            {
              'h-1 w-16': size === 'small',
              'h-1.5 w-24': size === 'medium',
              'h-2 w-32': size === 'large',
            }
          )}>
            <div 
              className={cn('absolute top-0 h-full rounded-full', colorClass.replace('text-', 'bg-'))}
              style={{
                width: '30%',
                animation: 'progressAnim 1.5s ease-in-out infinite',
              }}
            />
          </div>
        );
        
      case 'bounce':
        return (
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'animate-bounce rounded-full',
                  colorClass.replace('text-', 'bg-'),
                  {
                    'h-1 w-1': size === 'small',
                    'h-1.5 w-1.5': size === 'medium',
                    'h-2 w-2': size === 'large',
                  }
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  // Add styles for the progress animation if needed
  React.useEffect(() => {
    if (type === 'progress' && !document.getElementById('progress-keyframes')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'progress-keyframes';
      styleElement.textContent = `
        @keyframes progressAnim {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      if (document.getElementById('progress-keyframes')) {
        const element = document.getElementById('progress-keyframes');
        if (element) document.head.removeChild(element);
      }
    };
  }, [type]);

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {renderLoader()}
      {text && (
        <p className={cn('mt-2 font-medium', colorClass, {
          'text-xs': size === 'small',
          'text-sm': size === 'medium',
          'text-base': size === 'large',
        })}>
          {text}
        </p>
      )}
    </div>
  );
}
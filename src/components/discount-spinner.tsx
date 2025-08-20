
'use client';

import type { DiscountSpinnerOutput } from '@/ai/flows/interactive-discount-spinner';
import React from 'react';
import { cn } from '@/lib/utils';

const defaultDiscounts = Array(8).fill({ name: '?', value: '' });

// Vibrant, professional colors
const segmentColors = [
  '#60a5fa', // blue-400
  '#818cf8', // indigo-400
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#facc15', // yellow-400
  '#a3e635', // lime-400
  '#4ade80', // green-400
  '#2dd4bf', // teal-400
];

type DiscountSpinnerProps = {
  discounts?: DiscountSpinnerOutput['discounts'];
  winningIndex: number | null;
  isSpinning: boolean;
};

export function DiscountSpinner({ discounts = defaultDiscounts, winningIndex, isSpinning }: DiscountSpinnerProps) {
  const numSegments = discounts.length;
  const segmentAngleDeg = 360 / numSegments;
  const size = 384; // w-96

  const finalRotation = winningIndex !== null
    ? -(winningIndex * segmentAngleDeg + segmentAngleDeg / 2)
    : 0;

  const spinCycles = 5;
  const startRotation = finalRotation + 360 * spinCycles;

  const rotationStyle: React.CSSProperties = {
    transition: isSpinning ? 'transform 4s cubic-bezier(0.33, 1, 0.68, 1)' : 'none',
    transform: `rotate(${isSpinning ? startRotation : finalRotation}deg)`,
  };

  const getSegmentStyle = (index: number): React.CSSProperties => {
    const colors = segmentColors.map((color, i) =>
        `${color} ${i * segmentAngleDeg}deg ${(i + 1) * segmentAngleDeg}deg`
    ).join(', ');

    return {
      background: `conic-gradient(${colors})`,
    };
  };

  const getTextPositionStyle = (index: number): React.CSSProperties => {
    const angle = segmentAngleDeg * index + (segmentAngleDeg / 2);
    const radius = size / 2 * 0.65; // Position text at 65% of the radius
    const x = Math.sin(angle * Math.PI / 180) * radius;
    const y = -Math.cos(angle * Math.PI / 180) * radius;

    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
      textAlign: 'center',
    };
  };

  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* The main spinner wheel */}
      <div
        className="absolute w-full h-full rounded-full border-8 border-white shadow-lg"
        style={{
          ...getSegmentStyle(0), // The gradient is the same for all, so just use index 0
          ...rotationStyle,
        }}
      >
        {/* White dividing lines */}
        {discounts.map((_, index) => (
          <div
            key={index}
            className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-white origin-bottom"
            style={{ transform: `rotate(${index * segmentAngleDeg}deg)` }}
          />
        ))}

        {/* Text Labels */}
        {discounts.map((discount, index) => {
          const angle = segmentAngleDeg * index + segmentAngleDeg / 2;
          return (
            <div key={index} style={getTextPositionStyle(index)}>
                <div
                    className="flex items-center justify-center text-white font-semibold text-xs text-center"
                    style={{
                        transform: `rotate(0deg)`,
                        maxWidth: '80px',
                        wordWrap: 'break-word',
                    }}
                >
                    {discount.name}
                </div>
            </div>
          );
        })}
      </div>


      {/* The unified pointer at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0L30 20L15 40L0 20L15 0Z" fill="#333333"/>
            <path d="M15 16L27.5 20L15 35.5L2.5 20L15 16Z" fill="#FEFEFE"/>
        </svg>
      </div>


      {/* The central "SPIN!" button */}
      <div className="absolute w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-gray-200 z-10">
        <span className="font-headline text-xl font-bold text-gray-700 select-none">SPIN!</span>
      </div>
    </div>
  );
}

'use client';

import React, { useRef, useEffect } from 'react';

interface AudioWaveformProps {
    audioLevel: number;
    color?: string;
    height?: number;
    animated?: boolean;
    speaking?: boolean;
}

export function AudioWaveform({
    audioLevel,
    color = 'bg-indigo-500',
    height = 60,
    animated = true,
    speaking = false
}: AudioWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set dimensions
        const width = canvas.width;
        const centerY = canvas.height / 2;

        // Draw waveform
        ctx.beginPath();

        // Normalized level (0-1)
        const normalizedLevel = Math.min(1, Math.max(0, audioLevel / 100));

        // Base bars (always showing)
        const barCount = 16;
        const barWidth = 3;
        const barGap = 3;
        const totalBarWidth = barWidth + barGap;
        const totalWidth = barCount * totalBarWidth;
        const startX = (width - totalWidth) / 2;

        // Draw each bar
        for (let i = 0; i < barCount; i++) {
            // Calculate height for this bar
            let barHeight;

            if (speaking) {
                // When speaking, create a dynamic waveform
                const barPosition = i / (barCount - 1); // 0 to 1
                const distanceFromCenter = Math.abs(barPosition - 0.5) * 2; // 0 to 1 (0 at center, 1 at edges)

                // Center bars are taller when speaking
                const baseHeight = Math.max(5, normalizedLevel * height * 0.4);

                // Dynamic height based on audio level and position
                if (animated) {
                    // Add randomness when animated
                    const randomFactor = speaking ? Math.random() * 0.5 : Math.random() * 0.1;
                    barHeight = baseHeight * (1 - distanceFromCenter * 0.7) * (0.8 + randomFactor);
                } else {
                    // Smoother curve when not animated
                    barHeight = baseHeight * (1 - distanceFromCenter * 0.7);
                }
            } else {
                // When not speaking, show a flat idle pattern
                const baseHeight = height * 0.15; // much smaller when idle

                if (animated) {
                    // Gentle random movement when idle but animated
                    barHeight = baseHeight * (0.7 + Math.random() * 0.3);
                } else {
                    // Completely flat when not animated and not speaking
                    const centerBar = i === Math.floor(barCount / 2) || i === Math.ceil(barCount / 2) - 1;
                    barHeight = baseHeight * (centerBar ? 1 : 0.7);
                }
            }

            // Draw the bar (centered vertically)
            const x = startX + i * totalBarWidth;
            ctx.fillStyle = color;
            ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
        }

        ctx.stroke();

    }, [audioLevel, color, height, animated, speaking]);

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={height}
            className="w-full h-full"
        />
    );
} 
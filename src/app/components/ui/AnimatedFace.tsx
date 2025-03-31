'use client';

import React, { useRef, useEffect } from 'react';

interface AnimatedFaceProps {
    speaking: boolean;
    emotion?: 'neutral' | 'happy' | 'thinking' | 'confused';
    audioLevel?: number;
}

export function AnimatedFace({
    speaking,
    emotion = 'neutral',
    audioLevel = 0
}: AnimatedFaceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const frameCountRef = useRef<number>(0);

    // Draw the animated face
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Animation settings
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const faceRadius = Math.min(width, height) * 0.35;

        // Normalized audio level (0-1)
        const normalizedLevel = Math.min(1, Math.max(0, audioLevel / 100));

        // Animation frame
        const animate = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Increment frame counter
            frameCountRef.current += 1;

            // Draw face
            drawFace(ctx, centerX, centerY, faceRadius, normalizedLevel, frameCountRef.current, speaking, emotion);

            // Continue animation
            animationRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [speaking, emotion, audioLevel]);

    return (
        <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="w-full max-w-[240px] mx-auto"
        />
    );
}

// Helper function to draw the face
function drawFace(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    audioLevel: number,
    frameCount: number,
    speaking: boolean,
    emotion: string
) {
    // Face
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(236, 233, 252, 0.9)';
    ctx.fill();

    // Add subtle gradient
    const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX, centerY, radius * 1.2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(180, 160, 255, 0.1)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Eyes base positions
    const eyeDistance = radius * 0.5;
    const eyeY = centerY - radius * 0.1;
    const leftEyeX = centerX - eyeDistance / 2;
    const rightEyeX = centerX + eyeDistance / 2;
    const eyeSize = radius * 0.15;

    // Subtle eye movement based on frame
    const eyeMovement = Math.sin(frameCount / 50) * radius * 0.03;

    // Left Eye
    drawEye(ctx, leftEyeX + eyeMovement, eyeY, eyeSize, frameCount, emotion);

    // Right Eye
    drawEye(ctx, rightEyeX + eyeMovement, eyeY, eyeSize, frameCount, emotion);

    // Mouth
    drawMouth(ctx, centerX, centerY + radius * 0.3, radius * 0.6, radius * 0.1, speaking, audioLevel, frameCount, emotion);
}

// Helper function to draw eye
function drawEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    frameCount: number,
    emotion: string
) {
    // Blinking occasionally
    const blinkInterval = 120;
    const isBlinking = frameCount % blinkInterval < 5;

    // Eye white
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Eye shape/expression changes based on emotion
    let pupilSize = size * 0.55;
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;

    if (emotion === 'thinking') {
        // Looking up when thinking
        pupilOffsetY = -size * 0.2;
    } else if (emotion === 'confused') {
        // Slightly off-center for confused
        pupilOffsetX = size * 0.1;
        pupilOffsetY = size * 0.1;
    } else if (emotion === 'happy') {
        // Smaller, upturned pupils for happy
        pupilSize = size * 0.5;
        pupilOffsetY = -size * 0.1;
    }

    // Add subtle movement
    const pupilMovement = Math.sin(frameCount / 60) * size * 0.1;
    pupilOffsetX += pupilMovement;

    // Pupil
    if (!isBlinking) {
        ctx.beginPath();
        ctx.arc(x + pupilOffsetX, y + pupilOffsetY, pupilSize, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();

        // Light reflection
        ctx.beginPath();
        ctx.arc(x + pupilOffsetX - pupilSize * 0.3, y + pupilOffsetY - pupilSize * 0.3, pupilSize * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
    } else {
        // Draw closed eye when blinking
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.quadraticCurveTo(x, y, x + size, y);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Helper function to draw mouth
function drawMouth(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    speaking: boolean,
    audioLevel: number,
    frameCount: number,
    emotion: string
) {
    // Speaking animation - mouth opens more with higher audio level
    let mouthHeight = height;
    let mouthY = y;
    let curveDirection = 1; // 1: smile, -1: frown, 0: neutral

    // Adjust based on emotion
    if (emotion === 'happy') {
        curveDirection = 1.5;
        mouthY -= height * 0.5;
    } else if (emotion === 'confused') {
        curveDirection = -0.3;
        mouthY += height * 0.5;
    } else if (emotion === 'thinking') {
        curveDirection = 0;
        // Offset mouth to one side when thinking
        x += width * 0.1;
        width *= 0.6;
    } else {
        curveDirection = 0.3; // slight smile for neutral
    }

    if (speaking) {
        // Dynamic mouth height based on audio level
        const speakingHeight = height * 2 * (0.5 + audioLevel * 0.5);

        // Add some randomness to mouth movement when speaking
        const pulseFactor = 0.7 + Math.sin(frameCount / 3) * 0.3;
        mouthHeight = speakingHeight * pulseFactor;

        // When speaking, less of a smile/frown
        curveDirection *= 0.5;
    }

    // Draw mouth
    ctx.beginPath();
    ctx.moveTo(x - width / 2, mouthY);

    // Control points for the curve
    const cpX1 = x;
    const cpY1 = mouthY + curveDirection * height * 2;
    const cpX2 = x;
    const cpY2 = mouthY + mouthHeight;

    // Draw the curve
    ctx.quadraticCurveTo(cpX1, cpY1, x + width / 2, mouthY);

    if (speaking || mouthHeight > height) {
        // For open mouth, draw the bottom curve
        ctx.lineTo(x + width / 2, mouthY + mouthHeight);
        ctx.quadraticCurveTo(cpX2, cpY2 + curveDirection * height, x - width / 2, mouthY + mouthHeight);
        ctx.closePath();

        // Fill the mouth
        ctx.fillStyle = 'rgba(70, 50, 80, 0.2)';
        ctx.fill();
    }

    // Outline
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();
} 
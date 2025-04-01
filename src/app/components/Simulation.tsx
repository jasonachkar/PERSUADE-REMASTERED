'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { AnimatedFace } from './ui/AnimatedFace';
import { AudioWaveform } from './ui/AudioWaveform';
import {
    Mic, MicOff, PhoneOff,
    Volume2, RefreshCw,
    ArrowRight, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Customer emotions
const EMOTIONS = ['friendly', 'skeptical', 'curious', 'neutral', 'irritated'];

// Difficulty levels
const DIFFICULTY_LEVELS = ['easy', 'moderate', 'difficult'];

// Products
const PRODUCTS = [
    'Smart Home System',
    'Business Software',
    'Electric Vehicle',
    'Solar Panel Installation',
    'Financial Service Package',
    'Healthcare Plan',
    'Subscription Service'
];

// Evaluation feedback interface
interface FeedbackItem {
    aspect: string;
    score: number;
    comment: string;
}

interface Evaluation {
    overallScore: number;
    detailedFeedback: FeedbackItem[];
    summary: string;
}

export default function Simulation() {
    // Simulation state
    const [simulationState, setSimulationState] = useState<'setup' | 'calling' | 'results'>('setup');
    const [customerEmotion, setCustomerEmotion] = useState<string>('friendly');
    const [callDifficulty, setCallDifficulty] = useState<string>('moderate');
    const [product, setProduct] = useState<string>('Smart Home System');

    // Call state
    const [callDuration, setCallDuration] = useState(0);
    const callDurationRef = useRef<NodeJS.Timeout | null>(null);

    // Feedback/evaluation
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

    // Simulated bot speaking state
    const [botSpeaking, setBotSpeaking] = useState(false);
    const botSpeakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Hook up WebRTC for audio
    const {
        status,
        isMuted,
        startCall,
        toggleMute,
        endCall,
        audioLevel,
        messages
    } = useWebRTC({
        onMessage: (message) => {
            console.log('User message:', message);
            // Simulate bot response after user speaks
            simulateBotSpeaking();
        }
    });

    // Simulates the bot speaking
    const simulateBotSpeaking = () => {
        // Clear any existing timeout
        if (botSpeakingTimeoutRef.current) {
            clearTimeout(botSpeakingTimeoutRef.current);
        }

        // Set bot to speaking state
        setBotSpeaking(true);

        // Randomly determine how long bot speaks (3-7 seconds)
        const speakingDuration = 3000 + Math.random() * 4000;

        // Set timeout to stop speaking
        botSpeakingTimeoutRef.current = setTimeout(() => {
            setBotSpeaking(false);
        }, speakingDuration);
    };

    // Start timer when call is connected
    useEffect(() => {
        if (status === 'connected' && simulationState === 'calling') {
            // Start timer
            callDurationRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);

            // Simulate initial bot greeting
            setTimeout(simulateBotSpeaking, 1000);
        }

        return () => {
            if (callDurationRef.current) {
                clearInterval(callDurationRef.current);
            }
        };
    }, [status, simulationState]);

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (botSpeakingTimeoutRef.current) {
                clearTimeout(botSpeakingTimeoutRef.current);
            }

            if (callDurationRef.current) {
                clearInterval(callDurationRef.current);
            }
        };
    }, []);

    // Handle starting the simulation
    const handleStartSimulation = async () => {
        setSimulationState('calling');
        await startCall(customerEmotion, callDifficulty, product);
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // End call and show results
    const handleEndCall = async () => {
        // End WebRTC call
        endCall();

        // Stop timer
        if (callDurationRef.current) {
            clearInterval(callDurationRef.current);
        }

        try {
            // Call API to evaluate the conversation
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages }),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            setEvaluation(data);
            setSimulationState('results');
        } catch (error) {
            console.error('Error evaluating call:', error);
            // Fallback evaluation
            setEvaluation({
                overallScore: 3,
                detailedFeedback: [
                    {
                        aspect: "Listening Skills",
                        score: 3,
                        comment: "You demonstrated adequate listening skills."
                    },
                    {
                        aspect: "Product Knowledge",
                        score: 3,
                        comment: "Your product knowledge was satisfactory."
                    },
                    {
                        aspect: "Objection Handling",
                        score: 3,
                        comment: "You handled objections reasonably well."
                    },
                    {
                        aspect: "Communication Style",
                        score: 3,
                        comment: "Your communication style was clear and professional."
                    }
                ],
                summary: "You showed good potential in this call. Continue practicing to improve your skills."
            });
            setSimulationState('results');
        }
    };

    // Restart simulation
    const handleRestartSimulation = () => {
        setSimulationState('setup');
        setCallDuration(0);
        setEvaluation(null);
    };

    // Determine the bot's emotion based on customerEmotion
    const getBotEmotion = () => {
        switch (customerEmotion) {
            case 'friendly': return 'happy';
            case 'skeptical': return 'thinking';
            case 'irritated': return 'confused';
            default: return 'neutral';
        }
    };

    // Render setup screen
    const renderSetup = () => (
        <div className="max-w-xl mx-auto p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl animate-scale-up">
            <h2 className="text-2xl font-bold mb-6 text-indigo-800">Configure Your Simulation</h2>

            <div className="space-y-6 mb-8">
                {/* Customer emotion selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Emotion
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {EMOTIONS.map((emotion) => (
                            <button
                                key={emotion}
                                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all duration-300 ${customerEmotion === emotion
                                    ? 'bg-indigo-600 text-white font-medium shadow-md transform scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                onClick={() => setCustomerEmotion(emotion)}
                            >
                                {emotion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty level selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {DIFFICULTY_LEVELS.map((level) => (
                            <button
                                key={level}
                                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all duration-300 ${callDifficulty === level
                                    ? 'bg-indigo-600 text-white font-medium shadow-md transform scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                onClick={() => setCallDifficulty(level)}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product to Sell
                    </label>
                    <select
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                        {PRODUCTS.map((prod) => (
                            <option key={prod} value={prod}>
                                {prod}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleStartSimulation}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
                <span>Start Simulation</span>
                <ArrowRight size={18} />
            </button>
        </div>
    );

    // Render calling screen
    const renderCalling = () => (
        <div className="max-w-2xl mx-auto animate-fade-in">
            {/* Call status bar */}
            <div className="bg-indigo-900/90 text-white p-3 rounded-t-2xl flex items-center justify-between backdrop-blur-sm shadow-md">
                <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                    <span className="text-sm font-medium">
                        {status === 'connected' ? 'Call in progress' : 'Connecting...'}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{formatTime(callDuration)}</span>
                </div>
            </div>

            {/* Main call area */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-b-2xl shadow-xl">
                {/* Virtual customer */}
                <div className="mb-8">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Virtual Customer</h3>
                        <p className="text-sm text-gray-500 capitalize">{customerEmotion} | {callDifficulty} difficulty</p>
                    </div>

                    <div className="relative">
                        {/* Animated face */}
                        <div className="mb-4">
                            <AnimatedFace
                                speaking={botSpeaking}
                                emotion={getBotEmotion() as 'neutral' | 'happy' | 'thinking' | 'confused'}
                                audioLevel={botSpeaking ? 70 + Math.random() * 30 : 0}
                            />
                        </div>

                        {/* Audio waveform */}
                        <div className="h-12 mb-4">
                            <AudioWaveform
                                audioLevel={botSpeaking ? 70 + Math.random() * 30 : 0}
                                color="#6366f1"
                                speaking={botSpeaking}
                            />
                        </div>

                        {/* Speaking indicator */}
                        <div className={`text-center text-sm font-medium transition-opacity duration-300 ${botSpeaking ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-indigo-600">Speaking...</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* User audio */}
                <div className="mb-8">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">You</h3>
                        <p className="text-sm text-gray-500">{isMuted ? 'Microphone muted' : 'Microphone active'}</p>
                    </div>

                    <div className="h-12 mb-4">
                        <AudioWaveform
                            audioLevel={isMuted ? 0 : audioLevel}
                            color="#22c55e"
                            speaking={!isMuted && audioLevel > 20}
                        />
                    </div>
                </div>

                {/* Call controls */}
                <div className="flex justify-center space-x-6">
                    {/* Mute button */}
                    <button
                        onClick={toggleMute}
                        className={`p-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${isMuted ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                            }`}
                        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    {/* End call button */}
                    <button
                        onClick={handleEndCall}
                        className="p-5 bg-red-600 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
                        aria-label="End call"
                    >
                        <PhoneOff size={24} />
                    </button>

                    {/* Volume button - just for UI, not functional */}
                    <button
                        className="p-5 bg-white text-gray-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
                        aria-label="Volume"
                    >
                        <Volume2 size={24} />
                    </button>
                </div>
            </div>
        </div>
    );

    // Render feedback/results screen
    const renderResults = () => {
        if (!evaluation) return null;

        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-4 text-white">
                        <h2 className="text-2xl font-bold">Call Evaluation</h2>
                        <p className="opacity-80">
                            {formatTime(callDuration)} minute{callDuration >= 60 ? 's' : ''} with {customerEmotion} customer ({callDifficulty} difficulty)
                        </p>
                    </div>

                    {/* Overall score */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Overall Performance</h3>
                                <p className="text-gray-500">Your call effectiveness score</p>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-4 border-indigo-100 shadow-md animate-scale-up">
                                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                        {evaluation.overallScore}/5
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed feedback */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Feedback</h3>

                        <div className="grid gap-6 mb-8 md:grid-cols-2">
                            {evaluation.detailedFeedback.map((feedback: FeedbackItem, index: number) => (
                                <Card key={index} className="border-none shadow-md animate-scale-up stagger-item">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-semibold flex items-center justify-between">
                                            <span>{feedback.aspect}</span>
                                            <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                                {feedback.score}/5
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">{feedback.comment}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                <CheckCircle2 size={20} className="text-indigo-600 mr-2" />
                                Summary
                            </h3>
                            <p className="text-gray-700">{evaluation.summary}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleRestartSimulation}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center"
                            >
                                <RefreshCw size={18} className="mr-2" />
                                <span>New Simulation</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render component based on state
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 py-12 px-4">
            <div className="mb-8 text-center animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Voice Call Simulator
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Practice your sales skills in a realistic conversation with an AI customer.
                    Receive detailed feedback to improve your performance.
                </p>
            </div>

            {simulationState === 'setup' && renderSetup()}
            {simulationState === 'calling' && renderCalling()}
            {simulationState === 'results' && renderResults()}
        </div>
    );
}
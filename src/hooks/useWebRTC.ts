import { useState, useEffect, useRef, useCallback } from 'react';

export type WebRTCStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface UseWebRTCProps {
    onAudioData?: (audioData: Float32Array) => void;
    onMessage?: (message: string) => void;
}

// SpeechRecognition types
interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        [index: number]: {
            isFinal: boolean;
            0: SpeechRecognitionResult;
            length: number;
        };
        length: number;
    };
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
}

export function useWebRTC({ onAudioData, onMessage }: UseWebRTCProps = {}) {
    const [status, setStatus] = useState<WebRTCStatus>('disconnected');
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioAnalyserRef = useRef<AnalyserNode | null>(null);
    const audioDataRef = useRef<Float32Array | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Audio visualization data
    const [audioLevel, setAudioLevel] = useState(0);

    // Setup WebRTC
    const setupPeerConnection = useCallback(() => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnectionRef.current = peerConnection;

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate', event.candidate);
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state', peerConnection.iceConnectionState);

            if (peerConnection.iceConnectionState === 'connected') {
                setStatus('connected');
            } else if (peerConnection.iceConnectionState === 'failed') {
                setStatus('failed');
                setError('Connection failed. Please try again.');
            } else if (peerConnection.iceConnectionState === 'disconnected') {
                setStatus('disconnected');
            }
        };

        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            console.log('Received remote track', remoteStream);

            // Setup audio context for remote audio
            if (audioContextRef.current === null) {
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;

                const source = audioContext.createMediaStreamSource(remoteStream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                audioAnalyserRef.current = analyser;
                audioDataRef.current = new Float32Array(analyser.frequencyBinCount);

                // Visualize audio
                const visualize = () => {
                    if (audioAnalyserRef.current && audioDataRef.current) {
                        audioAnalyserRef.current.getFloatTimeDomainData(audioDataRef.current);

                        let sum = 0;
                        for (let i = 0; i < audioDataRef.current.length; i++) {
                            sum += Math.abs(audioDataRef.current[i]);
                        }
                        const average = sum / audioDataRef.current.length;

                        // Scale the level (0-100)
                        const scaledLevel = Math.min(100, average * 200);
                        setAudioLevel(scaledLevel);

                        if (onAudioData) {
                            onAudioData(audioDataRef.current);
                        }
                    }

                    requestAnimationFrame(visualize);
                };

                visualize();

                // Connect to audio output
                const remoteAudio = new Audio();
                remoteAudio.srcObject = remoteStream;
                remoteAudio.play();
            }
        };

        return peerConnection;
    }, [onAudioData]);

    // Start call
    const startCall = useCallback(async (customerEmotion: string, callDifficulty: string, product: string) => {
        try {
            setStatus('connecting');
            setError(null);

            // Reset messages
            setMessages([]);

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            // Setup speech recognition
            if ('webkitSpeechRecognition' in window) {
                // TypeScript doesn't know about webkitSpeechRecognition so we need to cast
                const SpeechRecognitionAPI = window.webkitSpeechRecognition ||
                    (window as any).webkitSpeechRecognition;

                const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;

                        if (event.results[i].isFinal) {
                            setTranscript(prev => prev + ' ' + transcript);

                            // Add to messages
                            setMessages(prev => [...prev, { role: 'user', content: transcript }]);

                            if (onMessage) {
                                onMessage(transcript);
                            }
                        }
                    }
                };

                recognition.start();
                recognitionRef.current = recognition;
            }

            // Create and setup peer connection
            const peerConnection = setupPeerConnection();

            // Add local tracks to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            // Create offer
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
            });

            await peerConnection.setLocalDescription(offer);

            // Send offer to server
            const response = await fetch('/api/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    offerSdp: offer.sdp,
                    customerEmotion,
                    callDifficulty,
                    product
                }),
            });

            if (!response.ok) {
                console.error('API Response Status:', response.status);
                console.error('API Response Text:', await response.text());
                throw new Error(`Failed to start session: ${response.status}`);
            }

            const { answerSdp } = await response.json();

            // Set remote description
            const remoteDesc = new RTCSessionDescription({
                type: 'answer',
                sdp: answerSdp,
            });

            await peerConnection.setRemoteDescription(remoteDesc);

            // Add system message
            setMessages(prev => [...prev, {
                role: 'system',
                content: `Call started with a ${customerEmotion.toLowerCase()} customer at ${callDifficulty.toLowerCase()} difficulty level about ${product}.`
            }]);

        } catch (err) {
            console.error('Error starting call:', err);
            setStatus('failed');
            setError(err instanceof Error ? err.message : 'Failed to start call');
            endCall();
        }
    }, [setupPeerConnection, onMessage]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();

            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });

            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    // End call
    const endCall = useCallback(() => {
        // Stop local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
            audioAnalyserRef.current = null;
            audioDataRef.current = null;
        }

        // Stop speech recognition
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        setStatus('disconnected');
        setIsMuted(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endCall();
        };
    }, [endCall]);

    return {
        status,
        error,
        isMuted,
        startCall,
        toggleMute,
        endCall,
        audioLevel,
        transcript,
        messages
    };
} 
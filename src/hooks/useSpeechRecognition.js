import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = (onSpeechEnd) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);
    const transcriptRef = useRef(''); // Ref to keep track of latest transcript

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('Browser does not support speech recognition.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            transcriptRef.current = ''; // Reset on start
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const currentTranscript = finalTranscript || interimTranscript;
            setTranscript(currentTranscript);
            transcriptRef.current = currentTranscript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (onSpeechEnd) {
                onSpeechEnd(transcriptRef.current);
            }
        };

        recognitionRef.current = recognition;
    }, [onSpeechEnd]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            transcriptRef.current = '';
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const hasSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    return { isListening, transcript, startListening, stopListening, hasRecognition: hasSupport };
};

export default useSpeechRecognition;

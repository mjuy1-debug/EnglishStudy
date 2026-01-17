export const speakText = (text, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) {
        console.warn('Browser does not support text-to-speech');
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for learning

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
        v.lang.includes(lang) && (v.name.includes('Google') || v.name.includes('Samantha'))
    );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
};


import { useState, useCallback, useRef } from 'react';

export const useVoiceSearch = (
  lang: string, 
  onResult: (text: string) => void, 
  t: (key: string) => string
) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t('voiceSearchNotSupported'));
      return;
    }

    if (isListening) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition', error);
      setIsListening(false);
    }
  }, [lang, t, isListening, onResult]);

  return { isListening, startListening };
};

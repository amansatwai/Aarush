import { useCallback, useEffect, useState } from 'react';
import {
  getVoiceStatus,
  initializeVoiceAssistant,
  muteAssistant,
  setLanguage,
  setSpeechPitch,
  setSpeechRate,
  setVoice,
  speak,
  startListening,
  stopListening,
  subscribeToVoiceEvents,
  unmuteAssistant,
} from '../utils/voiceAssistantEngine';
import {
  executeCommand,
  getCommandHistory,
} from '../utils/naturalLanguageEngine';

export default function useVoiceAssistant(
  navigate
) {
  const [status, setStatus] =
    useState(getVoiceStatus());
  const [transcript, setTranscript] =
    useState('');
  const [response, setResponse] =
    useState('');
  const [history, setHistory] =
    useState([]);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setStatus(getVoiceStatus());
    setHistory(getCommandHistory());
  }, []);

  const handleResult = useCallback(
    async (text) => {
      try {
        setTranscript(text);

        const result = await executeCommand(text, {
          navigate,
          speak: (message) => {
            setResponse(message);
            speak(message);
          },
        });

        setResponse(
          result?.message ||
            result?.content ||
            'Command completed.'
        );
        refresh();
      } catch (commandError) {
        setError(
          commandError?.message ||
            'Unable to execute voice command.'
        );
      }
    },
    [navigate, refresh]
  );

  useEffect(() => {
    initializeVoiceAssistant({
      onResult: handleResult,
      onError: setError,
    });

    const unsubscribe =
      subscribeToVoiceEvents((event) => {
        setStatus(getVoiceStatus());

        if (event.type === 'error') {
          setError(event.error);
        }
      });

    refresh();

    return unsubscribe;
  }, [handleResult, refresh]);

  return {
    status,
    transcript,
    response,
    history,
    error,
    start: startListening,
    stop: stopListening,
    speak,
    mute: muteAssistant,
    unmute: unmuteAssistant,
    setLanguage,
    setVoice,
    setSpeechRate,
    setSpeechPitch,
    refresh,
  };
}
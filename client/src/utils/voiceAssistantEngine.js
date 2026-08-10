const listeners = new Set();

let recognition = null;
let listening = false;
let muted = false;
let language = 'en-IN';
let voiceName = '';
let speechRate = 1;
let speechPitch = 1;

function emit(event) {
  listeners.forEach((listener) => listener(event));
}

function getRecognitionConstructor() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  );
}

export function initializeVoiceAssistant({
  onResult,
  onError,
  onEnd,
} = {}) {
  const Recognition =
    getRecognitionConstructor();

  if (!Recognition) {
    return {
      supported: false,
      listening: false,
      speechSynthesis:
        typeof window !== 'undefined' &&
        Boolean(window.speechSynthesis),
    };
  }

  recognition = new Recognition();
  recognition.lang = language;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    emit({
      type: 'start',
      listening: true,
    });
  };

  recognition.onresult = (event) => {
    const result =
      event.results?.[0]?.[0]?.transcript || '';

    emit({
      type: 'result',
      text: result,
      listening,
    });

    onResult?.(result);
  };

  recognition.onerror = (event) => {
    listening = false;

    emit({
      type: 'error',
      error: event.error,
      listening: false,
    });

    onError?.(event.error);
  };

  recognition.onend = () => {
    listening = false;

    emit({
      type: 'end',
      listening: false,
    });

    onEnd?.();
  };

  return {
    supported: true,
    listening,
    speechSynthesis:
      typeof window !== 'undefined' &&
      Boolean(window.speechSynthesis),
  };
}

export function startListening() {
  if (!recognition) {
    initializeVoiceAssistant();
  }

  if (!recognition) {
    throw new Error(
      'Speech recognition is not supported.'
    );
  }

  if (!listening) {
    recognition.lang = language;
    recognition.start();
  }

  return true;
}

export function stopListening() {
  recognition?.stop();
  listening = false;

  emit({
    type: 'stop',
    listening: false,
  });

  return true;
}

export function speak(text) {
  if (
    muted ||
    !text ||
    typeof window === 'undefined' ||
    !window.speechSynthesis
  ) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    text
  );

  const voices =
    window.speechSynthesis.getVoices();

  const selected = voices.find(
    (voice) => voice.name === voiceName
  );

  if (selected) {
    utterance.voice = selected;
  }

  utterance.lang = language;
  utterance.rate = speechRate;
  utterance.pitch = speechPitch;

  utterance.onstart = () =>
    emit({ type: 'speaking', text });

  utterance.onend = () =>
    emit({ type: 'spoken', text });

  window.speechSynthesis.speak(utterance);

  return true;
}

export function muteAssistant() {
  muted = true;
  window.speechSynthesis?.cancel();
  emit({ type: 'muted', muted: true });
  return true;
}

export function unmuteAssistant() {
  muted = false;
  emit({ type: 'muted', muted: false });
  return true;
}

export function getVoiceStatus() {
  return {
    supported: Boolean(
      getRecognitionConstructor()
    ),
    speechSynthesis:
      typeof window !== 'undefined' &&
      Boolean(window.speechSynthesis),
    listening,
    muted,
    language,
    voice: voiceName,
    speechRate,
    speechPitch,
  };
}

export function getSupportedLanguages() {
  return [
    { code: 'en-IN', label: 'English India' },
    { code: 'en-US', label: 'English US' },
    { code: 'hi-IN', label: 'Hindi India' },
    { code: 'bn-IN', label: 'Bengali India' },
    { code: 'ta-IN', label: 'Tamil India' },
  ];
}

export function setLanguage(nextLanguage) {
  language = nextLanguage || 'en-IN';

  if (recognition) {
    recognition.lang = language;
  }

  emit({
    type: 'language',
    language,
  });

  return language;
}

export function setVoice(nextVoice) {
  voiceName = nextVoice || '';
  emit({
    type: 'voice',
    voice: voiceName,
  });

  return voiceName;
}

export function setSpeechRate(rate) {
  speechRate = Math.max(
    0.5,
    Math.min(2, Number(rate || 1))
  );

  return speechRate;
}

export function setSpeechPitch(pitch) {
  speechPitch = Math.max(
    0,
    Math.min(2, Number(pitch || 1))
  );

  return speechPitch;
}

export function getAvailableVoices() {
  if (
    typeof window === 'undefined' ||
    !window.speechSynthesis
  ) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

export function subscribeToVoiceEvents(
  callback
) {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}
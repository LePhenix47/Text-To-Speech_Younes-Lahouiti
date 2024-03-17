/**
 * Utility class encapsulating the Web Speech API's Text-to-Speech functionality, offering enhanced developer convenience and customizability.
 * @example
 * import TextToSpeech from '@lephenix-47/text-to-speech';
 *
 * const ttsInstance = new TextToSpeech();
 * ttsInstance
 *   .setVoiceRate(1)
 *   .setText('Hello World!');
 * ttsInstance.speak();
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */
class TextToSpeech {
  /**
   * @private
   * @type {SpeechSynthesisUtterance}
   * @readonly
   * Represents the internal [object utilized for controlling speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/SpeechSynthesisUtterance). Instantiated privately and immutably scoped to each individual TextToSpeech instance.
   */
  private readonly utterance: SpeechSynthesisUtterance;

  constructor() {
    this.utterance = new SpeechSynthesisUtterance();
  }

  /**
   * Set voice rate.
   * @param {number} rate - Rate value (0 - 10).
   * @returns The current instance of TextToSpeech for method chaining.
   */
  setVoiceRate = (rate: number): TextToSpeech => {
    this.utterance.rate = rate;
    return this;
  };

  /**
   * Set voice pitch.
   * @param {number} pitch - Pitch value (0 - 3).
   * @returns The current instance of TextToSpeech for method chaining.
   */
  setVoicePitch = (pitch: number): TextToSpeech => {
    this.utterance.pitch = pitch;

    return this;
  };

  /**
   * Set volume level.
   * @param volumeLevel - Volume level (0 - 1).
   * @returns The current instance of TextToSpeech for method chaining.
   */
  setVolume = (volumeLevel: number): TextToSpeech => {
    this.utterance.volume = volumeLevel;

    return this;
  };

  /**
   * Set language.
   * @param {string} languageCode - Language code (e.g., 'en-US').
   * @returns The current instance of TextToSpeech for method chaining.
   */
  setLanguage = (languageCode: string): TextToSpeech => {
    this.utterance.lang = languageCode;

    return this;
  };

  /**
   * Set voice speech.
   * @param {SpeechSynthesisVoice} voiceObject - SpeechSynthesisVoice object.
   * @returns The current instance of TextToSpeech for method chaining.
   */
  setVoiceSpeech = (voiceObject: SpeechSynthesisVoice): TextToSpeech => {
    this.utterance.voice = voiceObject;

    return this;
  };

  /**
   * Set the text to be spoken by the `TextToSpeech` instance.
   *
   * @param {string} utteranceText - The text to be spoken.
   *
   * @returns {TextToSpeech} - The current instance of TextToSpeech for method chaining.
   */
  setVoiceTest = (utteranceText: string): TextToSpeech => {
    this.utterance.text = utteranceText;

    return this;
  };

  /**
   * Get available voices.
   * @param {string} optionalCountryCodeFilter - Optional country code filter.
   * @returns Array of available SpeechSynthesisVoice objects.
   */
  getVoices = (optionalCountryCodeFilter?: string): SpeechSynthesisVoice[] => {
    const voices = speechSynthesis.getVoices();
    if (!optionalCountryCodeFilter) {
      return voices;
    }

    return voices.filter((voice) =>
      voice.lang.includes(optionalCountryCodeFilter)
    );
  };

  /**
   * Speak the given text.
   * @param utteranceText - Text to speak.
   */
  speak = (): void => {
    speechSynthesis.speak(this.utterance);
  };

  /**
   * Cancel speech.
   */
  cancelSpeech = (): void => {
    speechSynthesis.cancel();
  };

  /**
   * Pause speech.
   */
  pauseSpeech = (): void => {
    speechSynthesis.pause();
  };

  /**
   * Resume speech.
   */
  resumeSpeech = (): void => {
    speechSynthesis.resume();
  };

  /**
   * Readonly property: Indicates if speech is paused.
   */
  get isPaused(): boolean {
    return speechSynthesis.paused;
  }

  /**
   * Readonly property: Indicates if speech is speaking.
   */
  get isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }

  /**
   * Readonly property: Indicates if there is pending speech.
   */
  get isPending(): boolean {
    return speechSynthesis.pending;
  }
}

export default TextToSpeech;

//Web components
import {
  selectQuery,
  selectQueryAll,
  setStyleProperty,
} from "@utils/functions/helper-functions/dom.functions";

import { Options } from "@utils/types/options.types";
import { OptionsMaxValues } from "@utils/variables/enums.variables";

import { WebStorage } from "@lephenix47/webstorage-utility";
import { TextToSpeech } from "@lephenix47/text-to-speech-utility";

import { fixInputRangeBackground } from "@utils/functions/event-listeners/input-range-thumb-fix.functions";
import { checkIfDefaultValuesAreSetInLocalStorage } from "@utils/functions/event-listeners/default-from-web-storage.functions";

const textToSpeechUtility = new TextToSpeech();

let indexOfCurrentWordSpoken: number = 0;

const textAreaElement = selectQuery<HTMLTextAreaElement>("textarea");

const voiceSelectionElement = selectQuery<HTMLSelectElement>(
  "select#voice-selection"
);
const voiceRateInputElement = selectQuery<HTMLInputElement>("input#voice-rate");
const voiceRateOutputElement = selectQuery<HTMLOutputElement>(
  "output[name=voice-rate]"
);

const voicePitchInputElement =
  selectQuery<HTMLInputElement>("input#voice-pitch");
const voicePitchOutputElement = selectQuery<HTMLOutputElement>(
  "output[name=voice-pitch]"
);

const voiceVolumeInputElement =
  selectQuery<HTMLInputElement>("input#voice-volume");
const voiceVolumeOutputElement = selectQuery<HTMLOutputElement>(
  "output[name=voice-volume]"
);

const startSpeakingButton = selectQuery<HTMLButtonElement>(
  ".index__button--start"
);

const pauseSpeakingButton = selectQuery<HTMLButtonElement>(
  ".index__button--pause"
);

const stopSpeakingButton = selectQuery<HTMLButtonElement>(
  ".index__button--stop"
);

// * Initalization
const inputElements: (
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLInputElement
)[] = [
  voiceSelectionElement,
  voiceRateInputElement,
  voicePitchInputElement,
  voiceVolumeInputElement,
  textAreaElement,
];

const outputElements: HTMLOutputElement[] = [
  null,
  voiceRateOutputElement,
  voicePitchOutputElement,
  voiceVolumeOutputElement,
  null,
];

const outputElementsMap: Map<
  HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement,
  HTMLOutputElement
> = new Map();

const voicesByLanguageMap = new Map<string, SpeechSynthesisVoice[]>();

function populateOutputElementsMap(): void {
  for (let i = 0; i < inputElements.length; i++) {
    outputElementsMap.set(inputElements[i], outputElements[i]);
  }
}
populateOutputElementsMap();

checkIfDefaultValuesAreSetInLocalStorage();

// * Event listeners
fixInputRangeBackground();

function addInputsEventListeners(): void {
  for (const element of inputElements) {
    setDefaultValueIfPossible(element);

    element.addEventListener("change", setSpeechUtterance);
    element.addEventListener("input", setSpeechUtteranceSettings);
  }
}

function setDefaultValueIfPossible(
  element: HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement
): void {
  const { rate, pitch, text, volume } = WebStorage.getKey<Options>(
    "text-to-speech-options"
  );

  let defaultValue = null;

  switch (element.name) {
    case "voice-selection": {
      const chosenVoice: SpeechSynthesisVoice = getChosenVoice(element.value);

      textToSpeechUtility.setVoiceSpeech(chosenVoice);
      break;
    }

    case "voice-rate": {
      const output = outputElementsMap.get(element);
      output.textContent = rate.toString();

      defaultValue = (rate / OptionsMaxValues.rate) * 100;

      setStyleProperty(
        "--_webkit-progression-width",
        `${defaultValue}%`,
        element
      );
      textToSpeechUtility.setVoiceRate(rate);
      break;
    }
    case "voice-pitch": {
      const output = outputElementsMap.get(element);
      output.textContent = pitch.toString();

      defaultValue = (pitch / OptionsMaxValues.pitch) * 100;

      setStyleProperty(
        "--_webkit-progression-width",
        `${defaultValue}%`,
        element
      );

      textToSpeechUtility.setVoicePitch(pitch);
      break;
    }
    case "voice-volume": {
      const output = outputElementsMap.get(element);

      defaultValue = Math.round(volume * 100);

      output.textContent = `${defaultValue}%`;

      setStyleProperty(
        "--_webkit-progression-width",
        `${defaultValue}%`,
        element
      );

      textToSpeechUtility.setVolume(volume);
      break;
    }
    case "text-to-read": {
      defaultValue = text;

      textToSpeechUtility.setVoiceText(text);
      break;
    }

    default: {
      throw new Error("Unknown property to change");
    }
  }

  textToSpeechUtility.setVoiceSpeech;

  console.log(element.name, { defaultValue });

  element.value = defaultValue;
}

function getChosenVoice(value: string): SpeechSynthesisVoice {
  const voicesArray: SpeechSynthesisVoice[] = voicesByLanguageMap.get(
    navigator.language
  );

  const chosenVoice: SpeechSynthesisVoice = voicesArray.find((voice) => {
    return voice.name === value;
  });

  return chosenVoice;
}

function setSpeechUtterance(e: InputEvent) {}

function logTTS(): void {
  // @ts-ignore
  console.log(textToSpeechUtility.utterance);
}

function startSpeech(): void {
  console.log("Starting speech");
  const { isPaused, isSpeaking } = textToSpeechUtility;

  if (isPaused && isSpeaking) {
    textToSpeechUtility.resumeSpeech();
    logTTS();

    return;
  }

  if (!isPaused && isSpeaking) {
    logTTS();

    return;
  }

  textToSpeechUtility.speak();
  logTTS();
}

function pauseSpeech(): void {
  console.log("Pausing speech");

  const { isPaused, isSpeaking, isPending } = textToSpeechUtility;
  if (!isSpeaking) {
    return;
  }

  textToSpeechUtility.pauseSpeech();
  logTTS();
}

function stopSpeech(): void {
  console.log("Stopping speech");
  textToSpeechUtility.resumeSpeech();

  textToSpeechUtility.cancelSpeech();
  logTTS();
}

function updateText(): void {
  textToSpeechUtility.setVoiceText(
    textAreaElement.value.substring(indexOfCurrentWordSpoken)
  );

  console.log(textAreaElement.value.substring(indexOfCurrentWordSpoken));
}
function setSpeechUtteranceSettings(e: InputEvent): void {
  stopSpeech();

  const { value, valueAsNumber } = e.target as HTMLInputElement;

  const options = WebStorage.getKey<Options>("text-to-speech-options");

  switch (e.target) {
    case textAreaElement: {
      options.text = value;

      break;
    }
    case voiceSelectionElement: {
      const chosenVoice: SpeechSynthesisVoice = getChosenVoice(value);

      textToSpeechUtility.setVoiceSpeech(chosenVoice);

      break;
    }
    case voiceRateInputElement: {
      const normalizedValue: number =
        (valueAsNumber * OptionsMaxValues.rate) / 100;

      options.rate = normalizedValue;
      textToSpeechUtility.setVoiceRate(normalizedValue);

      const output: HTMLOutputElement = outputElementsMap.get(
        voiceRateInputElement
      );

      output.textContent = normalizedValue.toString();

      break;
    }
    case voicePitchInputElement: {
      const normalizedValue: number =
        (valueAsNumber * OptionsMaxValues.pitch) / 100;

      options.pitch = normalizedValue;
      textToSpeechUtility.setVoicePitch(normalizedValue);

      const output: HTMLOutputElement = outputElementsMap.get(
        voicePitchInputElement
      );

      output.textContent = normalizedValue.toString();

      break;
    }

    case voiceVolumeInputElement: {
      const normalizedValue: number =
        (valueAsNumber * OptionsMaxValues.volume) / 100;

      textToSpeechUtility.setVolume(normalizedValue);

      const output: HTMLOutputElement = outputElementsMap.get(
        voiceVolumeInputElement
      );

      options.volume = normalizedValue;
      output.textContent = `${value}%`;

      break;
    }
    default:
      break;
  }

  WebStorage.setKey("text-to-speech-options", options);

  updateText();
  // @ts-ignore
  console.log(textToSpeechUtility.utterance.text);

  startSpeech();
}

textToSpeechUtility.setOnVoicesChanged(() => {
  populateVoicesMap();
  addInputsEventListeners();
});

textToSpeechUtility.setOnBoundary((e: SpeechSynthesisEvent) => {
  indexOfCurrentWordSpoken = e.charIndex;
});

function populateVoicesMap(): void {
  const voices: SpeechSynthesisVoice[] = textToSpeechUtility.getVoices();

  let options: string = "";
  // Loop through all available voices
  for (const voice of voices) {
    // Get or initialize the language array
    let languageVoices = voicesByLanguageMap.get(voice.lang);
    if (!languageVoices) {
      languageVoices = [];
      voicesByLanguageMap.set(voice.lang, languageVoices);
    }

    // Push the voice to the appropriate language category
    languageVoices.push(voice);

    options += /* html */ `
    <option value="${voice.name}">${voice.name} _ ${voice.lang}</option>
    `;
  }

  voiceSelectionElement.insertAdjacentHTML("beforeend", options);
}

startSpeakingButton.addEventListener("click", () => {
  indexOfCurrentWordSpoken = 0;
  startSpeech();
});
pauseSpeakingButton.addEventListener("click", () => {
  indexOfCurrentWordSpoken = 0;
  pauseSpeech();
});
stopSpeakingButton.addEventListener("click", () => {
  indexOfCurrentWordSpoken = 0;
  stopSpeech();
  updateText();
});

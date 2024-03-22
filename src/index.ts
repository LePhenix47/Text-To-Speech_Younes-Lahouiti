//Web components
import {
  selectQuery,
  selectQueryAll,
  setStyleProperty,
} from "@utils/functions/helper-functions/dom.functions";

import "./components/web-component.component";

import { Options } from "@utils/types/options.types";
import { OptionsMaxValues } from "@utils/variables/enums.variables";

import { WebStorage } from "@lephenix47/webstorage-utility";
import { TextToSpeech } from "@lephenix47/text-to-speech-utility";

const textToSpeechUtility = new TextToSpeech();

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
  "button[name=start-speaking]"
);

const stopSpeakingButton = selectQuery<HTMLButtonElement>(
  "button[name=stop-speaking]"
);

const restartCheckboxInput = selectQuery<HTMLInputElement>(
  "input#restart-on-change"
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

function checkIfDefaultValuesAreSetInLocalStorage(): void {
  const options: Options = WebStorage.getKey<Options>("text-to-speech-options");
  if (options) {
    return;
  }

  const defaultOptions: Options = {
    pitch: 1,
    rate: 1,
    volume: 1,
    text: "",
  };

  WebStorage.setKey("text-to-speech-options", defaultOptions);
}
checkIfDefaultValuesAreSetInLocalStorage();

// * Event listeners
function fixInputRangeBackground(): void {
  const inputsWithThumbArray = selectQueryAll<HTMLInputElement>(
    `input[type="range"][data-range="a-range-with-overflowing-thumb"]`
  );

  for (const input of inputsWithThumbArray) {
    input.addEventListener("input", (e) => {
      const input = e.currentTarget as HTMLInputElement;
      const { max, valueAsNumber } = input;

      const percentage: number = Math.round(
        (valueAsNumber / Number(max)) * 100
      );

      const stringResult: string = `${percentage}%`;

      input.style.setProperty("--_webkit-progression-width", stringResult);
    });
  }
}

fixInputRangeBackground();

function addInputsEventListeners(): void {
  for (const element of inputElements) {
    setDefaultValueIfPossible(element);

    element.addEventListener("change", setSpeechUtterance);
    element.addEventListener("input", setSpeechUtteranceSettings);
  }
}
addInputsEventListeners();

function setDefaultValueIfPossible(
  element: HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement
): void {
  const { rate, pitch, text, volume } = WebStorage.getKey<Options>(
    "text-to-speech-options"
  );

  if (element instanceof HTMLSelectElement) {
    return;
  }

  let defaultValue = null;

  switch (element.name) {
    case "voice-rate": {
      const output = outputElementsMap.get(element);
      output.textContent = rate.toString();

      defaultValue = (rate / OptionsMaxValues.rate) * 100;

      setStyleProperty(
        "--_webkit-progression-width",
        `${defaultValue}%`,
        element
      );
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
      break;
    }
    case "text-to-read": {
      defaultValue = text;
      break;
    }

    default: {
      throw new Error("Unknown property to change");
    }
  }

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

function setSpeechUtterance(e: InputEvent) {
  //   setSpeechUtteranceSettings(e);

  restartSpeaking();
}

function restartSpeaking(): void {
  if (!restartCheckboxInput.checked) {
    return;
  }
}

function togglePauseButton(e: MouseEvent): void {
  const button = e.target as HTMLButtonElement;

  const { isPaused, isSpeaking, isPending } = textToSpeechUtility;

  if (!isSpeaking && !isPending) {
    textToSpeechUtility.speak();

    button.textContent = "Pause";
    return;
  }

  if (isPaused) {
    textToSpeechUtility.resumeSpeech();

    button.textContent = "Pause";
  } else {
    textToSpeechUtility.cancelSpeech();

    button.textContent = "Resume";
  }
}

function stopSpeech(): void {
  textToSpeechUtility.cancelSpeech();
}

function setSpeechUtteranceSettings(e: InputEvent): void {
  const { value, valueAsNumber } = e.target as HTMLInputElement;

  const options = WebStorage.getKey<Options>("text-to-speech-options");

  switch (e.target) {
    case textAreaElement: {
      options.text = value;
      textToSpeechUtility.setVoiceText(value);

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
}

textToSpeechUtility.setOnVoicesChanged(populateVoicesMap);

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

startSpeakingButton.addEventListener("click", togglePauseButton);
stopSpeakingButton.addEventListener("click", stopSpeech);

//Web components
import {
  selectQuery,
  selectQueryAll,
} from "@utils/functions/helper-functions/dom.functions";

import "./components/web-component.component";

const textAreaElement = selectQuery<HTMLTextAreaElement>("textarea");

const speechUtterance = new SpeechSynthesisUtterance();

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

function populateOutputElementsMap() {
  for (let i = 0; i < inputElements.length; i++) {
    outputElementsMap.set(inputElements[i], outputElements[i]);
  }
}
populateOutputElementsMap();

// * Event listeners
function addInputsEventListeners() {
  for (const element of inputElements) {
    element.addEventListener("change", setSpeechUtterance);
    element.addEventListener("input", setSpeechUtteranceSettings);
  }
}
addInputsEventListeners();
function getChosenVoice(value: string) {
  const frenchVoicesArray: SpeechSynthesisVoice[] =
    voicesByLanguageMap.get("fr-FR");

  const chosenVoice: SpeechSynthesisVoice = frenchVoicesArray.find((voice) => {
    return voice.name === value;
  });

  return chosenVoice;
}

function setSpeechUtterance(e: InputEvent) {
  //   setSpeechUtteranceSettings(e);

  restartSpeaking();
}

function toggleSpeech(startOver: boolean) {
  return () => {
    stopSpeech();

    if (startOver) {
      speechSynthesis.speak(speechUtterance);
    }
  };
}

function restartSpeaking() {
  if (!restartCheckboxInput.checked) {
    return;
  }

  console.log("Change detected!!!");
}

function togglePauseButton(e) {
  console.log(speechSynthesis.speaking, speechSynthesis.paused);

  const button = e.target as HTMLButtonElement;

  if (!speechSynthesis.speaking && !speechSynthesis.pending) {
    speechSynthesis.speak(speechUtterance);

    button.textContent = "Pause";
    return;
  }

  if (speechSynthesis.paused) {
    speechSynthesis.resume();

    button.textContent = "Pause";
  } else {
    speechSynthesis.cancel();

    button.textContent = "Resume";
  }
}

function startSpeaking() {
  speechSynthesis.speak(speechUtterance);
}

function stopSpeech() {
  speechSynthesis.cancel();
}

function setSpeechUtteranceSettings(e: InputEvent) {
  const { value } = e.target as HTMLInputElement;

  switch (e.target) {
    case textAreaElement: {
      speechUtterance.text = value;

      console.log("text:", speechUtterance.text);

      break;
    }
    case voiceSelectionElement: {
      const chosenVoice: SpeechSynthesisVoice = getChosenVoice(value);

      speechUtterance.voice = chosenVoice;

      console.log("voice:", chosenVoice);

      break;
    }
    case voiceRateInputElement: {
      const MAX_SPEECH_RATE: number = 10;

      const normalizedValue: number = (Number(value) * MAX_SPEECH_RATE) / 100;

      speechUtterance.rate = normalizedValue;

      const output: HTMLOutputElement = outputElementsMap.get(
        voiceRateInputElement
      );

      output.textContent = normalizedValue.toString();

      console.log("rate:", speechUtterance.rate);

      break;
    }
    case voicePitchInputElement: {
      const MAX_SPEECH_PITCH: number = 2;

      const normalizedValue: number = (Number(value) * MAX_SPEECH_PITCH) / 100;
      speechUtterance.pitch = normalizedValue;

      const output: HTMLOutputElement = outputElementsMap.get(
        voicePitchInputElement
      );

      output.textContent = normalizedValue.toString();

      console.log("pitch:", speechUtterance.pitch);

      break;
    }

    case voiceVolumeInputElement: {
      const MAX_SPEECH_VOLUME: number = 1;

      const normalizedValue: number = (Number(value) * MAX_SPEECH_VOLUME) / 100;
      speechUtterance.volume = normalizedValue;

      const output: HTMLOutputElement = outputElementsMap.get(
        voiceVolumeInputElement
      );

      output.textContent = `${value}%`;

      console.log("volume:", speechUtterance.volume);

      break;
    }
    default:
      console.log("Bruv there was no HTML element");

      break;
  }
}

speechSynthesis.addEventListener("voiceschanged", populateVoicesMap);

speechSynthesis.addEventListener("end", (e) => {
  console.log("Speech ended", e);
});
function populateVoicesMap() {
  const voices: SpeechSynthesisVoice[] = speechSynthesis.getVoices();

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
    <option value="${voice.name}">${voice.name}-${voice.lang}</option>
    `;
  }

  voiceSelectionElement.insertAdjacentHTML("beforeend", options);
}

startSpeakingButton.addEventListener("click", togglePauseButton);
stopSpeakingButton.addEventListener("click", stopSpeech);

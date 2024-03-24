import { WebStorage } from "@lephenix47/webstorage-utility";
import { Options } from "@utils/types/options.types";

export function checkIfDefaultValuesAreSetInLocalStorage(): void {
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

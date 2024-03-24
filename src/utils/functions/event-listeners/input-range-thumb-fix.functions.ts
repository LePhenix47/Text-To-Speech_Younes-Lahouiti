import { selectQueryAll } from "../helper-functions/dom.functions";

export function fixInputRangeBackground(): void {
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

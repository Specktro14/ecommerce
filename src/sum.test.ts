import { expect, test } from "vitest";

import { sum } from "./sum";

test("adds 1 + 2 to equal 3", () => {
  if (typeof Temporal !== "undefined" || "Temporal" in globalThis) {
    console.log("✅ ¡Temporal está soportado nativamente en este entorno!");
  } else {
    console.log("❌ Temporal NO está soportado. Necesitas usar el polyfill.");
  }
  expect(sum(1, 2)).toBe(3);
});

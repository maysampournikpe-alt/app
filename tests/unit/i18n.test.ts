import { describe, it, expect } from "vitest";
import { MESSAGES } from "@/i18n/messages";
import { translate } from "@/i18n/translate";

function keys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe("translations", () => {
  const en = new Set(keys(MESSAGES.en));
  it("Spanish has every English key (no untranslated text)", () => {
    const es = new Set(keys(MESSAGES.es));
    const missing = [...en].filter((k) => !es.has(k));
    expect(missing).toEqual([]);
  });
  it("Spanish has no extra keys that English lacks", () => {
    const extra = keys(MESSAGES.es).filter((k) => !en.has(k));
    expect(extra).toEqual([]);
  });
  it("placeholders like {n} match between languages", () => {
    const bad: string[] = [];
    for (const k of en) {
      const a = (translate("en", k).match(/\{\w+\}/g) ?? []).sort().join();
      const b = (translate("es", k).match(/\{\w+\}/g) ?? []).sort().join();
      if (a !== b) bad.push(k);
    }
    expect(bad).toEqual([]);
  });
  it("falls back to English for languages that are partly translated", () => {
    expect(translate("vi", "common.appName")).toBe("Rumbo");
    expect(translate("vi", "nav.find")).toBe("Tìm");
  });
  it("handles plurals and variables", () => {
    expect(translate("en", "common.daysLeft", { count: 1 })).toBe("1 day left");
    expect(translate("es", "common.daysLeft", { count: 3 })).toBe("Quedan 3 días");
  });
});

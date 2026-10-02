import { describe, it, expect } from "vitest";
import { blockHours, burnoutCheck, hoursByKind, overlaps } from "@/lib/balance";
import type { ScheduleBlock } from "@/types";

const b = (day: number, start: string, end: string, kind: ScheduleBlock["kind"], id = `${day}${start}${kind}`): ScheduleBlock => ({ id, day, start, end, kind, label: kind });
const schoolWeek = [0, 1, 2, 3, 4].map((d) => b(d, "08:00", "15:30", "school"));

describe("schedule balance", () => {
  it("measures blocks, including ones past midnight", () => {
    expect(blockHours({ start: "08:00", end: "15:30" })).toBe(7.5);
    expect(blockHours({ start: "22:00", end: "01:00" })).toBe(3);
  });
  it("adds hours by kind", () => {
    expect(hoursByKind(schoolWeek).school).toBe(37.5);
  });
  it("finds overlapping blocks on the same day", () => {
    const o = overlaps([b(0, "15:00", "17:00", "practice"), b(0, "16:00", "18:00", "work"), b(1, "16:00", "18:00", "work")]);
    expect(o).toHaveLength(1);
  });
  it("a normal school week is OK", () => {
    expect(burnoutCheck([...schoolWeek, b(5, "10:00", "14:00", "social"), b(6, "12:00", "16:00", "family")]).level).toBe("ok");
  });
  it("school + long practice + a job every day is overloaded", () => {
    const blocks = [...schoolWeek, ...[0, 1, 2, 3, 4].map((d) => b(d, "15:45", "18:30", "practice")), ...[0, 1, 2, 3, 4, 5].map((d) => b(d, "18:45", "22:30", "work"))];
    const r = burnoutCheck(blocks, 3);
    expect(r.level).toBe("overloaded");
    expect(r.reasons).toContain("heavy_days");
    expect(r.reasons).toContain("little_rest");
  });
});

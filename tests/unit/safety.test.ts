import { describe, it, expect } from "vitest";
import { scamCheck } from "@/lib/safety/scam";
import { ageVerdict } from "@/lib/safety/age";
import { detectCrisis, isBlockedRequest } from "@/lib/safety/crisis";
import type { Opportunity } from "@/types";

const base: Opportunity = {
  id: "x",
  title: "Summer camp",
  organization: "City Parks",
  description: "Outdoor fun",
  category: "camp",
  cost: { type: "paid", text: "$50" },
  mode: "in_person",
  carFree: "unknown",
  source: "web",
  sourceUrl: "https://example.org/camp",
};

describe("scam check", () => {
  it("does not flag a normal paid camp", () => {
    expect(scamCheck(base)).toEqual([]);
  });
  it("flags a job that charges a starter kit fee", () => {
    expect(scamCheck({ ...base, category: "job", description: "Earn money! Just buy a starter kit first." })).toContain("upfront_fee");
  });
  it("flags requests for a social security number", () => {
    expect(scamCheck({ ...base, description: "Send your Social Security number to apply" })).toContain("sensitive_info");
  });
  it("flags gift card payments", () => {
    expect(scamCheck({ ...base, description: "Pay with gift cards" })).toContain("odd_payment");
  });
  it("flags too-good-to-be-true pay", () => {
    expect(scamCheck({ ...base, category: "job", payText: "$75/hour, no experience" })).toContain("too_good");
    expect(scamCheck({ ...base, description: "Guaranteed scholarship for everyone" })).toContain("too_good");
  });
  it("flags scholarships that charge to apply", () => {
    expect(scamCheck({ ...base, category: "scholarship", description: "$25 application fee" })).toContain("scholarship_fee");
  });
  it("flags shortened or insecure links", () => {
    expect(scamCheck({ ...base, sourceUrl: "https://bit.ly/abc" })).toContain("sketchy_link");
    expect(scamCheck({ ...base, sourceUrl: "http://jobs.example.com" })).toContain("sketchy_link");
  });
  it("flags chat-app-only contact and Spanish scams", () => {
    expect(scamCheck({ ...base, description: "Escríbenos por WhatsApp para aplicar" })).toContain("chat_only");
    expect(scamCheck({ ...base, description: "Dinero fácil desde casa" })).toContain("too_good");
  });
});

describe("age filter", () => {
  it("hides adult topics", () => {
    expect(ageVerdict({ ...base, title: "Casino night volunteer" }, { age: 15 })).toBe("hide");
    expect(ageVerdict({ ...base, description: "Must be 21 to attend" }, { age: 15 })).toBe("hide");
  });
  it("hides things far above the student's age or grade", () => {
    expect(ageVerdict({ ...base, ages: { min: 18 } }, { age: 13 })).toBe("hide");
    expect(ageVerdict({ ...base, grades: { min: 11 } }, { grade: 8 })).toBe("hide");
  });
  it("hides things for younger kids", () => {
    expect(ageVerdict({ ...base, grades: { max: 8 } }, { grade: 10 })).toBe("hide");
  });
  it("marks almost-old-enough as check", () => {
    expect(ageVerdict({ ...base, ages: { min: 16 } }, { age: 15 })).toBe("check");
  });
  it("allows normal results", () => {
    expect(ageVerdict({ ...base, grades: { min: 9, max: 12 } }, { age: 15, grade: 10 })).toBe("ok");
  });
});

describe("crisis detection", () => {
  it("detects self-harm in English and Spanish", () => {
    expect(detectCrisis("sometimes I want to die")).toBe("self_harm");
    expect(detectCrisis("ya no quiero vivir")).toBe("self_harm");
  });
  it("detects abuse", () => {
    expect(detectCrisis("my stepdad hits me")).toBe("abuse");
    expect(detectCrisis("mi tío me pega")).toBe("abuse");
  });
  it("does not trigger on normal homework", () => {
    expect(detectCrisis("how do I kill a process in linux? help with my essay on the death penalty")).toBe(null);
    expect(detectCrisis("chess: how to attack the king")).toBe(null);
  });
  it("blocks clearly inappropriate requests", () => {
    expect(isBlockedRequest("where can I get a fake id")).toBe(true);
    expect(isBlockedRequest("law internships")).toBe(false);
  });
});

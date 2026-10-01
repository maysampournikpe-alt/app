import { describe, it, expect } from "vitest";
import { moderateText, cleanNickname } from "@/lib/safety/moderation";

describe("People tab content filter", () => {
  it("removes phone numbers, emails, addresses, social handles and links", () => {
    const r = moderateText("Text me at 956-555-1234 or (956) 555 1234, email maria.r@gmail.com, I live at 1234 N Main St, my snap is maria_22 and @maria.r, see https://example.com");
    expect(r.text).not.toMatch(/555|gmail|Main St|maria_22|@maria|example\.com/);
    expect(r.removed.sort()).toEqual(["address", "email", "link", "phone", "social"]);
    expect(r.blocked).toBe(false);
  });
  it("leaves normal study talk alone", () => {
    const r = moderateText("Does anyone understand question 12 on the chemistry worksheet? We meet at the library at 4.");
    expect(r.removed).toEqual([]);
    expect(r.text).toContain("question 12");
  });
  it("blocks profanity, bullying and sexual content (English and Spanish)", () => {
    expect(moderateText("this is shit").blocked).toBe(true);
    expect(moderateText("nobody likes you").reason).toBe("bullying");
    expect(moderateText("eres tonta").reason).toBe("bullying");
    expect(moderateText("send pics").reason).toBe("sexual");
    expect(moderateText("ven a mi casa").reason).toBe("meetup");
  });
  it("cleans nicknames", () => {
    expect(cleanNickname("  Vale<script>  ")).toBe("Valescript");
    expect(cleanNickname("9565551234")).toBeNull();
    expect(cleanNickname("x")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { normalizePhoneNumber } from "./phone";

describe("normalizePhoneNumber", () => {
  it("removes common phone formatting characters", () => {
    expect(normalizePhoneNumber("(555) 123-4567")).toBe("5551234567");
  });

  it("preserves a single leading plus", () => {
    expect(normalizePhoneNumber("+1 (555) 123-4567")).toBe("+15551234567");
  });

  it("collapses repeated leading plus signs", () => {
    expect(normalizePhoneNumber("++61 400 123 456")).toBe("+61400123456");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizePhoneNumber("  +44 20 7946 0958  ")).toBe("+442079460958");
  });
});

import { describe, expect, it } from "vitest";
import { BOMB_CATEGORIES, BOMB_CATEGORY_IDS, BOMB_CATEGORY_LABELS, BOMB_PROMPTS } from "../src/bomb-content";
import { SAME_WAVE_PROMPTS } from "../src/same-wave-content";
import { WHO_AM_I_IDENTITIES } from "../src/who-am-i-content";

const unique = (values: readonly string[]) => new Set(values).size === values.length;

describe("Bomba content catalog", () => {
  it("contains many bilingual prompts across stable categories", () => {
    expect(BOMB_PROMPTS.length).toBeGreaterThanOrEqual(80);
    expect(BOMB_CATEGORY_IDS.length).toBeGreaterThanOrEqual(10);
    expect(unique(BOMB_CATEGORY_IDS)).toBe(true);
    expect(BOMB_CATEGORIES).toHaveLength(BOMB_CATEGORY_IDS.length);
    expect(Object.keys(BOMB_CATEGORY_LABELS)).toHaveLength(BOMB_CATEGORY_IDS.length);
  });

  it("keeps every prompt complete, playable, translated, and uniquely identified", () => {
    expect(unique(BOMB_PROMPTS.map((prompt) => prompt.id))).toBe(true);
    for (const prompt of BOMB_PROMPTS) {
      expect(BOMB_CATEGORY_IDS).toContain(prompt.category);
      expect(prompt.topic.trim()).not.toBe("");
      expect(prompt.topicEn.trim()).not.toBe("");
      expect(prompt.examples.length).toBeGreaterThanOrEqual(3);
      expect(prompt.examplesEn.length).toBeGreaterThanOrEqual(3);
      expect(prompt.examples.every((example) => example.trim())).toBe(true);
      expect(prompt.examplesEn.every((example) => example.trim())).toBe(true);
    }
  });
});

describe("Stessa Onda content catalog", () => {
  it("contains at least sixty social prompts with four localized choices", () => {
    expect(SAME_WAVE_PROMPTS.length).toBeGreaterThanOrEqual(60);
    expect(unique(SAME_WAVE_PROMPTS.map((prompt) => prompt.id))).toBe(true);
    for (const prompt of SAME_WAVE_PROMPTS) {
      expect(prompt.prompt.trim()).not.toBe("");
      expect(prompt.promptEn.trim()).not.toBe("");
      expect(prompt.options).toHaveLength(4);
      expect(prompt.optionsEn).toHaveLength(4);
      expect(prompt.options.every((option) => option.trim())).toBe(true);
      expect(prompt.optionsEn.every((option) => option.trim())).toBe(true);
    }
  });
});

describe("Chi sono? content catalog", () => {
  it("contains sixty complete bilingual identities with stable unique IDs", () => {
    expect(WHO_AM_I_IDENTITIES).toHaveLength(60);
    expect(unique(WHO_AM_I_IDENTITIES.map((identity) => identity.id))).toBe(true);
    for (const identity of WHO_AM_I_IDENTITIES) {
      expect(identity.label.trim()).not.toBe("");
      expect(identity.labelEn.trim()).not.toBe("");
    }
  });
});

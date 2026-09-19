import { describe, expect, it } from "vitest";
import { categoryDescription, categoryLabel, supportedLocales, translate } from "../src/i18n";

describe("localization", () => {
  it("keeps every supported locale usable for categories and interpolation", () => {
    expect(supportedLocales).toEqual(["it", "en"]);
    expect(categoryLabel("it", "objects")).toBe("Oggetti");
    expect(categoryLabel("en", "objects")).toBe("Objects");
    expect(categoryLabel("it", "slang")).toBe("Slang Giovanile");
    expect(categoryDescription("en", "party_chaos")).toContain("Dancing");
    expect(translate("en", "setup.morePlayersMany", { count: 3 })).toContain("3");
  });

  it("provides complete contextual help copy in both locales", () => {
    for (const key of ["help.catalog.title", "help.stats.title", "help.impostor.title", "help.bomb.title", "help.sameWave.title"] as const) {
      expect(translate("it", key)).not.toBe(translate("en", key));
    }
    for (const key of ["help.catalog.body", "help.stats.body", "help.impostor.body", "help.bomb.body", "help.sameWave.body"] as const) {
      expect(translate("it", key)).not.toBe("");
      expect(translate("en", key)).not.toBe("");
    }
  });
});

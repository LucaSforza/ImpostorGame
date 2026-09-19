import { describe, expect, it } from "vitest";
import { categoryDescription, categoryLabel, supportedLocales, translate } from "./i18n";

describe("localization", () => {
  it("keeps every supported locale usable for categories and interpolation", () => {
    expect(supportedLocales).toEqual(["it", "en"]);
    expect(categoryLabel("it", "objects")).toBe("Oggetti");
    expect(categoryLabel("en", "objects")).toBe("Objects");
    expect(categoryLabel("it", "slang")).toBe("Slang Giovanile");
    expect(categoryDescription("en", "party_chaos")).toContain("Dancing");
    expect(translate("en", "setup.morePlayersMany", { count: 3 })).toContain("3");
  });
});

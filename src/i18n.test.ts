import { describe, expect, it } from "vitest";
import { categoryLabel, supportedLocales, translate } from "./i18n";

describe("localization", () => {
  it("keeps every supported locale usable for categories and interpolation", () => {
    expect(supportedLocales).toEqual(["it", "en"]);
    expect(categoryLabel("it", "objects")).toBe("Oggetti");
    expect(categoryLabel("en", "objects")).toBe("Objects");
    expect(translate("en", "setup.morePlayersMany", { count: 3 })).toContain("3");
  });
});

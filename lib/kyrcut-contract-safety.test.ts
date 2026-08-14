import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Kyrcut contract safety wording", () => {
  it("requires exact validator agreement between PAUSE and ARM_PAUSE", () => {
    const contract = readFileSync(join(process.cwd(), "contracts", "kyrcut.py"), "utf8");

    expect(contract).toContain("PAUSE and");
    expect(contract).toContain("ARM_PAUSE are never equivalent");
    expect(contract).toContain("Validators must agree exactly on PAUSE versus ARM_PAUSE");
  });
});

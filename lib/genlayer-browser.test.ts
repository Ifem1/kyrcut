import { describe, expect, it } from "vitest";
import { authorizeCapabilityThenArm, sourceManifestFromUrls } from "./genlayer-browser";

describe("sourceManifestFromUrls", () => {
  it("requires multiple independent HTTPS sources", () => {
    expect(() => sourceManifestFromUrls(["https://status.example.org"])).toThrow(/at least two/i);
    expect(() => sourceManifestFromUrls(["https://status.example.org", "http://unsafe.example.org"])).toThrow(/HTTPS/i);
  });

  it("serializes multiple HTTPS sources for register_circuit", () => {
    const manifest = JSON.parse(
      sourceManifestFromUrls([
        "https://status.example.org",
        "https://docs.example.org/incidents",
        "https://governance.example.org",
      ]),
    );

    expect(manifest).toEqual([
      { label: "primary", url: "https://status.example.org" },
      { label: "source-2", url: "https://docs.example.org/incidents" },
      { label: "source-3", url: "https://governance.example.org" },
    ]);
  });
});

describe("authorizeCapabilityThenArm", () => {
  it("waits for capability authorization before submitting ARMED mode", async () => {
    const calls: string[] = [];
    const client = {
      async writeContract(args: { functionName: string }) {
        calls.push(args.functionName);
        return args.functionName === "authorize_pause_capability" ? "0xaaaa" : "0xbbbb";
      },
      async waitForTransactionReceipt(args: { hash: string; status?: string; interval?: number }) {
        calls.push(`wait:${args.hash}:${args.status}:${args.interval}`);
        return {};
      },
    };

    const result = await authorizeCapabilityThenArm(
      client,
      "0x0000000000000000000000000000000000000001",
      7,
      "0x0000000000000000000000000000000000000002",
      "pause",
    );

    expect(result).toEqual({ authorizationHash: "0xaaaa", armHash: "0xbbbb" });
    expect(calls).toEqual(["authorize_pause_capability", "wait:0xaaaa:ACCEPTED:15000", "set_mode"]);
  });
});

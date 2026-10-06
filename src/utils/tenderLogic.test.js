import { describe, it, expect } from "vitest";
import { getRequirementStatus } from "./tenderLogic";

describe("Tender Status Logic", () => {
  const deadline = "2026-10-20";

  it("returns OK when deadline-day expiry is provided", () => {
    const req = { mandatory: true, has_expiry: true };
    const status = getRequirementStatus(req, { name: "test.pdf" }, "2026-10-20", deadline);
    expect(status).toBe("OK");
  });

  it("returns Expired when expiry date is the day before deadline", () => {
    const req = { mandatory: true, has_expiry: true };
    const status = getRequirementStatus(req, { name: "test.pdf" }, "2026-10-19", deadline);
    expect(status).toBe("Expired");
  });

  it("returns Expiry date needed when has_expiry is true without a date", () => {
    const req = { mandatory: true, has_expiry: true };
    const status = getRequirementStatus(req, { name: "test.pdf" }, "", deadline);
    expect(status).toBe("Expiry date needed");
  });

  it("returns Not provided when optional requirement has no file", () => {
    const req = { mandatory: false, has_expiry: false };
    const status = getRequirementStatus(req, null, "", deadline);
    expect(status).toBe("Not provided");
  });

  it("returns Missing when mandatory requirement has no file", () => {
    const req = { mandatory: true, has_expiry: false };
    const status = getRequirementStatus(req, null, "", deadline);
    expect(status).toBe("Missing");
  });
});

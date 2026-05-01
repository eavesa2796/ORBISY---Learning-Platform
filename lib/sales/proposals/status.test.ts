import { describe, expect, it } from "vitest";
import {
  assertProposalStatusTransition,
  canTransitionProposalStatus,
} from "./status";

describe("proposal status transitions", () => {
  it("allows valid transitions", () => {
    expect(canTransitionProposalStatus("DRAFT", "SENT")).toBe(true);
    expect(canTransitionProposalStatus("DRAFT", "DECLINED")).toBe(true);
    expect(canTransitionProposalStatus("SENT", "VIEWED")).toBe(true);
    expect(canTransitionProposalStatus("SENT", "ACCEPTED")).toBe(true);
    expect(canTransitionProposalStatus("VIEWED", "ACCEPTED")).toBe(true);
    expect(canTransitionProposalStatus("SENT", "DECLINED")).toBe(true);
  });

  it("blocks invalid transitions", () => {
    expect(canTransitionProposalStatus("DRAFT", "ACCEPTED")).toBe(false);
    expect(canTransitionProposalStatus("ACCEPTED", "SENT")).toBe(false);
    expect(canTransitionProposalStatus("DECLINED", "VIEWED")).toBe(false);
    expect(canTransitionProposalStatus("DECLINED", "ACCEPTED")).toBe(false);
  });

  it("throws for invalid transition assertions", () => {
    expect(() => assertProposalStatusTransition("DRAFT", "ACCEPTED")).toThrow(
      "Invalid proposal status transition: DRAFT -> ACCEPTED",
    );
  });

  it("accepts no-op transitions", () => {
    expect(() => assertProposalStatusTransition("VIEWED", "VIEWED")).not.toThrow();
  });
});

export type ProposalStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "DECLINED";

const ALLOWED_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  DRAFT: ["SENT", "DECLINED"],
  SENT: ["VIEWED", "ACCEPTED", "DECLINED"],
  VIEWED: ["ACCEPTED", "DECLINED"],
  ACCEPTED: [],
  DECLINED: [],
};

export function canTransitionProposalStatus(
  from: ProposalStatus,
  to: ProposalStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertProposalStatusTransition(
  from: ProposalStatus,
  to: ProposalStatus,
) {
  if (!canTransitionProposalStatus(from, to)) {
    throw new Error(`Invalid proposal status transition: ${from} -> ${to}`);
  }
}

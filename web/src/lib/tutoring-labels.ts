// Small, shared vocabulary for the tutoring marketplace surface (listings,
// proposals, connects). Lives here so the tutor-side and student-side pages
// speak about mode, status and tutor kind with exactly the same words rather
// than each growing its own slightly different copy.

import type { ListingMode, ListingStatus, ProposalStatus } from "@/lib/api/queries";
import type { Tutor } from "@/lib/mockData";

type ChipColour = "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error";

export const listingModeLabel = (mode: ListingMode): string => {
  switch (mode) {
    case "online":
      return "Online";
    case "in_person":
      return "In person";
    case "either":
      return "Online or in person";
  }
};

export const listingStatusMeta = (
  status: ListingStatus,
): { label: string; color: ChipColour } => {
  switch (status) {
    case "open":
      return { label: "Open", color: "secondary" };
    case "filled":
      return { label: "Filled", color: "success" };
    case "closed":
      return { label: "Closed", color: "default" };
  }
};

export const proposalStatusMeta = (
  status: ProposalStatus,
): { label: string; color: ChipColour } => {
  switch (status) {
    case "submitted":
      return { label: "Submitted", color: "info" };
    case "accepted":
      return { label: "Accepted", color: "success" };
    case "declined":
      return { label: "Declined", color: "default" };
    case "withdrawn":
      return { label: "Withdrawn", color: "warning" };
  }
};

export const tutorKindLabel = (kind: NonNullable<Tutor["tutorKind"]>): string => {
  switch (kind) {
    case "university_student":
      return "University student";
    case "graduate":
      return "Graduate";
    case "completed_matric":
      return "Completed matric";
  }
};

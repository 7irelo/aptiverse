import { RoleGuard } from "@/components/common/RoleGuard";

// Parent area = role-gated only. The baseline parent experience (child
// progress overview, wellbeing summary, account/settings, managing child
// links, billing) is NOT paywalled: a parent must be able to see their
// dashboard and reach Billing to subscribe in the first place. Genuinely
// premium extras gate themselves in-shell with <FeatureGuard> around the
// specific feature, never around the whole layout.
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow="parent">{children}</RoleGuard>;
}

import { RoleGuard } from "@/components/common/RoleGuard";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow="tutor">{children}</RoleGuard>;
}

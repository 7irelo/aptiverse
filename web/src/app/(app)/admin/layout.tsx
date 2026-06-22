import { RoleGuard } from "@/components/common/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["admin", "super_admin"]}>{children}</RoleGuard>;
}

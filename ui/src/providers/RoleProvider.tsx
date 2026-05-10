"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "student" | "parent" | "teacher" | "school_admin" | "tutor" | "admin" | "super_admin";

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "student", label: "Student", description: "Grade 11-12 learner" },
  { value: "parent", label: "Parent / Guardian", description: "Supporting your child" },
  { value: "teacher", label: "Teacher", description: "Class educator" },
  { value: "school_admin", label: "School Admin", description: "School leadership" },
  { value: "tutor", label: "Tutor", description: "Independent educator" },
  { value: "admin", label: "Admin", description: "Platform operator" },
  { value: "super_admin", label: "Super Admin", description: "Platform owner" },
];

type RoleState = {
  role: Role;
  setRole: (r: Role) => void;
};

// In real life this comes from the auth provider claims. For demo / unauth flows
// we let users switch personas — the store persists the choice.
export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "student",
      setRole: (r) => set({ role: r }),
    }),
    { name: "aptiverse:role" },
  ),
);

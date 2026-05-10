"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ASSESSMENTS,
  GOALS,
  SUBJECTS,
  PRACTICE_TESTS,
  TUTORS,
  COURSES,
  BURSARIES,
  CHILDREN,
  CLASSES,
  NOTIFICATIONS,
  type Assessment,
  type Goal,
  type Subject,
  type PracticeTest,
  type Tutor,
  type Course,
  type Bursary,
  type Child,
  type ClassRecord,
  type Notification,
} from "@/lib/mockData";

// Mock fetch with delay so loading states render properly
const fakeFetch = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((res) => setTimeout(() => res(value), ms));

export const queryKeys = {
  subjects: () => ["subjects"] as const,
  subject: (id: string) => ["subject", id] as const,
  assessments: () => ["assessments"] as const,
  goals: () => ["goals"] as const,
  practiceTests: () => ["practice-tests"] as const,
  tutors: () => ["tutors"] as const,
  courses: () => ["courses"] as const,
  bursaries: () => ["bursaries"] as const,
  children: () => ["children"] as const,
  classes: () => ["classes"] as const,
  notifications: () => ["notifications"] as const,
};

export const useSubjects = () =>
  useQuery<Subject[]>({ queryKey: queryKeys.subjects(), queryFn: () => fakeFetch(SUBJECTS) });

export const useSubject = (id: string) =>
  useQuery<Subject | undefined>({
    queryKey: queryKeys.subject(id),
    queryFn: () => fakeFetch(SUBJECTS.find((s) => s.id === id)),
    enabled: !!id,
  });

export const useAssessments = () =>
  useQuery<Assessment[]>({ queryKey: queryKeys.assessments(), queryFn: () => fakeFetch(ASSESSMENTS) });

export const useGoals = () =>
  useQuery<Goal[]>({ queryKey: queryKeys.goals(), queryFn: () => fakeFetch(GOALS) });

export const usePracticeTests = () =>
  useQuery<PracticeTest[]>({ queryKey: queryKeys.practiceTests(), queryFn: () => fakeFetch(PRACTICE_TESTS) });

export const useTutors = () =>
  useQuery<Tutor[]>({ queryKey: queryKeys.tutors(), queryFn: () => fakeFetch(TUTORS) });

export const useCourses = () =>
  useQuery<Course[]>({ queryKey: queryKeys.courses(), queryFn: () => fakeFetch(COURSES) });

export const useBursaries = () =>
  useQuery<Bursary[]>({ queryKey: queryKeys.bursaries(), queryFn: () => fakeFetch(BURSARIES) });

export const useChildren = () =>
  useQuery<Child[]>({ queryKey: queryKeys.children(), queryFn: () => fakeFetch(CHILDREN) });

export const useClasses = () =>
  useQuery<ClassRecord[]>({ queryKey: queryKeys.classes(), queryFn: () => fakeFetch(CLASSES) });

export const useNotifications = () =>
  useQuery<Notification[]>({ queryKey: queryKeys.notifications(), queryFn: () => fakeFetch(NOTIFICATIONS) });

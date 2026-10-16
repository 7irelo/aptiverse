"use client";

// Binds the shared study vocabulary (lib/study-vocabulary.ts) to the signed-in
// student's education level. One hook so a page asks for a word rather than
// re-deriving `isTertiary ? ... : ...` for the thirteenth time.
//
// Reads the academic profile through the existing query layer, so it shares the
// react-query cache with every other caller on the page and costs no extra
// request.

import { useAcademicProfile } from "@/lib/api/queries";
import { studyVocabulary, type StudyVocabulary } from "@/lib/study-vocabulary";

export type { StudyVocabulary };

export function useStudyVocabulary(): StudyVocabulary & { isResolved: boolean } {
  const profileQuery = useAcademicProfile();
  return {
    ...studyVocabulary(profileQuery.data?.educationLevel),
    // For the rare caller that must not commit to a word until it is certain,
    // e.g. a document the student is about to print and hand to someone.
    isResolved: profileQuery.isSuccess,
  };
}

"use client";

// Data layer for the referral programme.
//
// Kept in its own module rather than in queries.ts: the affiliate surface is
// self-contained, and queries.ts is a 2500-line file that several people are
// editing at once.

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/fetcher";
import { getAccessToken } from "@/lib/api/token";
import {
  clearReferralCode,
  getDeviceId,
  getStoredReferral,
} from "@/lib/analytics/attribution";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

export type AffiliateSummary = {
  referralCode: string;
  shareUrl: string;
  status: string;
  audience: string;
  payoutOnboardingStatus: "not_started" | "submitted" | "approved" | "rejected";
  hasPayoutDetails: boolean;
  needsPayoutDetails: boolean;
  reviewNotes: string | null;
  commissionRatePercent: number;
  commissionablePayments: number;
  holdDays: number;
  attributionIsLifetime: boolean;
  referralsTotal: number;
  referralsSignedUp: number;
  referralsEarning: number;
  referralsCompleted: number;
  referralsFlagged: number;
  lifetimeEarnedZar: number;
  pendingZar: number;
  onHoldZar: number;
  payableZar: number;
  paidZar: number;
  reversedZar: number;
  carriedBalanceZar: number;
  nextHoldReleaseAt: string | null;
};

export type AffiliateReferral = {
  id: string;
  status: "signed" | "earning" | "completed" | "flagged" | "blocked";
  signedUpAt: string;
  firstPaymentAt: string | null;
  paymentsCommissioned: number;
  paymentsRemaining: number;
  earnedZar: number;
  planCode: string | null;
};

export type CommissionEntry = {
  id: string;
  referralId: string;
  entryType: "accrual" | "reversal" | "adjustment";
  status: "pending" | "held" | "payable" | "paid" | "reversed";
  paymentNumber: number;
  sourcePaymentAmountZar: number;
  commissionRatePercent: number;
  amountZar: number;
  occurredAt: string;
  holdUntil: string | null;
  paidAt: string | null;
  planCode: string | null;
  reason: string | null;
  paymentReference: string | null;
};

export type AffiliatePayout = {
  id: string;
  runReference: string;
  periodStart: string;
  periodEnd: string;
  totalZar: number;
  entryCount: number;
  status: "draft" | "paid" | "cancelled";
  paymentReference: string | null;
  paidAt: string | null;
  notes: string | null;
};

export type AffiliateTaxYear = {
  taxYear: number;
  label: string;
  startsOn: string;
  endsOn: string;
  paidZar: number;
  accruedZar: number;
  payoutCount: number;
};

export type PayoutDetailsInput = {
  legalFirstName: string;
  legalLastName: string;
  idType: "sa_id" | "passport";
  idNumber: string;
  taxReferenceNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province?: string;
  postalCode: string;
  country?: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchCode: string;
  accountType?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export const affiliateKeys = {
  me: () => ["affiliate", "me"] as const,
  referrals: () => ["affiliate", "referrals"] as const,
  commissions: () => ["affiliate", "commissions"] as const,
  payouts: () => ["affiliate", "payouts"] as const,
  taxYears: () => ["affiliate", "tax-years"] as const,
  adminSummary: () => ["affiliate", "admin", "summary"] as const,
  adminList: (status: string, search: string) => ["affiliate", "admin", "list", status, search] as const,
  adminOne: (id: string) => ["affiliate", "admin", "one", id] as const,
  adminFlagged: () => ["affiliate", "admin", "flagged"] as const,
  adminPayouts: (status: string, run: string) => ["affiliate", "admin", "payouts", status, run] as const,
  adminPayoutEntries: (id: string) => ["affiliate", "admin", "payout-entries", id] as const,
};

export const useAffiliateSummary = () =>
  useQuery<AffiliateSummary>({
    queryKey: affiliateKeys.me(),
    queryFn: () => apiClient.get<AffiliateSummary>("/api/affiliates/me"),
  });

export const useAffiliateReferrals = () =>
  useQuery<AffiliateReferral[]>({
    queryKey: affiliateKeys.referrals(),
    queryFn: () => apiClient.get<AffiliateReferral[]>("/api/affiliates/me/referrals"),
  });

export const useAffiliateCommissions = () =>
  useQuery<CommissionEntry[]>({
    queryKey: affiliateKeys.commissions(),
    queryFn: () => apiClient.get<CommissionEntry[]>("/api/affiliates/me/commissions"),
  });

export const useAffiliatePayouts = () =>
  useQuery<AffiliatePayout[]>({
    queryKey: affiliateKeys.payouts(),
    queryFn: () => apiClient.get<AffiliatePayout[]>("/api/affiliates/me/payouts"),
  });

export const useAffiliateTaxYears = () =>
  useQuery<AffiliateTaxYear[]>({
    queryKey: affiliateKeys.taxYears(),
    queryFn: () => apiClient.get<AffiliateTaxYear[]>("/api/affiliates/me/tax-years"),
  });

export const useSavePayoutDetails = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PayoutDetailsInput) =>
      apiClient.put<AffiliateSummary>("/api/affiliates/me/payout-details", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: affiliateKeys.me() });
    },
  });
};

// Records the referral against the signed-in account.
//
// Runs once per session on the first authenticated page load, which covers
// email signup and OAuth alike without either flow having to know about it.
// Every outcome clears the stored code, including the refusals: an unknown
// code, a self-referral and an account that already has a referrer are all
// final answers, and retrying them on every page load forever would be worse
// than useless.
//
// It fails invisibly. Nobody ever sees anything because a referral code was
// bad, which is the whole point.
export function useReferralClaim(isAuthenticated: boolean): void {
  const attempted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || attempted.current) return;
    const stored = getStoredReferral();
    if (!stored?.code) return;

    attempted.current = true;
    void (async () => {
      try {
        await apiClient.post("/api/affiliates/referrals/claim", {
          code: stored.code,
          landingPath: stored.landingPath,
          deviceId: getDeviceId(),
        });
      } catch {
        // Offline, or the API is unhappy. Leave the code in place so the next
        // load tries again rather than losing somebody's commission.
        attempted.current = false;
        return;
      }
      clearReferralCode();
    })();
  }, [isAuthenticated]);
}

// CSV endpoints are [Authorize], so a plain anchor href would 401: the browser
// does not attach the Bearer token to a top-level navigation. Fetch it with
// the token, then hand the blob to a synthetic link.
export async function downloadCsv(path: string, filename: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Could not download that file. Please try again.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ---- Admin ---------------------------------------------------------------

export type AdminAffiliate = {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  referralCode: string;
  status: string;
  audience: string;
  payoutOnboardingStatus: "not_started" | "submitted" | "approved" | "rejected";
  hasPayoutDetails: boolean;
  detailsSubmittedAt: string | null;
  referralCount: number;
  payableZar: number;
  onHoldZar: number;
  pendingZar: number;
  paidZar: number;
  payoutDetails: {
    legalName: string;
    idType: string | null;
    idNumber: string | null;
    taxReferenceNumber: string | null;
    address: string;
    bankName: string | null;
    accountHolderName: string | null;
    accountNumber: string | null;
    branchCode: string | null;
    accountType: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  } | null;
};

export type AdminProgrammeSummary = {
  affiliateCount: number;
  activeReferrerCount: number;
  referralCount: number;
  payingReferralCount: number;
  awaitingReview: number;
  flaggedReferrals: number;
  pendingZar: number;
  onHoldZar: number;
  payableZar: number;
  blockedOnDetailsZar: number;
  paidZar: number;
  draftPayoutCount: number;
  draftPayoutZar: number;
};

export type AdminFlaggedReferral = {
  id: string;
  affiliateId: string;
  affiliateName: string;
  affiliateCode: string;
  referredName: string;
  referredEmail: string | null;
  status: string;
  flagReason: string | null;
  signedUpAt: string;
  parkedZar: number;
  signals: { signalType: string; severity: string; detail: string | null; occurredAt: string }[];
};

export type AdminPayoutLine = {
  id: string;
  runReference: string;
  affiliateId: string;
  affiliateCode: string;
  payeeName: string;
  bankName: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  branchCode: string | null;
  accountType: string | null;
  amountZar: number;
  entryCount: number;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "paid" | "cancelled";
  paymentReference: string | null;
  paidAt: string | null;
  suggestedReference: string;
};

export type PayoutRunResult = {
  runReference: string;
  payoutCount: number;
  totalZar: number;
  skippedNoDetails: number;
  skippedNoDetailsZar: number;
  carriedNegative: number;
};

export const useAdminAffiliateSummary = () =>
  useQuery<AdminProgrammeSummary>({
    queryKey: affiliateKeys.adminSummary(),
    queryFn: () => apiClient.get<AdminProgrammeSummary>("/api/affiliates/admin/summary"),
  });

export const useAdminAffiliates = (status: string, search = "") =>
  useQuery<AdminAffiliate[]>({
    queryKey: affiliateKeys.adminList(status, search),
    queryFn: () => {
      const params = new URLSearchParams({ status });
      if (search) params.set("search", search);
      return apiClient.get<AdminAffiliate[]>(`/api/affiliates/admin?${params.toString()}`);
    },
  });

export const useAdminAffiliate = (id: string | null) =>
  useQuery<AdminAffiliate>({
    queryKey: affiliateKeys.adminOne(id ?? ""),
    queryFn: () => apiClient.get<AdminAffiliate>(`/api/affiliates/admin/${id}`),
    enabled: !!id,
  });

export const useAdminFlaggedReferrals = () =>
  useQuery<AdminFlaggedReferral[]>({
    queryKey: affiliateKeys.adminFlagged(),
    queryFn: () => apiClient.get<AdminFlaggedReferral[]>("/api/affiliates/admin/referrals/flagged"),
  });

export const useAdminPayouts = (status: string, runReference = "") =>
  useQuery<AdminPayoutLine[]>({
    queryKey: affiliateKeys.adminPayouts(status, runReference),
    queryFn: () => {
      const params = new URLSearchParams({ status });
      if (runReference) params.set("runReference", runReference);
      return apiClient.get<AdminPayoutLine[]>(`/api/affiliates/admin/payouts?${params.toString()}`);
    },
  });

export const useAdminPayoutEntries = (id: string | null) =>
  useQuery<CommissionEntry[]>({
    queryKey: affiliateKeys.adminPayoutEntries(id ?? ""),
    queryFn: () => apiClient.get<CommissionEntry[]>(`/api/affiliates/admin/payouts/${id}/entries`),
    enabled: !!id,
  });

function useAdminMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["affiliate"] });
    },
  });
}

export const useApproveAffiliate = () =>
  useAdminMutation((input: { id: string; notes?: string }) =>
    apiClient.post(`/api/affiliates/admin/${input.id}/approve`, { notes: input.notes }));

export const useRejectAffiliate = () =>
  useAdminMutation((input: { id: string; notes?: string }) =>
    apiClient.post(`/api/affiliates/admin/${input.id}/reject`, { notes: input.notes }));

export const useSuspendAffiliate = () =>
  useAdminMutation((input: { id: string; notes?: string }) =>
    apiClient.post(`/api/affiliates/admin/${input.id}/suspend`, { notes: input.notes }));

export const useReinstateAffiliate = () =>
  useAdminMutation((input: { id: string }) =>
    apiClient.post(`/api/affiliates/admin/${input.id}/reinstate`));

export const useClearReferral = () =>
  useAdminMutation((input: { id: string; notes?: string }) =>
    apiClient.post(`/api/affiliates/admin/referrals/${input.id}/clear`, { notes: input.notes }));

export const useBlockReferral = () =>
  useAdminMutation((input: { id: string; notes?: string }) =>
    apiClient.post(`/api/affiliates/admin/referrals/${input.id}/block`, { notes: input.notes }));

export const useGeneratePayoutRun = () =>
  useAdminMutation((input: { periodEnd?: string; minimumZar?: number }) =>
    apiClient.post<PayoutRunResult>("/api/affiliates/admin/payouts/generate", input));

export const useMarkPayoutPaid = () =>
  useAdminMutation((input: { id: string; paymentReference: string; paidAt?: string; notes?: string }) =>
    apiClient.post(`/api/affiliates/admin/payouts/${input.id}/mark-paid`, {
      paymentReference: input.paymentReference,
      paidAt: input.paidAt,
      notes: input.notes,
    }));

export const useCancelPayout = () =>
  useAdminMutation((input: { id: string; notes?: string }) =>
    apiClient.post(`/api/affiliates/admin/payouts/${input.id}/cancel`, { notes: input.notes }));

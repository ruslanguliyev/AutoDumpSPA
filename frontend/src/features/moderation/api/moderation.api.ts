import { gqlRequest } from '@/lib/graphql';

export const REPORT_REASONS = [
  'SPAM',
  'SCAM',
  'WRONG_INFO',
  'PROHIBITED',
  'ALREADY_SOLD',
  'OTHER',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export type ProfileKind = 'SPECIALIST' | 'SERVICE_CENTER' | 'SELLER';
export type AdminProfile = {
  id: string;
  targetType: ProfileKind;
  name: string;
  city: string;
  slug: string | null;
  rating: number;
  reviewsCount: number;
  verified: boolean;
};

export type ReportStatus = 'OPEN' | 'ACTIONED' | 'DISMISSED';

export type Report = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingStatus: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'BLOCKED';
  itemId: string | null;
  kind: string;
  sellerName: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  reporterEmail: string;
  openReportsForListing: number;
  createdAt: string;
};

const REPORT_FIELDS = `
  id listingId listingTitle listingStatus itemId kind sellerName
  reason details status reporterEmail openReportsForListing createdAt
`;

export const moderationApi = {
  report: (input: { listingId: string; reason: ReportReason; details?: string }) =>
    gqlRequest<{ reportListing: boolean }>(
      `mutation($input: ReportListingInput!) { reportListing(input: $input) }`,
      { input },
    ).then((d) => d.reportListing),

  reports: (status: ReportStatus) =>
    gqlRequest<{ reports: Report[] }>(
      `query($status: ReportStatus) { reports(status: $status) { ${REPORT_FIELDS} } }`,
      { status },
    ).then((d) => d.reports),

  dismiss: (id: string) =>
    gqlRequest(`mutation($id: String!) { dismissReport(id: $id) }`, { id }),

  block: (listingId: string, reason: string) =>
    gqlRequest(`mutation($listingId: String!, $reason: String!) { blockListing(listingId: $listingId, reason: $reason) }`, {
      listingId,
      reason,
    }),

  unblock: (listingId: string) =>
    gqlRequest(`mutation($listingId: String!) { unblockListing(listingId: $listingId) }`, { listingId }),

  profiles: (targetType: ProfileKind, search: string) =>
    gqlRequest<{ adminProfiles: AdminProfile[] }>(
      `query($targetType: ReviewTargetType!, $search: String) {
        adminProfiles(targetType: $targetType, search: $search, limit: 100) {
          id targetType name city slug rating reviewsCount verified
        }
      }`,
      { targetType, search: search.trim() || null },
    ).then((d) => d.adminProfiles),

  setVerified: (targetType: ProfileKind, targetId: string, verified: boolean) =>
    gqlRequest(
      `mutation($targetType: ReviewTargetType!, $targetId: String!, $verified: Boolean!) {
        setProfileVerified(targetType: $targetType, targetId: $targetId, verified: $verified)
      }`,
      { targetType, targetId, verified },
    ),
};

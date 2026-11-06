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
};

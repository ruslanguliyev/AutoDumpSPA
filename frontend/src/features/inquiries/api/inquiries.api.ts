import { gqlRequest } from '@/lib/graphql';

export type InquiryStatus = 'NEW' | 'READ';

export type Inquiry = {
  id: string;
  listingId: string;
  listingTitle: string;
  message: string;
  phone: string | null;
  status: InquiryStatus;
  createdAt: string;
  fromName: string | null;
  fromEmail: string | null;
};

const FIELDS = `id listingId listingTitle message phone status createdAt fromName fromEmail`;

export const inquiriesApi = {
  create: (input: { listingId: string; message: string; phone?: string }) =>
    gqlRequest<{ createInquiry: Inquiry }>(
      `mutation CreateInquiry($input: CreateInquiryInput!) { createInquiry(input: $input) { ${FIELDS} } }`,
      { input },
    ).then((d) => d.createInquiry),

  received: () =>
    gqlRequest<{ receivedInquiries: Inquiry[] }>(
      `query { receivedInquiries { ${FIELDS} } }`,
    ).then((d) => d.receivedInquiries),

  sent: () =>
    gqlRequest<{ sentInquiries: Inquiry[] }>(
      `query { sentInquiries { ${FIELDS} } }`,
    ).then((d) => d.sentInquiries),

  unreadCount: () =>
    gqlRequest<{ unreadInquiriesCount: number }>(
      `query { unreadInquiriesCount }`,
    ).then((d) => d.unreadInquiriesCount),

  markRead: (id: string) =>
    gqlRequest<{ markInquiryRead: Inquiry }>(
      `mutation MarkRead($id: String!) { markInquiryRead(id: $id) { ${FIELDS} } }`,
      { id },
    ).then((d) => d.markInquiryRead),
};

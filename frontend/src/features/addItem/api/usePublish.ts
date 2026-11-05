import { gqlRequest } from '@/lib/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { forceSyncDraft } from '@/features/addItem/api/useDraft';
import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import { validateDraft } from '@/features/addItem/utils/validateDraft';

const DRAFT_QUERY_KEY = 'add-item-draft';
const DRAFTS_STORAGE_KEY = 'autodump:add-item-drafts';

const getToken = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem('autobaz-token');

const PUBLISH_LISTING = `
mutation PublishListing($id: String!) {
  publishListing(id: $id) {
    id
    status
  }
}
`;

const readDrafts = (): Record<string, ListingDraft> => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
  if (!raw) return {};
  try {
    return (JSON.parse(raw) as Record<string, ListingDraft>) ?? {};
  } catch (error) {
    console.error('Failed to parse drafts cache', error);
    return {};
  }
};

const writeDrafts = (drafts: Record<string, ListingDraft>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
};

export const publishDraft = async (draftId: string): Promise<ListingDraft> => {
  if (!getToken()) {
    throw new Error('Please log in to create a listing');
  }

  const drafts = readDrafts();
  const draft = drafts[draftId];
  if (!draft) {
    throw new Error('Draft not found');
  }
  if (!validateDraft(draft)) {
    throw new Error('Draft is not ready to publish');
  }

  // Ensure the latest draft (incl. imageUrls) is persisted to the backend
  // before flipping status to published. Without this, a debounced autosave
  // might still be in flight and the published listing would end up with
  // stale data.
  await forceSyncDraft(draftId);

  await gqlRequest<{ publishListing: { id: string; status: string } }>(PUBLISH_LISTING, {
    id: draftId,
  });

  const next: ListingDraft = {
    ...draft,
    status: 'published',
  };
  drafts[draftId] = next;
  writeDrafts(drafts);
  return next;
};

export const usePublishDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishDraft,
    onSuccess: (draft) => {
      queryClient.setQueryData([DRAFT_QUERY_KEY, draft.id], draft);
    },
  });
};

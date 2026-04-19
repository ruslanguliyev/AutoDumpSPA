import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import { validateDraft } from '@/features/addItem/utils/validateDraft';

const DRAFT_QUERY_KEY = 'add-item-draft';
const DRAFTS_STORAGE_KEY = 'autodump:add-item-drafts';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

export const publishDraft = async (draftId: string) => {
  await sleep(300);
  const drafts = readDrafts();
  const draft = drafts[draftId];
  if (!draft) {
    throw new Error('Draft not found');
  }
  if (!validateDraft(draft)) {
    throw new Error('Draft is not ready to publish');
  }
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createEmptyDraft,
  type ListingDraft,
  type ListingType,
} from '@/features/addItem/store/useAddItemStore';
import { validateDraft } from '@/features/addItem/utils/validateDraft';

const DRAFTS_STORAGE_KEY = 'autodump:add-item-drafts';
const DRAFT_QUERY_KEY = 'add-item-draft';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readDrafts = (): Record<string, ListingDraft> => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, ListingDraft>;
    return parsed ?? {};
  } catch (error) {
    console.error('Failed to parse drafts cache', error);
    return {};
  }
};

const writeDrafts = (drafts: Record<string, ListingDraft>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
};

const applyPatch = (
  draft: ListingDraft,
  patch: Partial<ListingDraft>
): ListingDraft => ({
  ...draft,
  ...patch,
  common: {
    ...draft.common,
    ...patch.common,
    pricing: {
      ...draft.common.pricing,
      ...patch.common?.pricing,
    },
  },
  media: {
    ...draft.media,
    ...patch.media,
    images: patch.media?.images ?? draft.media.images,
  },
  seller: {
    ...draft.seller,
    ...patch.seller,
  },
  vehicle: draft.vehicle
    ? {
        ...draft.vehicle,
        ...patch.vehicle,
      }
    : draft.vehicle,
  part: draft.part
    ? {
        ...draft.part,
        ...patch.part,
      }
    : draft.part,
});

const finalizeStatus = (draft: ListingDraft): ListingDraft => {
  if (draft.status === 'published') return draft;
  const isReady = validateDraft(draft);
  return {
    ...draft,
    status: isReady ? 'ready' : 'draft',
  };
};

export const createDraft = async (type: ListingType) => {
  await sleep(200);
  const draft = createEmptyDraft(type);
  const drafts = readDrafts();
  drafts[draft.id] = draft;
  writeDrafts(drafts);
  return draft;
};

export const getDraft = async (draftId: string) => {
  await sleep(200);
  const drafts = readDrafts();
  return drafts[draftId] ?? null;
};

export const saveDraftPatch = async (
  draftId: string,
  patch: Partial<ListingDraft>
) => {
  await sleep(250);
  const drafts = readDrafts();
  const current = drafts[draftId];
  if (!current) {
    throw new Error('Draft not found');
  }
  const next = finalizeStatus(applyPatch(current, patch));
  drafts[draftId] = next;
  writeDrafts(drafts);
  return next;
};

export const useDraft = (draftId?: string) =>
  useQuery({
    queryKey: [DRAFT_QUERY_KEY, draftId],
    queryFn: () => (draftId ? getDraft(draftId) : null),
    enabled: Boolean(draftId),
    staleTime: 10_000,
  });

export const useCreateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDraft,
    onSuccess: (draft) => {
      queryClient.setQueryData([DRAFT_QUERY_KEY, draft.id], draft);
    },
  });
};

export const useSaveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, patch }: { draftId: string; patch: Partial<ListingDraft> }) =>
      saveDraftPatch(draftId, patch),
    onMutate: async ({ draftId, patch }) => {
      await queryClient.cancelQueries({ queryKey: [DRAFT_QUERY_KEY, draftId] });
      const previous = queryClient.getQueryData<ListingDraft | null>([
        DRAFT_QUERY_KEY,
        draftId,
      ]);
      if (previous) {
        const optimistic = finalizeStatus(applyPatch(previous, patch));
        queryClient.setQueryData([DRAFT_QUERY_KEY, draftId], optimistic);
      }
      return { previous };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([DRAFT_QUERY_KEY, variables.draftId], context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_QUERY_KEY, variables.draftId] });
    },
  });
};

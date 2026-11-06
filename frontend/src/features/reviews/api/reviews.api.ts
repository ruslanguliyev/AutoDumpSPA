import { gqlRequest } from '@/lib/graphql';

export type ReviewTargetType = 'SELLER' | 'SPECIALIST' | 'SERVICE_CENTER';

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string;
  mine: boolean;
  createdAt: string;
};

export type ReviewList = {
  items: Review[];
  total: number;
  average: number;
  /** Number of reviews per star: index 0 = 1 star ... index 4 = 5 stars. */
  distribution: number[];
};

const REVIEW_FIELDS = 'id rating comment authorName mine createdAt';

export const reviewsApi = {
  list: (targetType: ReviewTargetType, targetId: string, limit: number) =>
    gqlRequest<{ reviews: ReviewList }>(
      `query($targetType: ReviewTargetType!, $targetId: String!, $limit: Int) {
        reviews(targetType: $targetType, targetId: $targetId, limit: $limit) {
          total average distribution items { ${REVIEW_FIELDS} }
        }
      }`,
      { targetType, targetId, limit },
    ).then((d) => d.reviews),

  submit: (input: { targetType: ReviewTargetType; targetId: string; rating: number; comment?: string }) =>
    gqlRequest<{ submitReview: Review }>(
      `mutation($input: SubmitReviewInput!) { submitReview(input: $input) { ${REVIEW_FIELDS} } }`,
      { input },
    ).then((d) => d.submitReview),

  remove: (id: string) =>
    gqlRequest<{ deleteReview: boolean }>(`mutation($id: String!) { deleteReview(id: $id) }`, { id }).then(
      (d) => d.deleteReview,
    ),
};

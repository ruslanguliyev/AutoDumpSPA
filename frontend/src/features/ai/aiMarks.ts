export type AiMarkKey =
  | 'brand'
  | 'model'
  | 'price'
  | 'year'
  | 'city'
  | 'condition'
  | 'fuel'
  | 'transmission';

export type AiMarks = Partial<Record<AiMarkKey, boolean>>;

export const emptyAiMarks = (): AiMarks => ({});

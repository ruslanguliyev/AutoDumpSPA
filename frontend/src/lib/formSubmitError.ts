const UNAUTH_PATTERN =
  /unauthorized|forbidden|jwt|not authenticated|must be logged|login required/i;

export type SubmitErrorMessages = {
  network: string;
  generic: string;
  loginRequired: string;
};

export type MappedSubmitError = {
  message: string;
  showLoginLink?: boolean;
};

/** Never surface raw API/GraphQL text in the UI — map to i18n strings. */
export function mapSubmitError(
  error: unknown,
  messages: SubmitErrorMessages,
): MappedSubmitError | null {
  if (error == null) return null;

  if (error instanceof TypeError) {
    return { message: messages.network };
  }

  const raw = error instanceof Error ? error.message : String(error);
  if (UNAUTH_PATTERN.test(raw)) {
    return { message: messages.loginRequired, showLoginLink: true };
  }

  return { message: messages.generic };
}

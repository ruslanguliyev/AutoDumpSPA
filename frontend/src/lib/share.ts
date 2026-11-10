export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Web Share when the browser supports it; otherwise copy the URL to the clipboard. */
export async function shareOrCopyUrl({
  title,
  url,
}: {
  title: string;
  url: string;
}): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { parseFocus, withFocus, type ImageFocus } from '@/lib/imageFocus';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import Button from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';

type Props = {
  url: string;
  onChange: (url: string) => void;
};

const KEY_STEP = 5;

/**
 * The main photo inside the catalogue card frame (4:3, object-fit: cover).
 * Dragging the picture moves which part of it stays in the frame; the result is
 * kept in the URL as a focal point and used by every card.
 */
export function PhotoFocusEditor({ url, onChange }: Props) {
  const { t } = useTranslation('addItem');
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; focus: ImageFocus; overflowX: number; overflowY: number } | null>(null);
  const [focus, setFocus] = useState<ImageFocus>(() => parseFocus(url));
  const [dragging, setDragging] = useState(false);
  const [lastUrl, setLastUrl] = useState(url);

  // Another photo became the main one: start from its own focal point.
  if (url !== lastUrl) {
    setLastUrl(url);
    setFocus(parseFocus(url));
  }

  const src = resolveMediaUrl(url);
  if (!src) return null;

  const commit = (next: ImageFocus) => {
    setFocus(next);
    onChange(withFocus(url, next));
  };

  /** How far, in pixels, the covered image sticks out of the frame on each axis. */
  const overflow = () => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || !img.naturalWidth || !img.naturalHeight) return { x: 0, y: 0 };
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const scale = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
    return { x: img.naturalWidth * scale - fw, y: img.naturalHeight * scale - fh };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const o = overflow();
    drag.current = { x: event.clientX, y: event.clientY, focus, overflowX: o.x, overflowY: o.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    // Moving the picture right shows more of its left side, so the focus goes down.
    const clamp = (v: number) => Math.min(100, Math.max(0, v));
    const x = d.overflowX > 0 ? clamp(d.focus.x - ((event.clientX - d.x) / d.overflowX) * 100) : d.focus.x;
    const y = d.overflowY > 0 ? clamp(d.focus.y - ((event.clientY - d.y) / d.overflowY) * 100) : d.focus.y;
    setFocus({ x, y });
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    commit(focus);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [KEY_STEP, 0],
      ArrowRight: [-KEY_STEP, 0],
      ArrowUp: [0, KEY_STEP],
      ArrowDown: [0, -KEY_STEP],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const clamp = (v: number) => Math.min(100, Math.max(0, v));
    commit({ x: clamp(focus.x + move[0]), y: clamp(focus.y + move[1]) });
  };

  const centered = Math.round(focus.x) === 50 && Math.round(focus.y) === 50;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{t('photoFocus.title')}</p>
        <Button variant="ghost" size="sm" className="!h-11" onClick={() => commit({ x: 50, y: 50 })} disabled={centered}>
          {t('photoFocus.reset')}
        </Button>
      </div>
      <div
        ref={frameRef}
        role="slider"
        tabIndex={0}
        aria-label={t('photoFocus.aria')}
        aria-valuetext={`${Math.round(focus.x)}% ${Math.round(focus.y)}%`}
        className={cn(
          'relative aspect-[4/3] w-full max-w-md touch-none select-none overflow-hidden rounded-xl border border-border bg-card-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
        />
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-background/85 px-2.5 py-1 text-xs text-foreground">
          {t('photoFocus.hint')}
        </span>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Button from '@/shared/ui/button';

type DateRangeCalendarProps = {
  /** `YYYY-MM-DD`, or '' while nothing is picked. */
  start: string;
  end: string;
  /** First day that can be picked; every earlier day is greyed out. */
  min: string;
  /** True for a day that cannot be booked (greyed out, struck through, not clickable). */
  isUnavailable: (day: string) => boolean;
  onPick: (day: string) => void;
  locale: string;
  labels: {
    previousMonth: string;
    nextMonth: string;
    /** Added to the aria-label of an unavailable day. */
    unavailable: string;
    group: string;
  };
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
const toDay = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * Month grid for picking a date range. Days that are in the past or already booked are disabled and
 * drawn muted with a strike-through, so the state never depends on colour alone.
 * Dates are plain `YYYY-MM-DD` strings throughout; no time zone maths lives here.
 */
export function DateRangeCalendar({
  start,
  end,
  min,
  isUnavailable,
  onPick,
  locale,
  labels,
  className = '',
}: DateRangeCalendarProps) {
  const anchor = start || min;
  const [cursor, setCursor] = useState(() => ({
    year: Number(anchor.slice(0, 4)),
    month: Number(anchor.slice(5, 7)) - 1,
  }));

  const minYear = Number(min.slice(0, 4));
  const minMonth = Number(min.slice(5, 7)) - 1;
  const atMinMonth = cursor.year === minYear && cursor.month === minMonth;

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(
        new Date(Date.UTC(cursor.year, cursor.month, 1)),
      ),
    [locale, cursor],
  );

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short' });
    // 2024-01-01 is a Monday; weeks start on Monday.
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i))));
  }, [locale]);

  const dayLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }),
    [locale],
  );

  const cells = useMemo(() => {
    const offset = (new Date(Date.UTC(cursor.year, cursor.month, 1)).getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, i) => toDay(cursor.year, cursor.month, i + 1)),
    ];
  }, [cursor]);

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  return (
    <div role="group" aria-label={labels.group} className={className}>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="icon"
          size="icon"
          aria-label={labels.previousMonth}
          disabled={atMinMonth}
          onClick={() => shift(-1)}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </Button>
        <p className="min-w-0 truncate text-center text-[15px] font-semibold capitalize text-foreground" aria-live="polite">
          {monthLabel}
        </p>
        <Button type="button" variant="icon" size="icon" aria-label={labels.nextMonth} onClick={() => shift(1)}>
          <ChevronRight size={20} aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((w) => (
          <span key={w} className="py-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} aria-hidden="true" />;
          const past = day < min;
          const booked = !past && isUnavailable(day);
          const disabled = past || booked;
          const isEdge = day === start || day === end;
          const inRange = Boolean(start && end && day > start && day < end);
          const base = 'relative h-11 w-full min-w-0 text-[15px] tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
          let tone = 'rounded-[var(--radius)] text-foreground hover:bg-foreground/5';
          if (past) tone = 'rounded-[var(--radius)] text-subtle-foreground';
          if (inRange) tone = 'text-foreground bg-primary/15 hover:bg-primary/25';
          if (booked) tone = 'rounded-[var(--radius)] bg-card-muted text-muted-foreground line-through';
          if (isEdge) tone = 'rounded-[var(--radius)] bg-primary font-semibold text-primary-foreground';
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              aria-pressed={isEdge || inRange}
              aria-label={booked ? `${dayLabel.format(new Date(`${day}T00:00:00Z`))}, ${labels.unavailable}` : dayLabel.format(new Date(`${day}T00:00:00Z`))}
              className={`${base} ${tone} ${disabled ? 'cursor-not-allowed' : ''}`}
              onClick={() => onPick(day)}
            >
              {Number(day.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DateRangeCalendar;

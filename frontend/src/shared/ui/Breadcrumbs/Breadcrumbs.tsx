import { Link } from 'react-router-dom';

export type BreadcrumbItem = { label: string; to?: string };

/**
 * 13px muted trail with "/" separators and the current page in --foreground.
 *
 * The BEM class names stay: the seller page recolours this trail where it sits on top of
 * a cover image, and that override hangs off `.breadcrumbs__link` and its siblings.
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs mb-2.5" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list flex flex-wrap items-center gap-2 text-[13px] leading-snug text-muted-foreground">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const key = `${item.label}-${idx}`;

          return (
            <li key={key} className="breadcrumbs__item inline-flex items-center gap-2">
              {item.to && !isLast ? (
                <Link
                  className="breadcrumbs__link text-muted-foreground transition-colors hover:text-foreground"
                  to={item.to}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? 'breadcrumbs__current font-semibold text-foreground'
                      : 'breadcrumbs__current text-muted-foreground'
                  }
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span className="breadcrumbs__sep text-subtle-foreground" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

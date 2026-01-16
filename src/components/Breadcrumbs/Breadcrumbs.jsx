import { Link } from 'react-router-dom';
import './Breadcrumbs.scss';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const key = `${item.label}-${idx}`;

          return (
            <li key={key} className="breadcrumbs__item">
              {item.to && !isLast ? (
                <Link className="breadcrumbs__link" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className="breadcrumbs__current"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span className="breadcrumbs__sep" aria-hidden="true">
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


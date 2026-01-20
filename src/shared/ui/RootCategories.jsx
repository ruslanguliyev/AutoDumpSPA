import { useCategoryTree } from '@/shared/hooks/useCategoryTree';
import styles from './RootCategories.module.css';

const CategoryIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const RootCategories = () => {
  const categories = useCategoryTree();

  return (
    <section className={styles.section} aria-labelledby="root-categories-title">
      <h2 id="root-categories-title" className={styles.title}>
        Root Categories
      </h2>
      <ul className={styles.list}>
        {categories.map((category) => (
          <li key={category.id} className={styles.item}>
            <CategoryIcon />
            <span className={styles.text}>{category.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RootCategories;

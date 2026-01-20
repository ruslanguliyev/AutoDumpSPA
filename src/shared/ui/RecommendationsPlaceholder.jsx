import styles from './RecommendationsPlaceholder.module.css';

const RecommendationsPlaceholder = () => (
  <section className={styles.section} aria-labelledby="recommendations-title">
    <h2 id="recommendations-title" className={styles.title}>
      Recommendations
    </h2>
    <div className={styles.placeholder}>Recommendations will appear here.</div>
  </section>
);

export default RecommendationsPlaceholder;

import styles from "./ProductCardSkeleton.module.css";

const ProductCardSkeleton = () => (
  <div className={styles.card} aria-hidden="true">
    <div className={styles.cover} />
    <div className={styles.info}>
      <div className={styles.lineTitle} />
      <div className={styles.lineCredits} />
    </div>
    <div className={styles.meta}>
      <div className={styles.lineMeta} />
    </div>
    <div className={styles.actions}>
      <div className={styles.iconDot} />
      <div className={styles.iconDot} />
    </div>
  </div>
);

export { ProductCardSkeleton };

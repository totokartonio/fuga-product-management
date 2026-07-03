import styles from "./Field.module.css";

type Props = {
  children: React.ReactNode;
  label: string;
  htmlFor: string;
  error?: string | null;
};

const Field = ({ children, label, htmlFor, error }: Props) => {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export { Field };

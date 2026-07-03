import styles from "./EmptyState.module.css";

type Props = {
  message: string;
};

const EmptyState = ({ message }: Props) => {
  return (
    <div className={styles.state}>
      <p>{message}</p>
    </div>
  );
};

export { EmptyState };

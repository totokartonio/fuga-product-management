import styles from "./ErrorState.module.css";
import { Button } from "../Button/Button";

type Props = {
  message: string;
  onClick: () => void;
  disabled: boolean;
};

const ErrorState = ({ message, onClick, disabled }: Props) => {
  return (
    <div className={styles.state}>
      <p>{message}</p>
      <Button variant="ghost" onClick={onClick} disabled={disabled}>
        {disabled ? "Retrying…" : "Retry"}
      </Button>
    </div>
  );
};

export { ErrorState };

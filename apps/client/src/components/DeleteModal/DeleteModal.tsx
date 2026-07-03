import { Button } from "../ui/Button/Button";
import type { ProductResponse } from "@fuga/shared";
import styles from "./DeleteModal.module.css";

type Props = {
  product: ProductResponse;
  onDelete: () => void;
  onCancel: () => void;
};

const DeleteModal = ({ product, onDelete, onCancel }: Props) => {
  return (
    <div className={styles.confirm}>
      <p>
        Delete <strong>{product.name}</strong>? This can't be undone.
      </p>
      <div className={styles.confirmActions}>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export { DeleteModal };

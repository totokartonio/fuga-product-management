import type { ProductResponse } from "@fuga/shared";
import { useState } from "react";
import { formatCredits } from "../../utils/formatCredits";
import { formatDate } from "../../utils/formatDate";
import styles from "./ProductList.module.css";
import { IconButton } from "../ui/IconButton/IconButton";
import { Pencil, Trash2 } from "lucide-react";
import { RecordPlaceholder } from "../ui/RecordPlaceholder/RecordPlaceholder";

type Props = {
  product: ProductResponse;
  onDelete: (product: ProductResponse) => void;
  onEdit: (product: ProductResponse) => void;
};

const ProductCard = ({ product, onDelete, onEdit }: Props) => {
  const [broken, setBroken] = useState(false);

  const { main, featured } = formatCredits(product.artists);

  return (
    <div className={styles.card}>
      <div className={styles.cover}>
        {product.coverArtUrl && !broken ? (
          <img
            src={product.coverArtUrl}
            alt={product.name}
            onError={() => setBroken(true)}
          />
        ) : (
          <RecordPlaceholder className={styles.recordPlaceholder} />
        )}
      </div>

      <div className={styles.info}>
        <h2 className={styles.title}>{product.name}</h2>
        <p className={styles.credits}>
          <span className={styles.mainArtist}>{main}</span>
          {featured.length > 0 && (
            <>
              <span className={styles.feat}> feat. </span>
              {featured.join(", ")}
            </>
          )}
        </p>
      </div>

      <div className={styles.meta}>
        <span className={styles.metaLabel}>Added</span>
        <span className={styles.metaValue}>
          {formatDate(product.createdAt)}
        </span>
      </div>

      <div className={styles.actions}>
        <IconButton
          aria-label={`Edit ${product.name}`}
          onClick={() => onEdit(product)}
        >
          <Pencil size={18} />
        </IconButton>
        <IconButton
          tone="danger"
          aria-label={`Delete ${product.name}`}
          onClick={() => onDelete(product)}
        >
          <Trash2 size={18} />
        </IconButton>
      </div>
    </div>
  );
};

export { ProductCard };

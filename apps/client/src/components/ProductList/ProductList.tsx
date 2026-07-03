import type { ProductResponse } from "@fuga/shared";
import { ProductCard } from "./ProductCard";
import styles from "./ProductList.module.css";
import { Button } from "../ui/Button/Button";
import { ProductCardSkeleton } from "./ProductCardSkeleton/ProductCardSkeleton";

type Props = {
  products: ProductResponse[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onCreate: () => void;
  onRetry: () => void;
  onDelete: (product: ProductResponse) => void;
  onEdit: (product: ProductResponse) => void;
};

const ProductList = ({
  products,
  isLoading,
  isError,
  isFetching,
  onCreate,
  onRetry,
  onDelete,
  onEdit,
}: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1>Catalog</h1>
        </div>
        <Button variant="primary" onClick={onCreate}>
          Add release
        </Button>
      </div>
      {isError ? (
        <div className={styles.state}>
          <p>Couldn't load releases.</p>
          <Button variant="ghost" onClick={onRetry} disabled={isFetching}>
            {isFetching ? "Retrying…" : "Retry"}
          </Button>
        </div>
      ) : isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={styles.state}>
          <p>No releases yet. Add your first one to get started.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { ProductList };

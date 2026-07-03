import type { ProductResponse } from "@fuga/shared";
import { ProductCard } from "./ProductCard";
import styles from "./ProductList.module.css";
import { Button } from "../ui/Button/Button";
import { ProductCardSkeleton } from "./ProductCardSkeleton/ProductCardSkeleton";
import { EmptyState } from "../ui/EmptyState/EmptyState";
import { ErrorState } from "../ui/ErrorState/ErrorState";

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
  const emptyMessage = "No products yet. Add your first one to get started.";
  const errorMessage = "Couldn't load products.";
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
        <ErrorState
          message={errorMessage}
          onClick={onRetry}
          disabled={isFetching}
        />
      ) : isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState message={emptyMessage} />
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

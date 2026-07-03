import { useQuery } from "@tanstack/react-query";
import type { ProductResponse } from "@fuga/shared";
import { getProducts } from "../../api/products";
import { ProductList } from "../ProductList/ProductList";

type ProductListPageProps = {
  onCreate: () => void;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
};

const ProductListPage = ({
  onCreate,
  onEdit,
  onDelete,
}: ProductListPageProps) => {
  const {
    data: products,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  return (
    <ProductList
      products={products ?? []}
      isLoading={isLoading}
      isError={isError}
      isFetching={isFetching}
      onCreate={onCreate}
      onRetry={() => refetch()}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export { ProductListPage };

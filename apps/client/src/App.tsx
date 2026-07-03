import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "./api/products";
import { createArtist } from "./api/artists";
import { useState } from "react";
import { ProductList } from "./components/ProductList/ProductList";
import { ProductForm } from "./components/ProductForm/ProductForm";
import { ArtistForm } from "./components/ArtistForm/ArtistForm";
import type { ProductResponse } from "@fuga/shared";
import { ApiError } from "./api/apiError";
import { Modal } from "./components/ui/Modal/Modal";
import { DeleteModal } from "./components/DeleteModal/DeleteModal";

type ProductModalState =
  | { mode: "create" }
  | { mode: "edit"; product: ProductResponse }
  | null;

const App = () => {
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

  const queryClient = useQueryClient();

  const [productModal, setProductModal] = useState<ProductModalState>(null);
  const [isArtistFormOpen, setIsArtistFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(
    null,
  );

  const productMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductModal(null); // close on success
    },
  });

  const artistMutation = useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      setIsArtistFormOpen(false);
    },
  });

  const fieldErrorsOf = (error: unknown) =>
    error instanceof ApiError ? error.fields : undefined;

  const createFailedGenerally =
    productMutation.isError && !fieldErrorsOf(productMutation.error);

  const updateFailedGenerally =
    updateMutation.isError && !fieldErrorsOf(updateMutation.error);

  return (
    <>
      <ProductList
        products={products ?? []}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        onCreate={() => setProductModal({ mode: "create" })}
        onRetry={() => refetch()}
        onDelete={(product) => setDeleteTarget(product)}
        onEdit={(product) => setProductModal({ mode: "edit", product })}
      />

      <Modal
        isOpen={productModal?.mode === "create"}
        onClose={() => setProductModal(null)}
        title="Add product"
      >
        {productModal?.mode === "create" && (
          <ProductForm
            key="create-product"
            mode="create"
            onSubmit={(formData) => productMutation.mutate(formData)}
            onCreateArtist={() => setIsArtistFormOpen(true)}
            isSubmitting={productMutation.isPending}
            serverFieldErrors={fieldErrorsOf(productMutation.error)}
            submitError={
              createFailedGenerally ? "Failed to create product" : null
            }
          />
        )}
      </Modal>

      <Modal
        isOpen={productModal?.mode === "edit"}
        onClose={() => setProductModal(null)}
        title="Edit product"
      >
        {productModal?.mode === "edit" && (
          <ProductForm
            key={productModal.product.id}
            mode="edit"
            initialValues={productModal.product}
            onSubmit={(data) =>
              updateMutation.mutate({
                id: productModal.product.id,
                data,
              })
            }
            onCreateArtist={() => setIsArtistFormOpen(true)}
            isSubmitting={updateMutation.isPending}
            serverFieldErrors={fieldErrorsOf(updateMutation.error)}
            submitError={
              updateFailedGenerally ? "Failed to update product" : null
            }
          />
        )}
      </Modal>

      <Modal
        isOpen={isArtistFormOpen}
        onClose={() => setIsArtistFormOpen(false)}
        title="Add artist"
      >
        <ArtistForm
          onSubmit={(name) => artistMutation.mutate({ name })}
          isSubmitting={artistMutation.isPending}
          submitError={
            artistMutation.isError ? "Failed to create artist" : null
          }
        />
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete product"
        variant="centered"
      >
        {deleteTarget && (
          <DeleteModal
            product={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onDelete={() => {
              deleteMutation.mutate(deleteTarget.id);
              setDeleteTarget(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default App;

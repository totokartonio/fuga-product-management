import type { ProductResponse } from "@fuga/shared";
import { useDeleteProduct } from "../../hooks/products/useProductMutations";
import { DeleteModal } from "../DeleteModal/DeleteModal";
import { Modal } from "../ui/Modal/Modal";

type DeleteProductModalProps = {
  product: ProductResponse | null;
  onClose: () => void;
};

const DeleteProductModal = ({ product, onClose }: DeleteProductModalProps) => {
  const deleteMutation = useDeleteProduct({ onSuccess: () => closeAndReset() });

  const closeAndReset = () => {
    deleteMutation.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={product !== null}
      onClose={closeAndReset}
      title="Delete product"
      variant="centered"
    >
      {product && (
        <DeleteModal
          product={product}
          onCancel={closeAndReset}
          onDelete={() => deleteMutation.mutate(product.id)}
        />
      )}
    </Modal>
  );
};

export { DeleteProductModal };

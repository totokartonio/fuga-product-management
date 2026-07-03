import type { ProductResponse } from "@fuga/shared";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../../hooks/products/useProductMutations";
import { fieldErrorsOf } from "../../api/apiError";
import { ProductForm } from "../ProductForm/ProductForm";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";

type ProductModalState =
  | { mode: "create" }
  | { mode: "edit"; product: ProductResponse }
  | null;

type ProductModalProps = {
  state: ProductModalState;
  onClose: () => void;
  onCreateArtist: () => void;
};

const PRODUCT_FORM_ID = "product-form";

const ProductModal = ({
  state,
  onClose,
  onCreateArtist,
}: ProductModalProps) => {
  const createMutation = useCreateProduct({ onSuccess: () => closeAndReset() });
  const updateMutation = useUpdateProduct({ onSuccess: () => closeAndReset() });

  const closeAndReset = () => {
    createMutation.reset();
    updateMutation.reset();
    onClose();
  };

  const isEdit = state?.mode === "edit";
  const activeMutation = isEdit ? updateMutation : createMutation;

  const failedGenerally =
    activeMutation.isError && !fieldErrorsOf(activeMutation.error);

  const submitError = failedGenerally
    ? `Failed to ${isEdit ? "update" : "create"} product`
    : null;

  return (
    <Modal
      isOpen={state !== null}
      onClose={closeAndReset}
      title={isEdit ? "Edit product" : "Add product"}
      headerActions={
        <Button
          type="submit"
          form={PRODUCT_FORM_ID}
          disabled={activeMutation.isPending}
          variant="primary"
        >
          {activeMutation.isPending ? "Saving…" : "Save"}
        </Button>
      }
    >
      {state !== null && (
        <ProductForm
          key={state.mode === "edit" ? state.product.id : "create"}
          {...(state.mode === "edit"
            ? {
                mode: "edit" as const,
                initialValues: state.product,
                onSubmit: (data: FormData) =>
                  updateMutation.mutate({ id: state.product.id, data }),
              }
            : {
                mode: "create" as const,
                onSubmit: (data: FormData) => createMutation.mutate(data),
              })}
          formId={PRODUCT_FORM_ID}
          onCreateArtist={onCreateArtist}
          isSubmitting={activeMutation.isPending}
          serverFieldErrors={fieldErrorsOf(activeMutation.error)}
          submitError={submitError}
        />
      )}
    </Modal>
  );
};

export { ProductModal };
export type { ProductModalState };

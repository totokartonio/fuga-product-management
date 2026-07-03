import { useState } from "react";
import type { ProductResponse } from "@fuga/shared";
import { ProductListPage } from "./components/ProductListPage/ProductListPage";
import { ProductModal } from "./components/ProductModal/ProductModal";
import type { ProductModalState } from "./components/ProductModal/ProductModal";
import { ArtistModal } from "./components/ArtistModal/ArtistModal";
import { DeleteProductModal } from "./components/DeleteProductModal/DeleteProductModal";

const App = () => {
  const [productModal, setProductModal] = useState<ProductModalState>(null);
  const [isArtistFormOpen, setIsArtistFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(
    null,
  );

  return (
    <>
      <ProductListPage
        onCreate={() => setProductModal({ mode: "create" })}
        onEdit={(product) => setProductModal({ mode: "edit", product })}
        onDelete={setDeleteTarget}
      />

      <ProductModal
        state={productModal}
        onClose={() => setProductModal(null)}
        onCreateArtist={() => setIsArtistFormOpen(true)}
      />

      <ArtistModal
        isOpen={isArtistFormOpen}
        onClose={() => setIsArtistFormOpen(false)}
      />

      <DeleteProductModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default App;

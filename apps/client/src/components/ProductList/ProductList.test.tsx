import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "./ProductList";
import type { ProductResponse } from "@fuga/shared";

const sampleProduct: ProductResponse = {
  id: "1",
  name: "Revolver",
  coverArtUrl: null,
  createdAt: "2026-07-02T00:00:00.000Z",
  updatedAt: "2026-07-02T00:00:00.000Z",
  artists: [{ id: "a1", name: "The Beatles", role: "PRIMARY", position: 0 }],
};

const noop = () => {};

describe("ProductList", () => {
  it("renders products with name and credits", () => {
    render(
      <ProductList
        products={[sampleProduct]}
        isLoading={false}
        isError={false}
        isFetching={false}
        onCreate={noop}
        onRetry={noop}
        onDelete={noop}
        onEdit={noop}
      />,
    );

    expect(screen.getByText("Revolver")).toBeInTheDocument();
    expect(screen.getByText(/The Beatles/)).toBeInTheDocument();
  });

  it("shows the empty state when there are no products", () => {
    render(
      <ProductList
        products={[]}
        isLoading={false}
        isError={false}
        isFetching={false}
        onCreate={noop}
        onRetry={noop}
        onDelete={noop}
        onEdit={noop}
      />,
    );

    expect(screen.getByText(/no releases yet/i)).toBeInTheDocument();
  });
});

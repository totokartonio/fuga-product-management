import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductForm } from "./ProductForm";

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
};

const noop = () => {};

describe("ProductForm", () => {
  it("submits when editing a pre-filled valid product", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <ProductForm
        mode="edit"
        onSubmit={onSubmit}
        onCreateArtist={noop}
        initialValues={{
          id: "1",
          name: "Revolver",
          coverArtUrl: null,
          createdAt: "2026-07-02T00:00:00.000Z",
          updatedAt: "2026-07-02T00:00:00.000Z",
          artists: [
            { id: "a1", name: "The Beatles", role: "PRIMARY", position: 0 },
          ],
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toBeInstanceOf(FormData);
  });

  it("blocks submit when required fields are empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <ProductForm mode="create" onSubmit={onSubmit} onCreateArtist={noop} />,
    );

    await user.click(screen.getByRole("button", { name: /create product/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

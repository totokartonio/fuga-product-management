import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductForm } from "./ProductForm";

const FORM_ID = "product-form";

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      {ui}
      <button type="submit" form={FORM_ID}>
        Save
      </button>
    </QueryClientProvider>,
  );
};

const noop = () => {};

describe("ProductForm", () => {
  it("submits when editing a pre-filled valid product", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <ProductForm
        formId={FORM_ID}
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

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledOnce();

    const formData = onSubmit.mock.calls[0][0] as FormData;
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("name")).toBe("Revolver");
    expect(formData.get("mainArtistId")).toBe("a1");
  });

  it("blocks submit when required fields are empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <ProductForm
        formId={FORM_ID}
        mode="create"
        onSubmit={onSubmit}
        onCreateArtist={noop}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

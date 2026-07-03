import type { ProductResponse } from "@fuga/shared";
import { API_BASE } from "./config";
import { throwApiError } from "./apiError";

export const getProducts = async (): Promise<ProductResponse[]> => {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) await throwApiError(res);
  return res.json();
};

export const createProduct = async (
  data: FormData,
): Promise<ProductResponse> => {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    body: data,
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
};

export const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
  if (!res.ok) await throwApiError(res);
};

export const updateProduct = async (
  id: string,
  data: FormData,
): Promise<ProductResponse> => {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PATCH",
    body: data,
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
};

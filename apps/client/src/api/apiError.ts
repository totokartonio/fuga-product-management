type ErrorEnvelope = {
  error: { code: string; message: string; fields?: Record<string, string> };
};

export class ApiError extends Error {
  code: string;
  fields: Record<string, string>;

  constructor(
    code: string,
    message: string,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fields = fields;
  }
}

export const throwApiError = async (res: Response): Promise<never> => {
  let body: Partial<ErrorEnvelope> = {};
  try {
    body = await res.json();
  } catch {
    // non-JSON error body fall through to defaults
  }
  const err = body.error;
  throw new ApiError(
    err?.code ?? "UNKNOWN",
    err?.message ?? `Request failed (${res.status})`,
    err?.fields ?? {},
  );
};

export const fieldErrorsOf = (error: unknown) =>
  error instanceof ApiError ? error.fields : undefined;

export const messageOf = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

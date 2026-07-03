import { useState, type SubmitEventHandler } from "react";
import type { ArtistResponse, ProductResponse } from "@fuga/shared";
import {
  createProductSchema,
  updateProductSchema,
  fieldErrorsFromZod,
} from "@fuga/shared";
import { CoverPicker } from "./CoverPicker/CoverPicker";
import { MainArtistSelect } from "./MainArtistSelect";
import { FeaturedArtistsSelect } from "./FeaturedArtistsSelect";
import { Button } from "../ui/Button/Button";
import styles from "./ProductForm.module.css";
import field from "../ui/formField.module.css";

type BaseProps = {
  onSubmit: (data: FormData) => void;
  onCreateArtist: () => void;
  serverFieldErrors?: Record<string, string>;
  isSubmitting?: boolean;
  submitError?: string | null;
};

type Props =
  | (BaseProps & {
      mode: "create";
      initialValues?: undefined;
    })
  | (BaseProps & {
      mode: "edit";
      initialValues: ProductResponse;
    });

const ProductForm = ({
  onSubmit,
  onCreateArtist,
  mode,
  serverFieldErrors,
  isSubmitting = false,
  submitError = null,
  initialValues,
}: Props) => {
  const initialMain =
    initialValues?.artists.find((a) => a.role === "PRIMARY") ?? null;
  const initialFeatured = (initialValues?.artists ?? [])
    .filter((a) => a.role === "FEATURED")
    .sort((a, b) => a.position - b.position);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [mainArtist, setMainArtist] = useState<ArtistResponse | null>(
    initialMain ? { id: initialMain.id, name: initialMain.name } : null,
  );
  const [featuredArtists, setFeaturedArtists] = useState<ArtistResponse[]>(
    initialFeatured.map((a) => ({ id: a.id, name: a.name })),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const errors = { ...fieldErrors, ...serverFieldErrors };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // validate against the schema
    const schema = mode === "edit" ? updateProductSchema : createProductSchema;
    const result = schema.safeParse({
      name,
      mainArtistId: mainArtist?.id ?? "",
      featuredArtistIds: featuredArtists.map((a) => a.id),
    });

    if (!result.success) {
      setFieldErrors(fieldErrorsFromZod(result.error));
      return;
    }
    setFieldErrors({});

    // assemble formData for multipart
    const formData = new FormData();
    formData.append("name", name);
    if (mainArtist) formData.append("mainArtistId", mainArtist.id);
    featuredArtists.forEach((a) => formData.append("featuredArtistIds", a.id));

    if (coverFile) {
      formData.append("cover", coverFile);
    } else if (removeCover) {
      formData.append("removeCover", "true");
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset disabled={isSubmitting} className={field.fieldset}>
        <div className={field.field}>
          <span className={field.label}>Cover art</span>
          <CoverPicker
            onFileSelect={(file) => {
              setCoverFile(file);
              if (file) setRemoveCover(false);
            }}
            initialUrl={initialValues?.coverArtUrl}
            onRemove={() => setRemoveCover(true)}
          />
        </div>

        <div className={field.field}>
          <label className={field.label} htmlFor="product-name">
            Release name
          </label>
          <input
            id="product-name"
            className={field.input}
            placeholder="Doolittle"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className={field.error}>{errors.name}</p>}
        </div>

        <div className={field.field}>
          <div className={field.labelRow}>
            <label className={field.label}>Main artist</label>
            <button
              type="button"
              className={styles.linkButton}
              onClick={onCreateArtist}
            >
              + New artist
            </button>
          </div>
          <MainArtistSelect
            value={mainArtist}
            onChange={setMainArtist}
            excludeIds={featuredArtists.map((a) => a.id)}
          />
          {errors.mainArtistId && (
            <p className={field.error}>{errors.mainArtistId}</p>
          )}
        </div>

        <div className={field.field}>
          <label className={field.label}>Featured artists</label>
          <FeaturedArtistsSelect
            value={featuredArtists}
            onChange={setFeaturedArtists}
            excludeIds={mainArtist ? [mainArtist.id] : []}
          />
          {errors.featuredArtistIds && (
            <p className={field.error}>{errors.featuredArtistIds}</p>
          )}
        </div>

        {submitError && <p className={field.error}>{submitError}</p>}

        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create product"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
};

export { ProductForm };

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
import styles from "./ProductForm.module.css";
import { Fieldset } from "../ui/Fieldset/Fieldset";
import { Field } from "../ui/Field/Field";
import { Input } from "../ui/Input/Input";

type BaseProps = {
  onSubmit: (data: FormData) => void;
  onCreateArtist: () => void;
  serverFieldErrors?: Record<string, string>;
  isSubmitting?: boolean;
  submitError?: string | null;
  formId?: string;
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
  formId,
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
    <form id={formId} onSubmit={handleSubmit} className={styles.form}>
      <Fieldset disabled={isSubmitting}>
        <Field label="Cover art" htmlFor="cover-picker">
          <CoverPicker
            id="cover-picker"
            onFileSelect={(file) => {
              setCoverFile(file);
              if (file) setRemoveCover(false);
            }}
            initialUrl={initialValues?.coverArtUrl}
            onRemove={() => setRemoveCover(true)}
          />
        </Field>

        <Field
          label="Release name"
          htmlFor="product-name"
          error={errors.name ?? null}
        >
          <Input
            id="product-name"
            placeholder="Doolittle"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field
          label="Main artist"
          htmlFor="main-artist"
          error={errors.mainArtistId ?? null}
        >
          <MainArtistSelect
            value={mainArtist}
            onChange={setMainArtist}
            excludeIds={featuredArtists.map((a) => a.id)}
            onAddNew={onCreateArtist}
            id="main-artist"
          />
        </Field>

        <Field
          label="Featured artists"
          htmlFor="featured-artists"
          error={errors.featuredArtistIds ?? null}
        >
          <FeaturedArtistsSelect
            value={featuredArtists}
            onChange={setFeaturedArtists}
            excludeIds={mainArtist ? [mainArtist.id] : []}
            onAddNew={onCreateArtist}
            id="featured-artists"
          />
        </Field>

        {submitError && <p className={styles.submitError}>{submitError}</p>}
      </Fieldset>
    </form>
  );
};

export { ProductForm };

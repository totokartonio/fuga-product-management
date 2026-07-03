import { useState, type SubmitEventHandler } from "react";
import { createArtistSchema, fieldErrorsFromZod } from "@fuga/shared";
import styles from "./ArtistForm.module.css";
import { Fieldset } from "../ui/Fieldset/Fieldset";
import { Field } from "../ui/Field/Field";
import { Input } from "../ui/Input/Input";

type Props = {
  onSubmit: (artistName: string) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  formId?: string;
};

const ArtistForm = ({
  onSubmit,
  isSubmitting = false,
  submitError = null,
  formId,
}: Props) => {
  const [artistName, setArtistName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    // validate against the schema
    const parsed = createArtistSchema.safeParse({ name: artistName });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});

    onSubmit(parsed.data.name);
  };
  return (
    <form onSubmit={handleSubmit} className={styles.form} id={formId}>
      <Fieldset disabled={isSubmitting}>
        <Field
          label="Artist name"
          htmlFor="artist-name"
          error={fieldErrors.name ?? null}
        >
          <Input
            placeholder="Pixies"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            id="artist-name"
          />
        </Field>
        {submitError && <p className={styles.submitError}>{submitError}</p>}
      </Fieldset>
    </form>
  );
};

export { ArtistForm };

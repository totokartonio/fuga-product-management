import { useState, type SubmitEventHandler } from "react";
import { createArtistSchema, fieldErrorsFromZod } from "@fuga/shared";
import { Button } from "../ui/Button/Button";
import field from "../ui/formField.module.css";
import styles from "./ArtistForm.module.css";

type Props = {
  onSubmit: (artistName: string) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
};

const ArtistForm = ({
  onSubmit,
  isSubmitting = false,
  submitError = null,
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={field.field}>
        <label className={field.label} htmlFor="artist-name">
          Artist name
        </label>
        <input
          placeholder="Pixies"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          id="artist-name"
          className={field.input}
        />
      </div>
      {fieldErrors.name && <p className={field.error}>{fieldErrors.name}</p>}
      {submitError && <p className={field.error}>{submitError}</p>}

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          disabled={!artistName || isSubmitting}
        >
          {isSubmitting ? "Adding…" : "Add artist"}
        </Button>
      </div>
    </form>
  );
};

export { ArtistForm };

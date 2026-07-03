import { useState, useEffect, useRef, type ChangeEventHandler } from "react";
import { ALLOWED_COVER_TYPES, MAX_COVER_SIZE } from "@fuga/shared";
import { RecordPlaceholder } from "../../ui/RecordPlaceholder/RecordPlaceholder";
import { IconButton } from "../../ui/IconButton/IconButton";
import { X } from "lucide-react";
import styles from "./CoverPicker.module.css";

type Props = {
  onFileSelect: (file: File | null) => void;
  initialUrl?: string | null;
  onRemove?: () => void;
  id: string;
};

const CoverPicker = ({
  onFileSelect,
  initialUrl = null,
  onRemove,
  id,
}: Props) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setObjectUrl(null);
      setError(null);
      onFileSelect(null);
      return;
    }

    if (!(ALLOWED_COVER_TYPES as readonly string[]).includes(file.type)) {
      setError("Only JPEG, PNG, or WebP images are allowed");
      setObjectUrl(null);
      onFileSelect(null);
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      setError("Image must be 5MB or smaller");
      setObjectUrl(null);
      onFileSelect(null);
      return;
    }

    setError(null);
    setRemoved(false);
    setObjectUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleRemove = () => {
    setObjectUrl(null);
    onFileSelect(null);
    setError(null);

    // clear the file input
    if (inputRef.current) inputRef.current.value = "";

    // when removing an existing cover,
    if (initialUrl) {
      setRemoved(true);
      onRemove?.();
    }
  };

  const displayUrl = objectUrl ?? (removed ? null : initialUrl);

  return (
    <div>
      <input
        type="file"
        accept={ALLOWED_COVER_TYPES.join(", ")}
        onChange={handleChange}
        ref={inputRef}
        className={styles.hiddenInput}
        id={id}
      />

      {displayUrl ? (
        <div className={styles.preview}>
          <img
            src={displayUrl}
            alt="Cover preview"
            className={styles.previewImg}
          />
          <IconButton
            tone="danger"
            aria-label="Remove cover"
            className={styles.removeButton}
            type="button"
            onClick={handleRemove}
            size="sm"
          >
            <X size={10} />
          </IconButton>
        </div>
      ) : (
        <button
          type="button"
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
        >
          <span className={styles.placeholder}>
            <RecordPlaceholder />
          </span>
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export { CoverPicker };

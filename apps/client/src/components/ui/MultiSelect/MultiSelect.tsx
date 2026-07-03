import {
  useEffect,
  useId,
  useRef,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import styles from "./MultiSelect.module.css";

export type MultiSelectChip = {
  id: string;
  label: string;
};

export type MultiSelectListbox = {
  listboxId: string;
  getOptionDomId: (optionId: string) => string;
};

type Props = {
  value: MultiSelectChip[];
  onChange: (value: MultiSelectChip[]) => void;

  inputValue: string;
  onInputValueChange: (value: string) => void;

  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;

  renderListbox: (listbox: MultiSelectListbox) => ReactNode;
  activeOptionId?: string;
  onInputKeyDown?: KeyboardEventHandler<HTMLInputElement>;

  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;

  id: string;
};

const MultiSelect = ({
  value,
  onChange,
  inputValue,
  onInputValueChange,
  isOpen,
  onOpenChange,
  renderListbox,
  activeOptionId,
  onInputKeyDown,
  placeholder = "Search…",
  disabled = false,
  ariaLabel = "Select options",
  id,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const listboxId = useId();
  const optionIdPrefix = useId();

  const getOptionDomId = (optionId: string) => `${optionIdPrefix}-${optionId}`;

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onOpenChange]);

  const removeChip = (chipId: string) => {
    onChange(value.filter((chip) => chip.id !== chipId));
    inputRef.current?.focus();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (disabled) return;

    if (event.key === "Backspace" && inputValue === "" && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }

    onInputKeyDown?.(event);
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          onOpenChange(false);
        }
      }}
    >
      <div
        className={`${styles.control} ${isOpen ? styles.open : ""} ${
          disabled ? styles.disabled : ""
        }`}
        onMouseDown={(event) => {
          if (disabled) return;
          if ((event.target as HTMLElement).closest("button")) return;

          event.preventDefault();
          inputRef.current?.focus();
          onOpenChange(true);
        }}
      >
        {value.map((chip) => (
          <span key={chip.id} className={styles.chip}>
            <span className={styles.chipLabel}>{chip.label}</span>

            <IconButton
              type="button"
              size="sm"
              className={styles.removeButton}
              aria-label={`Remove ${chip.label}`}
              disabled={disabled}
              onClick={() => removeChip(chip.id)}
            >
              <X size={12} />
            </IconButton>
          </span>
        ))}

        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && activeOptionId
              ? getOptionDomId(activeOptionId)
              : undefined
          }
          placeholder={value.length === 0 ? placeholder : ""}
          value={inputValue}
          disabled={disabled}
          onFocus={() => onOpenChange(true)}
          onChange={(event) => {
            onInputValueChange(event.target.value);
            onOpenChange(true);
          }}
          onKeyDown={handleKeyDown}
          id={id}
        />
      </div>

      {isOpen && renderListbox({ listboxId, getOptionDomId })}
    </div>
  );
};

export { MultiSelect };

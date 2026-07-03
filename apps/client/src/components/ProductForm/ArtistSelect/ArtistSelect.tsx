import { useState, useEffect, useRef, type KeyboardEventHandler } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getArtists } from "../../../api/artists";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type { ArtistResponse } from "@fuga/shared";
import { IconButton } from "../../ui/IconButton/IconButton";
import { X } from "lucide-react";
import styles from "./ArtistSelect.module.css";

type Props = {
  value: ArtistResponse | null;
  onChange: (artist: ArtistResponse | null) => void;
  excludeIds?: string[];
  placeholder?: string;
  disabled?: boolean;
};

const ArtistSelect = ({
  value,
  onChange,
  excludeIds = [],
  placeholder = "Search artists…",
  disabled = false,
}: Props) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 250);

  const { data: artists = [], isFetching } = useQuery({
    queryKey: ["artists", debouncedQuery],
    queryFn: () => getArtists(debouncedQuery || undefined),
    enabled: isOpen,
    placeholderData: keepPreviousData,
  });

  const options = artists.filter((a) => !excludeIds.includes(a.id));

  // close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  const open = () => {
    setQuery("");
    setHighlighted(0);
    setIsOpen(true);
  };

  const select = (artist: ArtistResponse) => {
    onChange({ id: artist.id, name: artist.name });
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      open();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = options[highlighted];
      if (choice) select(choice);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const displayValue = isOpen ? query : (value?.name ?? "");

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
    >
      <div className={styles.inputWrap}>
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="artist-listbox"
          placeholder={placeholder}
          className={styles.input}
          value={displayValue}
          disabled={disabled}
          onFocus={open}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {value && !isOpen && (
          <IconButton
            type="button"
            aria-label="Clear artist"
            className={styles.clearButton}
            onClick={() => onChange(null)}
          >
            <X size={16} />
          </IconButton>
        )}
      </div>

      {isOpen && (
        <ul id="artist-listbox" role="listbox" className={styles.listbox}>
          {options.length === 0 ? (
            <li className={styles.empty}>
              {isFetching ? "Searching…" : "No artists found"}
            </li>
          ) : (
            options.map((a, i) => (
              <li
                key={a.id}
                role="option"
                aria-selected={a.id === value?.id}
                onMouseDown={(e) => {
                  e.preventDefault(); // beat the input blur
                  select(a);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={`${styles.option} ${i === highlighted ? styles.highlighted : ""}`}
              >
                {a.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export { ArtistSelect };

import { useState, type KeyboardEventHandler } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { getArtists } from "../../../api/artists";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type { ArtistResponse } from "@fuga/shared";
import {
  MultiSelect,
  type MultiSelectListbox,
} from "../../ui/MultiSelect/MultiSelect";
import styles from "./ArtistSelect.module.css";

const ADD_NEW_INDEX = 0;
const ADD_NEW_OPTION_ID = "add-new-artist";

type Props = {
  value: ArtistResponse[];
  onChange: (artists: ArtistResponse[]) => void;
  onAddNew: (name: string) => void;
  excludeIds?: string[];
  placeholder?: string;
  disabled?: boolean;
};

const ArtistSelect = ({
  value,
  onChange,
  onAddNew,
  excludeIds = [],
  placeholder = "Search artists…",
  disabled = false,
}: Props) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(ADD_NEW_INDEX);

  const debouncedQuery = useDebouncedValue(query, 250);

  const { data: artists = [], isFetching } = useQuery({
    queryKey: ["artists", debouncedQuery],
    queryFn: () => getArtists(debouncedQuery || undefined),
    enabled: isOpen && !disabled,
    placeholderData: keepPreviousData,
  });

  const hiddenIds = new Set([...value.map((a) => a.id), ...excludeIds]);
  const options = artists.filter((artist) => !hiddenIds.has(artist.id));

  // item 0 is always the "Add new artist" row; artists start at index 1
  const itemCount = options.length + 1;

  const highlightedIndex = Math.min(highlighted, itemCount - 1);

  const activeOptionId =
    highlightedIndex === ADD_NEW_INDEX
      ? ADD_NEW_OPTION_ID
      : options[highlightedIndex - 1]?.id;

  const selectArtist = (artist: ArtistResponse) => {
    onChange([...value, { id: artist.id, name: artist.name }]);
    setQuery("");
    setHighlighted(1);
  };

  const handleAddNew = () => {
    onAddNew(query.trim());
    setQuery("");
    setIsOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setIsOpen(next);
    if (next) setHighlighted(options.length > 0 ? 1 : ADD_NEW_INDEX);
  };

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setHighlighted(1); // optimistic: first match — clamps back to 0 if none arrive
  };

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        handleOpenChange(true);
        return;
      }
      setHighlighted(Math.min(highlightedIndex + 1, itemCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(Math.max(highlightedIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) {
        handleOpenChange(true);
        return;
      }
      if (highlightedIndex === ADD_NEW_INDEX) {
        handleAddNew();
      } else {
        const artist = options[highlightedIndex - 1];
        if (artist) selectArtist(artist);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const renderListbox = ({ listboxId, getOptionDomId }: MultiSelectListbox) => (
    <ul
      id={listboxId}
      role="listbox"
      aria-multiselectable="true"
      className={styles.listbox}
    >
      <li
        id={getOptionDomId(ADD_NEW_OPTION_ID)}
        role="option"
        aria-selected="false"
        className={`${styles.option} ${styles.addNew} ${
          highlightedIndex === ADD_NEW_INDEX ? styles.highlighted : ""
        }`}
        onMouseEnter={() => setHighlighted(ADD_NEW_INDEX)}
        onMouseDown={(e) => {
          e.preventDefault(); // beat the input blur
          handleAddNew();
        }}
      >
        <Plus size={16} />
        {query.trim() ? `Add new artist “${query.trim()}”` : "Add new artist"}
      </li>

      {options.length === 0 ? (
        <li className={styles.empty}>
          {isFetching ? "Searching…" : "No artists found"}
        </li>
      ) : (
        options.map((artist, index) => {
          const itemIndex = index + 1;
          return (
            <li
              key={artist.id}
              id={getOptionDomId(artist.id)}
              role="option"
              aria-selected="false"
              className={`${styles.option} ${
                itemIndex === highlightedIndex ? styles.highlighted : ""
              }`}
              onMouseEnter={() => setHighlighted(itemIndex)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectArtist(artist);
              }}
            >
              {artist.name}
            </li>
          );
        })
      )}
    </ul>
  );

  return (
    <MultiSelect
      value={value.map((artist) => ({ id: artist.id, label: artist.name }))}
      onChange={(chips) =>
        onChange(chips.map((chip) => ({ id: chip.id, name: chip.label })))
      }
      inputValue={query}
      onInputValueChange={handleQueryChange}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      renderListbox={renderListbox}
      activeOptionId={activeOptionId}
      onInputKeyDown={handleInputKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      ariaLabel="Search artists"
    />
  );
};

export { ArtistSelect };

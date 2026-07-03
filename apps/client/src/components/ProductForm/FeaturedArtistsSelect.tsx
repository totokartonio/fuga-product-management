import type { ArtistResponse } from "@fuga/shared";
import { ArtistSelect } from "./ArtistSelect/ArtistSelect";
import { IconButton } from "../ui/IconButton/IconButton";
import { X } from "lucide-react";
import styles from "./ProductForm.module.css";

type Props = {
  value: ArtistResponse[];
  onChange: (a: ArtistResponse[]) => void;
  excludeIds?: string[];
};

const FeaturedArtistsSelect = ({ value, onChange, excludeIds = [] }: Props) => {
  return (
    <div>
      <ArtistSelect
        value={null}
        onChange={(artist) => artist && onChange([...value, artist])}
        excludeIds={[...excludeIds, ...value.map((a) => a.id)]}
      />

      {value.map((fa) => (
        <div key={fa.id} className={styles.addedFeaturedArtist}>
          {fa.name}
          <IconButton
            type="button"
            aria-label={`Remove ${fa.name}`}
            onClick={() => onChange(value.filter((a) => a.id !== fa.id))}
            size="sm"
          >
            <X size={12} />
          </IconButton>
        </div>
      ))}
    </div>
  );
};

export { FeaturedArtistsSelect };

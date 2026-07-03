import type { ArtistResponse } from "@fuga/shared";
import { ArtistSelect } from "./ArtistSelect/ArtistSelect";

type Props = {
  value: ArtistResponse | null;
  onChange: (artist: ArtistResponse | null) => void;
  onAddNew: (name: string) => void;
  excludeIds?: string[];
  disabled?: boolean;
};

const MainArtistSelect = ({ value, onChange, ...rest }: Props) => (
  <ArtistSelect
    value={value ? [value] : []}
    onChange={(artists) => onChange(artists.at(-1) ?? null)}
    placeholder="Search main artist…"
    {...rest}
  />
);

export { MainArtistSelect };

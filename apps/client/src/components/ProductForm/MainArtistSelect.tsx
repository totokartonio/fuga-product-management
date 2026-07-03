import type { ArtistResponse } from "@fuga/shared";
import { ArtistSelect } from "./ArtistSelect/ArtistSelect";

type Props = {
  value: ArtistResponse | null;
  onChange: (a: ArtistResponse | null) => void;
  excludeIds?: string[];
};

const MainArtistSelect = ({ value, onChange, excludeIds }: Props) => {
  return (
    <ArtistSelect value={value} onChange={onChange} excludeIds={excludeIds} />
  );
};

export { MainArtistSelect };

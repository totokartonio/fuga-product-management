import type { ArtistResponse } from "@fuga/shared";
import { ArtistSelect } from "./ArtistSelect/ArtistSelect";

type Props = {
  value: ArtistResponse[];
  onChange: (artists: ArtistResponse[]) => void;
  onAddNew: (name: string) => void;
  excludeIds?: string[];
  disabled?: boolean;
};

const FeaturedArtistsSelect = (props: Props) => (
  <ArtistSelect {...props} placeholder="Search featured artists…" />
);

export { FeaturedArtistsSelect };

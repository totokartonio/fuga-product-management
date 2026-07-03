export {
  type ArtistRole,
  ARTIST_ROLES,
  artistRoleSchema,
} from "./schemas/artistRole";
export {
  createArtistSchema,
  type CreateArtistInput,
  artistResponseSchema,
  type ArtistResponse,
} from "./schemas/artists";
export {
  createProductSchema,
  type CreateProductInput,
  updateProductSchema,
  type UpdateProductInput,
  productArtistSchema,
  productResponseSchema,
  type ProductResponse,
} from "./schemas/products";

export { ALLOWED_COVER_TYPES, MAX_COVER_SIZE } from "./constants/cover";

export { fieldErrorsFromZod } from "./utils/fieldErrorsFromZod";

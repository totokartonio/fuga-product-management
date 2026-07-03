import { useCreateArtist } from "../../hooks/artists/useArtistMutations";
import { messageOf } from "../../api/apiError";
import { ArtistForm } from "../ArtistForm/ArtistForm";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";

type ArtistModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ARTIST_FORM_ID = "artist-form";

const ArtistModal = ({ isOpen, onClose }: ArtistModalProps) => {
  const artistMutation = useCreateArtist({ onSuccess: () => closeAndReset() });

  const closeAndReset = () => {
    artistMutation.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title="Add artist"
      headerActions={
        <Button
          type="submit"
          variant="primary"
          form={ARTIST_FORM_ID}
          disabled={artistMutation.isPending}
        >
          {artistMutation.isPending ? "Creating…" : "Create"}
        </Button>
      }
    >
      <ArtistForm
        formId={ARTIST_FORM_ID}
        onSubmit={(name) => artistMutation.mutate({ name })}
        isSubmitting={artistMutation.isPending}
        submitError={
          artistMutation.isError
            ? messageOf(artistMutation.error, "Failed to create artist")
            : null
        }
      />
    </Modal>
  );
};

export { ArtistModal };

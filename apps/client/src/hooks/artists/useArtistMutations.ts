import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createArtist } from "../../api/artists";

export const useCreateArtist = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      options?.onSuccess?.();
    },
  });
};

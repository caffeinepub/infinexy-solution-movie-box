import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Genre, type Movie, type MovieStats } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export type { Movie, MovieStats };
export { Genre };

export function useGetAllMovies() {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMovies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchMovies(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies", "search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      return actor.searchMovies(term);
    },
    enabled: !!actor && !isFetching && !!term.trim(),
  });
}

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<MovieStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return {
          genreCounts: {
            bollywood: 0n,
            hollywood: 0n,
            gujarati: 0n,
            tollywood: 0n,
          },
          totalMovies: 0n,
        };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface AddMovieParams {
  title: string;
  description: string;
  year: number;
  genre: string;
  thumbnailFile: File;
  videoFile: File;
  onThumbnailProgress?: (p: number) => void;
  onVideoProgress?: (p: number) => void;
}

export function useAddMovie() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: AddMovieParams) => {
      if (!actor) throw new Error("Not connected");

      // Read both files into memory simultaneously
      const [thumbBytes, videoBytes] = await Promise.all([
        params.thumbnailFile.arrayBuffer().then((b) => new Uint8Array(b)),
        params.videoFile.arrayBuffer().then((b) => new Uint8Array(b)),
      ]);

      let thumbnailBlob = ExternalBlob.fromBytes(thumbBytes);
      let videoBlob = ExternalBlob.fromBytes(videoBytes);
      if (params.onThumbnailProgress) {
        thumbnailBlob = thumbnailBlob.withUploadProgress(
          params.onThumbnailProgress,
        );
      }
      if (params.onVideoProgress) {
        videoBlob = videoBlob.withUploadProgress(params.onVideoProgress);
      }
      return actor.addMovie(
        params.title,
        params.description,
        BigInt(params.year),
        params.genre,
        thumbnailBlob,
        videoBlob,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteMovie() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (movieId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteMovie(movieId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

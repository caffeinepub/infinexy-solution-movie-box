import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Movie {
    id: MovieId;
    title: string;
    thumbnail: ExternalBlob;
    video: ExternalBlob;
    year: bigint;
    description: string;
    genre: Genre;
    uploadedAt: bigint;
    uploadedBy: Principal;
}
export interface GenreCount {
    tollywood: bigint;
    hollywood: bigint;
    bollywood: bigint;
    gujarati: bigint;
}
export interface MovieStats {
    genreCounts: GenreCount;
    totalMovies: bigint;
}
export type MovieId = string;
export enum Genre {
    tollywood = "tollywood",
    hollywood = "hollywood",
    bollywood = "bollywood",
    gujarati = "gujarati"
}
export interface backendInterface {
    registerUser(username: string, passwordHash: string): Promise<boolean>;
    loginUser(username: string, passwordHash: string): Promise<{ isAdmin: boolean } | null>;
    userExists(username: string): Promise<boolean>;
    isAdminUser(username: string): Promise<boolean>;
    changePassword(username: string, oldPasswordHash: string, newPasswordHash: string): Promise<boolean>;
    addMovie(title: string, description: string, year: bigint, genreText: string, thumbnailBlob: ExternalBlob, videoBlob: ExternalBlob): Promise<MovieId>;
    deleteMovie(movieId: MovieId): Promise<void>;
    getAllMovies(): Promise<Array<Movie>>;
    getMoviesByGenre(genreText: string): Promise<Array<Movie>>;
    getStats(): Promise<MovieStats>;
    searchMovies(searchTerm: string): Promise<Array<Movie>>;
}

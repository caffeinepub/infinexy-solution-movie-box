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
export interface UserProfile {
    name: string;
}
export type MovieId = string;
export enum Genre {
    tollywood = "tollywood",
    hollywood = "hollywood",
    bollywood = "bollywood",
    gujarati = "gujarati"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMovie(title: string, description: string, year: bigint, genreText: string, thumbnailBlob: ExternalBlob, videoBlob: ExternalBlob): Promise<MovieId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMovie(movieId: MovieId): Promise<void>;
    getAllMovies(): Promise<Array<Movie>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMoviesByGenre(genreText: string): Promise<Array<Movie>>;
    getStats(): Promise<MovieStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMovies(searchTerm: string): Promise<Array<Movie>>;
}

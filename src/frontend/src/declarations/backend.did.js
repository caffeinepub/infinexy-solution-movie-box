/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const _CaffeineStorageCreateCertificateResult = IDL.Record({
  'method' : IDL.Text,
  'blob_hash' : IDL.Text,
});
export const _CaffeineStorageRefillInformation = IDL.Record({
  'proposed_top_up_amount' : IDL.Opt(IDL.Nat),
});
export const _CaffeineStorageRefillResult = IDL.Record({
  'success' : IDL.Opt(IDL.Bool),
  'topped_up_amount' : IDL.Opt(IDL.Nat),
});
export const ExternalBlob = IDL.Vec(IDL.Nat8);
export const MovieId = IDL.Text;
export const Genre = IDL.Variant({
  'tollywood' : IDL.Null,
  'hollywood' : IDL.Null,
  'bollywood' : IDL.Null,
  'gujarati' : IDL.Null,
});
export const Movie = IDL.Record({
  'id' : MovieId,
  'title' : IDL.Text,
  'thumbnail' : ExternalBlob,
  'video' : ExternalBlob,
  'year' : IDL.Nat,
  'description' : IDL.Text,
  'genre' : Genre,
  'uploadedAt' : IDL.Int,
  'uploadedBy' : IDL.Principal,
});
export const GenreCount = IDL.Record({
  'tollywood' : IDL.Nat,
  'hollywood' : IDL.Nat,
  'bollywood' : IDL.Nat,
  'gujarati' : IDL.Nat,
});
export const MovieStats = IDL.Record({
  'genreCounts' : GenreCount,
  'totalMovies' : IDL.Nat,
});
export const LoginResult = IDL.Opt(IDL.Record({ 'isAdmin' : IDL.Bool }));

export const idlService = IDL.Service({
  '_caffeineStorageBlobIsLive' : IDL.Func(
      [IDL.Vec(IDL.Nat8)],
      [IDL.Bool],
      ['query'],
    ),
  '_caffeineStorageBlobsToDelete' : IDL.Func(
      [],
      [IDL.Vec(IDL.Vec(IDL.Nat8))],
      ['query'],
    ),
  '_caffeineStorageConfirmBlobDeletion' : IDL.Func(
      [IDL.Vec(IDL.Vec(IDL.Nat8))],
      [],
      [],
    ),
  '_caffeineStorageCreateCertificate' : IDL.Func(
      [IDL.Text],
      [_CaffeineStorageCreateCertificateResult],
      [],
    ),
  '_caffeineStorageRefillCashier' : IDL.Func(
      [IDL.Opt(_CaffeineStorageRefillInformation)],
      [_CaffeineStorageRefillResult],
      [],
    ),
  '_caffeineStorageUpdateGatewayPrincipals' : IDL.Func([], [], []),
  'registerUser' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  'loginUser' : IDL.Func([IDL.Text, IDL.Text], [LoginResult], ['query']),
  'userExists' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  'isAdminUser' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  'changePassword' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
  'addMovie' : IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, ExternalBlob, ExternalBlob],
      [MovieId],
      [],
    ),
  'deleteMovie' : IDL.Func([MovieId], [], []),
  'getAllMovies' : IDL.Func([], [IDL.Vec(Movie)], ['query']),
  'getMoviesByGenre' : IDL.Func([IDL.Text], [IDL.Vec(Movie)], ['query']),
  'getStats' : IDL.Func([], [MovieStats], ['query']),
  'searchMovies' : IDL.Func([IDL.Text], [IDL.Vec(Movie)], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const _CaffeineStorageCreateCertificateResult = IDL.Record({
    'method' : IDL.Text,
    'blob_hash' : IDL.Text,
  });
  const _CaffeineStorageRefillInformation = IDL.Record({
    'proposed_top_up_amount' : IDL.Opt(IDL.Nat),
  });
  const _CaffeineStorageRefillResult = IDL.Record({
    'success' : IDL.Opt(IDL.Bool),
    'topped_up_amount' : IDL.Opt(IDL.Nat),
  });
  const ExternalBlob = IDL.Vec(IDL.Nat8);
  const MovieId = IDL.Text;
  const Genre = IDL.Variant({
    'tollywood' : IDL.Null,
    'hollywood' : IDL.Null,
    'bollywood' : IDL.Null,
    'gujarati' : IDL.Null,
  });
  const Movie = IDL.Record({
    'id' : MovieId,
    'title' : IDL.Text,
    'thumbnail' : ExternalBlob,
    'video' : ExternalBlob,
    'year' : IDL.Nat,
    'description' : IDL.Text,
    'genre' : Genre,
    'uploadedAt' : IDL.Int,
    'uploadedBy' : IDL.Principal,
  });
  const GenreCount = IDL.Record({
    'tollywood' : IDL.Nat,
    'hollywood' : IDL.Nat,
    'bollywood' : IDL.Nat,
    'gujarati' : IDL.Nat,
  });
  const MovieStats = IDL.Record({
    'genreCounts' : GenreCount,
    'totalMovies' : IDL.Nat,
  });
  const LoginResult = IDL.Opt(IDL.Record({ 'isAdmin' : IDL.Bool }));

  return IDL.Service({
    '_caffeineStorageBlobIsLive' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [IDL.Bool],
        ['query'],
      ),
    '_caffeineStorageBlobsToDelete' : IDL.Func(
        [],
        [IDL.Vec(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    '_caffeineStorageConfirmBlobDeletion' : IDL.Func(
        [IDL.Vec(IDL.Vec(IDL.Nat8))],
        [],
        [],
      ),
    '_caffeineStorageCreateCertificate' : IDL.Func(
        [IDL.Text],
        [_CaffeineStorageCreateCertificateResult],
        [],
      ),
    '_caffeineStorageRefillCashier' : IDL.Func(
        [IDL.Opt(_CaffeineStorageRefillInformation)],
        [_CaffeineStorageRefillResult],
        [],
      ),
    '_caffeineStorageUpdateGatewayPrincipals' : IDL.Func([], [], []),
    'registerUser' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'loginUser' : IDL.Func([IDL.Text, IDL.Text], [LoginResult], ['query']),
    'userExists' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'isAdminUser' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'changePassword' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    'addMovie' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, ExternalBlob, ExternalBlob],
        [MovieId],
        [],
      ),
    'deleteMovie' : IDL.Func([MovieId], [], []),
    'getAllMovies' : IDL.Func([], [IDL.Vec(Movie)], ['query']),
    'getMoviesByGenre' : IDL.Func([IDL.Text], [IDL.Vec(Movie)], ['query']),
    'getStats' : IDL.Func([], [MovieStats], ['query']),
    'searchMovies' : IDL.Func([IDL.Text], [IDL.Vec(Movie)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };

import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // ── Migration: absorb stable variables from the previous version ──────────
  stable var accessControlState : AccessControl.AccessControlState = AccessControl.initState();
  stable var userProfiles : Map.Map<Principal, { name : Text }> = Map.empty();

  // ── Username/Password Auth ─────────────────────────────────────────────────

  type StoredUser = {
    username : Text;
    passwordHash : Text;
    isAdmin : Bool;
  };

  stable var stableUsers : [(Text, StoredUser)] = [];

  // Kept for stable variable compatibility with previous versions.
  // firstUserRegistered was used in older versions; adminInitialized replaces it.
  stable var firstUserRegistered : Bool = false;
  stable var adminInitialized : Bool = false;

  let users = Map.fromIter<Text, StoredUser>(stableUsers.vals());

  // Seed the admin account only once (on first ever deploy).
  // After that, never overwrite — so password changes survive upgrades.
  // Also treat firstUserRegistered=true (from old version) as already initialized.
  private func ensureAdminExists() {
    if (not adminInitialized and not firstUserRegistered) {
      users.add("admin", {
        username = "admin";
        passwordHash = "a63f45da"; // simpleHash("admin123")
        isAdmin = true;
      });
    };
    adminInitialized := true;
    firstUserRegistered := true;
  };

  do { ensureAdminExists() };

  system func preupgrade() {
    stableUsers := users.entries().toArray();
  };

  system func postupgrade() {
    // Restore users from stable storage into the in-memory map.
    for ((k, v) in stableUsers.vals()) {
      users.add(k, v);
    };
    stableUsers := [];
  };

  /// Registration is disabled — only the built-in admin account (admin/admin123) is allowed.
  public func registerUser(_username : Text, _passwordHash : Text) : async Bool {
    false;
  };

  /// Validate credentials. Returns null if invalid, login info on success.
  public query func loginUser(username : Text, passwordHash : Text) : async ?{ isAdmin : Bool } {
    switch (users.get(username)) {
      case null { null };
      case (?u) {
        if (u.passwordHash == passwordHash) ?{ isAdmin = u.isAdmin }
        else null;
      };
    };
  };

  /// Check if a username exists (to re-validate a stored session on page load).
  public query func userExists(username : Text) : async Bool {
    switch (users.get(username)) {
      case null { false };
      case (?_) { true };
    };
  };

  /// Returns true if the given username is admin.
  public query func isAdminUser(username : Text) : async Bool {
    switch (users.get(username)) {
      case null { false };
      case (?u) { u.isAdmin };
    };
  };

  /// Change password for a user. Validates old password before updating.
  /// Returns false if username not found or old password doesn't match.
  public func changePassword(username : Text, oldPasswordHash : Text, newPasswordHash : Text) : async Bool {
    switch (users.get(username)) {
      case null { false };
      case (?u) {
        if (u.passwordHash != oldPasswordHash) { return false };
        users.add(username, { username; passwordHash = newPasswordHash; isAdmin = u.isAdmin });
        true;
      };
    };
  };

  // ── Movies ─────────────────────────────────────────────────────────────────

  type Genre = {
    #bollywood;
    #hollywood;
    #gujarati;
    #tollywood;
  };

  type MovieId = Text;

  type Movie = {
    id : MovieId;
    title : Text;
    description : Text;
    year : Nat;
    genre : Genre;
    thumbnail : Storage.ExternalBlob;
    video : Storage.ExternalBlob;
    uploadedAt : Int;
    uploadedBy : Principal;
  };

  let movies = Map.empty<MovieId, Movie>();

  func fromTextToGenre(genreText : Text) : Genre {
    switch (genreText.toLower().trim(#char('\n'))) {
      case ("bollywood") { #bollywood };
      case ("hollywood") { #hollywood };
      case ("gujarati") { #gujarati };
      case ("tollywood") { #tollywood };
      case (_) { Runtime.trap("Invalid genre") };
    };
  };

  func generateMovieId(title : Text) : Text {
    title.concat(Time.now().toText());
  };

  public shared ({ caller }) func addMovie(
    title : Text,
    description : Text,
    year : Nat,
    genreText : Text,
    thumbnailBlob : Storage.ExternalBlob,
    videoBlob : Storage.ExternalBlob,
  ) : async MovieId {
    if (title.trim(#char('\n')).size() == 0) Runtime.trap("Title cannot be empty");
    let movieId = generateMovieId(title);
    movies.add(movieId, {
      id = movieId;
      title;
      description;
      year;
      genre = fromTextToGenre(genreText);
      thumbnail = thumbnailBlob;
      video = videoBlob;
      uploadedAt = Time.now();
      uploadedBy = caller;
    });
    movieId;
  };

  public func deleteMovie(movieId : MovieId) : async () {
    switch (movies.get(movieId)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?_) { movies.remove(movieId) };
    };
  };

  public query func getAllMovies() : async [Movie] {
    movies.values().toArray();
  };

  public query func getMoviesByGenre(genreText : Text) : async [Movie] {
    let genre = fromTextToGenre(genreText);
    movies.values().filter(func(m) { m.genre == genre }).toArray();
  };

  public query func searchMovies(searchTerm : Text) : async [Movie] {
    movies.values().filter(func(m) { m.title.toLower().contains(#text(searchTerm.toLower())) }).toArray();
  };

  type GenreCount = {
    bollywood : Nat;
    hollywood : Nat;
    gujarati : Nat;
    tollywood : Nat;
  };

  type MovieStats = {
    totalMovies : Nat;
    genreCounts : GenreCount;
  };

  public query func getStats() : async MovieStats {
    let arr = movies.values().toArray();
    {
      totalMovies = arr.size();
      genreCounts = {
        bollywood = arr.filter(func(m) { m.genre == #bollywood }).size();
        hollywood = arr.filter(func(m) { m.genre == #hollywood }).size();
        gujarati = arr.filter(func(m) { m.genre == #gujarati }).size();
        tollywood = arr.filter(func(m) { m.genre == #tollywood }).size();
      };
    };
  };
};

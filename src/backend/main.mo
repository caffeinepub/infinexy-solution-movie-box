import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";

actor {
  include MixinStorage();

  // User Authentication
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Movie Definitions
  type Genre = {
    #bollywood;
    #hollywood;
    #gujarati;
    #tollywood;
  };

  module Genre {
    public func compare(genre1 : Genre, genre2 : Genre) : Order.Order {
      switch (genre1, genre2) {
        case (#bollywood, #bollywood) { #equal };
        case (#bollywood, _) { #less };
        case (_, #bollywood) { #greater };
        case (#gujarati, #gujarati) { #equal };
        case (#gujarati, _) { #less };
        case (_, #gujarati) { #greater };
        case (#hollywood, #hollywood) { #equal };
        case (#hollywood, _) { #less };
        case (_, #hollywood) { #greater };
        case (#tollywood, #tollywood) { #equal };
      };
    };
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

  module Movie {
    public func compare(movie1 : Movie, movie2 : Movie) : Order.Order {
      Text.compare(movie1.id, movie2.id);
    };
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

  // Add new movie (authenticated users only)
  public shared ({ caller }) func addMovie(title : Text, description : Text, year : Nat, genreText : Text, thumbnailBlob : Storage.ExternalBlob, videoBlob : Storage.ExternalBlob) : async MovieId {

    if (title.trim(#char('\n')).size() == 0) {
      Runtime.trap("Title cannot be empty");
    };
    let movieId = generateMovieId(title);

    let movie : Movie = {
      id = movieId;
      title;
      description;
      year;
      genre = fromTextToGenre(genreText);
      thumbnail = thumbnailBlob;
      video = videoBlob;
      uploadedAt = Time.now();
      uploadedBy = caller;
    };

    movies.add(movieId, movie);

    movieId;
  };

  // Delete movie (only uploader or admin)
  public shared ({ caller }) func deleteMovie(movieId : MovieId) : async () {

    switch (movies.get(movieId)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?movie) {
        ignore movie;
        movies.remove(movieId);
      };
    };
  };

  public query func getAllMovies() : async [Movie] {
    movies.values().toArray();
  };

  // Get movies by specific genre
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
    let moviesArray = movies.values().toArray();
    let totalCount = moviesArray.size();
    // Calculate counts for each genre
    let bollywoodCount = moviesArray.filter(func(m) { m.genre == #bollywood }).size();
    let hollywoodCount = moviesArray.filter(func(m) { m.genre == #hollywood }).size();
    let gujaratiCount = moviesArray.filter(func(m) { m.genre == #gujarati }).size();
    let tollywoodCount = moviesArray.filter(func(m) { m.genre == #tollywood }).size();

    {
      totalMovies = totalCount;
      genreCounts = {
        bollywood = bollywoodCount;
        hollywood = hollywoodCount;
        gujarati = gujaratiCount;
        tollywood = tollywoodCount;
      };
    };
  };
};

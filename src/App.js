import { useEffect, useRef, useState } from "react";
import StartRating from "./starRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const KEY = `4ac5d14`;
export default function App() {
  // todo : states
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isDark, setIsDark] = useState(
    localStorage.getItem("dark-mode") === "false" ? false : true
  );
  // todo: custom hook
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");
  // todo: functions
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  // function handleDarkAndLight() {
  //   setIsDark(!isDark);
  //   localStorage.setItem("dark-mode", isDark);
  //   console.log(isDark);
  //   if (isDark) {
  //     document.body.classList.remove("dark-mode");
  //   } else {
  //     document.body.classList.add("dark-mode");
  //   }
  // }
  function handleDarkAndLight() {
    setIsDark(!isDark);
    localStorage.setItem("dark-mode", isDark);
    console.log(isDark);
    if (isDark) {
      document.body.classList.remove("dark-mode");
    } else {
      document.body.classList.add("dark-mode");
    }
  }
  useEffect(function () {
    handleDarkAndLight();
  }, []);

  // todo : components
  return (
    <>
      <NavBar>
        <Search setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} handleSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleCloseMovie={handleCloseMovie}
              handleAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                handleDeleteWatched={handleDeleteWatched}
              />{" "}
            </>
          )}
        </Box>
      </Main>
      <button className="btn-toggle dark " onClick={handleDarkAndLight}>
        {isDark ? "Dark" : "Light"}
      </button>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>
        {message === "Failed to fetch"
          ? "something want wrong! make sure you have a network and try again "
          : message}
      </span>{" "}
      🚫
    </p>
  );
}
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      {" "}
      <Logo />
      {children}
    </nav>
  );
}
function Search({ setQuery }) {
  const [searchValue, setSearchValue] = useState("");
  const inputEl = useRef(null);
  useKey("Enter", function () {
    inputEl.current.focus();
  });

  function handleSubmit(e) {
    e.preventDefault();
    setQuery(searchValue);
    setSearchValue("");
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        ref={inputEl}
      />
      <button>Search</button>
    </form>
  );
}
function Logo() {
  return (
    <div className="logo">
      <h1>
        <em>FilmFindr </em>{" "}
        <img src="favicon.png" width={"50px"} alt="logoImg" />
      </h1>
    </div>
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectMovie={handleSelectMovie}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, handleSelectMovie }) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetails({
  selectedId,
  handleCloseMovie,
  handleAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const [sameRatedMovie, setSameRatedMovie] = useState(false);
  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(() => {
    async function getMovieDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await response.json();
        setMovie(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    getMovieDetails();
  }, [selectedId]);
  useEffect(
    function () {
      if (!title) return;
      document.title = `Film | ${title}`;
      return function () {
        document.title = `FilmFindr`;
      };
    },
    [title]
  );
  useKey("Escape", handleCloseMovie);

  function onAdd() {
    const newWatchMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    const tempSameRatedMovie = watched.some(
      (movie) => movie.imdbID === selectedId
    );
    if (tempSameRatedMovie) {
      setSameRatedMovie(true);
      setTimeout(() => {
        setSameRatedMovie(false);
        handleCloseMovie();
      }, 2000);
      return;
    }
    handleAddWatched(newWatchMovie);
    handleCloseMovie();
  }
  const countUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  return isLoading ? (
    <p className="loader">loading...</p>
  ) : sameRatedMovie ? (
    <div id="alertBox" className="alert">
      You have added this movie before into your watched rating list{" "}
      <span className="user-rating"> {countUserRating} ⭐ </span>
    </div>
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={handleCloseMovie}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} IMDb rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StartRating maxRating={10} size={24} onSetRating={setUserRating} />
          {userRating > 0 && (
            <button className="btn-add" onClick={onAdd}>
              Add to list
            </button>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Stating {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, handleDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleDeleteWatched={handleDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteWatched(movie.imdbID)}
        >
          ❌
        </button>
      </div>
    </li>
  );
}

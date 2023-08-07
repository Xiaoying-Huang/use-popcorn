import { useEffect, useState } from "react";
import StarRating from './StarRating';

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "4855708";

function Button({ children, onClick, className = "" }) {
  return <button className={className} onClick={onClick}>{children}</button>;
}

export default function App() {

  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLodaing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);



  useEffect(function () {

    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLodaing(true);
        setError("");
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal });
        if (!res.ok) {
          throw new Error("Something went wrong with fetching movies");
        }

        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("Movie not found")
        }
        setMovies(data.Search);

      } catch (err) {

        if (err.name !== "AbortError") {
          console.log(err.message);
          setError(err.message);
        }
        setError("");
      } finally {
        setIsLodaing(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return
    }
    setSelectedId(null);
    fetchMovies();
    return function () {
      controller.abort();
    }
  }, [query]);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleAddToWatchedList(obj) {
    const updatedWatchedList = watched.map((item) => item.imdbID === obj.imdbID ? obj : item);

    if (!updatedWatchedList.some((item) => item.imdbID === obj.imdbID)) {
      // If obj.imdbID doesn't exist, add obj to the list
      updatedWatchedList.push(obj);
    }
    setWatched(currentList => updatedWatchedList);
  }

  function handleDeleteWatched(id) {
    const updatedWatchedList = watched.filter((item) => item.imdbID !== id);
    setWatched(currentList => updatedWatchedList);
  }

  return (
    <>
      <NavBar >
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {error
            ? <ErrorMessage error={error} />
            : isLoading
              ? <Loader />
              : <MovieList movies={movies} setSelectedId={handleSelectMovie} />}

        </Box>
        <Box>
          {
            selectedId
              ? <MovieDetail
                setSelectedId={setSelectedId}
                selectedId={selectedId}
                onCloseMovie={() => setSelectedId(current => null)}
                onAddToWatchedList={handleAddToWatchedList}
                watched={watched} />
              : <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />}

        </Box>
      </Main>
    </>
  );
}


function NavBar({ children }) {

  return (<>
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  </>);
}

function Logo() {
  return <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>;
}

function Search({ query, setQuery }) {

  return (<>
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  </>);
}

function NumResults({ movies }) {
  return (<>
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  </>);
}

function Loader() {
  return <p className="loader">Loading...</p>
}

function ErrorMessage({ error }) {
  return <p className="error">{error}</p>
}

function Main({ children }) {


  return (<>
    <main className="main">
      {children}
    </main>
  </>);
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (<>
    <div className="box">
      <Button
        onClick={() => setIsOpen((open) => !open)} className="btn-toggle"
      >
        {isOpen ? "–" : "+"}
      </Button>
      {isOpen && children}
    </div>
  </>);
}

function MovieList({ movies, setSelectedId }) {
  return (<><ul className="list">
    {movies?.map((movie) => (
      <Movie movie={movie} key={movie.imdbID} onClick={() => setSelectedId(movie.imdbID)} >
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </Movie>
    ))}
  </ul></>);
}

function MovieDetail({ selectedId, setSelectedId, onCloseMovie, onAddToWatchedList, watched }) {
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const hasBeenWatched = watched.some(element => element.imdbID === selectedId);

  let watchedRating = 0;
  if (hasBeenWatched) {
    let watchedObj = watched.filter(movie => movie.imdbID === selectedId);
    watchedRating = Number(watchedObj[0].userRating);
  }

  useEffect(function () {
    const handleKeyDown = function (e) {
      if (e.code === "Escape") {
        setSelectedId(null);
        console.log("Close");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setSelectedId]);

  useEffect(function () {
    setIsLoading(true);
    async function fetchMovieDetail() {
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);

      const data = await res.json();

      setMovieDetails(data);
      setIsLoading(false);
    }
    fetchMovieDetail();

  }, [selectedId])

  useEffect(
    function () {
      if (!movieDetails) {
        return;
      }
      document.title = `Movie | ${movieDetails.Title}`;
      return function () {
        document.title = "usePopcorn";
      }
    },
    [movieDetails]
  )

  function handleAdd() {
    const newMovieObj = {
      imdbID: selectedId,
      Title: movieDetails.Title,
      Year: movieDetails.Year,
      Poster: movieDetails.Poster,
      runtime: movieDetails.Runtime,
      imdbRating: Number(movieDetails.imdbRating),
      userRating: Number(userRating),
    }
    onAddToWatchedList(newMovieObj);
    onCloseMovie();
  }


  return <div className="details">
    {isLoading
      ? <Loader />
      :
      <>
        <header>
          <Button onClick={onCloseMovie} className="btn-back">&larr;</Button>
          <img src={movieDetails.Poster} alt={`poster of ${movieDetails.Title}`} />

          <div className="details-overview">
            <h2>{movieDetails.Title}</h2>
            <p>{movieDetails.Released} • {movieDetails.Runtime}</p>
            <p>{movieDetails.Genre}</p>
            <p>
              <span>⭐️</span>
              {movieDetails.imdbRating} IMDb rating
            </p>
          </div>
        </header>
        <section>
          <div className="rating">

            <StarRating maxRating={10} size={24} defaultRating={watchedRating} onSetRating={setUserRating} />

            {userRating > 0 && <Button className="btn-add" onClick={handleAdd}>+ Add to list</Button>}
          </div>
          <p>
            <em>{movieDetails.Plot}</em>
          </p>
          <p>Starring {movieDetails.Actors}</p>
          <p>Directed by {movieDetails.Director}</p>
        </section>
      </>}
  </div>

}

function WatchedMovieList({ watched, onDeleteWatched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (<>
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <Summary
          imdbRating={avgImdbRating}
          userRating={avgUserRating}
          runtime={avgRuntime} />
      </div>
    </div>
    <ul className="list list-movies">
      {watched.map((movie) => (
        <Movie movie={movie} key={movie.imdbID}>
          <Summary
            key={`summary-${movie.imdbID}`}
            imdbRating={movie.imdbRating}
            userRating={movie.userRating}
            runtime={movie.runtime} />
          <Button onClick={() => onDeleteWatched(movie.imdbID)} className="btn-delete">❌</Button>
        </Movie>
      ))}
    </ul >
  </>);
}

function Movie({ movie, children, onClick }) {
  return (<>
    <li onClick={onClick}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>{children}</div>
    </li>
  </>);
}

function Summary({ imdbRating, userRating, runtime }) {
  return (<>
    <p>
      <span>⭐️</span>
      <span>{imdbRating}</span>
    </p>
    <p>
      <span>🌟</span>
      <span>{userRating}</span>
    </p>
    <p>
      <span>⏳</span>
      <span>{runtime} min</span>
    </p></>);
}

import { useEffect, useRef, useState } from "react";
import StarRating from './StarRating';
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "4855708";

function Button({ children, onClick, className = "" }) {
  return <button className={className} onClick={onClick}>{children}</button>;
}

export default function App() {

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query, setSelectedId);
  const [watched, setWatched] = useLocalStorageState([], "watched");

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
        <Search query={query} setQuery={setQuery} setSelectedId={setSelectedId} />
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

function Search({ query, setQuery, setSelectedId }) {
  const inputEl = useRef(null);
  useKey("Enter", () => {
    if (document.activeElement === inputEl.current)
      return;
    inputEl.current.focus();
    setQuery("");
    setSelectedId(current => null);
  });

  return (<>
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
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

  const countRef = useRef(0);

  useEffect(function () {
    if (userRating) countRef.current = countRef.current + 1;
  }, [userRating]);

  let watchedRating = 0;
  if (hasBeenWatched) {
    let watchedObj = watched.filter(movie => movie.imdbID === selectedId);
    watchedRating = Number(watchedObj[0].userRating);
  }

  useKey("Escape", () => { setSelectedId(null) })

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
      countRatingDecisions: countRef.current
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

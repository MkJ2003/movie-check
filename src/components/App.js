import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Input from "./Input";
import Numresult from "./Numresult";
import Box from "./Box";
import Main from "./Main";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import WatchedSummary from "./WatchedSummary";
import MovieDetails from "./MovieDetails";
import WatchedMoviesList from "./WatchedMoviesList";
import MovieList from "./MovieList";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export const KEY = "d83692b4";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleDeletedWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,{signal:controller.signal}
          );

          if (!res.ok) {
            throw new Error("Something went wrong with fetching movies");
          }

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
         

          setMovies(data.Search);
        } catch (err) {
          if(err.name!=="AbortError"){
            console.log(err.message);
            setError(err.message);
          }
         
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      handleCloseMovie();
      fetchMovies();
      return function()
      {
        controller.abort();
      }
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Input query={query} setQuery={setQuery} />
        <Numresult movies={movies} />
      </Navbar>
      <Main>
        {/* <Box element = {<MovieList movies={movies}/>}/>
            <Box element = {
              <>
                <WatchedSummary watched={watched}/>
                <WatchedMoviesList watched={watched}/>
              </>
            }/> */}
        {/* <Box /> */}
        <Box>
          {/* {isLoading ?<Loader/>:<MovieList movies={movies}/>} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
              onCloseMovie={handleCloseMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeletedWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

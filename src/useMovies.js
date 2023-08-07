import { useState, useEffect } from "react";
const KEY = "4855708";
export function useMovies(query, setSelectedId) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLodaing] = useState(false);
    const [error, setError] = useState(null);
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
    }, [query, setSelectedId]);


    return { movies, isLoading, error }
}
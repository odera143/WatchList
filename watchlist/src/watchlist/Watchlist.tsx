import { Button, Container, Form } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const MyWatchlist = () => {
  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('watchlist', []);
  const [watched, setWatched] = useLocalStorage<Movie[]>('watched', []);

  const removeFromWatchlist = (movieId: number) => {
    setWatchlist(watchlist.filter((movie) => movie.id !== movieId));
  };

  const markAsWatched = (movie: Movie) => {
    if (watched.some((m) => m.id === movie.id)) {
      setWatched(
        watched.map((m) =>
          m.id === movie.id
            ? { ...m, timesWatched: (m.timesWatched || 0) + 1 }
            : m
        )
      );
    } else {
      setWatched([
        ...watched,
        { ...movie, timesWatched: (movie.timesWatched || 0) + 1 },
      ]);
    }
    removeFromWatchlist(movie.id);
  };

  return (
    <Container>
      <h1 className='text-center'>My Watchlist</h1>
      <p className='text-center'>
        {watchlist.length === 0
          ? 'Your watchlist is empty.'
          : `You have ${watchlist.length} movie(s) in your watchlist.`}
      </p>
      <div className='d-flex flex-wrap'>
        {watchlist.map((movie) => (
          <MovieCard movie={movie} key={movie.id}>
            <Button
              size='sm'
              onClick={() => markAsWatched(movie)}
              className='d-flex align-items-center flex-grow-1'
            >
              <Check className='me-2' width={16} height={16} />
              Mark as watched{' '}
              {movie.timesWatched > 0 && `(${movie.timesWatched + 1})`}
            </Button>
          </MovieCard>
        ))}
      </div>
    </Container>
  );
};
export default MyWatchlist;

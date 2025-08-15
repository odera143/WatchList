import { Button, Container } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import { Check } from 'lucide-react';
import { useAuthStore } from '../auth/useAuthStore';
import { useState, useEffect } from 'react';

const MyWatchlist = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  // const [localWatchlist, setLocalWatchlist] = useLocalStorage<Movie[]>(
  //   'watchlist',
  //   []
  // );
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    if (user && token) {
      fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watchlist`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setWatchlist(data))
        .catch((error) => console.error('Error fetching watchlist:', error));
    }
  }, [user, token]);

  const [watched, setWatched] = useLocalStorage<Movie[]>('watched', []);

  const removeFromWatchlist = (movieId: number) => {
    if (user && token) {
      // Remove from backend
      fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(() => {
          setWatchlist(watchlist.filter((movie) => movie.id !== movieId));
        })
        .catch((error) =>
          console.error('Error removing from watchlist:', error)
        );
    }
    // else {
    //   // Remove from localStorage
    //   const updatedWatchlist = localWatchlist.filter(
    //     (movie) => movie.id !== movieId
    //   );
    //   setLocalWatchlist(updatedWatchlist);
    //   setWatchlist(updatedWatchlist);
    // }
  };

  const markAsWatched = (movie: Movie) => {
    if (watched.some((m) => m.id === movie.id)) {
      const updatedWatched = watched.map((m) =>
        m.id === movie.id
          ? { ...m, times_watched: (m.times_watched || 0) + 1 }
          : m
      );
      setWatched(updatedWatched);
    } else {
      const updatedWatched = [
        ...watched,
        { ...movie, times_watched: (movie.times_watched || 0) + 1 },
      ];
      setWatched(updatedWatched);
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
              {movie.times_watched > 0 && `(${movie.times_watched + 1})`}
            </Button>
          </MovieCard>
        ))}
      </div>
    </Container>
  );
};
export default MyWatchlist;

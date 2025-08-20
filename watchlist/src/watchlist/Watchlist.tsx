import { Button, Container } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import { Check, X } from 'lucide-react';
import { useAuthStore } from '../auth/useAuthStore';
import { useState, useEffect } from 'react';

const MyWatchlist = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
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

  const removeFromWatchlist = (movieId: number) => {
    fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watchlist/${movieId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setWatchlist(watchlist.filter((movie) => movie.movieId !== movieId));
      })
      .catch((error) => console.error('Error removing from watchlist:', error));
  };

  const markAsWatched = (movie: Movie) => {
    fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watched`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movie),
    })
      .then(() => {
        setWatchlist(watchlist.filter((m) => m.movieId !== movie.movieId));
      })
      .catch((error) => console.error('Error marking as watched:', error));
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
          <MovieCard movie={movie} key={movie.movieId}>
            <div className='d-flex flex-column gap-2'>
              <Button
                size='sm'
                variant='success'
                onClick={() => markAsWatched(movie)}
                className='d-flex align-items-center flex-grow-1'
              >
                <Check className='me-2' width={16} height={16} />
                Mark as watched{' '}
                {movie.times_watched > 0 && `(${movie.times_watched + 1})`}
              </Button>
              <Button
                size='sm'
                onClick={() => removeFromWatchlist(movie.movieId)}
                className='d-flex align-items-center flex-grow-1'
                variant='danger'
              >
                <X className='me-2' width={16} height={16} />
                Remove from list
              </Button>
            </div>
          </MovieCard>
        ))}
      </div>
    </Container>
  );
};
export default MyWatchlist;

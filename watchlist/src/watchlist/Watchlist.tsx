import { Button, Container } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import { Eye, Trash2 } from 'lucide-react';
import { useAuthStore } from '../auth/useAuthStore';
import { useState, useEffect } from 'react';
import type { ToastConfig } from '../models/Toast';
import MyToast from '../components/Toast';

const MyWatchlist = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

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

  const addToast = (message: string, severity: 'success' | 'error') => {
    const newToast: ToastConfig = {
      id: Date.now(),
      message,
      severity,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const removeFromWatchlist = (movie: Movie) => {
    fetch(
      `${import.meta.env.VITE_BE_BASE_URL}/api/watchlist/${movie.movieId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        setWatchlist(watchlist.filter((m) => m.movieId !== movie.movieId));
        addToast(
          `${movie.title} removed from watchlist successfully`,
          'success'
        );
      })
      .catch((error) => {
        console.error('Error removing from watchlist:', error);
        addToast(`Failed to remove ${movie.title} from watchlist`, 'error');
      });
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
        addToast(`${movie.title} marked as watched successfully`, 'success');
      })
      .catch((error) => {
        console.error('Error marking as watched:', error);
        addToast(`Failed to mark ${movie.title} as watched`, 'error');
      });
  };

  return (
    <Container>
      <MyToast messages={toasts} onClose={removeToast} />
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
                <Eye className='me-2' width={16} height={16} />
                Mark as watched{' '}
                {movie.times_watched > 0 && `(${movie.times_watched + 1})`}
              </Button>
              <Button
                size='sm'
                onClick={() => removeFromWatchlist(movie)}
                className='d-flex align-items-center flex-grow-1'
                variant='danger'
              >
                <Trash2 className='me-2' width={16} height={16} />
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

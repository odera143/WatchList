import { Button, Container } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { addToWatchlilst } from '../util/watchlist-actions';
import type { ToastConfig } from '../models/Toast';
import MyToast from '../components/Toast';

const Watched = ({
  watchlistState,
}: {
  watchlistState: {
    watchlist: Movie[];
    setWatchlist: React.Dispatch<React.SetStateAction<Movie[]>>;
  };
}) => {
  const [watched, setWatched] = useState<Movie[]>([]);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { watchlist, setWatchlist } = watchlistState;
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  useEffect(() => {
    if (user && token) {
      fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watched`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setWatched(data))
        .catch((error) =>
          console.error('Error fetching watched movies:', error)
        );
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

  return (
    <Container>
      <MyToast messages={toasts} onClose={removeToast} />
      <h1 className='text-center'>My Watched Movies</h1>
      <p className='text-center'>
        {watched.length === 0
          ? 'You have not watched any movies.'
          : `You have watched ${watched.length} movie(s).`}
      </p>
      <div className='d-flex flex-wrap'>
        {watched.map((movie) => (
          <MovieCard movie={movie} key={movie.movieId}>
            <div className='d-flex justify-content-center gap-2'>
              <Button
                size='sm'
                className='d-flex align-items-center flex-grow-1'
                disabled={watchlist.some((m) => m.movieId === movie.movieId)}
                onClick={() => {
                  if (!watchlist.some((m) => m.movieId === movie.movieId)) {
                    addToWatchlilst(movie, token, addToast, setWatchlist);
                  }
                }}
              >
                <div className='d-flex align-items-center gap-1'>
                  <RotateCcw className='rotate-ccw' /> Mark for rewatch
                </div>
              </Button>
            </div>
          </MovieCard>
        ))}
      </div>
    </Container>
  );
};
export default Watched;

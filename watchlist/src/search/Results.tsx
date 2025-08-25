import { Container, Button, Alert } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import useApiFetch from '../hooks/useApiFetch';
import { useSearchParams } from 'react-router';
import { useState } from 'react';
import MovieCard from '../components/MovieCard';
import { useAuthStore } from '../auth/useAuthStore';
import MyToast from '../components/Toast';
import type { ToastConfig } from '../models/Toast';
import { Bookmark } from 'lucide-react';
import { addToWatchlilst } from '../util/watchlist-actions';

interface ResultsProps {
  data: {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const Results = ({
  watchlistState,
}: {
  watchlistState: {
    watchlist: Movie[];
    setWatchlist: React.Dispatch<React.SetStateAction<Movie[]>>;
  };
}) => {
  let [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const token = useAuthStore((state) => state.token);

  const [currentPage, setCurrentPage] = useState(1);
  const { data, loading, error }: ResultsProps = useApiFetch(
    `https://api.themoviedb.org/3/search/movie?query=${query}&page=${currentPage}`
  );
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const { watchlist, setWatchlist } = watchlistState;

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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <Alert variant='danger'>{error}</Alert>
      ) : (
        <>
          <div className='d-flex flex-wrap'>
            {data?.results.map((movie) => (
              <MovieCard movie={movie} key={movie.id}>
                <div className='d-flex flex-column gap-2'>
                  <Button
                    size='sm'
                    onClick={() =>
                      addToWatchlilst(movie, token, addToast, setWatchlist)
                    }
                    className='d-flex align-items-center flex-grow-1'
                    disabled={watchlist.some((m) => m.movieId === movie.id)}
                  >
                    <Bookmark className='me-2' width={16} height={16} />
                    {watchlist.some((m) => m.movieId === movie.id)
                      ? 'Already in watchlist'
                      : 'Add to watchlist'}
                  </Button>
                </div>
              </MovieCard>
            ))}
          </div>
          <div className='d-flex justify-content-center gap-2'>
            <Button
              disabled={currentPage <= 1}
              variant='primary'
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {'<'}
            </Button>
            <Button
              disabled={currentPage >= (data?.total_pages || 1)}
              variant='primary'
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {'>'}
            </Button>
          </div>
          <span>page: {data?.page}</span>
          <br />
          <span>total pages: {data?.total_pages}</span>
        </>
      )}
    </Container>
  );
};
export default Results;

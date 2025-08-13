import { Container, Row, Button, Card, Alert } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import useLocalStorage from '../hooks/useLocalStorage';
import useApiFetch from '../hooks/useApiFetch';
import { useSearchParams } from 'react-router';
import { useState } from 'react';
import MovieCard from '../components/MovieCard';

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

const Results = () => {
  let [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('watchlist', []);
  const [currentPage, setCurrentPage] = useState(1);
  const { data, loading, error }: ResultsProps = useApiFetch(
    `https://api.themoviedb.org/3/search/movie?query=${query}&page=${currentPage}`
  );

  const handleAddToWatchlist = (movie: Movie) => {
    if (movie && !watchlist.some((m) => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
    }
  };

  return (
    <Container>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <Alert variant='danger'>{error}</Alert>
      ) : (
        <>
          <div className='d-flex flex-wrap'>
            {data?.results.map((movie) => (
              <MovieCard movie={movie} key={movie.id}>
                <Button
                  size='sm'
                  onClick={() => handleAddToWatchlist(movie)}
                  className='d-flex align-items-center flex-grow-1'
                  disabled={watchlist.some((m) => m.id === movie.id)}
                >
                  {watchlist.some((m) => m.id === movie.id)
                    ? 'In Watchlist'
                    : 'Add to Watchlist'}
                </Button>
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

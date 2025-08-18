import { Container, Button, Alert } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import useApiFetch from '../hooks/useApiFetch';
import { useSearchParams } from 'react-router';
import { useState } from 'react';
import MovieCard from '../components/MovieCard';
import { useAuthStore } from '../auth/useAuthStore';

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
  const token = useAuthStore((state) => state.token);

  const [currentPage, setCurrentPage] = useState(1);
  const { data, loading, error }: ResultsProps = useApiFetch(
    `https://api.themoviedb.org/3/search/movie?query=${query}&page=${currentPage}`
  );

  const handleAddToWatchlist = (movie: Movie) => {
    const movieToAdd = {
      ...movie,
      movieId: movie.id,
    };
    delete movieToAdd.id;

    fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(movieToAdd),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add movie to watchlist');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Movie added to watchlist:', data);
      })
      .catch((error) => {
        console.error('Error adding movie to watchlist:', error);
      });
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
                  //   disabled={watchlist.some((m) => m.id === movie.id)}
                  // >
                  //   {watchlist.some((m) => m.id === movie.id)
                  //     ? 'In watchlist'
                  //     : 'Add to watchlist'}
                >
                  Add to watchlist
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

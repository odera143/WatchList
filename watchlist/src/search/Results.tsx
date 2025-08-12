import { Container, Row, Button, Card, Alert } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import useLocalStorage from '../hooks/useLocalStorage';
import useApiFetch from '../hooks/useApiFetch';
import { useSearchParams } from 'react-router';
import { useState } from 'react';

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
          <span>page: {data?.page}</span>
          <br />
          <span>total pages: {data?.total_pages}</span>
          <Row className='justify-content-center'>
            {data?.results.map((movie) => (
              <Card key={movie.id} style={{ width: '18rem' }} className='m-2'>
                <Card.Img
                  variant='top'
                  src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                  alt={movie.title}
                />
                <Card.Body>
                  <Card.Title className='fw-bold'>{movie.title}</Card.Title>
                  <Card.Text>Release Date: {movie.release_date}</Card.Text>
                  <Button
                    variant='primary'
                    onClick={() => handleAddToWatchlist(movie)}
                  >
                    Add to Watchlist
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </Row>
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
        </>
      )}
    </Container>
  );
};
export default Results;

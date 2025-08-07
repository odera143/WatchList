import { Container, Row, Button, Card } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import useLocalStorage from '../hooks/useLocalStorage';

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

const Results = ({ data, loading, error }: ResultsProps) => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('watchlist', []);

  const handleAddToWatchlist = (movie: Movie) => {
    if (movie && !watchlist.some((m) => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
    }
  };

  return (
    <Container>
      <span>page: {data.page}</span>
      <br />
      <span>total pages: {data.total_pages}</span>
      <Row className='justify-content-center'>
        {data.results.map((movie) => (
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
    </Container>
  );
};
export default Results;

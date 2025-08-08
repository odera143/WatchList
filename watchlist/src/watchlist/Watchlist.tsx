import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Movie } from '../models/Movie';

const MyWatchlist = () => {
  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('watchlist', []);
  const [watched, setWatched] = useLocalStorage<Movie[]>('watched', []);

  const removeFromWatchlist = (movieId: number) => {
    setWatchlist(watchlist.filter((movie) => movie.id !== movieId));
  };

  const markAsWatched = (movie: Movie) => {
    setWatched([...watched, movie]);
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
      <Row>
        {watchlist.map((movie) => (
          <Col key={movie.id} md={4}>
            <Card>
              <Card.Img
                variant='top'
                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
              />
              <Card.Body>
                <Card.Title>{movie.title}</Card.Title>
                <Card.Text>{movie.overview}</Card.Text>
                <Card.Footer className='d-flex flex-column align-items-center gap-2'>
                  <Button
                    variant='secondary'
                    onClick={() => removeFromWatchlist(movie.id)}
                  >
                    Remove from List
                  </Button>
                  <Button
                    variant='primary'
                    onClick={() => markAsWatched(movie)}
                  >
                    Mark as Watched
                  </Button>
                </Card.Footer>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};
export default MyWatchlist;

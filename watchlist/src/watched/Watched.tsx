import { Card, Col, Container, Row } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Movie } from '../models/Movie';

const Watched = () => {
  const [watched] = useLocalStorage<Movie[]>('watched', []);
  return (
    <Container>
      <h1 className='text-center'>My Watched Movies</h1>
      <p className='text-center'>
        {watched.length === 0
          ? 'You have not watched any movies.'
          : `You have watched ${watched.length} movie(s).`}
      </p>
      <Row>
        {watched.map((movie) => (
          <Col key={movie.id} md={4}>
            <Card>
              <Card.Img
                variant='top'
                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
              />
              <Card.Body>
                <Card.Title>{movie.title}</Card.Title>
                <Card.Text>{movie.overview}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};
export default Watched;

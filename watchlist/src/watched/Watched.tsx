import { Container, Row } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';

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
      <div className='d-flex flex-wrap'>
        {watched.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </Container>
  );
};
export default Watched;

import { Button, Container } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import { RotateCcw } from 'lucide-react';

const Watched = () => {
  const [watched] = useLocalStorage<Movie[]>('watched', []);
  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('watchlist', []);
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
          <MovieCard movie={movie} key={movie.movieId}>
            <Button
              size='sm'
              className='d-flex align-items-center flex-grow-1'
              disabled={watchlist.some((m) => m.movieId === movie.movieId)}
              onClick={() => {
                if (!watchlist.some((m) => m.movieId === movie.movieId)) {
                  setWatchlist([...watchlist, movie]);
                }
              }}
            >
              <div className='d-flex align-items-center gap-1'>
                <RotateCcw className='rotate-ccw' /> Mark for rewatch
              </div>
            </Button>
          </MovieCard>
        ))}
      </div>
    </Container>
  );
};
export default Watched;

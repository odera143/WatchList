import { Button, Container } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';

const Watched = () => {
  const [watched, setWatched] = useState<Movie[]>([]);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
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
            <div className='d-flex justify-content-center gap-2'>
              <Button
                size='sm'
                className='d-flex align-items-center flex-grow-1'
                disabled
                // disabled={watchlist.some((m) => m.movieId === movie.movieId)}
                // onClick={() => {
                //   if (!watchlist.some((m) => m.movieId === movie.movieId)) {
                //     setWatchlist([...watchlist, movie]);
                //   }
                // }}
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

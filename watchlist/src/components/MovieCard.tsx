import { Badge, Card } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import { Star } from 'lucide-react';
import { getGenreName } from '../static/genres';

const MovieCard: React.FC<{
  movie: Movie;
  children?: React.ReactNode;
}> = ({ movie, children }) => {
  return (
    <Card style={{ width: '18rem', padding: '0' }} className='m-2'>
      <Card.Img
        variant='top'
        src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
        alt={movie.title}
      />
      <Card.Body>
        <Card.Title>
          <span
            className='fw-bold text-truncate d-inline-block'
            style={{
              maxWidth: '12rem',
              verticalAlign: 'bottom',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {movie.title}
          </span>
          <span className='text-muted'>
            {' '}
            ({movie.release_date.substring(0, 4)})
          </span>
        </Card.Title>
        <Card.Text className='d-flex flex-column gap-2'>
          <div className='d-flex align-items-center gap-1'>
            <Star className='star' />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
          <div className='d-flex flex-wrap gap-1'>
            {movie.genre_ids.slice(0, 2).map((g) => (
              <Badge key={g} bg='secondary' className='text-xs'>
                {getGenreName(g)}
              </Badge>
            ))}
            {movie.genre_ids.length > 2 && (
              <Badge bg='secondary' className='text-xs'>
                +{movie.genre_ids.length - 2}
              </Badge>
            )}
          </div>
          <p className='small text-muted'>
            {movie.overview.length > 100
              ? movie.overview.slice(0, 100) + '...'
              : movie.overview}
          </p>
        </Card.Text>
      </Card.Body>
      <Card.Footer
        style={{
          backgroundColor: 'transparent',
          borderTop: 'none',
          paddingTop: 0,
          paddingBottom: '1rem',
        }}
      >
        {children}
      </Card.Footer>
    </Card>
  );
};
export default MovieCard;

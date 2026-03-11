import type { Movie } from '../models/Movie';
import { Check, Clock3, Star } from 'lucide-react';
import { getGenreName } from '../static/genres';
import { Dropdown } from 'react-bootstrap';

const MovieCard: React.FC<{
  movie: Movie;
  status?: 'want' | 'watched';
  userRating?: number;
  onOpenDetails?: (movie: Movie) => void;
  children?: React.ReactNode;
}> = ({ movie, status = 'want', userRating = 0, onOpenDetails, children }) => {
  const year = movie.release_date?.substring(0, 4) || 'N/A';
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : '';

  return (
    <article className='movie-card'>
      {posterUrl ? (
        <img className='movie-card__poster' src={posterUrl} alt={movie.title} />
      ) : (
        <div className='movie-card__poster movie-card__poster--fallback'>
          <span>No Poster</span>
        </div>
      )}
      <div className='movie-card__overlay'>
        <div className='movie-card__top-row'>
          <span
            className={`movie-status-pill ${status === 'watched' ? 'movie-status-pill--watched' : 'movie-status-pill--want'}`}
          >
            {status === 'watched' ? (
              <>
                <Check size={14} />
                Watched
              </>
            ) : (
              <>
                <Clock3 size={14} />
                Want to Watch
              </>
            )}
          </span>
          <Dropdown>
            <Dropdown.Toggle className='movie-card__dropdown-toggle'>
              ⋮
            </Dropdown.Toggle>
            <Dropdown.Menu>{children ? children : null}</Dropdown.Menu>
          </Dropdown>
        </div>

        <div>
          <div
            className='movie-card__body'
            onClick={() => onOpenDetails?.(movie)}
          >
            <h3 className='movie-card__title'>{movie.title}</h3>
            <div className='movie-card__meta'>
              <span>{year}</span>
              <span style={{ fontSize: '0.5rem' }}>•</span>
              <span>{getGenreName(movie.genre_ids?.[0] || 0)}</span>
              <span style={{ fontSize: '0.5rem' }}>•</span>
              <span className='movie-tmdb-rating'>
                <Star size={14} fill='currentColor' />
                {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
              </span>
              {status === 'watched' && userRating > 0 && (
                <>
                  <span style={{ fontSize: '0.5rem' }}>•</span>
                  <span className='movie-user-rating'>
                    <Star size={14} fill='currentColor' />
                    {userRating}/10
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
export default MovieCard;

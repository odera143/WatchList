import { Badge } from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import { Check, Clock3, Star } from 'lucide-react';
import { getGenreName } from '../static/genres';

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
          {status === 'watched' && userRating > 0 && (
            <span className='movie-user-rating'>
              <Star size={14} fill='currentColor' />
              {userRating}/10
            </span>
          )}
        </div>

        <div
          className='movie-card__body'
          onClick={() => onOpenDetails?.(movie)}
        >
          <h3 className='movie-card__title'>{movie.title}</h3>
          <div className='movie-card__meta'>
            <span>{year}</span>
            <span>•</span>
            <span>{getGenreName(movie.genre_ids?.[0] || 0)}</span>
            <span>•</span>
            <span className='movie-tmdb-rating'>
              <Star size={14} fill='currentColor' />
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>

        <div className='movie-card__genres'>
          {movie.genre_ids?.slice(0, 2).map((g) => (
            <Badge key={g} bg='secondary' className='movie-genre-badge'>
              {getGenreName(g)}
            </Badge>
          ))}
        </div>
        {children ? (
          <div className='movie-card__actions'>{children}</div>
        ) : null}
      </div>
    </article>
  );
};
export default MovieCard;

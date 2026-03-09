import { useState } from 'react';
import { Alert, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import type { Movie } from '../../models/Movie';
import { Search, Plus } from 'lucide-react';
import { addToWatchlist } from '../../util/watchlist-actions';
import { getGenreName } from '../../static/genres';

const SearchMovies = ({
  show,
  onHide,
  watchlistState: { watchlist, setWatchlist },
  addToast,
}: {
  show: boolean;
  onHide: () => void;
  watchlistState: {
    watchlist: Movie[];
    setWatchlist: React.Dispatch<React.SetStateAction<Movie[]>>;
  };
  addToast: (message: string, severity: 'success' | 'error') => void;
}) => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchMovies = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BE_BASE_URL}/api/tmdb/search?query=${encodeURIComponent(trimmedQuery)}&page=1`,
        {
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const payload = await response.json();
      setSearchResults(payload.results || []);
    } catch (error) {
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName='dashboard-modal-content'
      size='lg'
    >
      <Modal.Header closeButton className='dashboard-modal-header'>
        <Modal.Title>Search Movies</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className='mb-3'>
          <InputGroup.Text className='dashboard-input-addon'>
            <Search size={16} />
          </InputGroup.Text>
          <Form.Control
            className='dashboard-input'
            value={searchQuery}
            placeholder='Search movies...'
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchMovies()}
          />
          <Button className='add-movie-btn' onClick={searchMovies}>
            Search
          </Button>
        </InputGroup>

        {searchError && <Alert variant='danger'>{searchError}</Alert>}

        <div className='search-result-list'>
          {searchLoading && <p className='text-center mb-0'>Searching...</p>}
          {!searchLoading && searchResults.length === 0 && (
            <p className='text-center text-secondary mb-0'>
              No results yet. Hit search to find movies.
            </p>
          )}
          {!searchLoading &&
            searchResults.map((movie) => (
              <div key={movie.id} className='search-result-row'>
                <div className='d-flex align-items-center gap-3'>
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w45${movie.poster_path}`
                        : undefined
                    }
                    alt={movie.title}
                    className='search-result-poster'
                  />
                  <div>
                    <h6 className='mb-1'>{movie.title}</h6>
                    <small className='text-secondary'>
                      {movie.release_date?.substring(0, 4) || 'N/A'}
                      {movie.genre_ids?.[0]
                        ? ` • ${getGenreName(movie.genre_ids[0])}`
                        : ''}
                      {movie.vote_average
                        ? ` • TMDb: ${movie.vote_average.toFixed(1)}/10`
                        : ' • No rating'}
                    </small>
                  </div>
                </div>
                <Button
                  className='movie-action-btn movie-action-btn--primary'
                  disabled={watchlist.some((w) => w.movieId === movie.id)}
                  onClick={() => addToWatchlist(movie, addToast, setWatchlist)}
                  size='sm'
                >
                  <Plus size={14} className='me-1' />
                  Add
                </Button>
              </div>
            ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};
export default SearchMovies;

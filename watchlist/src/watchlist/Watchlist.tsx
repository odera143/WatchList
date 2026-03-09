import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Row,
} from 'react-bootstrap';
import type { Movie } from '../models/Movie';
import MovieCard from '../components/MovieCard';
import {
  Bookmark,
  Check,
  Clock3,
  Eye,
  Film,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ToastConfig } from '../models/Toast';
import MyToast from '../components/Toast';
import { updateMovieInWatchedList } from '../util/watched-actions';
import { useAuthStore } from '../auth/useAuthStore';
import SearchMovies from '../components/modals/SearchMovies';

type MovieStatus = 'want' | 'watched';
type MovieWithStatus = Movie & { status: MovieStatus };

const MyWatchlist = ({
  watchlistState,
}: {
  watchlistState: {
    watchlist: Movie[];
    setWatchlist: React.Dispatch<React.SetStateAction<Movie[]>>;
  };
}) => {
  const user = useAuthStore((state) => state.user);
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [watched, setWatched] = useState<Movie[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'want' | 'watched'>(
    'all',
  );
  const [sortOrder, setSortOrder] = useState<'recent' | 'title' | 'rating'>(
    'recent',
  );
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [notes, setNotes] = useState('');
  const { watchlist, setWatchlist } = watchlistState;

  useEffect(() => {
    if (!user) {
      setWatched([]);
      return;
    }

    fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watched`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch watched movies');
        }
        return res.json();
      })
      .then((data) => setWatched(data))
      .catch((error) => console.error(error));
  }, [user]);

  const addToast = (message: string, severity: 'success' | 'error') => {
    const newToast: ToastConfig = {
      id: Date.now(),
      message,
      severity,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const stats = useMemo(() => {
    const total = watchlist.length + watched.length;
    return {
      total,
      want: watchlist.length,
      watched: watched.length,
    };
  }, [watchlist, watched]);

  const combinedMovies = useMemo<MovieWithStatus[]>(() => {
    const wantMovies: MovieWithStatus[] = watchlist.map((movie) => ({
      ...movie,
      status: 'want',
    }));
    const watchedMovies: MovieWithStatus[] = watched.map((movie) => ({
      ...movie,
      status: 'watched',
    }));
    const allMovies = [...wantMovies, ...watchedMovies];

    const filtered = allMovies.filter((movie) => {
      const matchesQuery = movie.title
        .toLowerCase()
        .includes(query.toLowerCase().trim());
      const matchesStatus =
        statusFilter === 'all' ? true : movie.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortOrder === 'rating') {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }

      const aDate = new Date(
        a.last_watched || a.added_at || a.release_date || 0,
      ).getTime();
      const bDate = new Date(
        b.last_watched || b.added_at || b.release_date || 0,
      ).getTime();
      return bDate - aDate;
    });

    return sorted;
  }, [query, sortOrder, statusFilter, watchlist, watched]);

  const removeFromWatchlist = (movie: Movie) => {
    fetch(
      `${import.meta.env.VITE_BE_BASE_URL}/api/watchlist/${movie.movieId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )
      .then(() => {
        setWatchlist(watchlist.filter((m) => m.movieId !== movie.movieId));
        addToast(
          `${movie.title} removed from watchlist successfully`,
          'success',
        );
      })
      .catch((error) => {
        console.error('Error removing from watchlist:', error);
        addToast(`Failed to remove ${movie.title} from watchlist`, 'error');
      });
  };

  const openDetails = (movie: Movie) => {
    if (!watched.some((item) => item.movieId === movie.movieId)) {
      return;
    }
    setDetailMovie(movie);
    setUserRating(movie.user_rating || 0);
    setNotes(movie.notes || '');
  };

  const saveDetails = async () => {
    if (!detailMovie) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BE_BASE_URL}/api/watched/${detailMovie.movieId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...detailMovie,
            user_rating: userRating,
            notes,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to save movie details');
      }

      const updatedWatched = await response.json();
      setWatched(updatedWatched);
      setDetailMovie(null);
      addToast('Movie details updated', 'success');
    } catch (error) {
      addToast('Failed to update movie details', 'error');
    }
  };

  const markAsWatched = (movie: Movie) => {
    if (movie.times_watched > 0) {
      updateMovieInWatchedList(movie, addToast, setWatchlist, watchlist);
    } else {
      fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watched`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...movie,
          times_watched: (movie.times_watched || 0) + 1,
        }),
      })
        .then(() => {
          setWatchlist(watchlist.filter((m) => m.movieId !== movie.movieId));
          setWatched((prev) => [
            ...prev,
            { ...movie, times_watched: (movie.times_watched || 0) + 1 },
          ]);
          addToast(`${movie.title} marked as watched successfully`, 'success');
        })
        .catch((error) => {
          console.error('Error marking as watched:', error);
          addToast(`Failed to mark ${movie.title} as watched`, 'error');
        });
    }
  };

  return (
    <Container className='dashboard-container py-4 py-md-5'>
      <MyToast messages={toasts} onClose={removeToast} />
      <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4'>
        <div>
          <h1 className='dashboard-title mb-1'>My Watchlst</h1>
          <small className='text-secondary'>
            Letterboxd who? Manage your movie watchlist here.
          </small>
        </div>
        <Button className='add-movie-btn' onClick={() => setShowAddModal(true)}>
          <Bookmark size={16} className='me-2' />
          Add Movie
        </Button>
      </div>

      <Row className='g-3 mb-4'>
        <Col xs={12} md={4}>
          <div className='stats-card stats-card--purple'>
            <div>
              <h3>{stats.total}</h3>
              <p>Total</p>
            </div>
            <Film size={26} />
          </div>
        </Col>
        <Col xs={12} md={4}>
          <div className='stats-card stats-card--gold'>
            <div>
              <h3>{stats.want}</h3>
              <p>Want to Watch</p>
            </div>
            <Clock3 size={26} />
          </div>
        </Col>
        <Col xs={12} md={4}>
          <div className='stats-card stats-card--green'>
            <div>
              <h3>{stats.watched}</h3>
              <p>Watched</p>
            </div>
            <Check size={26} />
          </div>
        </Col>
      </Row>

      <Row className='g-2 g-md-3 mb-4'>
        <Col xs={12} md={6}>
          <InputGroup>
            <InputGroup.Text className='dashboard-input-addon'>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              className='dashboard-input'
              placeholder='Filter your watchlist...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select
            className='dashboard-select'
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'want' | 'watched')
            }
          >
            <option value='all'>All Status</option>
            <option value='want'>Want to Watch</option>
            <option value='watched'>Watched</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select
            className='dashboard-select'
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as 'recent' | 'title' | 'rating')
            }
          >
            <option value='recent'>Recently Added</option>
            <option value='title'>Title A-Z</option>
            <option value='rating'>TMDB Rating</option>
          </Form.Select>
        </Col>
      </Row>

      <div className='movie-grid'>
        {combinedMovies.map((movie) => {
          const isWatched = movie.status === 'watched';
          return (
            <MovieCard
              key={`${movie.status}-${movie.movieId}`}
              movie={movie}
              status={isWatched ? 'watched' : 'want'}
              userRating={movie.user_rating || 0}
              onOpenDetails={isWatched ? openDetails : undefined}
            >
              {isWatched ? (
                <Button
                  className='w-100 movie-action-btn movie-action-btn--secondary'
                  onClick={() => openDetails(movie)}
                >
                  Edit details
                </Button>
              ) : (
                <div className='d-grid gap-2'>
                  <Button
                    className='w-100 movie-action-btn movie-action-btn--primary'
                    onClick={() => markAsWatched(movie)}
                  >
                    <Eye className='me-2' size={16} />
                    Mark Watched
                  </Button>
                  <Button
                    className='w-100 movie-action-btn movie-action-btn--danger'
                    onClick={() => removeFromWatchlist(movie)}
                  >
                    <Trash2 className='me-2' size={16} />
                    Remove
                  </Button>
                </div>
              )}
            </MovieCard>
          );
        })}
      </div>

      {combinedMovies.length === 0 && (
        <div className='empty-state mt-4'>No movies match your filters.</div>
      )}

      <SearchMovies
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        watchlistState={{ watchlist, setWatchlist }}
        addToast={addToast}
      />

      <Modal
        show={!!detailMovie}
        onHide={() => setDetailMovie(null)}
        centered
        contentClassName='dashboard-modal-content'
      >
        <Modal.Header closeButton className='dashboard-modal-header'>
          <Modal.Title>{detailMovie?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='text-secondary mb-3'>{detailMovie?.overview}</p>
          <div className='mb-3'>
            <p className='small text-uppercase text-secondary mb-2'>
              Your Rating
            </p>
            <div className='d-flex flex-wrap align-items-center gap-2'>
              {Array.from({ length: 10 }).map((_, i) => {
                const value = i + 1;
                const active = userRating >= value;
                return (
                  <button
                    key={value}
                    type='button'
                    className='rating-star-btn'
                    onClick={() => setUserRating(value)}
                  >
                    <Star
                      size={22}
                      fill={active ? 'currentColor' : 'none'}
                      color={active ? '#facc15' : '#2f3d5b'}
                    />
                  </button>
                );
              })}
              <span className='text-secondary'>{userRating}/10</span>
            </div>
          </div>

          <Form.Group className='mb-3'>
            <Form.Label className='small text-uppercase text-secondary'>
              Notes
            </Form.Label>
            <Form.Control
              as='textarea'
              rows={4}
              className='dashboard-input'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <Button className='w-100 add-movie-btn' onClick={saveDetails}>
            Save Changes
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};
export default MyWatchlist;

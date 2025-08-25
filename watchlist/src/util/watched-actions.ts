import type { Movie } from '../models/Movie';

export const updateMovieInWatchedList = (
  movie: Movie,
  token: string | null,
  addToast: (message: string, severity: 'success' | 'error') => void,
  setWatchlist: React.Dispatch<React.SetStateAction<Movie[]>>,
  watchlist: Movie[]
) => {
  fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watched/${movie.movieId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...movie,
      times_watched: movie.times_watched + 1,
    } as Movie),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update movie in watched list');
      }
      return response.json();
    })
    .then(() => {
      setWatchlist(watchlist.filter((m) => m.movieId !== movie.movieId));
      addToast(
        `${movie.title} updated in watched list successfully`,
        'success'
      );
    })
    .catch((error) => {
      console.error('Error updating movie in watched list:', error);
      addToast(`Failed to update ${movie.title} in watched list`, 'error');
    });
};

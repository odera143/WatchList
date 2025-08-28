import type { Movie } from '../models/Movie';

export const addToWatchlist = (
  movie: Movie,
  token: string | null,
  addToast: (message: string, severity: 'success' | 'error') => void,
  setWatchlist: React.Dispatch<React.SetStateAction<Movie[]>>
) => {
  const movieToAdd: Movie = {
    ...movie,
    movieId: movie.id || movie.movieId,
  };
  delete movieToAdd.id;

  fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/watchlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movieToAdd),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to add movie to watchlist');
      }
      return response.json();
    })
    .then(() => {
      addToast(`${movie.title} added to watchlist successfully`, 'success');
      setWatchlist((prev) => [...prev, movieToAdd as Movie]);
    })
    .catch((error) => {
      console.error('Error adding movie to watchlist:', error);
      addToast(`Failed to add ${movie.title} to watchlist`, 'error');
    });
};

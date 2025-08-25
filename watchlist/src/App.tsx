import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import Nav from './nav/Nav';
import MyWatchlist from './watchlist/Watchlist';
import Watched from './watched/Watched';
import Results from './search/Results';
import AuthCallback from './auth/AuthCallback';
import { useEffect, useState } from 'react';
import { useAuthStore } from './auth/useAuthStore';
import type { Movie } from './models/Movie';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const token = useAuthStore((state) => state.token);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const watchlistState = { watchlist, setWatchlist };

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BE_BASE_URL}/api/watchlist`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
      }
    };
    fetchWatchlist();
  }, [token]);

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route
          path='/my-watchlist'
          element={<MyWatchlist watchlistState={watchlistState} />}
        />
        <Route
          path='/my-watched'
          element={<Watched watchlistState={watchlistState} />}
        />
        <Route
          path='/searchResults'
          element={<Results watchlistState={watchlistState} />}
        />
        <Route path='/auth' element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

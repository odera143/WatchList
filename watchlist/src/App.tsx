import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import Nav from './nav/Nav';
import MyWatchlist from './watchlist/Watchlist';
import Watched from './watched/Watched';
import Results from './search/Results';
import AuthCallback from './auth/AuthCallback';
import { useEffect } from 'react';
import { useAuthStore } from './auth/useAuthStore';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path='/my-watchlist' element={<MyWatchlist />} />
        <Route path='/my-watched' element={<Watched />} />
        <Route path='/searchResults' element={<Results />} />
        <Route path='/auth' element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

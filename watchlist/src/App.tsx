import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import Nav from './nav/Nav';
import MyWatchlist from './watchlist/Watchlist';
import Watched from './watched/Watched';
import Results from './search/Results';

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path='/my-watchlist' element={<MyWatchlist />} />
        <Route path='/my-watched' element={<Watched />} />
        <Route path='/searchResults' element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

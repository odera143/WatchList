import './App.css';
import Home from './home';
import { BrowserRouter, Route, Routes } from 'react-router';
import Nav from './nav/Nav';
import MyWatchlist from './watchlist/Watchlist';
import Watched from './watched/Watched';

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/my-watchlist' element={<MyWatchlist />} />
        <Route path='/my-watched' element={<Watched />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

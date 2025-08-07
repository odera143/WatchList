import './App.css';
import Home from './home';
import { BrowserRouter, Route, Routes } from 'react-router';
import Nav from './nav/Nav';
import MyWatchlist from './watchlist/Watchlist';

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/my-watchlist' element={<MyWatchlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

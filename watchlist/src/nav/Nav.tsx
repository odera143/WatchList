import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router';
import { useLocation } from 'react-router';
import Search from '../search/Search';

const Nav = () => {
  const location = useLocation();

  function isActive(path: string) {
    return location.pathname === path ? 'active' : '';
  }

  return (
    <Navbar className='bg-body-tertiary fixed-top'>
      <div className='container-fluid'>
        <span className='navbar-brand mb-0 h1'>Watchlist+More</span>
        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarText'
          aria-controls='navbarText'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarText'>
          <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
            <li className='nav-item'>
              <Link className={`nav-link ${isActive('/')}`} to='/'>
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                className={`nav-link ${isActive('/my-watchlist')}`}
                to='/my-watchlist'
              >
                Watchlist
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                className={`nav-link ${isActive('/my-watched')}`}
                to='/my-watched'
              >
                Watched
              </Link>
            </li>
          </ul>
          <Search />
        </div>
      </div>
    </Navbar>
  );
};
export default Nav;

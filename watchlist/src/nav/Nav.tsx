import { Button, Navbar } from 'react-bootstrap';
import { Link } from 'react-router';
import { useLocation } from 'react-router';
import Search from '../search/Search';
import { useAuthStore } from '../auth/useAuthStore';

const Nav = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

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
          &nbsp;&nbsp;&nbsp;&nbsp;
          {user ? (
            <div className='d-flex align-items-center'>
              <span className='ms-2'>{user.name}</span>
            </div>
          ) : (
            <Button
              href={`${import.meta.env.VITE_BE_BASE_URL}/auth/google`}
              size='sm'
            >
              Sign in with Google
            </Button>
          )}
          <Button
            className='ms-2'
            variant='outline-secondary'
            size='sm'
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/';
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </Navbar>
  );
};
export default Nav;

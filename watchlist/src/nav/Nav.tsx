import { Button, Navbar } from 'react-bootstrap';
import { useAuthStore } from '../auth/useAuthStore';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router';

const Nav = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Navbar className='dashboard-nav fixed-top' expand='lg'>
      <div className='container-fluid px-3 px-md-4'>
        <Link className='navbar-brand mb-0 h1 dashboard-brand' to='/'>
          Watchlst
        </Link>

        <div className='d-flex' id='navbarText'>
          {user ? (
            <div className='d-flex align-items-center gap-2'>
              <span className='dashboard-user-name'>{user.name}</span>
            </div>
          ) : (
            <Button
              href={`${import.meta.env.VITE_BE_BASE_URL}/auth/google`}
              size='sm'
            >
              Sign in with Google
            </Button>
          )}
          {user && (
            <Button
              className='ms-2 movie-action-btn movie-action-btn--secondary'
              size='sm'
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
            >
              <LogOut size={14} className='me-1' />
              Logout
            </Button>
          )}
        </div>
      </div>
    </Navbar>
  );
};
export default Nav;

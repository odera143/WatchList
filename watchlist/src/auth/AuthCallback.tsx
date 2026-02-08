import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from './useAuthStore';

const AuthCallback = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Get JWT from URL fragment (hash)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');

    if (!token) {
      console.error('No token in URL');
      navigate('/');
      return;
    }

    setUser(token);
    navigate('/my-watchlist');
  }, [navigate, setUser]);

  return <div>Authenticating...</div>;
};

export default AuthCallback;

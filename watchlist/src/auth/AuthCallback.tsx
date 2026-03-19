import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from './useAuthStore';
import { SITE_NAME } from '../seo/site';
import { useSeo } from '../seo/useSeo';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const initAuth = useAuthStore((state) => state.initAuth);
  const code = searchParams.get('code');

  useSeo({
    title: `Signing In | ${SITE_NAME}`,
    description: 'Completing your WatchLst sign-in.',
    path: '/auth',
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    if (!code) return;

    fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(async ({ user }) => {
        if (user) {
          setUser(user);
        } else {
          await initAuth();
        }
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error('Auth error:', error);
        setUser(null);
        navigate(`/`, { replace: true });
      });
  }, [code, initAuth, navigate, setUser]);

  return <div>Authenticating...</div>;
};

export default AuthCallback;

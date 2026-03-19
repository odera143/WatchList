export const SITE_NAME = 'WatchLst';
export const DEFAULT_TITLE = `${SITE_NAME} | Personal movie watchlist`;
export const DEFAULT_DESCRIPTION =
  'Track movies you want to watch, log what you have watched, and rate films in your personal WatchLst.';
export const DEFAULT_IMAGE_PATH = '/favicon.png';

const LOCAL_SITE_URL = 'http://localhost:5173';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getSiteOrigin = () => {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return LOCAL_SITE_URL;
};

export const toAbsoluteUrl = (value: string) => {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(value, `${getSiteOrigin()}/`).toString();
  }
};

export const getAbsoluteUrl = (path = '/') => toAbsoluteUrl(path);

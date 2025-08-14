import 'express-session';

interface UserData {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}

declare module 'express-session' {
  interface SessionData {
    user: UserData;
  }
}

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    gid: string;
    data: string;
  }
}

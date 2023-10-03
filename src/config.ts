export const REDIRECT_URI: string = import.meta.env.DEV
  ? 'http://localhost:5173/reroute'
  : 'https://spotify-playlist-manager-h4i8.vercel.app/reroute';

export const SCOPE =
  'playlist-modify-public\
   playlist-read-private\
   playlist-modify-private\
   user-library-modify\
   user-library-read\
   user-read-private';

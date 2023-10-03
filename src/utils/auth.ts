import { NavigateFunction } from 'react-router-dom';
import { SCOPE } from '../config';
import { generateRandomString, generateUrlWithSearchParams } from './common';

const { VITE_CLIENT_ID: client_id, VITE_CLIENT_SECRET: clinet_secret } =
  import.meta.env;

const REDIRECT_URI = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/reroute`;

export const generateCodeChallenge = async (codeVerifier: string) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const initConnectToSpofity = async () => {
  const codeVerifier = generateRandomString(64);
  window.localStorage.setItem('code_verifier', codeVerifier);

  const code_challange = await generateCodeChallenge(codeVerifier);

  window.location.href = generateUrlWithSearchParams(
    'https://accounts.spotify.com/authorize',
    {
      client_id: import.meta.env.VITE_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      code_challenge_method: 'S256',
      code_challenge: code_challange,
    }
  );
};

export const getToken = async (code: string, navigate: NavigateFunction) => {
  const code_verifier = localStorage.getItem('code_verifier');

  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: client_id,
    code_verifier: code_verifier,
  };

  const targetUrl = generateUrlWithSearchParams(
    'https://accounts.spotify.com/api/token',
    data
  );

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: 'Basic ' + btoa(client_id + ':' + clinet_secret),
    },
  });

  const responseData = await response.json();

  if (response.status === 200) {
    window.localStorage.setItem('access_token', responseData.access_token);
    window.localStorage.setItem('refresh_token', responseData.refresh_token);
    console.log('got token');

    navigate('/connected');
  } else {
    console.log(responseData);

    console.log('I ERRORED and i will got o /');
  }
};

export const refreshToken = async (navigate: NavigateFunction) => {
  console.log('trying to refresh');

  const targetUrl = generateUrlWithSearchParams(
    'https://accounts.spotify.com/api/token',
    {
      grant_type: 'refresh_token',
      refresh_token: window.localStorage.getItem('refresh_token'),
      clinet_id: client_id,
    }
  );

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(client_id + ':' + clinet_secret),
    },
  });

  const responseData = await response.json();
  if (response.status === 200) {
    window.localStorage.setItem('access_token', responseData.access_token);
  } else {
    logout(navigate);
  }
};

export const logout = (navigate: NavigateFunction) => {
  window.localStorage.removeItem('access_token');
  window.localStorage.removeItem('refresh_token');
  window.localStorage.removeItem('code_verifier');
  navigate('/');
};

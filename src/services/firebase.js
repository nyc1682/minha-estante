import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { persistencia } from './persistencia';

const configuracao = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigurado = Object.values(configuracao).every((valor) => typeof valor === 'string' && valor.trim().length > 0);
let autenticacao = null;

export function obterAutenticacao() {
  if (!firebaseConfigurado) throw Object.assign(new Error('Configuração ausente.'), { code: 'auth/configuracao-ausente' });
  if (autenticacao) return autenticacao;
  const app = getApps().length ? getApp() : initializeApp(configuracao);
  try {
    autenticacao = initializeAuth(app, { persistence: persistencia });
  } catch (erro) {
    if (erro.code !== 'auth/already-initialized') throw erro;
    autenticacao = getAuth(app);
  }
  autenticacao.languageCode = 'pt';
  return autenticacao;
}

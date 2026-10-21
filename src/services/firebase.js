import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { sessaoSegura } from './sessaoSegura';

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
  autenticacao = initializeAuth(app, {
    persistence: Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(sessaoSegura),
  });
  autenticacao.languageCode = 'pt';
  return autenticacao;
}

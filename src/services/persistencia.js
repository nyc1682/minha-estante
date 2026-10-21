import { getReactNativePersistence } from 'firebase/auth';
import { sessaoSegura } from './sessaoSegura';

export const persistencia = getReactNativePersistence(sessaoSegura);

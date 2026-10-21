import App from '../../App';
import { useConta } from '../context/ContaContext';

export default function Estante() {
  const { usuario } = useConta();
  return <App key={usuario.uid} />;
}

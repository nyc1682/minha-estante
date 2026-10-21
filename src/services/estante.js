import AsyncStorage from '@react-native-async-storage/async-storage';
import { chaveEstante } from '../utils/conta';
import { lerObras } from '../utils/obras';

const CHAVE_ANTIGA = '@minha-estante/obras-v1';
const CHAVE_IMPORTACAO = '@minha-estante/importacao-legado-v1';

export async function lerEstante(uid) {
  const [texto, antiga, registro] = await Promise.all([
    AsyncStorage.getItem(chaveEstante(uid)), AsyncStorage.getItem(CHAVE_ANTIGA),
    AsyncStorage.getItem(CHAVE_IMPORTACAO),
  ]);
  const importacao = registro ? JSON.parse(registro) : null;
  const podeImportar = !importacao || (importacao.uid === uid && !importacao.concluida);
  return { obras: lerObras(texto), temLegado: podeImportar && antiga !== null && antiga !== '[]' };
}

export async function salvarEstante(uid, obras) {
  const texto = JSON.stringify(obras);
  lerObras(texto);
  await AsyncStorage.setItem(chaveEstante(uid), texto);
}

export async function importarEstanteAntiga(uid, obrasAtuais) {
  const chave = chaveEstante(uid);
  const textoRegistro = await AsyncStorage.getItem(CHAVE_IMPORTACAO);
  const registro = textoRegistro ? JSON.parse(textoRegistro) : null;
  if (registro && registro.uid !== uid) throw new Error('A estante antiga já foi vinculada a outra conta.');
  if (registro?.concluida) throw new Error('A estante antiga já foi importada.');
  const antigas = lerObras(await AsyncStorage.getItem(CHAVE_ANTIGA));
  const mescladas = [...new Map([...antigas, ...obrasAtuais].map((obra) => [obra.id, obra])).values()];
  // Reservamos o legado para esta conta antes de copiar. Uma falha pode ser retomada por ela.
  await AsyncStorage.setItem(CHAVE_IMPORTACAO, JSON.stringify({ uid, concluida: false }));
  await AsyncStorage.setItem(chave, JSON.stringify(mescladas));
  await AsyncStorage.setItem(CHAVE_IMPORTACAO, JSON.stringify({ uid, concluida: true }));
  return mescladas;
}

import * as SecureStore from 'expo-secure-store';

// O Firebase persiste tokens de sessão; nenhuma senha é guardada aqui.
// Dividimos o JSON em partes pequenas para respeitar os limites do cofre nativo.
function chaveSegura(chave) {
  return `firebase-${Array.from(chave).map((letra) => letra.codePointAt(0).toString(16)).join('-')}`;
}

async function lerIndice(chave) {
  const texto = await SecureStore.getItemAsync(chave);
  if (!texto) return null;
  const indice = JSON.parse(texto);
  if (indice.versao !== 1 || !/^[a-z0-9-]+$/.test(indice.geracao)
    || !Number.isInteger(indice.partes) || indice.partes < 1 || indice.partes > 200) {
    throw new Error('Sessão armazenada inválida.');
  }
  return indice;
}

async function removerPartes(chave, indice) {
  if (!indice) return;
  await Promise.allSettled(Array.from({ length: indice.partes }, (_, numero) =>
    SecureStore.deleteItemAsync(`${chave}-${indice.geracao}-${numero}`)));
}

export const sessaoSegura = {
  async getItem(chave) {
    const base = chaveSegura(chave);
    const indice = await lerIndice(base);
    if (!indice) return null;
    const partes = await Promise.all(Array.from({ length: indice.partes }, (_, numero) =>
      SecureStore.getItemAsync(`${base}-${indice.geracao}-${numero}`)));
    return partes.some((parte) => parte === null) ? null : partes.join('');
  },
  async setItem(chave, valor) {
    const base = chaveSegura(chave);
    const anterior = await lerIndice(base);
    const partes = valor.match(/[\s\S]{1,400}/g) ?? [''];
    if (partes.length > 200) throw new Error('Sessão maior que o limite de armazenamento.');
    const indice = { versao: 1, geracao: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, partes: partes.length };
    try {
      for (let numero = 0; numero < partes.length; numero++) {
        await SecureStore.setItemAsync(`${base}-${indice.geracao}-${numero}`, partes[numero]);
      }
      await SecureStore.setItemAsync(base, JSON.stringify(indice));
    } catch (erro) {
      await removerPartes(base, indice);
      throw erro;
    }
    await removerPartes(base, anterior);
  },
  async removeItem(chave) {
    const base = chaveSegura(chave);
    const indice = await lerIndice(base);
    await SecureStore.deleteItemAsync(base);
    await removerPartes(base, indice);
  },
};

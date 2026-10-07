import { Directory, File, Paths } from 'expo-file-system';

export async function guardarCapa(uri) {
  const pasta = new Directory(Paths.document, 'capas');
  pasta.create({ idempotent: true, intermediates: true });
  const extensao = uri.split(/[?#]/)[0].match(/\.(jpe?g|png|webp|heic|heif|avif|gif|bmp)$/i)?.[1] ?? 'jpg';
  const nome = `capa-${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`;
  const destino = new File(pasta, nome);
  try {
    await new File(uri).copy(destino);
  } catch (erro) {
    apagarCapa(destino.uri);
    throw erro;
  }
  return destino.uri;
}

export function apagarCapa(uri) {
  if (!uri) return;
  try {
    const pasta = new Directory(Paths.document, 'capas');
    const prefixo = `${pasta.uri.replace(/\/$/, '')}/`;
    if (!uri.startsWith(prefixo)) return;
    const nome = uri.slice(prefixo.length);
    if (!/^capa-\d+-[a-z0-9]+\.(jpe?g|png|webp|heic|heif|avif|gif|bmp)$/i.test(nome)) return;
    const arquivo = new File(uri);
    if (arquivo.exists) arquivo.delete();
  } catch {
    // Uma falha de limpeza não desfaz o cadastro já salvo.
  }
}

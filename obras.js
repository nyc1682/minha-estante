export const STATUS = [
  { valor: 'lendo', texto: 'Lendo' },
  { valor: 'quero-ler', texto: 'Quero ler' },
  { valor: 'concluido', texto: 'Já li' },
  { valor: 'pausado', texto: 'Pausado' },
];

export const TIPOS = [
  { valor: 'manga', texto: 'Mangá' },
  { valor: 'manhwa', texto: 'Manhwa' },
];

export function validarCadastro(titulo, capitulo) {
  if (!titulo.trim()) return 'Digite o nome da obra.';
  const texto = capitulo.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(texto) || !Number.isFinite(Number(texto))) {
    return 'Informe um capítulo válido, como 0, 12 ou 12,5.';
  }
  return null;
}

export function lerObras(texto) {
  if (texto === null) return [];
  const obras = JSON.parse(texto);
  const ids = new Set();
  if (!Array.isArray(obras) || !obras.every((obra) => {
    if (!obra || typeof obra.id !== 'string' || ids.has(obra.id)) return false;
    ids.add(obra.id);
    return typeof obra.titulo === 'string' && obra.titulo.trim().length > 0
      && TIPOS.some((tipo) => tipo.valor === obra.tipo)
      && STATUS.some((status) => status.valor === obra.status)
      && Number.isFinite(obra.capitulo) && obra.capitulo >= 0;
  })) {
    throw new Error('Dados da estante inválidos.');
  }
  return obras;
}

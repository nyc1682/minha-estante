export const STATUS = [
  { valor: 'lendo', texto: 'Lendo' },
  { valor: 'quero-ler', texto: 'Quero ler' },
  { valor: 'concluido', texto: 'Já li' },
];

export const TIPOS = [
  { valor: 'manga', texto: 'Mangá' },
  { valor: 'manhwa', texto: 'Manhwa' },
  { valor: 'livro', texto: 'Livro' },
];

export const UNIDADES = [
  { valor: 'capitulo', texto: 'Capítulos' },
  { valor: 'pagina', texto: 'Páginas' },
];

export function validarCadastro(titulo, progresso, unidade = 'capitulo') {
  if (!titulo.trim()) return 'Digite o nome da obra.';
  const texto = progresso.trim().replace(',', '.');
  const numero = Number(texto);
  if (!/^\d+(\.\d+)?$/.test(texto) || !Number.isFinite(numero) || numero > Number.MAX_SAFE_INTEGER) {
    return 'Informe um progresso válido, como 0 ou 12.';
  }
  if (unidade === 'pagina' && !Number.isSafeInteger(numero)) {
    return 'Informe uma página inteira, como 0 ou 12.';
  }
  return null;
}

export function lerObras(texto) {
  if (texto === null) return [];
  const dados = JSON.parse(texto);
  if (!Array.isArray(dados)) throw new Error('Dados da estante inválidos.');
  const obras = dados.map((obra) => {
    if (!obra || typeof obra !== 'object') throw new Error('Obra inválida.');
    return {
      id: obra.id, titulo: obra.titulo, tipo: obra.tipo,
      status: obra.status === 'pausado' ? 'lendo' : obra.status,
      progresso: obra.progresso !== undefined ? obra.progresso : obra.capitulo,
      unidade: obra.unidade ?? (obra.tipo === 'livro' ? 'pagina' : 'capitulo'),
      capa: typeof obra.capa === 'string' && obra.capa.startsWith('file://') ? obra.capa : null,
    };
  });
  const ids = new Set();
  if (!Array.isArray(obras) || !obras.every((obra) => {
    if (typeof obra.id !== 'string' || !obra.id.trim() || ids.has(obra.id)) return false;
    ids.add(obra.id);
    return typeof obra.titulo === 'string' && obra.titulo.trim().length > 0
      && TIPOS.some((tipo) => tipo.valor === obra.tipo)
      && STATUS.some((status) => status.valor === obra.status)
      && UNIDADES.some((unidade) => unidade.valor === obra.unidade)
      && Number.isFinite(obra.progresso) && obra.progresso >= 0
      && obra.progresso <= Number.MAX_SAFE_INTEGER
      && (obra.unidade !== 'pagina' || Number.isSafeInteger(obra.progresso));
  })) {
    throw new Error('Dados da estante inválidos.');
  }
  return obras;
}

export function atualizarLista(obras, obra, editandoId) {
  if (editandoId === null) return [obra, ...obras];
  if (!obras.some((item) => item.id === editandoId)) throw new Error('Obra não encontrada.');
  return obras.map((item) => item.id === editandoId ? { ...obra, id: item.id } : item);
}

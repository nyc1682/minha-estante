export const STATUS = [
  { valor: 'lendo', texto: 'Lendo' },
  { valor: 'quero-ler', texto: 'Quero ler' },
  { valor: 'concluido', texto: 'Terminei' },
];

export const TIPOS = [
  { valor: 'manga', texto: 'Mangá' },
  { valor: 'manhwa', texto: 'Manhwa' },
  { valor: 'livro', texto: 'Livro' },
  { valor: 'filme', texto: 'Filme' },
  { valor: 'serie', texto: 'Série' },
];

export const UNIDADES = [
  { valor: 'capitulo', texto: 'Capítulos' },
  { valor: 'pagina', texto: 'Páginas' },
  { valor: 'minuto', texto: 'Minutos' },
  { valor: 'episodio', texto: 'Episódios' },
];

export function unidadePadrao(tipo) {
  return { livro: 'pagina', filme: 'minuto', serie: 'episodio' }[tipo] ?? 'capitulo';
}

export function opcoesStatus(tipo) {
  const audiovisual = tipo === 'filme' || tipo === 'serie';
  return STATUS.map((item) => ({
    ...item,
    texto: audiovisual && item.valor === 'lendo' ? 'Assistindo'
      : audiovisual && item.valor === 'quero-ler' ? 'Quero assistir' : item.texto,
  }));
}

export function opcoesUnidades(tipo) {
  const permitidas = tipo === 'filme' ? ['minuto']
    : tipo === 'serie' ? ['episodio', 'minuto'] : ['capitulo', 'pagina'];
  return UNIDADES.filter((item) => permitidas.includes(item.valor));
}

export function rotuloProgresso(unidade) {
  return {
    capitulo: 'Último capítulo lido', pagina: 'Última página lida',
    minuto: 'Minutos assistidos', episodio: 'Último episódio assistido',
  }[unidade];
}

export function validarCadastro(titulo, progresso, unidade = 'capitulo') {
  if (!titulo.trim()) return 'Digite o nome da obra.';
  const texto = progresso.trim().replace(',', '.');
  const numero = Number(texto);
  if (!/^\d+(\.\d+)?$/.test(texto) || !Number.isFinite(numero) || numero > Number.MAX_SAFE_INTEGER) {
    return 'Informe um progresso válido, como 0 ou 12.';
  }
  if (['pagina', 'episodio'].includes(unidade) && !Number.isSafeInteger(numero)) {
    return 'Informe um número inteiro, como 0 ou 12.';
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
      unidade: obra.unidade ?? unidadePadrao(obra.tipo),
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
      && (!['pagina', 'episodio'].includes(obra.unidade) || Number.isSafeInteger(obra.progresso));
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

export function filtrarObras(obras, secao, busca = '') {
  const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const consulta = normalizar(busca.trim());
  return obras.filter((obra) => (secao === 'todos' || obra.status === secao)
    && normalizar(obra.titulo).includes(consulta));
}

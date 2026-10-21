# Etapa 6 — Menu lateral, filmes e séries

Abra esta pasta no VS Code: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante

## Resultado desta etapa

O botão ☰ Menu abre uma aba pela esquerda. Ao escolher uma opção, ela fecha e a tela mostra somente aquele conteúdo. O menu também fecha pelo ×, por um toque fora dele ou pelo botão Voltar do Android.

O cadastro agora oferece Mangá, Manhwa, Livro, Filme e Série. Filmes acompanham minutos; séries acompanham episódios ou minutos. Leituras continuam com páginas ou capítulos. As listas mantêm os tópicos dos cinco tipos e suas quantidades.

Os dados anteriores e as capas são preservados. Os status salvos continuam sendo lendo, quero-ler e concluido, mas filmes e séries mostram Assistindo e Quero assistir. Trocar o tipo ou a unidade reinicia o campo de progresso em 0 para evitar tratar páginas como minutos, por exemplo. Tocar na opção já selecionada mantém o valor.

## Conceitos usados

- **Componente:** MenuLateral é uma função React responsável pelo menu. App passa informações e funções através de props, como aoSelecionar.
- **Estado (useState):** menuAberto guarda se o menu está visível; secaoAberta guarda qual conteúdo mostrar. Ao mudar o estado, o React atualiza a tela.
- **Renderização condicional:** a expressão secaoAberta === 'cadastro' decide se o formulário aparece. Nas outras opções, aparece somente a lista filtrada.
- **filter:** cria uma lista contendo apenas as obras com o status selecionado. Depois ListaObras separa essa lista pelos tipos.
- **map:** transforma as opções em botões e as obras em cartões. Cada item usa uma key estável.
- **Animated.Value:** guarda a posição horizontal do menu. Animated.timing muda essa posição ao longo de alguns milissegundos, usando translateX.
- **Callback:** uma função recebida por outro componente. O menu chama aoSelecionar depois de terminar a animação de fechamento.
- **useRef:** fechando guarda um bloqueio temporário para evitar que vários toques disparem o fechamento ao mesmo tempo. Mudar essa referência não redesenha a tela.

## Como testar no Android

No terminal integrado do VS Code, dentro da pasta minha-estante acima, execute:

```powershell
npm.cmd start
```

Esse comando inicia o Expo e mostra o QR code. Se o servidor já estiver aberto, pressione r no terminal para recarregar. Abra o projeto no Expo Go com computador e celular na mesma rede Wi-Fi. Não há dependências novas para instalar nesta etapa.

1. Confira que a primeira tela é Todos e que não há os antigos blocos de abrir e fechar.
2. Toque em ☰ Menu: a aba deve entrar pela esquerda. Teste fechar pelo ×, tocando fora e usando Voltar no Android.
3. Escolha Cadastrar novo item. O menu deve fechar e mostrar somente o formulário.
4. Cadastre um Filme, em Assistindo, com 30 minutos. Ele deve aparecer em Lendo / assistindo, no tópico Filmes.
5. Cadastre uma Série, em Quero assistir, com 0 episódios. Ela deve aparecer em Quero ler / assistir, no tópico Séries.
6. Edite a série: mude para Terminei e coloque 12 episódios. Ela deve aparecer em Terminei sem duplicar o cadastro. Episódios fracionados devem mostrar um aviso.
7. Escolha Todos e confira também os livros, mangás e manhwas antigos, com seus progressos e capas.
8. Comece uma edição, troque a categoria pelo menu e volte a Continuar edição: os campos devem ser mantidos. Cancelar edição deve descartar o rascunho.
9. Feche e reabra o projeto para conferir os cadastros salvos.

O GitHub guarda o código; para visualizar esta alteração no celular, recarregue o projeto local no Expo Go. O teste de desenvolvimento usa o computador, mas os cadastros e as capas são locais. Uma versão instalável fica para uma etapa posterior.

## Verificação realizada

Análise ESLint, geração do pacote JavaScript Android e verificações das regras dos cinco tipos, dados antigos, unidades, status, validação, edição sem duplicação e leitura após serialização JSON. A animação e os controles nativos precisam da sua confirmação no celular físico.

## Documentação consultada

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Animated no React Native 0.86](https://reactnative.dev/docs/0.86/animated)
- [Modal no React Native 0.86](https://reactnative.dev/docs/0.86/modal)

## Código completo dos arquivos criados ou alterados

Os caminhos abaixo são relativos à pasta minha-estante. Não precisa copiar: os arquivos já foram alterados no projeto. Secao.js continua como referência da etapa anterior, sem uso na tela atual.

### MenuLateral.js

Caminho: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante\MenuLateral.js

```javascript
import { useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MenuLateral({ aberto, aoFechar, aoSelecionar, selecionado, opcoes }) {
  const { width } = useWindowDimensions();
  const largura = Math.min(340, width * 0.86);
  const [deslocamento] = useState(() => new Animated.Value(-340));
  const fechando = useRef(false);

  function abrir() {
    fechando.current = false;
    deslocamento.setValue(-largura);
    Animated.timing(deslocamento, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }

  function fechar(valor) {
    if (fechando.current) return;
    fechando.current = true;
    Animated.timing(deslocamento, { toValue: -largura, duration: 180, useNativeDriver: true })
      .start(({ finished }) => {
        if (!finished) return;
        aoFechar();
        if (valor !== undefined) aoSelecionar(valor);
      });
  }

  return (
    <Modal visible={aberto} transparent animationType="none" onShow={abrir}
      onRequestClose={() => fechar()} statusBarTranslucent>
      <SafeAreaProvider>
        <View style={styles.fundo}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button"
            accessibilityLabel="Fechar menu" onPress={() => fechar()} />
          <Animated.View style={[styles.painel, { width: largura, transform: [{ translateX: deslocamento }] }]}>
            <SafeAreaView style={styles.area}>
              <ScrollView contentContainerStyle={styles.conteudo}>
                <View style={styles.cabecalho}>
                  <Text style={styles.titulo} accessibilityRole="header">Minha Estante</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu"
                    onPress={() => fechar()} style={styles.fechar}>
                    <Text style={styles.icone}>×</Text>
                  </Pressable>
                </View>
                <Text style={styles.ajuda}>Escolha o que deseja ver</Text>
                {opcoes.map((opcao) => (
                  <Pressable key={opcao.valor} accessibilityRole="button"
                    accessibilityState={{ selected: selecionado === opcao.valor }}
                    onPress={() => fechar(opcao.valor)}
                    style={({ pressed }) => [styles.opcao,
                      selecionado === opcao.valor && styles.selecionada, pressed && styles.pressionada]}>
                    <Text style={styles.texto}>{opcao.texto}</Text>
                    {opcao.total !== undefined && <Text style={styles.total}>{opcao.total}</Text>}
                  </Pressable>
                ))}
                <Text style={styles.ajuda}>Livros, mangás, manhwas, filmes e séries.</Text>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  painel: { height: '100%', backgroundColor: '#171A23' },
  area: { flex: 1 },
  conteudo: { padding: 20, gap: 16, paddingBottom: 32 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { flex: 1, color: '#F5F6FA', fontSize: 24, fontWeight: '700' },
  fechar: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  icone: { color: '#E4DBFF', fontSize: 32 },
  ajuda: { color: '#AAB1C1', fontSize: 15, lineHeight: 23 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    minHeight: 56, borderWidth: 1, borderColor: '#353B4B', borderRadius: 14, backgroundColor: '#1B1F2A' },
  selecionada: { borderColor: '#B8A7FF', backgroundColor: '#302742' },
  pressionada: { opacity: 0.6 },
  texto: { flex: 1, color: '#F5F6FA', fontSize: 17, fontWeight: '600' },
  total: { color: '#B8A7FF', fontSize: 16 },
});

```

### obras.js

Caminho: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante\obras.js

```javascript
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

```

### ListaObras.js

Caminho: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante\ListaObras.js

```javascript
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Capa from './Capa';
import { opcoesStatus, rotuloProgresso } from './obras';

const GRUPOS = [
  { valor: 'livro', texto: 'Livros' },
  { valor: 'manga', texto: 'Mangás' },
  { valor: 'manhwa', texto: 'Manhwas' },
  { valor: 'filme', texto: 'Filmes' },
  { valor: 'serie', texto: 'Séries' },
];

export default function ListaObras({ obras, aoEditar, ocupado }) {
  return (
    <View style={styles.lista}>
      {GRUPOS.map((grupo) => {
        const itens = obras.filter((obra) => obra.tipo === grupo.valor);
        return (
          <View key={grupo.valor} style={styles.grupo}>
            <Text style={styles.topico} accessibilityRole="header">{grupo.texto} ({itens.length})</Text>
            {itens.length === 0 && <Text style={styles.vazio}>Nenhuma obra neste tópico.</Text>}
            {itens.map((obra) => (
              <View key={obra.id} style={styles.cartao}>
                <View style={styles.linha}>
                  <Capa uri={obra.capa} titulo={obra.titulo} />
                  <View style={styles.dados}>
                    <Text style={styles.titulo}>{obra.titulo}</Text>
                    <Text style={styles.status}>{opcoesStatus(obra.tipo).find((item) => item.valor === obra.status).texto}</Text>
                    <Text style={styles.descricao}>
                      {rotuloProgresso(obra.unidade)}: {String(obra.progresso).replace('.', ',')}
                    </Text>
                  </View>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${obra.titulo}`}
                  disabled={ocupado} onPress={() => aoEditar(obra)}
                  style={({ pressed }) => [styles.editar, (pressed || ocupado) && styles.atenuado]}>
                  <Text style={styles.textoEditar}>Editar obra</Text>
                </Pressable>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 24 },
  grupo: { gap: 12 },
  topico: { color: '#E4DBFF', fontSize: 20, fontWeight: '700' },
  vazio: { color: '#AAB1C1', fontSize: 15, lineHeight: 23 },
  cartao: { borderWidth: 1, borderColor: '#353B4B', borderRadius: 12, padding: 12, gap: 12, backgroundColor: '#1B1F2A' },
  linha: { flexDirection: 'row', gap: 12 },
  dados: { flex: 1, minWidth: 0, gap: 8 },
  titulo: { color: '#F5F6FA', fontSize: 20, fontWeight: '600' },
  status: { color: '#B8A7FF', fontSize: 14, fontWeight: '700' },
  descricao: { color: '#C4C8D4', fontSize: 16, lineHeight: 24 },
  editar: { borderWidth: 1, borderColor: '#B8A7FF', padding: 14, borderRadius: 12, alignItems: 'center' },
  textoEditar: { color: '#E4DBFF', fontSize: 16, fontWeight: '600' },
  atenuado: { opacity: 0.6 },
});

```

### App.js

Caminho: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante\App.js

```javascript
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import {
  Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Opcoes from './Opcoes';
import MenuLateral from './MenuLateral';
import ListaObras from './ListaObras';
import Capa from './Capa';
import { apagarCapa, guardarCapa } from './capas';
import { atualizarLista, lerObras, opcoesStatus, opcoesUnidades, rotuloProgresso,
  TIPOS, unidadePadrao, validarCadastro } from './obras';

const CHAVE_ESTANTE = '@minha-estante/obras-v1';
const SECOES = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'concluido', texto: 'Terminei' },
  { valor: 'lendo', texto: 'Lendo / assistindo' },
  { valor: 'quero-ler', texto: 'Quero ler / assistir' },
];

export default function App() {
  const [obras, setObras] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('manga');
  const [status, setStatus] = useState('lendo');
  const [progresso, setProgresso] = useState('0');
  const [unidade, setUnidade] = useState('capitulo');
  const [editandoId, setEditandoId] = useState(null);
  const [capa, setCapa] = useState(null);
  const [escolhendoCapa, setEscolhendoCapa] = useState(false);
  const [secaoAberta, setSecaoAberta] = useState('todos');
  const [menuAberto, setMenuAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [pronto, setPronto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const bloqueio = useRef(false);
  const rolagem = useRef(null);
  const seletorAberto = useRef(false);

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(CHAVE_ESTANTE)
      .then((texto) => {
        const salvas = lerObras(texto);
        if (ativo) {
          setObras(salvas);
          setPronto(true);
          setMensagem('');
        }
      })
      .catch(() => {
        if (ativo) setMensagem('Não foi possível carregar sua estante. Tente novamente.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  function tentarCarregar() {
    setCarregando(true);
    setPronto(false);
    setTentativa((anterior) => anterior + 1);
  }

  function selecionarTipo(novoTipo) {
    if (novoTipo === tipo) return;
    setTipo(novoTipo);
    setUnidade(unidadePadrao(novoTipo));
    setProgresso('0');
  }

  function selecionarSecao(secao) {
    if (bloqueio.current || seletorAberto.current) return;
    setSecaoAberta(secao);
    if (pronto) setMensagem('');
    Keyboard.dismiss();
    rolagem.current?.scrollTo({ y: 0, animated: false });
  }

  function editarObra(obra) {
    if (bloqueio.current || seletorAberto.current) return;
    setEditandoId(obra.id);
    setTitulo(obra.titulo);
    setTipo(obra.tipo);
    setStatus(obra.status);
    setProgresso(String(obra.progresso).replace('.', ','));
    setUnidade(obra.unidade);
    setCapa(obra.capa);
    setMensagem('');
    setSecaoAberta('cadastro');
    rolagem.current?.scrollTo({ y: 0, animated: true });
  }

  function cancelarEdicao() {
    if (bloqueio.current || seletorAberto.current) return;
    setEditandoId(null);
    setTitulo('');
    setTipo('manga');
    setStatus('lendo');
    setProgresso('0');
    setUnidade('capitulo');
    setCapa(null);
    setMensagem('');
    setSecaoAberta('todos');
    Keyboard.dismiss();
  }

  async function escolherCapa() {
    if (bloqueio.current || seletorAberto.current) return;
    seletorAberto.current = true;
    setEscolhendoCapa(true);
    setMensagem('');
    Keyboard.dismiss();
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [2, 3], quality: 0.75,
      });
      if (!resultado.canceled && resultado.assets?.[0]?.uri) {
        setCapa(resultado.assets[0].uri);
      }
    } catch {
      setMensagem('Não foi possível abrir a imagem. Tente escolher outra capa.');
    } finally {
      seletorAberto.current = false;
      setEscolhendoCapa(false);
    }
  }

  async function salvarObra() {
    if (!pronto || bloqueio.current || seletorAberto.current) return;
    const erro = validarCadastro(titulo, progresso, unidade);
    if (erro) {
      setMensagem(erro);
      return;
    }
    bloqueio.current = true;
    setSalvando(true);
    setMensagem('');
    const novaObra = {
      id: editandoId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      titulo: titulo.trim(), tipo, status,
      progresso: Number(progresso.trim().replace(',', '.')), unidade,
      capa,
    };
    const capaAnterior = obras.find((obra) => obra.id === editandoId)?.capa ?? null;
    let capaCopiada = null;
    try {
      if (capa && capa !== capaAnterior) {
        capaCopiada = await guardarCapa(capa);
        novaObra.capa = capaCopiada;
      }
      const novasObras = atualizarLista(obras, novaObra, editandoId);
      await AsyncStorage.setItem(CHAVE_ESTANTE, JSON.stringify(novasObras));
      setObras(novasObras);
      setTitulo('');
      setProgresso('0');
      setEditandoId(null);
      setCapa(null);
      setSecaoAberta(novaObra.status);
      setMensagem(`${novaObra.titulo}: ${editandoId === null ? 'cadastro adicionado' : 'alterações salvas'}.`);
      Keyboard.dismiss();
      if (capaAnterior && capaAnterior !== novaObra.capa) apagarCapa(capaAnterior);
    } catch {
      apagarCapa(capaCopiada);
      setMensagem('Não foi possível salvar. Seus campos foram mantidos; tente novamente.');
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  }

  const ocupado = salvando || escolhendoCapa;
  const itensVisiveis = obras.filter((obra) => secaoAberta === 'todos' || obra.status === secaoAberta);
  const opcoesMenu = [
    { valor: 'cadastro', texto: editandoId === null ? 'Cadastrar novo item' : 'Continuar edição' },
    ...SECOES.map((secao) => ({ ...secao,
      total: obras.filter((obra) => secao.valor === 'todos' || obra.status === secao.valor).length })),
  ];
  const nomeSecao = secaoAberta === 'cadastro'
    ? editandoId === null ? 'Cadastrar novo item' : 'Editar item'
    : SECOES.find((secao) => secao.valor === secaoAberta).texto;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.tela}>
        <StatusBar style="light" />
        <View style={styles.cabecalho}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir menu"
            accessibilityState={{ expanded: menuAberto, disabled: ocupado }} disabled={ocupado}
            onPress={() => { Keyboard.dismiss(); setMenuAberto(true); }}
            style={({ pressed }) => [styles.botaoMenu, (pressed || ocupado) && styles.atenuado]}>
            <Text style={styles.textoSecundario}>☰ Menu</Text>
          </Pressable>
          <Text style={styles.marca}>Minha Estante</Text>
        </View>
        <MenuLateral aberto={menuAberto} aoFechar={() => setMenuAberto(false)}
          aoSelecionar={selecionarSecao} selecionado={secaoAberta} opcoes={opcoesMenu} />
        <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={rolagem} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text style={styles.etiqueta}>LEITURAS, FILMES E SÉRIES</Text>
            <Text style={styles.titulo} accessibilityRole="header">{nomeSecao}</Text>
            {secaoAberta !== 'cadastro' && <Text style={styles.descricao}>{itensVisiveis.length} obra(s) nesta categoria</Text>}

            {secaoAberta === 'cadastro' && (
            <View style={styles.cartao}>
              <Text style={styles.subtitulo} accessibilityRole="header">
                {editandoId === null ? 'Adicionar obra' : 'Editar obra'}
              </Text>
              {editandoId !== null && <Text style={styles.ajuda}>Altere os campos e toque em Salvar alterações.</Text>}
              <Text style={styles.rotulo}>Nome da obra</Text>
              <TextInput
                accessibilityLabel="Nome da obra" style={styles.campo}
                value={titulo} onChangeText={setTitulo} placeholder="Ex.: Solo Leveling"
                placeholderTextColor="#AAB1C1" maxLength={150} editable={!ocupado}
              />
              <Text style={styles.rotulo}>Capa da obra (opcional)</Text>
              <View style={styles.linhaCapa}>
                <Capa uri={capa} titulo={titulo} grande />
                <View style={styles.dadosObra}>
                  <Pressable accessibilityRole="button" disabled={ocupado} onPress={escolherCapa}
                    style={({ pressed }) => [styles.secundario, (pressed || ocupado) && styles.atenuado]}>
                    <Text style={styles.textoSecundario}>
                      {escolhendoCapa ? 'Abrindo galeria…' : capa ? 'Trocar capa' : 'Escolher capa'}
                    </Text>
                  </Pressable>
                  {capa && (
                    <Pressable accessibilityRole="button" disabled={ocupado} onPress={() => setCapa(null)}
                      style={({ pressed }) => [styles.secundario, (pressed || ocupado) && styles.atenuado]}>
                      <Text style={styles.textoSecundario}>Remover capa</Text>
                    </Pressable>
                  )}
                </View>
              </View>
              <Text style={styles.ajuda}>Escolha uma imagem da galeria. A capa será guardada ao salvar a obra.</Text>
              <Text style={styles.rotulo}>Tipo</Text>
              <Opcoes grupo="Tipo" opcoes={TIPOS} valor={tipo} aoSelecionar={selecionarTipo} desabilitado={ocupado} />
              <Text style={styles.rotulo}>Status</Text>
              <Opcoes grupo="Status" opcoes={opcoesStatus(tipo)} valor={status} aoSelecionar={setStatus} desabilitado={ocupado} />
              <Text style={styles.rotulo}>Acompanhar por</Text>
              <Opcoes grupo="Progresso" opcoes={opcoesUnidades(tipo)} valor={unidade}
                aoSelecionar={(novaUnidade) => {
                  if (novaUnidade === unidade) return;
                  setUnidade(novaUnidade); setProgresso('0');
                }} desabilitado={ocupado} />
              <Text style={styles.rotulo}>{rotuloProgresso(unidade)}</Text>
              <TextInput
                accessibilityLabel={rotuloProgresso(unidade)} style={styles.campo}
                value={progresso} onChangeText={setProgresso} keyboardType={['pagina', 'episodio'].includes(unidade) ? 'number-pad' : 'decimal-pad'}
                maxLength={12} editable={!ocupado} selectTextOnFocus
              />
              <Text style={styles.ajuda}>Use 0 se ainda não começou. Trocar o tipo ou a unidade reinicia este campo.</Text>
              <Pressable
                accessibilityRole="button" disabled={!pronto || ocupado}
                accessibilityState={{ disabled: !pronto || ocupado }}
                onPress={salvarObra}
                style={({ pressed }) => [styles.adicionar, (!pronto || ocupado || pressed) && styles.atenuado]}
              >
                <Text style={styles.textoBotao}>
                  {salvando ? 'Salvando…' : editandoId === null ? 'Adicionar à estante' : 'Salvar alterações'}
                </Text>
              </Pressable>
              {editandoId !== null && (
                <Pressable accessibilityRole="button" disabled={ocupado} onPress={cancelarEdicao}
                  style={({ pressed }) => [styles.secundario, (pressed || ocupado) && styles.atenuado]}>
                  <Text style={styles.textoSecundario}>Cancelar edição</Text>
                </Pressable>
              )}
            </View>
            )}

            {mensagem !== '' && <Text style={styles.mensagem} accessibilityLiveRegion="polite">{mensagem}</Text>}
            {carregando && <Text style={styles.descricao}>Carregando sua estante…</Text>}
            {!carregando && !pronto && (
              <Pressable accessibilityRole="button" style={styles.adicionar} onPress={tentarCarregar}>
                <Text style={styles.textoBotao}>Tentar carregar novamente</Text>
              </Pressable>
            )}
            {pronto && secaoAberta !== 'cadastro' && (
              <ListaObras obras={itensVisiveis} aoEditar={editarObra} ocupado={ocupado} />
            )}
            <Text style={styles.ajuda}>Seus cadastros ficam salvos neste celular.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#101218' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#353B4B' },
  botaoMenu: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#B8A7FF', borderRadius: 12 },
  marca: { flex: 1, color: '#F5F6FA', fontSize: 22, fontWeight: '700' },
  conteudo: { padding: 24, paddingBottom: 40, gap: 16 },
  etiqueta: { color: '#B8A7FF', fontSize: 14, fontWeight: '700' },
  titulo: { color: '#F5F6FA', fontSize: 32, fontWeight: '700' },
  descricao: { color: '#C4C8D4', fontSize: 17, lineHeight: 26 },
  cartao: {
    backgroundColor: '#1B1F2A', borderRadius: 16, padding: 20,
    gap: 12, borderWidth: 1, borderColor: '#353B4B',
  },
  subtitulo: { color: '#F5F6FA', fontSize: 22, fontWeight: '600' },
  rotulo: { color: '#F5F6FA', fontSize: 16, fontWeight: '600', marginTop: 4 },
  campo: {
    color: '#F5F6FA', fontSize: 17, backgroundColor: '#101218',
    borderWidth: 1, borderColor: '#69748B', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 52,
  },
  ajuda: { color: '#AAB1C1', fontSize: 14, lineHeight: 22 },
  adicionar: { backgroundColor: '#B8A7FF', padding: 16, borderRadius: 12, alignItems: 'center' },
  textoBotao: { color: '#161021', fontSize: 17, fontWeight: '700' },
  secundario: { borderWidth: 1, borderColor: '#B8A7FF', padding: 14, borderRadius: 12, alignItems: 'center' },
  textoSecundario: { color: '#E4DBFF', fontSize: 16, fontWeight: '600' },
  atenuado: { opacity: 0.6 },
  mensagem: { color: '#E4DBFF', fontSize: 16, lineHeight: 24 },
  linhaCapa: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  dadosObra: { flex: 1, minWidth: 0, gap: 12 },
});

```

### README.md

Caminho: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante\README.md

````markdown
# Minha Estante

App para organizar mangás, manhwas, livros, filmes e séries, desenvolvido em JavaScript, React Native e Expo.

## Etapa atual

Etapa 6: menu lateral que desliza da esquerda para a direita ao tocar em ☰ Menu.
O menu fecha ao escolher uma opção, tocar fora, tocar em × ou usar Voltar no Android.
Opções: Cadastrar novo item, Todos, Terminei, Lendo / assistindo e Quero ler / assistir.
A tela mostra somente o conteúdo escolhido; a opção inicial é Todos.
Cada lista mostra os tópicos Livros, Mangás, Manhwas, Filmes e Séries com suas quantidades.
Tipos: Mangá, Manhwa, Livro, Filme e Série.
Leituras usam Lendo / Quero ler; filmes e séries usam Assistindo / Quero assistir.
Terminei vale para todos. Os valores salvos dos status continuam compatíveis com as versões anteriores.
Leituras acompanham capítulos ou páginas; filmes, minutos; séries, episódios ou minutos.
Páginas e episódios aceitam inteiros. Trocar tipo ou unidade reinicia o campo de progresso em 0.
Toque em Editar obra, altere os campos e salve, ou cancele para descartar o rascunho.
Escolha no menu o status desejado e encontre as obras pelo tópico de tipo.
Ao editar uma obra, o formulário abre automaticamente. Ao salvar, abre sua categoria.
Trocar de opção no menu preserva os campos; Cancelar edição descarta o rascunho e mostra Todos.
Os dados ficam salvos no celular.
Cadastros antigos em Pausado aparecem como Lendo, mantendo o progresso.
Escolha uma capa opcional da galeria, veja a prévia e salve a obra.
Uma cópia da imagem fica guardada no celular e aparece ao lado do título na lista.
Na edição, você pode trocar ou remover a capa; cancelar mantém a imagem salva.
Obras antigas continuam funcionando sem capa. Não há busca automática nesta etapa.
Exclusão e busca serão adicionadas após confirmar o teste desta etapa.

## Abrir no Windows

Instale o Node.js LTS de https://nodejs.org/en/download e reabra o VS Code.
Abra esta pasta pelo menu Arquivo > Abrir Pasta.
No terminal integrado, dentro desta pasta, execute:

```powershell
npm.cmd ci
npm.cmd start
```

`ci` instala as versões registradas no package-lock.json.
`start` inicia o servidor de desenvolvimento e mostra um QR code.
Usamos `.cmd` para evitar bloqueios de scripts PowerShell no Windows.

## Testar no Android

Instale o Expo Go: https://expo.dev/go.
Conecte o computador e o celular à mesma rede Wi-Fi.
Abra o Expo Go e escaneie o QR code mostrado no terminal.
Você deve ver “Minha Estante”, o botão ☰ Menu e a lista Todos.
Abra o menu e toque em Cadastrar novo item para mostrar o formulário.
Cadastre uma obra em cada status e escolha as categorias para conferir os tópicos.
Cadastre um Filme em Assistindo com 30 minutos e uma Série em Quero assistir com 0 episódios.
Confira que cada obra aparece no tópico certo e apenas nos status correspondentes (ou em Todos).
Teste fechar o menu tocando fora, em × e usando Voltar no Android.
Edite uma obra: o status e o progresso devem mudar sem duplicar o cadastro.
Cadastre um Livro e confira o tópico Livros e o progresso por páginas.
Feche e reabra o projeto no Expo Go para conferir que as obras foram mantidas.
Escolha uma capa, salve e confira a imagem ao lado da obra. Teste trocar, remover
e cancelar a edição. Feche e reabra para confirmar que a capa foi mantida.
O guia ETAPA-6.md explica os conceitos e mostra o código completo dos arquivos alterados.
Para parar o servidor, pressione Ctrl+C no terminal.

O GitHub guarda o código e seu histórico; ele não instala o app no celular.
Este teste usa o servidor local. Uma versão instalável que funcione sem
computador será preparada em uma etapa posterior.

## Arquivos principais

- App.js: formulário, lista, estado React, carregamento e gravação local.
- Opcoes.js: botões reutilizáveis de tipo, status e categorias.
- obras.js: opções, validação, migração dos dados antigos e atualização da lista.
- Capa.js: exibição da imagem, com indicação quando não há capa ou ela falha.
- capas.js: cópia das imagens para documentos e limpeza das capas substituídas.
- MenuLateral.js: menu animado com seleção, contagem e fechamento pelo botão Voltar.
- ListaObras.js: lista agrupada pelos cinco tipos, com capa e edição.
- Secao.js: componente da etapa anterior, preservado como referência; não é usado pela tela atual.
- index.js: registra o componente no Expo.
- app.json: configura nome, orientação e aparência.
- package.json: dependências e comandos.
- package-lock.json: versões exatas das dependências.
- assets/: imagens padrão do template Expo.

## Verificações

O pacote JavaScript para Android foi gerado e a análise ESLint passou.
A edição sem duplicação, migração de Pausado para Lendo, tipos, progresso e
leitura dos dados salvos foram verificados. Páginas aceitam números inteiros;
capítulos também aceitam decimais. Títulos vazios e valores inválidos são rejeitados.
O teste visual e a persistência em um celular físico ainda precisam ser confirmados.
Os fluxos de cópia, falha de cópia, limpeza restrita e preservação do cadastro
foram verificados com um sistema de arquivos simulado. Galeria e arquivos nativos
precisam ser testados no Android físico.
Não há TypeScript nesta versão. ESLint é uma ferramenta de desenvolvimento.

O npm audit reporta 22 alertas nas dependências transitivas do template.
Não use npm audit fix --force: a correção sugerida retrocede o Expo para uma
versão incompatível. As correções sem mudança principal já foram aplicadas.

Documentação: https://docs.expo.dev/more/create-expo/
e https://docs.expo.dev/get-started/start-developing/.

````

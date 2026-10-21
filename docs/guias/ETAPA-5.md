# Etapa 5 — Tela organizada em seções

Pasta do projeto: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante

## Organização da tela

Uma coluna vertical com os cabeçalhos:
- Cadastrar novo item (muda para Editar item durante uma edição).
- Todos.
- Terminei.
- Lendo.
- Quero ler.

Toque no cabeçalho para abrir ou fechar a seção. Uma seção abre por vez.
Inicialmente, Todos está aberto e o cadastro fica fechado.
Cada categoria mostra três tópicos: Livros, Mangás e Manhwas.
Os cabeçalhos e os tópicos mostram suas quantidades; tópicos vazios mostram uma mensagem.
As obras mantêm capa, status, progresso e botão Editar obra.
Terminei é o novo nome visual do status concluído, antes exibido como Já li.
Os dados salvos não precisam ser alterados para essa mudança de nome.

Fechar o cadastro preserva o rascunho. Ao editar, o formulário abre automaticamente
e a tela sobe até ele. Ao salvar, o formulário fecha e abre a categoria do status
da obra. Cancelar edição descarta o rascunho sem mudar o cadastro salvo.
As seções ficam bloqueadas enquanto uma capa está sendo escolhida ou a obra é salva.

## Como abrir

Não foram adicionadas dependências. Recarregue o projeto no Expo Go.
Se o servidor estiver parado, execute no terminal do VS Code, na pasta acima:

```powershell
npm.cmd start
```

start inicia o Expo e exibe o QR code. Use o mesmo Wi-Fi do computador.
Os arquivos desta pasta já foram atualizados; não é necessário git pull nela.

## Teste e resultado esperado

1. Abra o app: Todos deve estar aberto, com Livros, Mangás e Manhwas.
2. Toque em Todos: a lista deve fechar. Toque novamente: ela deve abrir.
3. Abra Cadastrar novo item e digite um nome; abra Lendo e depois volte ao cadastro.
   O texto digitado deve continuar no campo.
4. Cadastre um Livro como Lendo, um Mangá como Terminei e um Manhwa como Quero ler.
5. Abra Todos: as três obras devem estar em tópicos separados pelo tipo.
6. Abra Terminei: só o mangá deve aparecer, no tópico Mangás.
7. Abra Lendo: só o livro deve aparecer, no tópico Livros.
8. Abra Quero ler: só o manhwa deve aparecer, no tópico Manhwas.
9. Confira as quantidades das categorias e dos tópicos.
10. Toque em Editar obra: o formulário deve abrir com os dados existentes.
11. Mude o status e salve: deve abrir a categoria nova, sem duplicar a obra.
12. As obras antes chamadas Já li devem aparecer em Terminei.
13. Feche e reabra o projeto: dados, progresso e capas devem permanecer.
14. Confirme o resultado na conversa antes de avançarmos para a próxima etapa.

## Conceitos de React e JavaScript

secaoAberta guarda uma identificação, como 'todos' ou 'cadastro'. null significa
que todas as seções estão fechadas. setSecaoAberta recebe uma função que compara
o valor anterior: tocar na mesma seção a fecha, e tocar em outra troca a seção aberta.

Secao recebe props com título, quantidade, estado aberto e evento aoAlternar.
children é o conteúdo colocado entre as tags do componente. A expressão
aberta && (...) usa renderização condicional para mostrar esse conteúdo só ao abrir.
O rascunho continua no estado de App mesmo quando o formulário deixa de ser exibido.

ListaObras organiza os cartões usando map para criar cada tópico e filter para
selecionar as obras de seu tipo. App filtra antes pelo status da categoria.
Isso permite reaproveitar a mesma lista em Todos, Terminei, Lendo e Quero ler.

accessibilityState.expanded informa a leitores de tela se a seção está aberta.
A lógica e a aparência são feitas com componentes do React Native, sem nova biblioteca.

Documentação oficial consultada:
https://reactnative.dev/docs/0.86/pressable
https://reactnative.dev/docs/0.86/accessibility

## Arquivos e código completo

App.js, obras.js e README.md foram alterados. Secao.js e ListaObras.js foram criados.
Todos estão na raiz da pasta do projeto. Os guias anteriores registram versões anteriores.

## Secao.js

```
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Secao({ titulo, total, aberta, aoAlternar, desabilitada, children }) {
  return (
    <View style={styles.secao}>
      <Pressable accessibilityRole="button"
        accessibilityLabel={total === undefined ? titulo : `${titulo}, ${total} obras`}
        accessibilityState={{ expanded: aberta, disabled: desabilitada }}
        disabled={desabilitada} onPress={aoAlternar}
        style={({ pressed }) => [styles.cabecalho, aberta && styles.aberto,
          (pressed || desabilitada) && styles.atenuado]}>
        <Text style={styles.titulo}>{titulo}</Text>
        {total !== undefined && <Text style={styles.contagem}>{total}</Text>}
        <Text style={styles.sinal} importantForAccessibility="no">{aberta ? '−' : '+'}</Text>
      </Pressable>
      {aberta && <View style={styles.conteudo}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { borderWidth: 1, borderColor: '#353B4B', borderRadius: 16, overflow: 'hidden' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60,
    padding: 16, backgroundColor: '#1B1F2A' },
  aberto: { backgroundColor: '#35294F' },
  titulo: { flex: 1, color: '#F5F6FA', fontSize: 19, fontWeight: '700' },
  contagem: { color: '#E4DBFF', fontSize: 16 },
  sinal: { color: '#B8A7FF', fontSize: 24, fontWeight: '700' },
  conteudo: { padding: 12, gap: 16 },
  atenuado: { opacity: 0.6 },
});

```

## ListaObras.js

```
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Capa from './Capa';
import { STATUS } from './obras';

const GRUPOS = [
  { valor: 'livro', texto: 'Livros' },
  { valor: 'manga', texto: 'Mangás' },
  { valor: 'manhwa', texto: 'Manhwas' },
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
                    <Text style={styles.status}>{STATUS.find((item) => item.valor === obra.status).texto}</Text>
                    <Text style={styles.descricao}>
                      {obra.unidade === 'pagina' ? 'Última página' : 'Último capítulo'}: {String(obra.progresso).replace('.', ',')}
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

## App.js

```
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
import Secao from './Secao';
import ListaObras from './ListaObras';
import Capa from './Capa';
import { apagarCapa, guardarCapa } from './capas';
import { atualizarLista, lerObras, STATUS, TIPOS, UNIDADES, validarCadastro } from './obras';

const CHAVE_ESTANTE = '@minha-estante/obras-v1';
const SECOES = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'concluido', texto: 'Terminei' },
  { valor: 'lendo', texto: 'Lendo' },
  { valor: 'quero-ler', texto: 'Quero ler' },
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
    setTipo(novoTipo);
    setUnidade(novoTipo === 'livro' ? 'pagina' : 'capitulo');
  }

  function alternarSecao(secao) {
    if (bloqueio.current || seletorAberto.current) return;
    setSecaoAberta((atual) => atual === secao ? null : secao);
    Keyboard.dismiss();
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.tela}>
        <StatusBar style="light" />
        <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={rolagem} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text style={styles.etiqueta}>MANGÁS, MANHWAS E LIVROS</Text>
            <Text style={styles.titulo} accessibilityRole="header">Minha Estante</Text>
            <Text style={styles.descricao}>Toque em uma seção para abrir ou fechar.</Text>

            <Secao titulo={editandoId === null ? 'Cadastrar novo item' : 'Editar item'}
              aberta={secaoAberta === 'cadastro'} aoAlternar={() => alternarSecao('cadastro')}
              desabilitada={ocupado}>
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
              <Text style={styles.rotulo}>Status da leitura</Text>
              <Opcoes grupo="Status" opcoes={STATUS} valor={status} aoSelecionar={setStatus} desabilitado={ocupado} />
              <Text style={styles.rotulo}>Acompanhar por</Text>
              <Opcoes grupo="Progresso" opcoes={UNIDADES} valor={unidade} aoSelecionar={setUnidade} desabilitado={ocupado} />
              <Text style={styles.rotulo}>{unidade === 'pagina' ? 'Última página lida' : 'Último capítulo lido'}</Text>
              <TextInput
                accessibilityLabel={unidade === 'pagina' ? 'Última página lida' : 'Último capítulo lido'} style={styles.campo}
                value={progresso} onChangeText={setProgresso} keyboardType={unidade === 'pagina' ? 'number-pad' : 'decimal-pad'}
                maxLength={12} editable={!ocupado} selectTextOnFocus
              />
              <Text style={styles.ajuda}>Use 0 se você ainda não começou a ler.</Text>
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
            </Secao>

            {mensagem !== '' && <Text style={styles.mensagem} accessibilityLiveRegion="polite">{mensagem}</Text>}
            {carregando && <Text style={styles.descricao}>Carregando sua estante…</Text>}
            {!carregando && !pronto && (
              <Pressable accessibilityRole="button" style={styles.adicionar} onPress={tentarCarregar}>
                <Text style={styles.textoBotao}>Tentar carregar novamente</Text>
              </Pressable>
            )}
            {SECOES.map((secao) => {
              const itens = obras.filter((obra) => secao.valor === 'todos' || obra.status === secao.valor);
              return (
                <Secao key={secao.valor} titulo={secao.texto} total={itens.length}
                  aberta={secaoAberta === secao.valor} aoAlternar={() => alternarSecao(secao.valor)}
                  desabilitada={ocupado}>
                  {pronto && <ListaObras obras={itens} aoEditar={editarObra} ocupado={ocupado} />}
                </Secao>
              );
            })}
            <Text style={styles.ajuda}>Seus cadastros ficam salvos neste celular.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#101218' },
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

## obras.js

```
export const STATUS = [
  { valor: 'lendo', texto: 'Lendo' },
  { valor: 'quero-ler', texto: 'Quero ler' },
  { valor: 'concluido', texto: 'Terminei' },
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

```

## README.md

```
# Minha Estante

App para organizar mangás, manhwas e livros, desenvolvido em JavaScript, React Native e Expo.

## Etapa atual

Etapa 5: tela organizada em uma coluna de seções que abrem e fecham.
Seções: Cadastrar novo item, Todos, Terminei, Lendo e Quero ler.
Cada lista mostra os tópicos Livros, Mangás e Manhwas com suas quantidades.
Uma seção abre por vez; o cadastro começa fechado e Todos começa aberto.
Os status são Lendo, Quero ler e Terminei (o mesmo concluído antes chamado Já li).
Tipos: Mangá, Manhwa e Livro. Acompanhe o progresso por capítulos ou páginas.
Toque em Editar obra, altere os campos e salve, ou cancele para descartar o rascunho.
Escolha a seção do status desejado e encontre as obras pelo tópico de tipo.
Ao editar uma obra, o formulário abre automaticamente. Ao salvar, abre sua categoria.
Fechar o formulário preserva os campos; Cancelar edição descarta o rascunho.
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
Você deve ver “Minha Estante” e o formulário “Adicionar obra”.
Toque em Cadastrar novo item para abrir o formulário.
Cadastre uma obra em cada status e abra as categorias para conferir os tópicos.
Edite uma obra: o status e o progresso devem mudar sem duplicar o cadastro.
Cadastre um Livro e confira o tópico Livros e o progresso por páginas.
Feche e reabra o projeto no Expo Go para conferir que as obras foram mantidas.
Escolha uma capa, salve e confira a imagem ao lado da obra. Teste trocar, remover
e cancelar a edição. Feche e reabra para confirmar que a capa foi mantida.
O guia ETAPA-5.md explica os conceitos e mostra o código completo dos arquivos.
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
- Secao.js: cabeçalho que abre e fecha seu conteúdo, com contagem e acessibilidade.
- ListaObras.js: lista agrupada em Livros, Mangás e Manhwas, com capa e edição.
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

```

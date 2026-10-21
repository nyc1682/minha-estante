import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import {
  Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Opcoes from './src/components/Opcoes';
import MenuLateral from './src/components/MenuLateral';
import ListaObras from './src/components/ListaObras';
import Capa from './src/components/Capa';
import { apagarCapa, guardarCapa } from './src/services/capas';
import { atualizarLista, lerObras, opcoesStatus, opcoesUnidades, rotuloProgresso,
  TIPOS, unidadePadrao, validarCadastro } from './src/utils/obras';

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

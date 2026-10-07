import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Opcoes from './Opcoes';
import { lerObras, STATUS, TIPOS, validarCadastro } from './obras';

const CHAVE_ESTANTE = '@minha-estante/obras-v1';
const FILTROS = [{ valor: 'todos', texto: 'Todas' }, ...STATUS];

export default function App() {
  const [obras, setObras] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('manga');
  const [status, setStatus] = useState('lendo');
  const [capitulo, setCapitulo] = useState('0');
  const [filtro, setFiltro] = useState('todos');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [pronto, setPronto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const bloqueio = useRef(false);

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

  async function adicionarObra() {
    if (!pronto || bloqueio.current) return;
    const erro = validarCadastro(titulo, capitulo);
    if (erro) {
      setMensagem(erro);
      return;
    }
    bloqueio.current = true;
    setSalvando(true);
    setMensagem('');
    const novaObra = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      titulo: titulo.trim(), tipo, status,
      capitulo: Number(capitulo.trim().replace(',', '.')),
    };
    const novasObras = [novaObra, ...obras];
    try {
      await AsyncStorage.setItem(CHAVE_ESTANTE, JSON.stringify(novasObras));
      setObras(novasObras);
      setTitulo('');
      setCapitulo('0');
      setFiltro('todos');
      setMensagem(`${novaObra.titulo} foi adicionada à sua estante.`);
      Keyboard.dismiss();
    } catch {
      setMensagem('Não foi possível salvar. Seus campos foram mantidos; tente novamente.');
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  }

  const obrasVisiveis = obras.filter((obra) => filtro === 'todos' || obra.status === filtro);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.tela}>
        <StatusBar style="light" />
        <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text style={styles.etiqueta}>MANGÁS E MANHWAS</Text>
            <Text style={styles.titulo} accessibilityRole="header">Minha Estante</Text>
            <Text style={styles.descricao}>Organize o que você lê e o que quer ler.</Text>

            <View style={styles.cartao}>
              <Text style={styles.subtitulo} accessibilityRole="header">Adicionar obra</Text>
              <Text style={styles.rotulo}>Nome da obra</Text>
              <TextInput
                accessibilityLabel="Nome da obra" style={styles.campo}
                value={titulo} onChangeText={setTitulo} placeholder="Ex.: Solo Leveling"
                placeholderTextColor="#AAB1C1" maxLength={150} editable={!salvando}
              />
              <Text style={styles.rotulo}>Tipo</Text>
              <Opcoes grupo="Tipo" opcoes={TIPOS} valor={tipo} aoSelecionar={setTipo} />
              <Text style={styles.rotulo}>Status da leitura</Text>
              <Opcoes grupo="Status" opcoes={STATUS} valor={status} aoSelecionar={setStatus} />
              <Text style={styles.rotulo}>Último capítulo lido</Text>
              <TextInput
                accessibilityLabel="Último capítulo lido" style={styles.campo}
                value={capitulo} onChangeText={setCapitulo} keyboardType="decimal-pad"
                maxLength={12} editable={!salvando} selectTextOnFocus
              />
              <Text style={styles.ajuda}>Use 0 se você ainda não começou a ler.</Text>
              <Pressable
                accessibilityRole="button" disabled={!pronto || salvando}
                accessibilityState={{ disabled: !pronto || salvando }}
                onPress={adicionarObra}
                style={({ pressed }) => [styles.adicionar, (!pronto || salvando || pressed) && styles.atenuado]}
              >
                <Text style={styles.textoBotao}>{salvando ? 'Salvando…' : 'Adicionar à estante'}</Text>
              </Pressable>
            </View>

            {mensagem !== '' && <Text style={styles.mensagem} accessibilityLiveRegion="polite">{mensagem}</Text>}
            {carregando && <Text style={styles.descricao}>Carregando sua estante…</Text>}
            {!carregando && !pronto && (
              <Pressable accessibilityRole="button" style={styles.adicionar} onPress={tentarCarregar}>
                <Text style={styles.textoBotao}>Tentar carregar novamente</Text>
              </Pressable>
            )}
            <Text style={styles.subtitulo} accessibilityRole="header">Suas obras ({obras.length})</Text>
            <Opcoes grupo="Categoria" opcoes={FILTROS} valor={filtro} aoSelecionar={setFiltro} />
            {pronto && obrasVisiveis.length === 0 && (
              <Text style={styles.descricao}>
                {obras.length === 0 ? 'Sua estante está vazia. Adicione sua primeira obra acima.' : 'Nenhuma obra nesta categoria.'}
              </Text>
            )}
            {obrasVisiveis.map((obra) => (
              <View key={obra.id} style={styles.cartao}>
                <Text style={styles.subtitulo}>{obra.titulo}</Text>
                <Text style={styles.etiqueta}>
                  {TIPOS.find((item) => item.valor === obra.tipo).texto} · {STATUS.find((item) => item.valor === obra.status).texto}
                </Text>
                <Text style={styles.descricao}>Último capítulo: {String(obra.capitulo).replace('.', ',')}</Text>
              </View>
            ))}
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
  atenuado: { opacity: 0.6 },
  mensagem: { color: '#E4DBFF', fontSize: 16, lineHeight: 24 },
});

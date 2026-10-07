# Etapa 4 — Capas da galeria

Pasta do projeto: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante

## Resultado desta etapa

- Campo Capa da obra (opcional), com botão Escolher capa.
- Seletor de imagens da galeria do celular, com recorte vertical no Android.
- Prévia antes de salvar; a capa aparece ao lado da obra na lista.
- Ao editar, você pode trocar ou remover a capa. Salvar confirma a alteração;
  Cancelar edição mantém a imagem anterior.
- Obras cadastradas em versões anteriores continuam funcionando sem capa.
- As imagens são copiadas para a pasta de documentos do app no celular.
- Uma capa antiga só é removida após a gravação bem-sucedida de sua substituição.
- Capas não são enviadas ao GitHub ou a um servidor.

Nesta etapa a imagem é escolhida por você. Busca automática por título exigiria
uma fonte de dados externa e internet para a pesquisa. Mantivemos o funcionamento
local e offline definido para esta primeira versão.

## Atualizar e abrir no Android

Pare o Expo com Ctrl+C no terminal do VS Code. Na pasta do projeto acima:

```powershell
npm.cmd ci
npm.cmd start
```

ci instala as dependências das versões registradas, incluindo os dois módulos novos.
start inicia o servidor de desenvolvimento e exibe o QR code para o Expo Go.
Mantenha celular e computador na mesma rede Wi-Fi e reabra o projeto.
As alterações já estão nesta pasta; não é necessário git pull nela.

Comando equivalente de instalação já executado nesta etapa:

```powershell
npx.cmd expo install expo-image-picker expo-file-system
```

Não precisa executar essa instalação novamente após npm.cmd ci.
Ambos os módulos são incluídos no Expo Go. No app.json, configuramos a mensagem
para fotos e desabilitamos câmera e microfone para uma futura versão própria.
No Expo Go, as permissões pertencem ao próprio aplicativo Expo Go.

## Como testar e resultado esperado

1. Edite uma obra que já existe e toque em Escolher capa.
2. Selecione uma imagem da galeria e confirme o recorte: uma prévia deve aparecer.
3. Toque em Salvar alterações. A mesma obra deve mostrar a capa à esquerda do título.
4. Feche e reabra o projeto no Expo Go: a obra e a imagem devem continuar presentes.
5. Edite novamente e toque em Trocar capa. Selecione outra imagem, mas toque em
   Cancelar edição: a lista deve continuar mostrando a capa anterior.
6. Troque novamente e salve: a lista deve mostrar a nova imagem.
7. Edite, toque em Remover capa e salve: o cartão deve mostrar Sem capa.
8. Abra o seletor e cancele sem escolher: a prévia atual deve continuar igual.
9. Cadastre uma obra nova sem capa: o cadastro deve funcionar normalmente.
10. Ao editar apenas status ou progresso, a capa já salva deve continuar igual.
11. Confirme o teste no celular antes de avançarmos para outra etapa.

O Expo Go precisa do servidor para carregar o projeto de desenvolvimento.
Depois de abrir, esta funcionalidade não faz buscas nem envia imagens pela rede.
Escolha uma imagem que já esteja disponível no celular para testar sem internet.
Desinstalar o aplicativo ou limpar seus dados pode apagar a estante e as capas.

## Conceitos de JavaScript e React

O estado capa guarda uma URI: um endereço que indica onde a imagem está no celular.
Image usa source={{ uri }} para exibir o arquivo. O componente Capa é reutilizado
no formulário e na lista, com tamanhos diferentes recebidos pela prop grande.

launchImageLibraryAsync abre a galeria. await espera você selecionar uma imagem
ou cancelar. resultado.canceled identifica o cancelamento, e assets[0].uri contém
o endereço da imagem escolhida. O botão bloqueia ações durante essa seleção.

guardarCapa usa Directory e File, do Expo FileSystem, para criar a pasta capas e
copiar a imagem. Paths.document é uma localização persistente; a imagem temporária
retornada pelo seletor não é usada como único arquivo do cadastro salvo.

A ordem das operações é importante: primeiro copiamos a imagem, depois gravamos
os dados com AsyncStorage, então atualizamos a lista e limpamos a capa anterior.
Se a cópia ou gravação falhar, mantemos o formulário e a capa anteriormente salva.

O campo capa é opcional. Ao ler um cadastro antigo, lerObras preenche null.
Capa.js mostra Sem capa quando não há imagem e Capa indisponível quando o arquivo
não pode ser exibido. A falha da imagem não impede mostrar os dados da obra.

## Verificações realizadas

- Análise ESLint e geração do pacote JavaScript para Android.
- Compatibilidade das dependências e configuração pública do Expo.
- Testes com arquivos simulados: cópia aguardada, falha limpa cópia parcial,
  proteção da imagem anterior, remoção limitada aos arquivos de capa do app.
- Dados antigos, edição, remoção e restauração do campo capa.
- A galeria, a aparência e os arquivos no Android real ainda precisam de seu teste.

Documentação oficial consultada:
https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/
https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/

## Arquivos criados ou alterados e código completo

Todos os arquivos abaixo ficam na raiz da pasta do projeto. O package-lock.json também foi atualizado automaticamente.

## Capa.js

```
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Capa({ uri, titulo, grande = false }) {
  const [uriComErro, setUriComErro] = useState(null);
  const tamanho = [styles.capa, grande && styles.grande];
  if (uri && uri !== uriComErro) {
    return (
      <Image source={{ uri }} style={tamanho} resizeMode="contain"
        accessibilityLabel={`Capa de ${titulo || 'sua obra'}`}
        onError={() => setUriComErro(uri)} />
    );
  }
  return (
    <View style={[tamanho, styles.vazia]}>
      <Text style={styles.texto}>{uri ? 'Capa indisponível' : 'Sem capa'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { width: 72, height: 108, borderRadius: 8, backgroundColor: '#101218' },
  grande: { width: 100, height: 150 },
  vazia: { justifyContent: 'center', alignItems: 'center', padding: 6 },
  texto: { color: '#AAB1C1', fontSize: 12, textAlign: 'center' },
});

```

## capas.js

```
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
import Capa from './Capa';
import { apagarCapa, guardarCapa } from './capas';
import { atualizarLista, lerObras, STATUS, TIPOS, UNIDADES, validarCadastro } from './obras';

const CHAVE_ESTANTE = '@minha-estante/obras-v1';
const FILTROS = [{ valor: 'todos', texto: 'Todas' }, ...STATUS];
const FILTROS_TIPO = [{ valor: 'todos', texto: 'Todos os tipos' }, ...TIPOS];

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
  const [filtro, setFiltro] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
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
      setFiltro('todos');
      setFiltroTipo('todos');
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

  const obrasVisiveis = obras.filter((obra) =>
    (filtro === 'todos' || obra.status === filtro)
    && (filtroTipo === 'todos' || obra.tipo === filtroTipo));
  const ocupado = salvando || escolhendoCapa;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.tela}>
        <StatusBar style="light" />
        <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={rolagem} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text style={styles.etiqueta}>MANGÁS, MANHWAS E LIVROS</Text>
            <Text style={styles.titulo} accessibilityRole="header">Minha Estante</Text>
            <Text style={styles.descricao}>Organize o que você lê e o que quer ler.</Text>

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

            {mensagem !== '' && <Text style={styles.mensagem} accessibilityLiveRegion="polite">{mensagem}</Text>}
            {carregando && <Text style={styles.descricao}>Carregando sua estante…</Text>}
            {!carregando && !pronto && (
              <Pressable accessibilityRole="button" style={styles.adicionar} onPress={tentarCarregar}>
                <Text style={styles.textoBotao}>Tentar carregar novamente</Text>
              </Pressable>
            )}
            <Text style={styles.subtitulo} accessibilityRole="header">Suas obras ({obras.length})</Text>
            <Opcoes grupo="Categoria" opcoes={FILTROS} valor={filtro} aoSelecionar={setFiltro} />
            <Text style={styles.rotulo}>Filtrar por tipo</Text>
            <Opcoes grupo="Filtrar por tipo" opcoes={FILTROS_TIPO} valor={filtroTipo} aoSelecionar={setFiltroTipo} />
            {pronto && obrasVisiveis.length === 0 && (
              <Text style={styles.descricao}>
                {obras.length === 0 ? 'Sua estante está vazia. Adicione sua primeira obra acima.' : 'Nenhuma obra nesta categoria.'}
              </Text>
            )}
            {obrasVisiveis.map((obra) => (
              <View key={obra.id} style={styles.cartao}>
                <View style={styles.linhaCapa}>
                  <Capa uri={obra.capa} titulo={obra.titulo} />
                  <View style={styles.dadosObra}>
                    <Text style={styles.subtitulo}>{obra.titulo}</Text>
                    <Text style={styles.etiqueta}>
                      {TIPOS.find((item) => item.valor === obra.tipo).texto} · {STATUS.find((item) => item.valor === obra.status).texto}
                    </Text>
                    <Text style={styles.descricao}>
                      {obra.unidade === 'pagina' ? 'Última página' : 'Último capítulo'}: {String(obra.progresso).replace('.', ',')}
                    </Text>
                  </View>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${obra.titulo}`}
                  disabled={ocupado} onPress={() => editarObra(obra)}
                  style={({ pressed }) => [styles.secundario, (pressed || ocupado) && styles.atenuado]}>
                  <Text style={styles.textoSecundario}>Editar obra</Text>
                </Pressable>
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

```

## app.json

```
{
  "expo": {
    "name": "Minha Estante",
    "slug": "minha-estante",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Permita escolher uma imagem para a capa da sua obra.",
          "cameraPermission": false,
          "microphonePermission": false
        }
      ]
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}

```

## package.json

```
{
  "name": "minha-estante",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo": "~57.0.27",
    "expo-file-system": "~57.0.7",
    "expo-image-picker": "~57.0.20",
    "expo-status-bar": "~57.0.1",
    "react": "19.2.3",
    "react-native": "0.86.3",
    "react-native-safe-area-context": "~5.7.0"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "private": true,
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-config-expo": "~57.0.2"
  }
}

```

## README.md

```
# Minha Estante

App para organizar mangás, manhwas e livros, desenvolvido em JavaScript, React Native e Expo.

## Etapa atual

Etapa 4: capas da galeria, cadastro e edição, com os status Lendo, Quero ler e Já li.
Tipos: Mangá, Manhwa e Livro. Acompanhe o progresso por capítulos ou páginas.
Toque em Editar obra, altere os campos e salve, ou cancele para descartar o rascunho.
Filtre a lista por status e por tipo. Os dados ficam salvos no celular.
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
Cadastre uma obra em cada status e toque nas categorias para filtrar a lista.
Edite uma obra: o status e o progresso devem mudar sem duplicar o cadastro.
Cadastre um Livro e teste o filtro Livro e o progresso por páginas.
Feche e reabra o projeto no Expo Go para conferir que as obras foram mantidas.
Escolha uma capa, salve e confira a imagem ao lado da obra. Teste trocar, remover
e cancelar a edição. Feche e reabra para confirmar que a capa foi mantida.
O guia ETAPA-4.md explica os conceitos e mostra o código completo dos arquivos.
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


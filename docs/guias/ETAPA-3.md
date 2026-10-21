# Etapa 3 — Editar obras e incluir livros

Pasta do projeto: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante

## Resultado desta etapa

- Cada cartão tem um botão Editar obra.
- O formulário permite mudar nome, tipo, status, unidade e progresso.
- Salvar alterações atualiza a mesma obra, mantendo seu identificador.
- Cancelar edição descarta o rascunho e volta ao formulário de cadastro.
- Livro foi incluído junto de Mangá e Manhwa.
- A lista pode ser filtrada por tipo e status ao mesmo tempo.
- Pausado foi removido; obras antigas nessa situação passam para Lendo.
- O capítulo antigo continua preservado como progresso em capítulos.
- Você pode acompanhar qualquer obra por páginas ou capítulos.
- Ao selecionar Livro, o padrão é Páginas; ao selecionar Mangá/Manhwa, Capítulos.
- Páginas aceitam inteiros, enquanto capítulos também aceitam decimais (ex.: 12,5).
- Os dados continuam sendo salvos no celular. Falhas de gravação mantêm o rascunho.

## Abrir a atualização

Não foi adicionada nenhuma dependência. Os arquivos nesta pasta já estão atualizados.
Se o Expo estiver rodando, salve e recarregue o projeto no Expo Go. Se precisar
reiniciar, pressione Ctrl+C no terminal do VS Code e execute, nesta pasta:

```powershell
npm.cmd start
```

start inicia o Expo e mostra o QR code para abrir no Android. Use o mesmo Wi-Fi.
Não precisa de git pull nesta pasta; em outra cópia, atualize pelo Git primeiro.

## Como testar e resultado esperado

1. Cadastre um Mangá como Quero ler, com progresso 0.
2. Toque em Editar obra no cartão. A tela deve rolar até o formulário preenchido.
3. Mude para Lendo e capítulo 12; toque em Salvar alterações.
4. A obra deve mostrar Lendo e capítulo 12, sem aumentar o total de cadastros.
5. Edite novamente, selecione Páginas e informe 35. O cartão deve mostrar Última página: 35.
6. Edite para Já li e salve. O filtro Já li deve mostrar a obra.
7. Edite o nome e toque em Cancelar edição. O nome salvo deve continuar igual.
8. Cadastre um Livro com página 40 e teste o filtro Livro.
9. Combine Livro com Lendo: apenas livros nesse status devem aparecer.
10. Os botões de status devem ser apenas Lendo, Quero ler e Já li.
11. Uma obra que estava Pausado deve continuar cadastrada como Lendo, com seu capítulo original.
12. Feche e reabra o projeto no Expo Go; os dados salvos devem permanecer.
13. Confirme o teste na conversa antes de avançarmos para a próxima etapa.

## Conceitos usados

editandoId é um estado React com o identificador da obra em edição. null significa
que o formulário está criando um cadastro. O identificador é mantido ao salvar,
por isso a edição não gera outro cartão.

editarObra copia os valores da obra para os estados do formulário. Cada TextInput
mostra esses valores pelo atributo value e atualiza o estado em onChangeText.

atualizarLista usa map para criar um array novo: substitui somente o objeto cujo
id corresponde à obra editada. Os outros objetos continuam intactos. Ao cadastrar,
o spread (...obras) inclui a obra nova antes das existentes.

O operador ?? usa o valor à direita quando o valor à esquerda é null ou undefined.
Isso permite aproveitar o id da obra editada ou gerar um id para um cadastro novo.

lerObras faz uma migração: transforma capitulo antigo em progresso, define a unidade
como capitulo e troca pausado por lendo. Essa transformação ocorre ao carregar;
o formato atualizado é gravado junto com a próxima alteração na estante.

useRef guarda a referência ao ScrollView. scrollTo leva a tela ao formulário
quando você toca em Editar obra. O botão cancelar altera apenas os estados do
formulário; não grava mudanças na lista nem no armazenamento.

O filtro combina condições com &&: a obra precisa corresponder tanto ao status
quanto ao tipo selecionado.

Documentação oficial consultada:
https://react.dev/reference/react/useState
https://reactnative.dev/docs/0.86/textinput
https://reactnative.dev/docs/0.86/scrollview

## Arquivos alterados e código completo

Os arquivos abaixo ficam na raiz da pasta do projeto indicada no início.
Nenhuma dependência foi adicionada. Os guias ETAPA-1.md e ETAPA-2.md registram
versões anteriores; ETAPA-3.md descreve a versão atual.
## App.js

```
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Opcoes from './Opcoes';
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
  const [filtro, setFiltro] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [pronto, setPronto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const bloqueio = useRef(false);
  const rolagem = useRef(null);

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
    if (bloqueio.current) return;
    setEditandoId(obra.id);
    setTitulo(obra.titulo);
    setTipo(obra.tipo);
    setStatus(obra.status);
    setProgresso(String(obra.progresso).replace('.', ','));
    setUnidade(obra.unidade);
    setMensagem('');
    rolagem.current?.scrollTo({ y: 0, animated: true });
  }

  function cancelarEdicao() {
    if (bloqueio.current) return;
    setEditandoId(null);
    setTitulo('');
    setTipo('manga');
    setStatus('lendo');
    setProgresso('0');
    setUnidade('capitulo');
    setMensagem('');
    Keyboard.dismiss();
  }

  async function salvarObra() {
    if (!pronto || bloqueio.current) return;
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
    };
    try {
      const novasObras = atualizarLista(obras, novaObra, editandoId);
      await AsyncStorage.setItem(CHAVE_ESTANTE, JSON.stringify(novasObras));
      setObras(novasObras);
      setTitulo('');
      setProgresso('0');
      setEditandoId(null);
      setFiltro('todos');
      setFiltroTipo('todos');
      setMensagem(`${novaObra.titulo}: ${editandoId === null ? 'cadastro adicionado' : 'alterações salvas'}.`);
      Keyboard.dismiss();
    } catch {
      setMensagem('Não foi possível salvar. Seus campos foram mantidos; tente novamente.');
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  }

  const obrasVisiveis = obras.filter((obra) =>
    (filtro === 'todos' || obra.status === filtro)
    && (filtroTipo === 'todos' || obra.tipo === filtroTipo));

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
                placeholderTextColor="#AAB1C1" maxLength={150} editable={!salvando}
              />
              <Text style={styles.rotulo}>Tipo</Text>
              <Opcoes grupo="Tipo" opcoes={TIPOS} valor={tipo} aoSelecionar={selecionarTipo} desabilitado={salvando} />
              <Text style={styles.rotulo}>Status da leitura</Text>
              <Opcoes grupo="Status" opcoes={STATUS} valor={status} aoSelecionar={setStatus} desabilitado={salvando} />
              <Text style={styles.rotulo}>Acompanhar por</Text>
              <Opcoes grupo="Progresso" opcoes={UNIDADES} valor={unidade} aoSelecionar={setUnidade} desabilitado={salvando} />
              <Text style={styles.rotulo}>{unidade === 'pagina' ? 'Última página lida' : 'Último capítulo lido'}</Text>
              <TextInput
                accessibilityLabel={unidade === 'pagina' ? 'Última página lida' : 'Último capítulo lido'} style={styles.campo}
                value={progresso} onChangeText={setProgresso} keyboardType={unidade === 'pagina' ? 'number-pad' : 'decimal-pad'}
                maxLength={12} editable={!salvando} selectTextOnFocus
              />
              <Text style={styles.ajuda}>Use 0 se você ainda não começou a ler.</Text>
              <Pressable
                accessibilityRole="button" disabled={!pronto || salvando}
                accessibilityState={{ disabled: !pronto || salvando }}
                onPress={salvarObra}
                style={({ pressed }) => [styles.adicionar, (!pronto || salvando || pressed) && styles.atenuado]}
              >
                <Text style={styles.textoBotao}>
                  {salvando ? 'Salvando…' : editandoId === null ? 'Adicionar à estante' : 'Salvar alterações'}
                </Text>
              </Pressable>
              {editandoId !== null && (
                <Pressable accessibilityRole="button" disabled={salvando} onPress={cancelarEdicao}
                  style={({ pressed }) => [styles.secundario, (pressed || salvando) && styles.atenuado]}>
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
                <Text style={styles.subtitulo}>{obra.titulo}</Text>
                <Text style={styles.etiqueta}>
                  {TIPOS.find((item) => item.valor === obra.tipo).texto} · {STATUS.find((item) => item.valor === obra.status).texto}
                </Text>
                <Text style={styles.descricao}>
                  {obra.unidade === 'pagina' ? 'Última página' : 'Último capítulo'}: {String(obra.progresso).replace('.', ',')}
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${obra.titulo}`}
                  disabled={salvando} onPress={() => editarObra(obra)}
                  style={({ pressed }) => [styles.secundario, (pressed || salvando) && styles.atenuado]}>
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
});

```

## Opcoes.js

```
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Opcoes({ opcoes, valor, aoSelecionar, grupo, desabilitado = false }) {
  return (
    <View style={styles.linha}>
      {opcoes.map((opcao) => (
        <Pressable
          key={opcao.valor}
          accessibilityRole="button"
          accessibilityLabel={`${grupo}: ${opcao.texto}`}
          accessibilityState={{ selected: valor === opcao.valor, disabled: desabilitado }}
          disabled={desabilitado}
          onPress={() => aoSelecionar(opcao.valor)}
          style={({ pressed }) => [
            styles.botao, valor === opcao.valor && styles.selecionado,
            (pressed || desabilitado) && styles.pressionado,
          ]}
        >
          <Text style={styles.texto}>{opcao.texto}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  botao: {
    minHeight: 48, justifyContent: 'center', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1,
    borderColor: '#505A72', backgroundColor: '#202635',
  },
  selecionado: { borderColor: '#B8A7FF', backgroundColor: '#55408C' },
  pressionado: { opacity: 0.7 },
  texto: { color: '#F5F6FA', fontSize: 16, fontWeight: '600' },
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

Etapa 3: cadastro e edição de obras, com os status Lendo, Quero ler e Já li.
Tipos: Mangá, Manhwa e Livro. Acompanhe o progresso por capítulos ou páginas.
Toque em Editar obra, altere os campos e salve, ou cancele para descartar o rascunho.
Filtre a lista por status e por tipo. Os dados ficam salvos no celular.
Cadastros antigos em Pausado aparecem como Lendo, mantendo o progresso.
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
O guia ETAPA-3.md explica os conceitos e mostra o código completo dos arquivos.
Para parar o servidor, pressione Ctrl+C no terminal.

O GitHub guarda o código e seu histórico; ele não instala o app no celular.
Este teste usa o servidor local. Uma versão instalável que funcione sem
computador será preparada em uma etapa posterior.

## Arquivos principais

- App.js: formulário, lista, estado React, carregamento e gravação local.
- Opcoes.js: botões reutilizáveis de tipo, status e categorias.
- obras.js: opções, validação, migração dos dados antigos e atualização da lista.
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
Não há TypeScript nesta versão. ESLint é uma ferramenta de desenvolvimento.

O npm audit reporta 22 alertas nas dependências transitivas do template.
Não use npm audit fix --force: a correção sugerida retrocede o Expo para uma
versão incompatível. As correções sem mudança principal já foram aplicadas.

Documentação: https://docs.expo.dev/more/create-expo/
e https://docs.expo.dev/get-started/start-developing/.

```


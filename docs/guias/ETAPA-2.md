# Etapa 2 — Cadastrar e organizar leituras

Projeto: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante

## O que mudou

- Formulário com nome, tipo, status e último capítulo lido.
- Botão Adicionar à estante com validação e confirmação de gravação.
- Lista real com seus cadastros e categorias Todas, Lendo, Quero ler, Já li e Pausado.
- Já li representa o status concluído.
- Os dados são salvos no celular com AsyncStorage, sem servidor ou login.
- Se carregar ou salvar falhar, aparece uma mensagem para tentar novamente.

## Comandos

Os arquivos locais já foram atualizados. No terminal do VS Code, dentro da pasta
acima, pare o Expo com Ctrl+C caso esteja rodando e execute:

```powershell
npm.cmd ci
npm.cmd start
```

ci instala as dependências exatas do projeto, incluindo o armazenamento local.
start inicia o Expo e mostra o QR code para abrir no Expo Go no Android.
Use a mesma rede Wi-Fi do computador. Não é necessário git pull nesta pasta:
as alterações foram feitas diretamente nela. Em outra cópia do projeto,
use git pull antes dos comandos, desde que não haja alterações locais pendentes.

A instalação da biblioteca foi feita seguindo a documentação oficial:
https://docs.expo.dev/versions/v57.0.0/sdk/async-storage/
Comando equivalente já executado na pasta do projeto:
npx.cmd expo install @react-native-async-storage/async-storage

## Como testar e resultado esperado

1. Cadastre One Piece como Mangá, Lendo, capítulo 10.
2. Cadastre Solo Leveling como Manhwa, Quero ler, capítulo 0.
3. Cadastre uma obra como Já li e outra como Pausado.
4. A lista deve mostrar quatro obras, cada uma com tipo, status e capítulo.
5. Toque em Lendo, Quero ler, Já li e Pausado: cada botão mostra sua categoria.
6. Toque em Todas: as quatro obras voltam a aparecer.
7. Tente adicionar um nome vazio: aparece Digite o nome da obra, sem criar registro.
8. Use capítulo 12,5: o app aceita capítulos decimais e mostra a vírgula na lista.
9. Espere a mensagem de confirmação de cadastro, feche e reabra o projeto no
   Expo Go: os cadastros devem continuar na lista.
10. Confirme o resultado na conversa antes de avançar para editar e excluir.

O teste de persistência requer manter o mesmo projeto e os dados do Expo Go.
Desinstalar o app ou limpar os dados pode apagar sua estante.
O Expo Go ainda precisa do servidor local para carregar este projeto de desenvolvimento.
A lógica da estante e seus cadastros não fazem chamadas de rede.

## Conceitos novos de JavaScript e React

useState guarda valores que mudam. Por exemplo:
const [titulo, setTitulo] = useState('');
titulo é o texto atual; setTitulo atualiza esse texto e faz React atualizar a tela.

TextInput usa value={titulo} para mostrar o valor e onChangeText={setTitulo}
para atualizá-lo quando você digita. Pressable usa onPress para executar uma
função quando o botão é tocado.

Uma obra é um objeto JavaScript com id, titulo, tipo, status e capitulo.
A estante é um array de objetos. [novaObra, ...obras] cria outro array com a
obra nova antes das anteriores. Isso evita alterar diretamente o estado React.

map transforma cada obra em um cartão na tela. filter cria a lista da categoria
selecionada. find encontra o texto de um status ou tipo.

Opcoes é um componente reutilizável: recebe props (opcoes, valor, aoSelecionar
e grupo) e desenha os botões. O mesmo componente atende tipo, status e filtros.

useEffect lê os cadastros quando a tela abre. useRef guarda um bloqueio que
impede duas gravações simultâneas caso você toque rapidamente no botão.

async/await espera uma tarefa assíncrona terminar. A gravação é aguardada antes
de limpar os campos e confirmar o cadastro. try/catch trata falhas de gravação.
JSON.stringify transforma a lista em texto para guardar; JSON.parse converte
o texto de volta em objetos. lerObras valida esse conteúdo antes de usá-lo.

## Verificações realizadas

Geração do pacote Android; compatibilidade de dependências; análise ESLint;
validação de títulos e capítulos; leitura de quatro status e rejeição de dados
corrompidos, status/tipos desconhecidos e identificadores repetidos.
O teste no celular físico deve ser confirmado por você.
Sem TypeScript. Edição, exclusão e busca ficam para as próximas etapas.

## Código completo

Caminhos relativos à pasta do projeto informada no início. O package-lock.json também foi atualizado automaticamente.

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

```

## Opcoes.js

```
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Opcoes({ opcoes, valor, aoSelecionar, grupo }) {
  return (
    <View style={styles.linha}>
      {opcoes.map((opcao) => (
        <Pressable
          key={opcao.valor}
          accessibilityRole="button"
          accessibilityLabel={`${grupo}: ${opcao.texto}`}
          accessibilityState={{ selected: valor === opcao.valor }}
          onPress={() => aoSelecionar(opcao.valor)}
          style={({ pressed }) => [
            styles.botao, valor === opcao.valor && styles.selecionado,
            pressed && styles.pressionado,
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

App para organizar mangás e manhwas, desenvolvido em JavaScript, React Native e Expo.

## Etapa atual

Etapa 2: cadastro de obras, lista e categorias Lendo, Quero ler, Já li e Pausado.
Informe nome, tipo (mangá/manhwa) e último capítulo lido. Os dados ficam salvos
localmente no celular, sem login ou servidor. Já li corresponde a concluído.
Edição, exclusão, atualização de capítulos e busca serão adicionadas nas próximas
etapas, após confirmar o teste desta versão no celular.

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
Feche e reabra o projeto no Expo Go para conferir que as obras foram mantidas.
O guia ETAPA-2.md explica os conceitos e mostra o código completo dos arquivos.
Para parar o servidor, pressione Ctrl+C no terminal.

O GitHub guarda o código e seu histórico; ele não instala o app no celular.
Este teste usa o servidor local. Uma versão instalável que funcione sem
computador será preparada em uma etapa posterior.

## Arquivos principais

- App.js: formulário, lista, estado React, carregamento e gravação local.
- Opcoes.js: botões reutilizáveis de tipo, status e categorias.
- obras.js: opções e validação dos cadastros e dados salvos.
- index.js: registra o componente no Expo.
- app.json: configura nome, orientação e aparência.
- package.json: dependências e comandos.
- package-lock.json: versões exatas das dependências.
- assets/: imagens padrão do template Expo.

## Verificações

O pacote JavaScript para Android foi gerado e a análise ESLint passou.
A validação de campos e a leitura dos dados salvos foram verificadas, incluindo
os quatro status, capítulos decimais, títulos vazios e dados inválidos.
O teste visual e a persistência em um celular físico ainda precisam ser confirmados.
Não há TypeScript nesta versão. ESLint é uma ferramenta de desenvolvimento.

O npm audit reporta 22 alertas nas dependências transitivas do template.
Não use npm audit fix --force: a correção sugerida retrocede o Expo para uma
versão incompatível. As correções sem mudança principal já foram aplicadas.

Documentação: https://docs.expo.dev/more/create-expo/
e https://docs.expo.dev/get-started/start-developing/.

```


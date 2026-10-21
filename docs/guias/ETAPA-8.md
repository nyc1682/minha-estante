# Etapa 8 — Contas com confirmação de e-mail

O cadastro e o login usam Firebase Authentication, com senha de 8 a 128 caracteres, maiúscula, número e símbolo. A estante só é liberada após confirmar o endereço pelo link recebido.

Leia primeiro o [guia de autenticação](../autenticacao.md), que explica a configuração, os testes e a separação entre contas e obras locais.

## Conceitos que apareceram

- **Contexto React:** ContaProvider compartilha a conta atual com as telas sem passar a mesma informação por muitos componentes.
- **Rotas:** cada arquivo de tela em src/app representa um caminho do Expo Router. As rotas protegidas mostram login, confirmação ou estante conforme a sessão.
- **async/await:** o cadastro espera a resposta do serviço antes de prosseguir; try/catch transforma falhas de rede em mensagens úteis.
- **Validação no cliente e no servidor:** o formulário orienta a pessoa, e o Firebase também rejeita senhas fora da política.
- **Sessão:** tokens emitidos pelo Firebase permitem manter a conta conectada. A senha não é salva no celular. No Android, esses tokens ficam no cofre nativo.
- **Identificador do usuário:** cada conta recebe um uid; ele separa as chaves das estantes locais. Confirmar a importação preserva a estante da versão anterior.
- **Variáveis de ambiente:** EXPO_PUBLIC identifica a configuração pública incluída no APK. Esse prefixo nunca deve receber credenciais administrativas.

## Código completo

Os caminhos são relativos à raiz do repositório. Os arquivos já foram criados no projeto; não é necessário copiar os trechos. Esta é uma fotografia da etapa 8. .env.local e credenciais de administração não fazem parte deste guia.

### .env.example

```text
# Configuração pública do aplicativo Web registrado no Firebase.
# Não coloque senhas, contas de serviço ou chaves privadas nestes campos.
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

```

### .firebaserc

```json
{
  "projects": {
    "default": "minha-estante-nyc1682-da2fd"
  }
}

```

### firebase.json

```json
{
  "auth": {
    "providers": {
      "anonymous": false,
      "emailPassword": true
    }
  },
  "emulators": {
    "auth": {
      "host": "127.0.0.1",
      "port": 9099
    },
    "ui": {
      "enabled": false
    },
    "singleProjectMode": true
  }
}

```

### backend/politica-autenticacao.json

```json
{
  "signIn": {
    "email": {
      "enabled": true,
      "passwordRequired": true
    },
    "anonymous": {
      "enabled": false
    }
  },
  "passwordPolicyConfig": {
    "passwordPolicyEnforcementState": "ENFORCE",
    "forceUpgradeOnSignin": false,
    "passwordPolicyVersions": [
      {
        "customStrengthOptions": {
          "minPasswordLength": 8,
          "maxPasswordLength": 128,
          "containsLowercaseCharacter": false,
          "containsUppercaseCharacter": true,
          "containsNumericCharacter": true,
          "containsNonAlphanumericCharacter": true
        }
      }
    ]
  },
  "emailPrivacyConfig": {
    "enableImprovedEmailPrivacy": true
  }
}

```

### src/utils/conta.js

```javascript
export const CARACTERES_ESPECIAIS = `^$*.[]{}()?"!@#%&/\\,><':;|_~`;

export function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

export function emailTemFormatoValido(email) {
  const texto = normalizarEmail(email);
  return texto.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);
}

export function requisitosSenha(senha) {
  return [
    { texto: 'Pelo menos 8 caracteres', atendido: senha.length >= 8 },
    { texto: 'Uma letra maiúscula (A–Z)', atendido: /[A-Z]/.test(senha) },
    { texto: 'Um número (0–9)', atendido: /[0-9]/.test(senha) },
    { texto: 'Um caractere especial, como @, # ou !',
      atendido: Array.from(senha).some((letra) => CARACTERES_ESPECIAIS.includes(letra)) },
  ];
}

export function validarConta(email, senha, confirmacao) {
  if (!emailTemFormatoValido(email)) return 'Informe um e-mail válido, como nome@exemplo.com.';
  if (senha.length > 128) return 'Use uma senha com no máximo 128 caracteres.';
  if (requisitosSenha(senha).some((item) => !item.atendido)) return 'Sua senha precisa atender às quatro regras abaixo.';
  if (senha !== confirmacao) return 'As senhas não são iguais.';
  return null;
}

export function mensagemAutenticacao(erro) {
  const mensagens = {
    'auth/invalid-credential': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/invalid-login-credentials': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/user-not-found': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/wrong-password': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/email-already-in-use': 'Não foi possível criar a conta. Se já possui cadastro, entre ou recupere a senha.',
    'auth/invalid-email': 'Confira o formato do seu e-mail.',
    'auth/weak-password': 'Escolha uma senha que atenda às quatro regras do cadastro.',
    'auth/password-does-not-meet-requirements': 'Escolha uma senha que atenda às quatro regras do cadastro.',
    'auth/network-request-failed': 'Sem conexão com o serviço de contas. Confira sua internet e tente novamente.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    'auth/user-disabled': 'Não foi possível acessar esta conta. Entre em contato com o suporte.',
    'auth/operation-not-allowed': 'O serviço de contas ainda precisa habilitar o login por e-mail e senha.',
    'auth/configuration-not-found': 'O serviço de contas ainda precisa ser ativado no Firebase.',
    'auth/email-nao-confirmado': 'Seu e-mail ainda não foi confirmado. Abra o link recebido e tente novamente.',
    'auth/configuracao-ausente': 'O serviço de contas ainda não foi configurado. Consulte o guia de autenticação.',
    'auth/politica-insegura': 'O serviço ainda precisa ativar as regras obrigatórias de senha. Consulte o guia de autenticação.',
  };
  return mensagens[erro?.code] ?? 'Não foi possível concluir esta ação. Tente novamente.';
}

export function politicaSenhaSegura(politica) {
  const regras = politica?.customStrengthOptions;
  return politica?.enforcementState === 'ENFORCE' && regras?.minPasswordLength >= 8
    && regras.containsUppercaseLetter === true && regras.containsNumericCharacter === true
    && regras.containsNonAlphanumericCharacter === true;
}

export function chaveEstante(uid) {
  if (typeof uid !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(uid)) throw new Error('Usuário inválido.');
  return `@minha-estante/usuarios/${uid}/obras-v1`;
}

```

### src/services/firebase.js

```javascript
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { persistencia } from './persistencia';

const configuracao = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigurado = Object.values(configuracao).every((valor) => typeof valor === 'string' && valor.trim().length > 0);
let autenticacao = null;

export function obterAutenticacao() {
  if (!firebaseConfigurado) throw Object.assign(new Error('Configuração ausente.'), { code: 'auth/configuracao-ausente' });
  if (autenticacao) return autenticacao;
  const app = getApps().length ? getApp() : initializeApp(configuracao);
  try {
    autenticacao = initializeAuth(app, { persistence: persistencia });
  } catch (erro) {
    if (erro.code !== 'auth/already-initialized') throw erro;
    autenticacao = getAuth(app);
  }
  autenticacao.languageCode = 'pt';
  return autenticacao;
}

```

### src/services/persistencia.js

```javascript
import { getReactNativePersistence } from 'firebase/auth';
import { sessaoSegura } from './sessaoSegura';

export const persistencia = getReactNativePersistence(sessaoSegura);

```

### src/services/persistencia.web.js

```javascript
import { browserLocalPersistence } from 'firebase/auth';

export const persistencia = browserLocalPersistence;

```

### src/services/sessaoSegura.js

```javascript
import * as SecureStore from 'expo-secure-store';

// O Firebase persiste tokens de sessão; nenhuma senha é guardada aqui.
// Dividimos o JSON em partes pequenas para respeitar os limites do cofre nativo.
function chaveSegura(chave) {
  return `firebase-${Array.from(chave).map((letra) => letra.codePointAt(0).toString(16)).join('-')}`;
}

async function lerIndice(chave) {
  const texto = await SecureStore.getItemAsync(chave);
  if (!texto) return null;
  const indice = JSON.parse(texto);
  if (indice.versao !== 1 || !/^[a-z0-9-]+$/.test(indice.geracao)
    || !Number.isInteger(indice.partes) || indice.partes < 1 || indice.partes > 200) {
    throw new Error('Sessão armazenada inválida.');
  }
  return indice;
}

async function removerPartes(chave, indice) {
  if (!indice) return;
  await Promise.allSettled(Array.from({ length: indice.partes }, (_, numero) =>
    SecureStore.deleteItemAsync(`${chave}-${indice.geracao}-${numero}`)));
}

export const sessaoSegura = {
  async getItem(chave) {
    const base = chaveSegura(chave);
    const indice = await lerIndice(base);
    if (!indice) return null;
    const partes = await Promise.all(Array.from({ length: indice.partes }, (_, numero) =>
      SecureStore.getItemAsync(`${base}-${indice.geracao}-${numero}`)));
    return partes.some((parte) => parte === null) ? null : partes.join('');
  },
  async setItem(chave, valor) {
    const base = chaveSegura(chave);
    const anterior = await lerIndice(base);
    const partes = valor.match(/[\s\S]{1,400}/g) ?? [''];
    if (partes.length > 200) throw new Error('Sessão maior que o limite de armazenamento.');
    const indice = { versao: 1, geracao: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, partes: partes.length };
    try {
      for (let numero = 0; numero < partes.length; numero++) {
        await SecureStore.setItemAsync(`${base}-${indice.geracao}-${numero}`, partes[numero]);
      }
      await SecureStore.setItemAsync(base, JSON.stringify(indice));
    } catch (erro) {
      await removerPartes(base, indice);
      throw erro;
    }
    await removerPartes(base, anterior);
  },
  async removeItem(chave) {
    const base = chaveSegura(chave);
    const indice = await lerIndice(base);
    await SecureStore.deleteItemAsync(base);
    await removerPartes(base, indice);
  },
};

```

### src/services/estante.js

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chaveEstante } from '../utils/conta';
import { lerObras } from '../utils/obras';

const CHAVE_ANTIGA = '@minha-estante/obras-v1';
const CHAVE_IMPORTACAO = '@minha-estante/importacao-legado-v1';

export async function lerEstante(uid) {
  const [texto, antiga, registro] = await Promise.all([
    AsyncStorage.getItem(chaveEstante(uid)), AsyncStorage.getItem(CHAVE_ANTIGA),
    AsyncStorage.getItem(CHAVE_IMPORTACAO),
  ]);
  const importacao = registro ? JSON.parse(registro) : null;
  const podeImportar = !importacao || (importacao.uid === uid && !importacao.concluida);
  return { obras: lerObras(texto), temLegado: podeImportar && antiga !== null && antiga !== '[]' };
}

export async function salvarEstante(uid, obras) {
  const texto = JSON.stringify(obras);
  lerObras(texto);
  await AsyncStorage.setItem(chaveEstante(uid), texto);
}

export async function importarEstanteAntiga(uid, obrasAtuais) {
  const chave = chaveEstante(uid);
  const textoRegistro = await AsyncStorage.getItem(CHAVE_IMPORTACAO);
  const registro = textoRegistro ? JSON.parse(textoRegistro) : null;
  if (registro && registro.uid !== uid) throw new Error('A estante antiga já foi vinculada a outra conta.');
  if (registro?.concluida) throw new Error('A estante antiga já foi importada.');
  const antigas = lerObras(await AsyncStorage.getItem(CHAVE_ANTIGA));
  const mescladas = [...new Map([...antigas, ...obrasAtuais].map((obra) => [obra.id, obra])).values()];
  // Reservamos o legado para esta conta antes de copiar. Uma falha pode ser retomada por ela.
  await AsyncStorage.setItem(CHAVE_IMPORTACAO, JSON.stringify({ uid, concluida: false }));
  await AsyncStorage.setItem(chave, JSON.stringify(mescladas));
  await AsyncStorage.setItem(CHAVE_IMPORTACAO, JSON.stringify({ uid, concluida: true }));
  return mescladas;
}

```

### src/context/ContaContext.js

```javascript
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification,
  sendPasswordResetEmail, signInWithEmailAndPassword, signOut, validatePassword,
} from 'firebase/auth';
import { firebaseConfigurado, obterAutenticacao } from '../services/firebase';
import { mensagemAutenticacao, normalizarEmail, politicaSenhaSegura } from '../utils/conta';

const ContaContext = createContext(null);
const dadosUsuario = (usuario) => usuario
  ? { uid: usuario.uid, email: usuario.email, emailVerificado: usuario.emailVerified } : null;

export function ContaProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(firebaseConfigurado);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [reenvioEm, setReenvioEm] = useState(0);
  const bloqueio = useRef(false);

  useEffect(() => {
    if (!firebaseConfigurado) return;
    let ativo = true;
    let desinscrever;
    Promise.resolve().then(() => {
      if (!ativo) return;
      desinscrever = onAuthStateChanged(obterAutenticacao(), (conta) => {
        if (!ativo) return;
        setUsuario(dadosUsuario(conta));
        setCarregando(false);
      }, (erro) => {
        if (!ativo) return;
        setUsuario(null);
        setMensagem(mensagemAutenticacao(erro));
        setCarregando(false);
      });
    }).catch((erro) => {
      if (!ativo) return;
      setMensagem(mensagemAutenticacao(erro));
      setCarregando(false);
    });
    return () => { ativo = false; desinscrever?.(); };
  }, []);

  async function executar(acao) {
    if (bloqueio.current) return false;
    bloqueio.current = true;
    setOcupado(true);
    setMensagem('');
    try {
      await acao();
      return true;
    } catch (erro) {
      setMensagem(mensagemAutenticacao(erro));
      return false;
    } finally {
      bloqueio.current = false;
      setOcupado(false);
    }
  }

  async function enviarConfirmacao(conta) {
    if (Date.now() < reenvioEm) {
      setMensagem('Aguarde um minuto antes de pedir outro e-mail. Confira também a pasta de spam.');
      return;
    }
    await sendEmailVerification(conta);
    setReenvioEm(Date.now() + 60000);
    setMensagem('Enviamos o link de confirmação. Confira sua caixa de entrada e a pasta de spam.');
  }

  const cadastrar = (email, senha) => executar(async () => {
    const auth = obterAutenticacao();
    const validacao = await validatePassword(auth, senha);
    if (!politicaSenhaSegura(validacao.passwordPolicy)) {
      throw Object.assign(new Error('Política de senha não configurada.'), { code: 'auth/politica-insegura' });
    }
    if (!validacao.isValid) throw Object.assign(new Error('Senha inválida.'), { code: 'auth/weak-password' });
    const resultado = await createUserWithEmailAndPassword(auth, normalizarEmail(email), senha);
    // A conta já existe se o envio falhar. A tela de confirmação permite tentar de novo.
    await enviarConfirmacao(resultado.user);
  });

  const entrar = (email, senha) => executar(async () => {
    const resultado = await signInWithEmailAndPassword(obterAutenticacao(), normalizarEmail(email), senha);
    if (!resultado.user.emailVerified) {
      setMensagem('Confirme seu e-mail antes de acessar a estante. Você pode reenviar o link nesta tela.');
    }
  });

  const confirmarEmail = () => executar(async () => {
    const conta = obterAutenticacao().currentUser;
    if (!conta) throw Object.assign(new Error('Sessão encerrada.'), { code: 'auth/invalid-credential' });
    await reload(conta);
    if (!conta.emailVerified) throw Object.assign(new Error('E-mail pendente.'), { code: 'auth/email-nao-confirmado' });
    await conta.getIdToken(true);
    setUsuario(dadosUsuario(conta));
  });

  const reenviarEmail = () => executar(async () => {
    const conta = obterAutenticacao().currentUser;
    if (conta) await enviarConfirmacao(conta);
  });

  const recuperarSenha = (email) => executar(async () => {
    await sendPasswordResetEmail(obterAutenticacao(), normalizarEmail(email));
    setMensagem('Se houver uma conta apta à recuperação, você receberá um link para redefinir a senha.');
  });

  const sair = () => executar(async () => {
    await signOut(obterAutenticacao());
    setReenvioEm(0);
  });

  return (
    <ContaContext.Provider value={{ usuario, carregando, ocupado, mensagem, firebaseConfigurado,
      cadastrar, entrar, confirmarEmail, reenviarEmail, recuperarSenha, sair,
      limparMensagem: () => setMensagem('') }}>
      {children}
    </ContaContext.Provider>
  );
}

export function useConta() {
  const contexto = useContext(ContaContext);
  if (!contexto) throw new Error('useConta precisa de ContaProvider.');
  return contexto;
}

```

### src/components/TelaConta.js

```javascript
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const estilosConta = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#101218' },
  conteudo: { padding: 24, paddingBottom: 40, gap: 16, flexGrow: 1, justifyContent: 'center' },
  marca: { color: '#B8A7FF', fontSize: 16, fontWeight: '700' },
  titulo: { color: '#F5F6FA', fontSize: 30, fontWeight: '700' },
  texto: { color: '#BFC6D5', fontSize: 16, lineHeight: 24 },
  rotulo: { color: '#F5F6FA', fontSize: 16, fontWeight: '600' },
  campo: { backgroundColor: '#1B1F2A', borderWidth: 1, borderColor: '#69748B', borderRadius: 12,
    color: '#F5F6FA', fontSize: 17, minHeight: 54, paddingHorizontal: 14, paddingVertical: 12 },
  botao: { backgroundColor: '#B8A7FF', minHeight: 52, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textoBotao: { color: '#161021', fontSize: 17, fontWeight: '700' },
  secundario: { backgroundColor: 'transparent', borderColor: '#B8A7FF', borderWidth: 1 },
  textoSecundario: { color: '#E4DBFF' },
  atenuado: { opacity: 0.55 },
  mensagem: { color: '#F5D5A7', fontSize: 16, lineHeight: 24 },
  atendido: { color: '#94DAB5', fontSize: 15, lineHeight: 23 },
  pendente: { color: '#BFC6D5', fontSize: 15, lineHeight: 23 },
});

export default function TelaConta({ titulo, descricao, mensagem, children }) {
  return (
    <SafeAreaView style={estilosConta.tela}>
      <KeyboardAvoidingView style={estilosConta.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={estilosConta.conteudo}>
          <Text style={estilosConta.marca}>MINHA ESTANTE</Text>
          <Text style={estilosConta.titulo} accessibilityRole="header">{titulo}</Text>
          <Text style={estilosConta.texto}>{descricao}</Text>
          {children}
          {mensagem ? <Text accessibilityLiveRegion="polite" style={estilosConta.mensagem}>{mensagem}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function CampoConta({ rotulo, ...propriedades }) {
  return <>
    <Text style={estilosConta.rotulo}>{rotulo}</Text>
    <TextInput accessibilityLabel={rotulo} style={estilosConta.campo} placeholderTextColor="#AAB1C1"
      autoCapitalize="none" autoCorrect={false} {...propriedades} />
  </>;
}

export function BotaoConta({ texto, aoPressionar, desabilitado = false, secundario = false }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: desabilitado }}
      onPress={aoPressionar} disabled={desabilitado}
      style={({ pressed }) => [estilosConta.botao, secundario && estilosConta.secundario,
        (pressed || desabilitado) && estilosConta.atenuado]}>
      <Text style={[estilosConta.textoBotao, secundario && estilosConta.textoSecundario]}>{texto}</Text>
    </Pressable>
  );
}

```

### src/app/_layout.js

```javascript
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContaProvider, useConta } from '../context/ContaContext';

function Rotas() {
  const { usuario, carregando } = useConta();
  if (carregando) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#101218' }}>
    <ActivityIndicator accessibilityLabel="Restaurando sessão" size="large" color="#B8A7FF" />
  </View>;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#101218' } }}>
      <Stack.Protected guard={Boolean(usuario?.emailVerificado)}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(usuario && !usuario.emailVerificado)}>
        <Stack.Screen name="confirmar-email" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  return <SafeAreaProvider><ContaProvider><StatusBar style="light" /><Rotas /></ContaProvider></SafeAreaProvider>;
}

```

### src/app/login.js

```javascript
import { useState } from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import TelaConta, { BotaoConta, CampoConta, estilosConta } from '../components/TelaConta';
import { useConta } from '../context/ContaContext';
import { emailTemFormatoValido } from '../utils/conta';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { entrar, recuperarSenha, ocupado, mensagem, limparMensagem, firebaseConfigurado } = useConta();
  const indisponivel = ocupado || !firebaseConfigurado;

  async function acessar() {
    setErro('');
    if (!emailTemFormatoValido(email) || !senha) {
      setErro('Informe seu e-mail e sua senha para entrar.');
      return;
    }
    const sucesso = await entrar(email, senha);
    if (sucesso) setSenha('');
  }

  function recuperar() {
    setErro('');
    if (!emailTemFormatoValido(email)) { setErro('Digite seu e-mail acima para recuperar a senha.'); return; }
    recuperarSenha(email);
  }

  return (
    <TelaConta titulo="Entrar na conta" descricao="Acesse sua estante com seu e-mail e senha." mensagem={erro || mensagem}>
      {!firebaseConfigurado && <Text style={estilosConta.mensagem}>A conexão com o serviço de contas aguarda a configuração do Firebase.</Text>}
      <CampoConta rotulo="E-mail" value={email} onChangeText={(valor) => { setEmail(valor); setErro(''); limparMensagem(); }}
        keyboardType="email-address" autoComplete="email" maxLength={254} editable={!ocupado} />
      <CampoConta rotulo="Senha" value={senha} onChangeText={(valor) => { setSenha(valor); setErro(''); limparMensagem(); }}
        secureTextEntry autoComplete="current-password" maxLength={128} editable={!ocupado} />
      <BotaoConta texto={ocupado ? 'Aguarde…' : 'Entrar'} aoPressionar={acessar} desabilitado={indisponivel} />
      <BotaoConta texto="Criar uma conta" secundario desabilitado={ocupado}
        aoPressionar={() => { limparMensagem(); router.push('/cadastro'); }} />
      <BotaoConta texto="Esqueci minha senha" secundario desabilitado={indisponivel} aoPressionar={recuperar} />
      <Text style={estilosConta.texto}>Você precisa de internet para entrar. Depois, a estante desta conta continua disponível neste aparelho sem internet.</Text>
    </TelaConta>
  );
}

```

### src/app/cadastro.js

```javascript
import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import TelaConta, { BotaoConta, CampoConta, estilosConta } from '../components/TelaConta';
import { useConta } from '../context/ContaContext';
import { requisitosSenha, validarConta } from '../utils/conta';

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const { cadastrar, ocupado, mensagem, limparMensagem, firebaseConfigurado } = useConta();

  async function criarConta() {
    const problema = validarConta(email, senha, confirmacao);
    setErro(problema ?? '');
    if (problema) return;
    const sucesso = await cadastrar(email, senha);
    if (sucesso) { setSenha(''); setConfirmacao(''); }
  }

  return (
    <TelaConta titulo="Criar conta" descricao="Use um e-mail ao qual você tenha acesso. Enviaremos um link para confirmar que ele é seu." mensagem={erro || mensagem}>
      {!firebaseConfigurado && <Text style={estilosConta.mensagem}>O cadastro será liberado após a configuração do Firebase.</Text>}
      <CampoConta rotulo="E-mail" value={email} onChangeText={(valor) => { setEmail(valor); setErro(''); limparMensagem(); }}
        keyboardType="email-address" autoComplete="email" maxLength={254} editable={!ocupado} />
      <CampoConta rotulo="Senha" value={senha} onChangeText={(valor) => { setSenha(valor); setErro(''); limparMensagem(); }}
        secureTextEntry autoComplete="new-password" maxLength={128} editable={!ocupado} />
      <View accessibilityLabel="Regras da senha" style={{ gap: 4 }}>
        {requisitosSenha(senha).map((regra) => <Text key={regra.texto}
          style={regra.atendido ? estilosConta.atendido : estilosConta.pendente}>
          {regra.atendido ? '✓' : '○'} {regra.texto}
        </Text>)}
      </View>
      <CampoConta rotulo="Confirmar senha" value={confirmacao} onChangeText={(valor) => { setConfirmacao(valor); setErro(''); }}
        secureTextEntry autoComplete="new-password" maxLength={128} editable={!ocupado} />
      <BotaoConta texto={ocupado ? 'Aguarde…' : 'Criar conta e confirmar e-mail'} aoPressionar={criarConta}
        desabilitado={ocupado || !firebaseConfigurado} />
      <BotaoConta texto="Já tenho uma conta" secundario desabilitado={ocupado}
        aoPressionar={() => { limparMensagem(); router.replace('/login'); }} />
      <Text style={estilosConta.texto}>Sua conta será guardada no serviço de autenticação. Nesta etapa, as obras e capas continuam salvas somente neste aparelho.</Text>
    </TelaConta>
  );
}

```

### src/app/confirmar-email.js

```javascript
import { Text } from 'react-native';
import TelaConta, { BotaoConta, estilosConta } from '../components/TelaConta';
import { useConta } from '../context/ContaContext';

export default function ConfirmarEmail() {
  const { usuario, confirmarEmail, reenviarEmail, sair, ocupado, mensagem } = useConta();
  return (
    <TelaConta titulo="Confirme seu e-mail" descricao={`Abra o link enviado para ${usuario?.email ?? 'seu e-mail'}. Depois, volte aqui para continuar.`} mensagem={mensagem}>
      <Text style={estilosConta.texto}>O acesso à estante só será liberado depois da confirmação. Se o link não chegou, confira a pasta de spam ou solicite outro.</Text>
      <BotaoConta texto={ocupado ? 'Aguarde…' : 'Já confirmei meu e-mail'} aoPressionar={confirmarEmail} desabilitado={ocupado} />
      <BotaoConta texto="Reenviar confirmação" aoPressionar={reenviarEmail} desabilitado={ocupado} secundario />
      <BotaoConta texto="Usar outra conta" aoPressionar={sair} desabilitado={ocupado} secundario />
    </TelaConta>
  );
}

```

### src/app/index.js

```javascript
import App from '../../App';
import { useConta } from '../context/ContaContext';

export default function Estante() {
  const { usuario } = useConta();
  return <App key={usuario.uid} />;
}

```

### index.js

```javascript
import 'expo-router/entry';

```

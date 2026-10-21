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

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

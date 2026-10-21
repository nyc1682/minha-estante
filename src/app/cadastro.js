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

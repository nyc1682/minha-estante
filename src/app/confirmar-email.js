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

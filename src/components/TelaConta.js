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

import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const titulo = 'Minha Estante';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.tela}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.conteudo}>
          <Text style={styles.etiqueta}>MANGÁS E MANHWAS</Text>
          <Text style={styles.titulo} accessibilityRole="header">{titulo}</Text>
          <Text style={styles.descricao}>
            Um lugar para acompanhar suas leituras, capítulo por capítulo.
          </Text>
          <View style={styles.cartao}>
            <Text style={styles.subtitulo} accessibilityRole="header">
              Sua estante começa aqui
            </Text>
            <Text style={styles.descricao}>
              Ainda não há obras cadastradas. Na próxima etapa, vamos criar o
              primeiro cadastro juntos.
            </Text>
          </View>
          <Text style={styles.rodape}>Etapa 1 · Primeira tela funcionando</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#101218' },
  conteudo: { flexGrow: 1, padding: 24, gap: 16 },
  etiqueta: { color: '#B8A7FF', fontSize: 13, fontWeight: '700' },
  titulo: { color: '#F5F6FA', fontSize: 32, fontWeight: '700' },
  descricao: { color: '#C4C8D4', fontSize: 17, lineHeight: 26 },
  cartao: {
    backgroundColor: '#1B1F2A', borderRadius: 16, padding: 24,
    marginTop: 24, gap: 12, borderWidth: 1, borderColor: '#353B4B',
  },
  subtitulo: { color: '#F5F6FA', fontSize: 22, fontWeight: '600' },
  rodape: { color: '#AAB1C1', fontSize: 14, lineHeight: 22, marginTop: 16 },
});

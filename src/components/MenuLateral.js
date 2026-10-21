import { useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MenuLateral({ aberto, aoFechar, aoSelecionar, selecionado, opcoes }) {
  const { width } = useWindowDimensions();
  const largura = Math.min(340, width * 0.86);
  const [deslocamento] = useState(() => new Animated.Value(-340));
  const fechando = useRef(false);

  function abrir() {
    fechando.current = false;
    deslocamento.setValue(-largura);
    Animated.timing(deslocamento, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }

  function fechar(valor) {
    if (fechando.current) return;
    fechando.current = true;
    Animated.timing(deslocamento, { toValue: -largura, duration: 180, useNativeDriver: true })
      .start(({ finished }) => {
        if (!finished) return;
        aoFechar();
        if (valor !== undefined) aoSelecionar(valor);
      });
  }

  return (
    <Modal visible={aberto} transparent animationType="none" onShow={abrir}
      onRequestClose={() => fechar()} statusBarTranslucent>
      <SafeAreaProvider>
        <View style={styles.fundo}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button"
            accessibilityLabel="Fechar menu" onPress={() => fechar()} />
          <Animated.View style={[styles.painel, { width: largura, transform: [{ translateX: deslocamento }] }]}>
            <SafeAreaView style={styles.area}>
              <ScrollView contentContainerStyle={styles.conteudo}>
                <View style={styles.cabecalho}>
                  <Text style={styles.titulo} accessibilityRole="header">Minha Estante</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu"
                    onPress={() => fechar()} style={styles.fechar}>
                    <Text style={styles.icone}>×</Text>
                  </Pressable>
                </View>
                <Text style={styles.ajuda}>Escolha o que deseja ver</Text>
                {opcoes.map((opcao) => (
                  <Pressable key={opcao.valor} accessibilityRole="button"
                    accessibilityState={{ selected: selecionado === opcao.valor }}
                    onPress={() => fechar(opcao.valor)}
                    style={({ pressed }) => [styles.opcao,
                      selecionado === opcao.valor && styles.selecionada, pressed && styles.pressionada]}>
                    <Text style={styles.texto}>{opcao.texto}</Text>
                    {opcao.total !== undefined && <Text style={styles.total}>{opcao.total}</Text>}
                  </Pressable>
                ))}
                <Text style={styles.ajuda}>Livros, mangás, manhwas, filmes e séries.</Text>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  painel: { height: '100%', backgroundColor: '#171A23' },
  area: { flex: 1 },
  conteudo: { padding: 20, gap: 16, paddingBottom: 32 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { flex: 1, color: '#F5F6FA', fontSize: 24, fontWeight: '700' },
  fechar: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  icone: { color: '#E4DBFF', fontSize: 32 },
  ajuda: { color: '#AAB1C1', fontSize: 15, lineHeight: 23 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    minHeight: 56, borderWidth: 1, borderColor: '#353B4B', borderRadius: 14, backgroundColor: '#1B1F2A' },
  selecionada: { borderColor: '#B8A7FF', backgroundColor: '#302742' },
  pressionada: { opacity: 0.6 },
  texto: { flex: 1, color: '#F5F6FA', fontSize: 17, fontWeight: '600' },
  total: { color: '#B8A7FF', fontSize: 16 },
});

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

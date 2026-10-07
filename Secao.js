import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Secao({ titulo, total, aberta, aoAlternar, desabilitada, children }) {
  return (
    <View style={styles.secao}>
      <Pressable accessibilityRole="button"
        accessibilityLabel={total === undefined ? titulo : `${titulo}, ${total} obras`}
        accessibilityState={{ expanded: aberta, disabled: desabilitada }}
        disabled={desabilitada} onPress={aoAlternar}
        style={({ pressed }) => [styles.cabecalho, aberta && styles.aberto,
          (pressed || desabilitada) && styles.atenuado]}>
        <Text style={styles.titulo}>{titulo}</Text>
        {total !== undefined && <Text style={styles.contagem}>{total}</Text>}
        <Text style={styles.sinal} importantForAccessibility="no">{aberta ? '−' : '+'}</Text>
      </Pressable>
      {aberta && <View style={styles.conteudo}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { borderWidth: 1, borderColor: '#353B4B', borderRadius: 16, overflow: 'hidden' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60,
    padding: 16, backgroundColor: '#1B1F2A' },
  aberto: { backgroundColor: '#35294F' },
  titulo: { flex: 1, color: '#F5F6FA', fontSize: 19, fontWeight: '700' },
  contagem: { color: '#E4DBFF', fontSize: 16 },
  sinal: { color: '#B8A7FF', fontSize: 24, fontWeight: '700' },
  conteudo: { padding: 12, gap: 16 },
  atenuado: { opacity: 0.6 },
});

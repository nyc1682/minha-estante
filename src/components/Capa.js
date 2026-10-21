import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Capa({ uri, titulo, grande = false }) {
  const [uriComErro, setUriComErro] = useState(null);
  const tamanho = [styles.capa, grande && styles.grande];
  if (uri && uri !== uriComErro) {
    return (
      <Image source={{ uri }} style={tamanho} resizeMode="contain"
        accessibilityLabel={`Capa de ${titulo || 'sua obra'}`}
        onError={() => setUriComErro(uri)} />
    );
  }
  return (
    <View style={[tamanho, styles.vazia]}>
      <Text style={styles.texto}>{uri ? 'Capa indisponível' : 'Sem capa'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { width: 72, height: 108, borderRadius: 8, backgroundColor: '#101218' },
  grande: { width: 100, height: 150 },
  vazia: { justifyContent: 'center', alignItems: 'center', padding: 6 },
  texto: { color: '#AAB1C1', fontSize: 12, textAlign: 'center' },
});

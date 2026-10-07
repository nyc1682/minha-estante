import { Pressable, StyleSheet, Text, View } from 'react-native';
import Capa from './Capa';
import { STATUS } from './obras';

const GRUPOS = [
  { valor: 'livro', texto: 'Livros' },
  { valor: 'manga', texto: 'Mangás' },
  { valor: 'manhwa', texto: 'Manhwas' },
];

export default function ListaObras({ obras, aoEditar, ocupado }) {
  return (
    <View style={styles.lista}>
      {GRUPOS.map((grupo) => {
        const itens = obras.filter((obra) => obra.tipo === grupo.valor);
        return (
          <View key={grupo.valor} style={styles.grupo}>
            <Text style={styles.topico} accessibilityRole="header">{grupo.texto} ({itens.length})</Text>
            {itens.length === 0 && <Text style={styles.vazio}>Nenhuma obra neste tópico.</Text>}
            {itens.map((obra) => (
              <View key={obra.id} style={styles.cartao}>
                <View style={styles.linha}>
                  <Capa uri={obra.capa} titulo={obra.titulo} />
                  <View style={styles.dados}>
                    <Text style={styles.titulo}>{obra.titulo}</Text>
                    <Text style={styles.status}>{STATUS.find((item) => item.valor === obra.status).texto}</Text>
                    <Text style={styles.descricao}>
                      {obra.unidade === 'pagina' ? 'Última página' : 'Último capítulo'}: {String(obra.progresso).replace('.', ',')}
                    </Text>
                  </View>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${obra.titulo}`}
                  disabled={ocupado} onPress={() => aoEditar(obra)}
                  style={({ pressed }) => [styles.editar, (pressed || ocupado) && styles.atenuado]}>
                  <Text style={styles.textoEditar}>Editar obra</Text>
                </Pressable>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 24 },
  grupo: { gap: 12 },
  topico: { color: '#E4DBFF', fontSize: 20, fontWeight: '700' },
  vazio: { color: '#AAB1C1', fontSize: 15, lineHeight: 23 },
  cartao: { borderWidth: 1, borderColor: '#353B4B', borderRadius: 12, padding: 12, gap: 12, backgroundColor: '#1B1F2A' },
  linha: { flexDirection: 'row', gap: 12 },
  dados: { flex: 1, minWidth: 0, gap: 8 },
  titulo: { color: '#F5F6FA', fontSize: 20, fontWeight: '600' },
  status: { color: '#B8A7FF', fontSize: 14, fontWeight: '700' },
  descricao: { color: '#C4C8D4', fontSize: 16, lineHeight: 24 },
  editar: { borderWidth: 1, borderColor: '#B8A7FF', padding: 14, borderRadius: 12, alignItems: 'center' },
  textoEditar: { color: '#E4DBFF', fontSize: 16, fontWeight: '600' },
  atenuado: { opacity: 0.6 },
});

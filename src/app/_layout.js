import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContaProvider, useConta } from '../context/ContaContext';

function Rotas() {
  const { usuario, carregando } = useConta();
  if (carregando) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#101218' }}>
    <ActivityIndicator accessibilityLabel="Restaurando sessão" size="large" color="#B8A7FF" />
  </View>;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#101218' } }}>
      <Stack.Protected guard={Boolean(usuario?.emailVerificado)}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(usuario && !usuario.emailVerificado)}>
        <Stack.Screen name="confirmar-email" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  return <SafeAreaProvider><ContaProvider><StatusBar style="light" /><Rotas /></ContaProvider></SafeAreaProvider>;
}

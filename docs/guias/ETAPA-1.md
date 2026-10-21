# Etapa 1 — Minha Estante

Projeto local: C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante

## Como testar

1. Instale Node.js LTS pelo site https://nodejs.org/en/download e reabra o VS Code.
2. Abra a pasta do projeto no VS Code e use Terminal > Novo Terminal.
3. Execute npm.cmd ci para instalar as versões do package-lock.json.
4. Execute npm.cmd start para iniciar o servidor e mostrar o QR code.
5. Instale Expo Go no Android (https://expo.dev/go), use o mesmo Wi-Fi do PC e escaneie o QR code.
6. Você deve ver Minha Estante e Sua estante começa aqui, com fundo escuro.
7. Altere a constante titulo em App.js, salve e veja o texto atualizar no celular.
8. Confirme o teste na conversa antes de avançar para o cadastro.

O projeto foi criado a partir do template oficial blank, sem TypeScript.
Comando equivalente, executado na pasta outputs: npx.cmd create-expo-app@latest minha-estante --template blank
A biblioteca de área segura foi instalada na pasta do projeto com: npx.cmd expo install react-native-safe-area-context
Esses comandos já foram executados; não recrie o projeto.

## Conceitos usados

- import traz componentes de outras bibliotecas.
- function App define um componente React: uma função que descreve a tela.
- return devolve a interface escrita em JSX, a sintaxe de elementos dentro do JavaScript.
- const titulo guarda o texto em uma variável que não será reatribuída.
- {titulo} coloca o valor JavaScript dentro do JSX.
- View agrupa elementos; Text mostra textos; ScrollView permite rolar se faltar espaço.
- style e accessibilityRole são props: configurações recebidas pelos componentes.
- StyleSheet.create organiza objetos JavaScript com as cores, tamanhos e espaçamentos.
- SafeAreaView evita que o conteúdo fique sob a câmera e as barras do sistema.
- Um commit salva uma etapa no histórico Git; push envia os commits ao GitHub.

## Código completo dos arquivos pequenos

Os arquivos abaixo estão na raiz do projeto. O package-lock.json registra centenas de
versões automaticamente, e as imagens ficam em assets; não são reproduzidos aqui.
AGENTS.md e LICENSE vieram do template oficial.
## App.js

```
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

```

## index.js

```
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

```

## app.json

```
{
  "expo": {
    "name": "Minha Estante",
    "slug": "minha-estante",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}

```

## package.json

```
{
  "name": "minha-estante",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "expo": "~57.0.27",
    "expo-status-bar": "~57.0.1",
    "react": "19.2.3",
    "react-native": "0.86.3",
    "react-native-safe-area-context": "~5.7.0"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "private": true,
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-config-expo": "~57.0.2"
  }
}

```

## eslint.config.js

```
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  }
]);

```

## .gitignore

```
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

# generated native folders
/ios
/android

```

## README.md

```
# Minha Estante

App para organizar mangás e manhwas, desenvolvido em JavaScript, React Native e Expo.

## Etapa atual

Etapa 1: primeira tela em português, com tema escuro e áreas seguras no Android.
Cadastro, edição, exclusão, capítulos, armazenamento local, busca e filtros serão
adicionados em etapas seguintes, após confirmar o teste no celular.

## Abrir no Windows

Instale o Node.js LTS de https://nodejs.org/en/download e reabra o VS Code.
Abra esta pasta pelo menu Arquivo > Abrir Pasta.
No terminal integrado, dentro desta pasta, execute:

```powershell
npm.cmd ci
npm.cmd start
```

`ci` instala as versões registradas no package-lock.json.
`start` inicia o servidor de desenvolvimento e mostra um QR code.
Usamos `.cmd` para evitar bloqueios de scripts PowerShell no Windows.

## Testar no Android

Instale o Expo Go: https://expo.dev/go.
Conecte o computador e o celular à mesma rede Wi-Fi.
Abra o Expo Go e escaneie o QR code mostrado no terminal.
Você deve ver “Minha Estante” e “Sua estante começa aqui”.
Edite o texto em App.js e salve para verificar a atualização no celular.
Para parar o servidor, pressione Ctrl+C no terminal.

O GitHub guarda o código e seu histórico; ele não instala o app no celular.
Este teste usa o servidor local. Uma versão instalável que funcione sem
computador será preparada em uma etapa posterior.

## Arquivos principais

- App.js: componente da primeira tela e estilos.
- index.js: registra o componente no Expo.
- app.json: configura nome, orientação e aparência.
- package.json: dependências e comandos.
- package-lock.json: versões exatas das dependências.
- assets/: imagens padrão do template Expo.

## Verificações

O pacote JavaScript para Android foi gerado e a análise ESLint passou.
O diagnóstico expo-doctor passou nas 21 verificações antes das atualizações
compatíveis do npm. A compatibilidade e o pacote Android foram conferidos novamente.
O teste visual em um celular físico ainda precisa ser confirmado.
Não há TypeScript nesta versão. ESLint é uma ferramenta de desenvolvimento.

O npm audit reporta 22 alertas nas dependências transitivas do template.
Não use npm audit fix --force: a correção sugerida retrocede o Expo para uma
versão incompatível. As correções sem mudança principal já foram aplicadas.

Documentação: https://docs.expo.dev/more/create-expo/
e https://docs.expo.dev/get-started/start-developing/.

```

## AGENTS.md

```
This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

```

## LICENSE

```
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```


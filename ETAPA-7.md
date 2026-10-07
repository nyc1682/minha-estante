# Etapa 7 — Aplicativo Android instalável

O projeto está configurado para gerar um APK de versão final, com o JavaScript dentro do aplicativo. Após instalar, você abre Minha Estante pelo ícone no celular, sem Expo Go e sem o computador. Os cadastros e as capas continuam locais.

**Situação atual:** APK Android 1.0.0 gerado com sucesso na conta Expo `langue`, com chave Android gerenciada pelo EAS. O teste no celular físico ainda precisa da sua confirmação.

[Baixar o APK para instalar no Android](https://expo.dev/artifacts/eas/d8Tv1Op8i-2cNdNeT7COLs8M2X0LYIoj56Lk2UL-TRU.apk)

Cópia local do instalador: `C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante-1.0.0.apk`.

O arquivo tem cerca de 70 MB. Sua estrutura contém manifesto Android, código nativo, JavaScript embutido e bloco de assinatura. Isso verifica o conteúdo do instalador; a abertura, a galeria e a persistência no aparelho devem ser testadas seguindo os passos abaixo.

Projeto Expo: https://expo.dev/accounts/langue/projects/minha-estante

Compilação Android 1.0.0: https://expo.dev/accounts/langue/projects/minha-estante/builds/d765b791-d4e4-4587-ae11-d5f1eb3e88b4

## Conceitos

- **APK:** arquivo de instalação de um aplicativo Android.
- **Build (compilação):** transforma o projeto JavaScript e as bibliotecas nativas no aplicativo instalável.
- **EAS Build:** serviço oficial do Expo que realiza essa compilação. O acesso à conta Expo é necessário para gerar o arquivo; não é um login dos usuários dentro do Minha Estante.
- **Identificador Android:** `com.nyc1682.minhaestante` identifica este aplicativo nas próximas instalações e atualizações.
- **Assinatura:** o Android usa uma chave para reconhecer atualizações do mesmo app. Mantenha a mesma conta Expo e a chave gerenciada pelo EAS nas próximas versões.
- **JSON:** formato dos arquivos de configuração. Cada propriedade tem um nome e um valor; não usamos comentários dentro desses arquivos.

## Pasta e comandos no Windows

Abra no VS Code:

`C:\Users\nycol\Documents\Codex\2026-10-07\me-d\outputs\minha-estante`

Execute os comandos abaixo no terminal integrado, dentro dessa pasta. Se precisar conferir a pasta atual, use `Get-Location` no PowerShell.

1. Crie uma conta em https://expo.dev/signup.
2. Entre na conta pelo comando:

```powershell
npx.cmd eas-cli@latest login
```

Esse comando usa a ferramenta oficial EAS, sem instalar uma dependência no aplicativo. Complete o login na janela do navegador. Digite senhas somente no site oficial ou no prompt de login; não envie sua senha na conversa.

3. Confira o usuário:

```powershell
npx.cmd eas-cli@latest whoami
```

O resultado esperado é seu nome de usuário Expo.

4. Gere o APK:

```powershell
npx.cmd eas-cli@latest build --platform android --profile apk
```

Na primeira execução, aceite criar/vincular o projeto Minha Estante à sua conta Expo, se solicitado. Quando perguntar se deseja gerar uma nova chave Android (keystore), aceite para esta primeira versão. Esse comando envia o projeto para compilação; seus cadastros do celular não fazem parte do código enviado. Ele não publica na Play Store. Se houver aviso de limite ou cobrança, pare e envie a mensagem para avaliarmos antes de contratar qualquer serviço.

Aguarde o status Finished. O tempo depende da fila e da compilação. O terminal deve mostrar a página da compilação e o link de instalação/download. Um erro ou um status Failed significa que o APK não está pronto; envie o erro antes de continuar.

## Instalar e testar

1. Abra no Android o link da compilação concluída e baixe o APK.
2. Abra o arquivo baixado. Se o Android solicitar, permita que o navegador ou o gerenciador de arquivos instale esse aplicativo.
3. Abra Minha Estante pelo ícone próprio na lista de aplicativos.
4. Desligue o servidor Expo no computador (Ctrl+C), ative modo avião no celular e abra Minha Estante novamente.
5. Cadastre uma obra, escolha uma capa local, edite o status e o progresso, feche e reabra. Os dados devem permanecer.

**Atenção aos dados existentes:** o APK é um aplicativo separado do Expo Go. Os cadastros e as capas feitos no Expo Go não são transferidos automaticamente para essa instalação. Não desinstale o Expo Go se quiser manter acesso aos dados anteriores. Um recurso de exportação/importação pode ser uma próxima etapa.

## Arquivos de configuração

O código completo de `eas.json` e `app.json` está abaixo. Ambos ficam na pasta minha-estante. A CLI acrescentou o identificador do projeto Expo em app.json ao vincular o projeto à conta langue.

### eas.json

```json
{
  "cli": {
    "version": ">= 24.11.0",
    "appVersionSource": "local"
  },
  "build": {
    "apk": {
      "distribution": "internal",
      "developmentClient": false,
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### app.json

```json
{
  "expo": {
    "name": "Minha Estante",
    "slug": "minha-estante",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "updates": {
      "enabled": false
    },
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Permita escolher uma imagem para a capa da sua obra.",
          "cameraPermission": false,
          "microphonePermission": false
        }
      ]
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.nyc1682.minhaestante",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "5f169008-19cd-48f4-9b61-89b0231a3bdb"
      }
    }
  }
}
```

`developmentClient: false` mantém o perfil como aplicativo final. `buildType: apk` gera o arquivo que pode ser instalado diretamente. `updates.enabled: false` evita procurar atualizações de código pela internet; alterações futuras podem ser entregues por um novo APK assinado com a mesma chave. Para futuras versões, também aumente android.versionCode.

## Documentação oficial consultada

- [Criar a primeira compilação](https://docs.expo.dev/build/setup/)
- [Gerar e instalar APK no Android](https://docs.expo.dev/build-reference/apk/)
- [EAS CLI e login](https://docs.expo.dev/eas/cli/)
- [Configuração do app no Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/config/app/)

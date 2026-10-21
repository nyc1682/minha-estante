# Instalar Minha Estante no Android

## Versão 1.0.0

O APK foi gerado na conta Expo `langue`, com o identificador Android `com.nyc1682.minhaestante`.

[Consultar a compilação no Expo](https://expo.dev/accounts/langue/projects/minha-estante/builds/d765b791-d4e4-4587-ae11-d5f1eb3e88b4)

O link direto de download usado na primeira entrega estava indisponível (HTTP 404) na revisão de 21/10/2026. Uma cópia do arquivo `minha-estante-1.0.0.apk` foi preservada localmente na pasta outputs, ao lado da pasta do projeto. Os instaladores não são versionados junto ao código-fonte.

## Instalar o arquivo

1. Transfira o APK para o celular e abra o arquivo.
2. Se o Android solicitar, autorize a instalação pelo navegador ou gerenciador de arquivos usado.
3. Toque em Instalar e abra Minha Estante pelo ícone próprio.
4. Desligue o servidor Expo no computador e teste em modo avião: cadastre uma obra, feche e reabra. Os dados devem permanecer.

O app instalado não depende de Expo Go, computador ou conexão com a internet. Os cadastros anteriores do Expo Go não são transferidos automaticamente, pois pertencem a outro armazenamento. Preserve o Expo Go enquanto precisar consultar esses dados.

## Gerar outro APK

No terminal do VS Code, dentro da pasta do repositório que contém package.json:

```powershell
npm.cmd ci
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest build --platform android --profile apk
```

`ci` instala as dependências. `login` autentica na conta Expo; a conta usada para este projeto é langue. `build` envia o projeto aos servidores EAS e gera o APK pelo perfil definido em eas.json. Aguarde o status Finished e baixe o instalador pelo link informado.

Não envie senhas ou chaves ao repositório. Se o serviço informar limite ou cobrança, avalie o aviso antes de contratar qualquer plano.

Para uma nova versão, aumente expo.version e android.versionCode em app.json. Mantenha o identificador Android e a mesma chave de assinatura gerenciada no EAS para instalar como atualização. O perfil apk é de versão final; não usa cliente de desenvolvimento.

[Documentação oficial de APKs no Expo](https://docs.expo.dev/build-reference/apk/).

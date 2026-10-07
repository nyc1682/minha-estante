# Minha Estante

App para organizar mangás e manhwas, desenvolvido em JavaScript, React Native e Expo.

## Etapa atual

Etapa 2: cadastro de obras, lista e categorias Lendo, Quero ler, Já li e Pausado.
Informe nome, tipo (mangá/manhwa) e último capítulo lido. Os dados ficam salvos
localmente no celular, sem login ou servidor. Já li corresponde a concluído.
Edição, exclusão, atualização de capítulos e busca serão adicionadas nas próximas
etapas, após confirmar o teste desta versão no celular.

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
Você deve ver “Minha Estante” e o formulário “Adicionar obra”.
Cadastre uma obra em cada status e toque nas categorias para filtrar a lista.
Feche e reabra o projeto no Expo Go para conferir que as obras foram mantidas.
O guia ETAPA-2.md explica os conceitos e mostra o código completo dos arquivos.
Para parar o servidor, pressione Ctrl+C no terminal.

O GitHub guarda o código e seu histórico; ele não instala o app no celular.
Este teste usa o servidor local. Uma versão instalável que funcione sem
computador será preparada em uma etapa posterior.

## Arquivos principais

- App.js: formulário, lista, estado React, carregamento e gravação local.
- Opcoes.js: botões reutilizáveis de tipo, status e categorias.
- obras.js: opções e validação dos cadastros e dados salvos.
- index.js: registra o componente no Expo.
- app.json: configura nome, orientação e aparência.
- package.json: dependências e comandos.
- package-lock.json: versões exatas das dependências.
- assets/: imagens padrão do template Expo.

## Verificações

O pacote JavaScript para Android foi gerado e a análise ESLint passou.
A validação de campos e a leitura dos dados salvos foram verificadas, incluindo
os quatro status, capítulos decimais, títulos vazios e dados inválidos.
O teste visual e a persistência em um celular físico ainda precisam ser confirmados.
Não há TypeScript nesta versão. ESLint é uma ferramenta de desenvolvimento.

O npm audit reporta 22 alertas nas dependências transitivas do template.
Não use npm audit fix --force: a correção sugerida retrocede o Expo para uma
versão incompatível. As correções sem mudança principal já foram aplicadas.

Documentação: https://docs.expo.dev/more/create-expo/
e https://docs.expo.dev/get-started/start-developing/.

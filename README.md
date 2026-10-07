# Minha Estante

App para organizar mangás, manhwas, livros, filmes e séries, desenvolvido em JavaScript, React Native e Expo.

## Etapa atual

Etapa 6: menu lateral que desliza da esquerda para a direita ao tocar em ☰ Menu.
O menu fecha ao escolher uma opção, tocar fora, tocar em × ou usar Voltar no Android.
Opções: Cadastrar novo item, Todos, Terminei, Lendo / assistindo e Quero ler / assistir.
A tela mostra somente o conteúdo escolhido; a opção inicial é Todos.
Cada lista mostra os tópicos Livros, Mangás, Manhwas, Filmes e Séries com suas quantidades.
Tipos: Mangá, Manhwa, Livro, Filme e Série.
Leituras usam Lendo / Quero ler; filmes e séries usam Assistindo / Quero assistir.
Terminei vale para todos. Os valores salvos dos status continuam compatíveis com as versões anteriores.
Leituras acompanham capítulos ou páginas; filmes, minutos; séries, episódios ou minutos.
Páginas e episódios aceitam inteiros. Trocar tipo ou unidade reinicia o campo de progresso em 0.
Toque em Editar obra, altere os campos e salve, ou cancele para descartar o rascunho.
Escolha no menu o status desejado e encontre as obras pelo tópico de tipo.
Ao editar uma obra, o formulário abre automaticamente. Ao salvar, abre sua categoria.
Trocar de opção no menu preserva os campos; Cancelar edição descarta o rascunho e mostra Todos.
Os dados ficam salvos no celular.
Cadastros antigos em Pausado aparecem como Lendo, mantendo o progresso.
Escolha uma capa opcional da galeria, veja a prévia e salve a obra.
Uma cópia da imagem fica guardada no celular e aparece ao lado do título na lista.
Na edição, você pode trocar ou remover a capa; cancelar mantém a imagem salva.
Obras antigas continuam funcionando sem capa. Não há busca automática nesta etapa.
Exclusão e busca serão adicionadas após confirmar o teste desta etapa.

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
Você deve ver “Minha Estante”, o botão ☰ Menu e a lista Todos.
Abra o menu e toque em Cadastrar novo item para mostrar o formulário.
Cadastre uma obra em cada status e escolha as categorias para conferir os tópicos.
Cadastre um Filme em Assistindo com 30 minutos e uma Série em Quero assistir com 0 episódios.
Confira que cada obra aparece no tópico certo e apenas nos status correspondentes (ou em Todos).
Teste fechar o menu tocando fora, em × e usando Voltar no Android.
Edite uma obra: o status e o progresso devem mudar sem duplicar o cadastro.
Cadastre um Livro e confira o tópico Livros e o progresso por páginas.
Feche e reabra o projeto no Expo Go para conferir que as obras foram mantidas.
Escolha uma capa, salve e confira a imagem ao lado da obra. Teste trocar, remover
e cancelar a edição. Feche e reabra para confirmar que a capa foi mantida.
O guia ETAPA-6.md explica os conceitos e mostra o código completo dos arquivos alterados.
Para parar o servidor, pressione Ctrl+C no terminal.

O GitHub guarda o código e seu histórico; ele não instala o app no celular.
Este teste usa o servidor local. Uma versão instalável que funcione sem
computador será preparada em uma etapa posterior.

## Arquivos principais

- App.js: formulário, lista, estado React, carregamento e gravação local.
- Opcoes.js: botões reutilizáveis de tipo, status e categorias.
- obras.js: opções, validação, migração dos dados antigos e atualização da lista.
- Capa.js: exibição da imagem, com indicação quando não há capa ou ela falha.
- capas.js: cópia das imagens para documentos e limpeza das capas substituídas.
- MenuLateral.js: menu animado com seleção, contagem e fechamento pelo botão Voltar.
- ListaObras.js: lista agrupada pelos cinco tipos, com capa e edição.
- Secao.js: componente da etapa anterior, preservado como referência; não é usado pela tela atual.
- index.js: registra o componente no Expo.
- app.json: configura nome, orientação e aparência.
- package.json: dependências e comandos.
- package-lock.json: versões exatas das dependências.
- assets/: imagens padrão do template Expo.

## Verificações

O pacote JavaScript para Android foi gerado e a análise ESLint passou.
A edição sem duplicação, migração de Pausado para Lendo, tipos, progresso e
leitura dos dados salvos foram verificados. Páginas aceitam números inteiros;
capítulos também aceitam decimais. Títulos vazios e valores inválidos são rejeitados.
O teste visual e a persistência em um celular físico ainda precisam ser confirmados.
Os fluxos de cópia, falha de cópia, limpeza restrita e preservação do cadastro
foram verificados com um sistema de arquivos simulado. Galeria e arquivos nativos
precisam ser testados no Android físico.
Não há TypeScript nesta versão. ESLint é uma ferramenta de desenvolvimento.

O npm audit reporta 22 alertas nas dependências transitivas do template.
Não use npm audit fix --force: a correção sugerida retrocede o Expo para uma
versão incompatível. As correções sem mudança principal já foram aplicadas.

Documentação: https://docs.expo.dev/more/create-expo/
e https://docs.expo.dev/get-started/start-developing/.

# Orientações para agentes — Minha Estante

## Projeto

App mobile em português para livros, mangás, manhwas, filmes e séries. Usa JavaScript, React Native e Expo SDK 57. A estante usa armazenamento local por conta; autenticação com Firebase e navegação com Expo Router.

- App.js: formulário, seções, estado e persistência com AsyncStorage.
- src/components/: componentes visuais.
- src/utils/obras.js: regras, validação, filtros e compatibilidade dos dados antigos.
- src/services/capas.js: cópia e limpeza das capas locais.
- src/app/: rotas Expo Router; mantenha componentes, serviços e utilitários fora dessa pasta.
- src/context/ e serviços de autenticação: integração de conta.
- docs/: desenvolvimento, instalação e aprendizado.

O projeto usa JavaScript, sem configuração TypeScript. index.js carrega expo-router/entry. Preserve a arquitetura atual; migrações exigem tarefa específica.

## Comandos no Windows

Use Node.js 22.13 ou superior e npm com package-lock.json. No PowerShell, use os executáveis .cmd.

```powershell
npm.cmd ci
npm.cmd start
npm.cmd run lint
npm.cmd test
npx.cmd expo export --platform android --output-dir dist
```

Antes de concluir mudanças de código, execute lint e testes. Para mudanças no app, execute também a exportação Android: verifica bundle e imports, mas não gera APK nem substitui teste no celular. Não execute tsc enquanto não existir configuração TypeScript. Relate verificações não executadas.

No celular, verifique cadastro, edição sem duplicar, status, progresso, capas, busca e menu. Feche e reabra para confirmar persistência.

## Expo e dependências

Antes de alterar APIs Expo, EAS ou React Native, confirme a versão em package.json e consulte https://docs.expo.dev/versions/v57.0.0/ . Para outros recursos, consulte https://docs.expo.dev/llms.txt e siga o link específico.

Instale bibliotecas com npx.cmd expo install <pacote>. Não atualize versões principais nem execute npm audit fix --force em tarefas não relacionadas. Evite novas dependências quando os recursos existentes resolvem o problema.

android/ e ios/ são gerados pelo Expo e ignorados pelo Git. Configure comportamento nativo em app.json e plugins de configuração. Use os perfis de eas.json para builds; módulos nativos podem exigir development build.

## Regras de implementação

- Preserve textos em português, tema escuro e compatibilidade mobile.
- Faça mudanças pequenas, com código fácil de entender por quem está aprendendo.
- Preserve a chave de armazenamento, dados antigos e capas existentes. Mudanças de formato precisam de migração e testes.
- Atualize o estado da estante somente após confirmar a gravação. Preserve campos após falhas e impeça ações simultâneas durante operações assíncronas.
- Apague somente capas gerenciadas pelo app, após salvar a remoção da referência.
- Use rótulos acessíveis e estados de seleção/desabilitado nos controles.
- Atualize a documentação quando comandos ou funcionalidades mudarem.

## Coordenação de agentes

Quando o usuário solicitar agentes, o agente principal coordena tarefas delimitadas:

1. Analista: relata problemas com evidências, impacto e arquivos.
2. Implementador: aplica uma melhoria nos arquivos atribuídos.
3. Revisor: verifica diff, regressões, compatibilidade dos dados e validação.

Não atribua o mesmo arquivo simultaneamente a vários implementadores. O coordenador integra, revisa e executa as verificações finais. Diferencie defeitos confirmados de sugestões; não invente bugs para justificar mudanças.

Trabalhe localmente por padrão. Publicação de releases, deploy e merge devem fazer parte de solicitação explícita. Não inclua segredos, .env, credenciais ou binários gerados no Git.

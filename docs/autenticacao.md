# Contas, login e confirmação de e-mail

## O que foi implementado

A versão 1.1.0 usa Firebase Authentication para guardar as contas no serviço de autenticação do Google. As telas de cadastro, login e confirmação são separadas e usam Expo Router.

O projeto ativo é **minha-estante-nyc1682-da2fd**, criado pelo proprietário da aplicação. A configuração remota habilita e-mail/senha, desabilita contas anônimas e exige a política de senha. A conta Google de administração do Firebase é independente das contas que as pessoas criam dentro do aplicativo.

O Firebase tem um armazenamento próprio de usuários, com identificador, e-mail, estado de verificação e informações de autenticação. Nesta etapa não há coleção de senhas no Firestore ou tabela SQL personalizada. O app não grava a senha em AsyncStorage, no GitHub ou em arquivos locais.

## Fluxo no aplicativo

1. Abra **Criar uma conta** na tela de login.
2. Informe seu e-mail, sua senha e a confirmação da senha.
3. A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula de A a Z, um número e um símbolo aceito pelo Firebase, como @, # ou !. O limite é de 128 caracteres. Letra minúscula é permitida, mas não é obrigatória.
4. Ao cadastrar, o Firebase cria a conta e envia um link de confirmação para o e-mail informado.
5. Abra o link recebido e volte ao app. Toque em **Já confirmei meu e-mail**.
6. O aplicativo consulta o Firebase novamente antes de liberar a estante. Alterar somente um estado visual da tela não confirma o endereço no serviço.

Validar o formato de um e-mail não prova que ele existe ou pertence à pessoa. A confirmação acontece pelo link recebido. Se o envio falhar depois da criação da conta, ela continua pendente: use Reenviar confirmação. Confira também a pasta de spam.

O botão **Esqueci minha senha** pede o e-mail acima do botão e solicita um link de recuperação ao Firebase. A resposta não informa se aquele e-mail está cadastrado.

## Senhas e sessões

- A política é obrigatória no servidor; não depende apenas da validação do formulário.
- O cadastro consulta a política remota e fica bloqueado se o serviço deixar de exigir as quatro regras.
- Contas sem e-mail confirmado ficam na tela de confirmação, sem acesso à estante.
- O Firebase gerencia a autenticação e a proteção das senhas.
- No Android, o estado de autenticação e os tokens de sessão usam o cofre nativo com expo-secure-store. Nenhuma senha é persistida pelo aplicativo.
- No navegador, a persistência usa o mecanismo do Firebase para a plataforma web; o alvo testado nesta etapa é Android.
- Reenvios repetidos recebem uma espera no app e continuam sujeitos aos limites do serviço.

Para ver as contas criadas, abra [Authentication no projeto Firebase](https://console.firebase.google.com/project/minha-estante-nyc1682-da2fd/authentication/users). Essa área exige acesso de administração à sua conta Google; a lista de usuários não é publicada no repositório.

## Onde os dados ficam

| Dado | Local |
| --- | --- |
| Conta, e-mail, confirmação e autenticação | Firebase Authentication |
| Sessão persistida no Android | Cofre nativo do aplicativo |
| Obras e progresso | Armazenamento local, separado pelo identificador do usuário |
| Capas | Arquivos locais gerenciados pelo aplicativo |

Entrar na mesma conta em outro aparelho recupera a conta, mas ainda não recupera as obras e capas. O backup da estante na nuvem fica para uma próxima etapa.

A estante da versão sem login não é atribuída automaticamente a quem entrar. O app oferece **Importar minha estante anterior**, pede confirmação e vincula esses cadastros a uma única conta neste aparelho. A chave antiga é preservada. Falhas de importação permitem retomar pela mesma conta, sem oferecer o legado a outra pessoa.

O botão **Sair** encerra a sessão, mas preserva os cadastros locais daquela conta. É necessária internet para cadastrar, entrar, confirmar e-mail e recuperar senha. Depois de entrar com e-mail confirmado, os dados locais continuam disponíveis offline.

## Configuração para desenvolvimento

Execute todos os comandos na pasta do repositório que contém package.json, pelo terminal integrado do VS Code:

```powershell
npm.cmd ci
npx.cmd eas-cli@latest env:pull preview --path .env.local --non-interactive
npm.cmd start
```

O segundo comando exige acesso ao projeto Expo do proprietário e traz a configuração Firebase já registrada no ambiente preview. Alternativamente, copie .env.example para .env.local e preencha com os identificadores públicos do seu próprio aplicativo Firebase.

Esses valores EXPO_PUBLIC são incluídos no APK e não são senhas ou credenciais de administração. Nunca coloque contas de serviço, chaves privadas, tokens administrativos ou senhas em variáveis EXPO_PUBLIC. .env.local permanece fora do Git.

Após mudar essas variáveis, recarregue completamente o app. Se o pacote continuar com uma configuração antiga, reinicie o Expo com `npm.cmd start -- --clear` ou exporte com `npx.cmd expo export --clear --platform android --output-dir dist`.

## Configuração do serviço

firebase.json registra o provedor e-mail/senha e o emulador local. O arquivo [politica-autenticacao.json](../backend/politica-autenticacao.json) registra a política aplicada no servidor. Alterar esse JSON local não altera sozinho o serviço remoto: aplique as regras no Console Firebase ou pela API administrativa autorizada.

No Console Firebase, confira Authentication > Settings > Password policy: modo obrigatório, mínimo 8, máximo 128, maiúscula, número e caractere especial. Mantenha a proteção contra enumeração de e-mails habilitada. Não ative banco em modo de teste ou regras públicas para armazenar contas.

Se no futuro houver obras no banco remoto, será necessário autorizar cada usuário no servidor usando seu identificador e e-mail confirmado. As proteções de rota do aplicativo organizam a interface; não substituem regras de acesso de um banco na nuvem.

## Arquivos principais

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/login.js` | Acesso à conta e recuperação de senha |
| `src/app/cadastro.js` | Cadastro e indicadores das regras de senha |
| `src/app/confirmar-email.js` | Reenvio e verificação do link confirmado |
| `src/app/_layout.js` | Rotas protegidas pelo estado da conta |
| `src/context/ContaContext.js` | Operações de autenticação e restauração da sessão |
| `src/services/firebase.js` | Inicialização do SDK com a configuração pública |
| `src/services/persistencia.js` | Persistência Firebase no Android |
| `src/services/persistencia.web.js` | Persistência Firebase no navegador |
| `src/services/sessaoSegura.js` | Adaptação do cofre nativo para os tokens de sessão |
| `src/services/estante.js` | Estante por usuário e importação do legado |
| `src/utils/conta.js` | Formato do e-mail, regras de senha e mensagens |
| `src/components/TelaConta.js` | Campos e botões reutilizados nas telas de conta |

## Como testar

1. Tente cadastrar e-mail malformado e senhas que falhem em cada regra. Deve aparecer um aviso, sem criar a conta.
2. Cadastre com um e-mail seu e uma senha válida. Deve abrir a tela de confirmação.
3. Antes de abrir o link, toque em Já confirmei. A estante deve continuar bloqueada.
4. Abra o link recebido, volte ao app e confirme novamente. A estante deve abrir.
5. Cadastre uma obra, feche e reabra o app. Confira a sessão e a obra. Teste sem internet depois de uma entrada confirmada.
6. Saia, entre em outra conta confirmada e confira que ela não mostra as obras da primeira.
7. Teste senha incorreta, recuperação de senha e reenvio do e-mail de confirmação.
8. Se houver dados da versão sem login, teste a importação e confira títulos, progresso e capas.

Verificações já realizadas: lint, testes automatizados de regras e persistência, exportação Android, fluxo de conta no emulador Firebase e rejeição das quatro violações de senha pelo Firebase real. O teste visual no celular e a chegada do e-mail real ainda precisam ser confirmados pelo usuário.

## Referências oficiais

- [Firebase no Expo](https://docs.expo.dev/guides/using-firebase/)
- [Políticas de senha](https://firebase.google.com/docs/auth/web/password-auth)
- [Confirmação de e-mail e recuperação](https://firebase.google.com/docs/auth/web/manage-users)
- [Rotas autenticadas no Expo Router](https://docs.expo.dev/router/advanced/authentication/)
- [Cofre nativo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

# Serviço de contas

O armazenamento de usuários é o Firebase Authentication do projeto `minha-estante-nyc1682-da2fd`. Ele guarda as contas; não existe tabela personalizada de senhas na aplicação.

O arquivo politica-autenticacao.json documenta a configuração aplicada pela API administrativa do Firebase:

- Cadastro e login por e-mail e senha.
- Contas anônimas desabilitadas.
- Política obrigatória: 8 a 128 caracteres, maiúscula, número e símbolo.
- Proteção contra enumeração de e-mails.

Editar o JSON não implanta a política automaticamente. A aplicação consulta a política remota antes de cadastrar e bloqueia o cadastro se o servidor deixar de exigir os requisitos mínimos.

firebase.json, na raiz, permite publicar a configuração do provedor com `npx.cmd firebase-tools@latest deploy --only auth --project minha-estante-nyc1682-da2fd`. Execute esse comando somente na pasta do repositório, com a conta administradora autenticada. As regras de senha devem ser verificadas separadamente em Authentication > Settings > Password policy ou aplicadas pela API administrativa documentada.

Os arquivos de administração, senhas e credenciais de conta de serviço não pertencem ao repositório nem ao APK. O aplicativo usa apenas o SDK cliente e os identificadores públicos EXPO_PUBLIC.

Leia o [guia de autenticação](../docs/autenticacao.md) para configuração, limites e testes. As obras e capas ainda não são armazenadas neste serviço.

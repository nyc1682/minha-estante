# Minha Estante

Organize livros, mangás, manhwas, filmes e séries em um aplicativo Android com interface em português, tema escuro e dados salvos no celular.

Desenvolvido em **JavaScript, React Native e Expo**, como um projeto de aprendizado em desenvolvimento mobile.

## Funcionalidades

- Cadastro de conta, confirmação de e-mail, login e recuperação de senha pelo Firebase.
- Cadastro e edição de obras, com capa opcional da galeria.
- Status: lendo / assistindo, quero ler / assistir e terminei.
- Progresso em capítulos, páginas, minutos ou episódios, conforme o tipo.
- Menu lateral e listas separadas por status e tipo de obra.
- Busca por título nas listas, sem diferenciar maiúsculas ou acentos.
- Persistência local dos cadastros e das capas.
- Após entrar na conta, acesso à estante local sem computador ou internet.

Exclusão com confirmação ainda está prevista.

## Instalar no Android

A versão 1.0.0 foi compilada como APK. Veja o [guia de instalação](docs/instalacao.md) para encontrar o instalador, gerar novas versões e testar no celular.

## Desenvolver no Windows

Abra a pasta do repositório no VS Code e execute no terminal integrado:

```powershell
npm.cmd ci
npm.cmd start
```

`ci` instala as versões do arquivo de dependências; `start` inicia o Expo para testar alterações. Veja os [pré-requisitos e comandos de desenvolvimento](docs/desenvolvimento.md).

O login da versão 1.1.0 requer configuração do Firebase. Copie `.env.example` para `.env`, preencha os campos públicos do aplicativo Web registrado no seu projeto Firebase e habilite Authentication com e-mail e senha. Configure a política de senha em modo obrigatório: mínimo de 8 caracteres, uma letra maiúscula, um número e um caractere especial. Reinicie o Expo após alterar o ambiente. Não publique o arquivo `.env` nem contas de serviço. Sem essa configuração, as telas de conta aparecem, mas o acesso fica indisponível.

## Estrutura

```text
minha-estante/
├── App.js                 # Tela principal e estado do aplicativo
├── index.js               # Entrada do Expo
├── src/
│   ├── app/               # Rotas de conta e estante com Expo Router
│   ├── context/           # Estado da sessão de autenticação
│   ├── components/        # Capa, lista, menu lateral e opções
│   ├── services/          # Arquivos das capas no celular
│   └── utils/             # Tipos, status, validação e regras das obras
├── assets/                # Ícones e imagens do aplicativo
├── docs/                  # Instalação, desenvolvimento e guias de aprendizado
├── app.json               # Configuração do aplicativo
├── eas.json               # Perfil de compilação do APK
└── package.json           # Dependências e comandos
```

## Documentação

- [Instalar e gerar o APK](docs/instalacao.md)
- [Desenvolver e verificar o projeto](docs/desenvolvimento.md)
- [Guias de aprendizado por etapa](docs/README.md)
- [Entender a organização das pastas](docs/organizacao.md)
- [Orientações para agentes de código](AGENTS.md)

## Dados e privacidade

A versão 1.1.0 exige conta e confirmação de e-mail pelo Firebase Authentication. As obras e capas continuam no aparelho, separadas por conta, sem backup ou sincronização na nuvem. Cadastros da versão sem login podem ser importados pela opção apresentada no app. A instalação por APK tem armazenamento separado do Expo Go; os dados entre essas instalações não são transferidos automaticamente.

## Licença

[MIT](LICENSE).

# Minha Estante

Organize livros, mangás, manhwas, filmes e séries em um aplicativo Android com interface em português, tema escuro e dados salvos no celular.

Desenvolvido em **JavaScript, React Native e Expo**, como um projeto de aprendizado em desenvolvimento mobile.

## Funcionalidades

- Cadastro e edição de obras, com capa opcional da galeria.
- Status: lendo / assistindo, quero ler / assistir e terminei.
- Progresso em capítulos, páginas, minutos ou episódios, conforme o tipo.
- Menu lateral e listas separadas por status e tipo de obra.
- Persistência local dos cadastros e das capas.
- APK Android para uso sem Expo Go, computador ou internet.

Busca por título e exclusão com confirmação ainda estão previstas.

## Instalar no Android

A versão 1.0.0 foi compilada como APK. Veja o [guia de instalação](docs/instalacao.md) para encontrar o instalador, gerar novas versões e testar no celular.

## Desenvolver no Windows

Abra a pasta do repositório no VS Code e execute no terminal integrado:

```powershell
npm.cmd ci
npm.cmd start
```

`ci` instala as versões do arquivo de dependências; `start` inicia o Expo para testar alterações. Veja os [pré-requisitos e comandos de desenvolvimento](docs/desenvolvimento.md).

## Estrutura

```text
minha-estante/
├── App.js                 # Tela principal e estado do aplicativo
├── index.js               # Entrada do Expo
├── src/
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

## Dados e privacidade

O app não exige login e não usa servidor para guardar sua estante. Os cadastros ficam no aparelho. A instalação por APK tem armazenamento separado do Expo Go; os dados anteriores não são transferidos automaticamente.

## Licença

[MIT](LICENSE).

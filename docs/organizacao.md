# Organização do projeto

O código foi separado por responsabilidade, mantendo uma estrutura pequena:

- `src/components/`: componentes React que desenham partes da interface.
- `src/services/`: acesso aos arquivos das capas no celular.
- `src/utils/`: funções JavaScript de validação, tipos, status e atualização das obras.
- `docs/guias/`: os sete guias de aprendizado, preservados como registros históricos.
- `assets/`: ícones e imagens.

App.js continua na raiz e coordena a tela principal. index.js registra esse componente no Expo. As configurações e o arquivo de dependências também continuam na raiz.

## O que muda nos imports

`import` indica de qual arquivo vem um componente ou uma função. `./` começa na pasta do arquivo atual; `../` sobe uma pasta. Ao mover um arquivo, precisamos ajustar esse caminho.

Os imports internos de App.js agora são:

```javascript
import Opcoes from './src/components/Opcoes';
import MenuLateral from './src/components/MenuLateral';
import ListaObras from './src/components/ListaObras';
import Capa from './src/components/Capa';
import { apagarCapa, guardarCapa } from './src/services/capas';
import { atualizarLista, lerObras, opcoesStatus, opcoesUnidades, rotuloProgresso,
  TIPOS, unidadePadrao, validarCadastro } from './src/utils/obras';
```

Em src/components/ListaObras.js, os imports completos são:

```javascript
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Capa from './Capa';
import { opcoesStatus, rotuloProgresso } from '../utils/obras';
```

O restante dos componentes movidos manteve o mesmo código. Secao.js, que não era mais usado, foi removido; o exemplo da etapa 5 e o histórico Git preservam sua implementação.

## O que fica fora do Git

node_modules, arquivos temporários, APKs, AABs, variáveis locais e chaves de assinatura são ignorados pelo .gitignore. package-lock.json permanece no repositório para reproduzir as versões das dependências.

## Conferir a reorganização

Na pasta do repositório, execute os comandos do [guia de desenvolvimento](desenvolvimento.md). A análise deve passar, e o pacote Android deve ser gerado sem imports ausentes. Ao abrir o projeto no Expo Go, a tela e os cadastros devem se comportar como antes.

O APK já instalado continua sendo a versão 1.0.0. Esta organização do código-fonte não exige reinstalar o aplicativo no celular.

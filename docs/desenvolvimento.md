# Desenvolver no Windows

## Preparar o ambiente

Use VS Code e Node.js em uma versão LTS compatível com Expo SDK 57. O SDK exige Node.js 22.13 ou superior; consulte a [tabela oficial de compatibilidade](https://docs.expo.dev/versions/v57.0.0/). O instalador oficial está em [nodejs.org](https://nodejs.org/en/download).

Após instalar Node.js, reabra o VS Code. Abra a pasta que contém package.json pelo menu Arquivo > Abrir Pasta. Todos os comandos abaixo devem ser executados no terminal integrado, nessa pasta.

```powershell
node --version
npm.cmd --version
npm.cmd ci
npm.cmd start
```

Os primeiros comandos mostram as versões instaladas. `ci` instala as versões exatas de package-lock.json. `start` inicia o servidor de desenvolvimento e mostra um QR code. Usamos `.cmd` para evitar o bloqueio de scripts PowerShell no Windows.

No Android, abra o projeto pelo Expo Go, com computador e celular na mesma rede Wi-Fi. Para recarregar, pressione `r` no terminal; para parar o servidor, pressione Ctrl+C. Esse fluxo serve para desenvolver. Para usar o app instalado sem computador, siga o [guia do APK](instalacao.md).

## Verificar alterações

```powershell
npm.cmd run lint
npm.cmd test
npx.cmd expo export --platform android --output-dir dist
```

O lint analisa o JavaScript e os testes verificam as regras de busca. O último comando gera o pacote JavaScript Android e verifica se os imports são resolvidos; ele não gera um APK. A pasta dist é ignorada pelo Git. Esta versão usa apenas JavaScript, sem configuração TypeScript.

Após mudar o código, teste no celular: cadastro, edição sem duplicar, troca de status, progresso, capas e fechamento do menu. Feche e reabra o app para verificar os dados salvos.

## Onde editar

| Arquivo | Responsabilidade |
| --- | --- |
| `App.js` | Formulário, seleção de listas, estado e persistência dos cadastros |
| `src/components/Capa.js` | Imagem da capa e indicação de imagem ausente |
| `src/components/ListaObras.js` | Cartões agrupados pelos cinco tipos |
| `src/components/MenuLateral.js` | Menu animado e escolha da seção |
| `src/components/Opcoes.js` | Botões reutilizáveis de seleção |
| `src/services/capas.js` | Cópia e limpeza dos arquivos das capas |
| `src/utils/obras.js` | Opções, validação e compatibilidade dos dados antigos |

Os ícones ficam em assets; app.json e eas.json permanecem na raiz para o Expo e o EAS.

## Dependências

Mantenha package-lock.json no Git. Para acrescentar uma biblioteca compatível com o Expo, consulte a documentação correspondente ao SDK e use `npx.cmd expo install nome-do-pacote`.

Na preparação da versão 1.0.0 foram registrados alertas em dependências transitivas. Para verificar o estado atual, use `npm.cmd audit`. Não aplique `npm.cmd audit fix --force` automaticamente: a mudança pode trocar versões principais incompatíveis com o Expo. Avalie o relatório antes de atualizar.

## Próximas funcionalidades previstas

- Excluir uma obra com confirmação.
- Exportar e importar a estante para facilitar backup e transferência.

## Referências

- [Iniciar o desenvolvimento com Expo](https://docs.expo.dev/get-started/start-developing/)
- [Documentação do Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)

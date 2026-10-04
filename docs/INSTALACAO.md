# Instalação e homologação

## 1. Abrir o projeto

Extraia o ZIP e abra a pasta `aprovacao-pagamentos-slack`. Para publicar somente o portfólio, siga `PUBLICAR.md`: não é necessário configurar Slack, n8n ou Google para subir o código no GitHub.

Para executar, use um ambiente de teste. Tenha uma instância n8n, um app Slack em workspace de teste, acesso ao Google Sheets/Drive e Node.js para o configurador opcional.

## 2. Criar a planilha

Crie as abas `Respostas do formulário` e `Negados`. Copie os cabeçalhos e a ordem de `PLANILHA.md` ou de `examples/estrutura-planilha.json`. A linha 1 é o cabeçalho; dados começam na linha 2. A coluna V é `Anexo no Drive`.

Guarde o ID da planilha e o `gid` de cada aba. Não inclua dados reais no repositório.

## 3. Preparar uma cópia do workflow

No PowerShell, na raiz do projeto:

```powershell
Copy-Item .\examples\config.example.json .\config.local.json
notepad .\config.local.json
```

Preencha as três propriedades `CONFIGURE_*` e os IDs de usuários fictícios `UDEMO*` com os valores do ambiente de teste. `IDS-DE-EXEMPLO.md` mostra onde cada ID aparece. Feche o editor e execute:

```powershell
node .\scripts\configurar-local.cjs .\config.local.json
```

O resultado fica em `private/workflow.configurado.json`. A pasta `private` e `config.local.json` estão no `.gitignore`. Os tokens não fazem parte desse arquivo de configuração.

Importe o resultado no n8n. Alternativamente, importe o JSON público e configure os nós manualmente. Selecione as credenciais Slack e Google Sheets nos nós correspondentes, confira a seleção de planilha/aba e ajuste os nomes de exibição dos aprovadores nos nós do modal e da extração da decisão. O JSON contém as versões dos tipos de nó exportadas pelo autor; a versão exata da instância n8n original não foi informada.

## 4. Configurar Slack

O fluxo usa `views.open`, `chat.postMessage`, `conversations.open` e respostas a interações. Configure o comando `/pagamento` e a interatividade para as URLs exibidas nos dois nós Webhook. Caminhos do template: `slack-slash-pagamento` e `slack-interactivity`.

Configure o bot com as permissões exigidas pelos métodos: `commands`, `chat:write`, `im:write` e acesso a arquivos por `files:read`, também exigido pelo elemento `file_input`. Instale/reinstale o app após mudanças de permissões e confira as políticas do workspace. O arquivo precisa estar acessível ao bot; ter um escopo não torna todos os arquivos acessíveis.

**Antes de ativar URLs acessíveis externamente:** implemente ou confirme a validação de assinatura Slack (`X-Slack-Signature` e timestamp, usando o corpo bruto), e verifique a identidade do responsável autorizado a decidir cada pedido. Essas validações não aparecem no JSON recebido. Não há implementação de gateway incluída neste pacote.

As decisões humanas e as credenciais devem apontar apenas para participantes de teste até concluir a homologação. Não use o JSON original com informações internas como versão pública.

## 5. Apps Script de anexos

Crie um projeto Apps Script, cole `apps-script/Anexos.gs` e use o manifesto fornecido. Em Configurações do projeto → Propriedades do script, adicione:

| Chave | Valor |
|---|---|
| SLACK_BOT_TOKEN | Token novo do bot autorizado a ler os anexos |
| GDRIVE_FOLDER_ID | ID de uma pasta de teste no Drive |
| SPREADSHEET_ID | ID da planilha de teste |

Execute `processarAnexosPendentes` manualmente e autorize os acessos. Esse script cria arquivos e atualiza a planilha; não possui modo de simulação. Use apenas dados fictícios na homologação.

A versão pública organiza anexos em subpastas por protocolo, consulta ambas as abas e só preenche `Anexo no Drive` quando todos os anexos da solicitação forem processados. Se um falhar, a próxima execução reutiliza os que já foram copiados. Referências em formato de URL e IDs de arquivo isolados são aceitas.

Depois dos testes, configure um acionador baseado em tempo conforme a necessidade e as quotas do ambiente. A frequência original não foi informada. Restringir compartilhamento da pasta e dos arquivos é responsabilidade da configuração de Drive; o script não os torna públicos.

## 6. Roteiro de teste funcional

| Cenário | Verificar |
|---|---|
| Solicitação com anexo e dados válidos | Protocolo, registro na planilha e pedido ao aprovador |
| PIX/boleto/transferência incompletos | Aviso de validação ao solicitante |
| Aprovação | Status aprovado e aviso aos dois destinatários de Contas a Pagar |
| Negativa sem motivo | Orientação para informar motivo |
| Negativa com motivo | Registro em Negados, remoção da principal e aviso |
| Programação | Apenas após aprovação; status PROGRAMADO e aviso |
| Repetição do clique | Verificação do estado já registrado; testar cliques simultâneos separadamente |
| Falha em um dos anexos | Coluna Drive permanece vazia até completar todos; arquivo salvo é reutilizado |
| Pedido movido de aba | Anexos localizados pelo protocolo na execução seguinte |

O teste de clique repetido sequencial não comprova proteção contra duas execuções simultâneas. Pagamento programado não comprova pagamento realizado. Não execute este fluxo contra contas bancárias: não existe integração bancária neste projeto.

## Referências oficiais

- [Importação e exportação no n8n](https://docs.n8n.io/workflows/export-import/)
- [Verificação de requisições Slack](https://docs.slack.dev/authentication/verifying-requests-from-slack/)
- [Slack files.info](https://docs.slack.dev/reference/methods/files.info/)
- [Slack file_input](https://docs.slack.dev/reference/block-kit/block-elements/file-input-element/)
- [Propriedades de Apps Script](https://developers.google.com/apps-script/guides/properties)

# Escopo da adaptação e limitações

## O que foi preservado

O JSON público contém os 46 nós e todas as conexões do export recebido. Mantém formulário, validações existentes, ramificações de aprovação/negação/programação, notificação a dois destinatários de Contas a Pagar, gravação no Sheets, transferência dos negados e descarte de retries identificados pelo cabeçalho Slack.

A lógica dos nós foi mantida; referências a pessoas/empresa foram substituídas de forma consistente também nos nomes e expressões que referenciam outros nós. Não foi feita uma reescrita do processo financeiro.

## O que foi retirado

Vínculos de credenciais n8n, identificadores de planilhas e abas, IDs de usuários reais, nomes pessoais de aprovadores e responsáveis, referências de workspace, IDs de workflow/instância/versão, IDs de webhooks e tags internas. O workflow público está desativado e sem dados fixados de execução.

Os prints recebidos não foram distribuídos. As imagens públicas são ilustrações de interface geradas por código e estão identificadas como fictícias; há versões HTML editáveis dos mesmos exemplos. Não representam evidência de homologação.

## Apps Script: alterações explícitas

- Token fixo substituído pela leitura de Script Properties; IDs também configuráveis.
- Pasta por **protocolo**, em vez de pasta por dia, para permitir retomada em dias diferentes.
- Apenas marca a linha após sucesso de todos os anexos; em falha parcial, reutiliza os arquivos já copiados.
- Aceita IDs de arquivo isolados, porque o n8n pode registrar ID em vez de permalink.
- Consulta principal e Negados, pois a reprovação move o pedido antes que o script necessariamente processe anexos.
- Exige cabeçalhos explícitos e usa planilha configurada, sem depender da aba ativa ou de fallback que sobrescreva V.
- Adiciona bloqueio de execução no mesmo projeto e relocaliza a linha pelo protocolo antes de gravar.
- Downloads autenticados limitados a `files.slack.com`, sem seguir redirecionamentos. Se a API retornar outro host ou redirecionamento, registra erro; a compatibilidade deve ser validada no workspace.
- Logs sem token, URL privada ou dados completos do solicitante.

## Pontos que permanecem para homologação

1. **Assinatura e autorização:** o JSON não implementa verificação criptográfica de requisições Slack. A validação de estado não confere se quem clicou é o aprovador designado ou um responsável autorizado por Contas a Pagar. Não há código de proteção externa incluído; confirmar/implementar antes de expor o fluxo.
2. **Concorrência:** ler status e depois gravar não é operação atômica. Cliques simultâneos ainda podem disparar efeitos repetidos. O lock do Apps Script não bloqueia o n8n nem alterações manuais.
3. **Falhas parciais:** mensagens e escritas em ramificações independentes podem ter resultados diferentes. O nó HTTP não garante que `ok: false` do Slack seja tratado como falha do fluxo. Uma mensagem pode sair antes de uma gravação falhar.
4. **Reprovação:** o fluxo copia para Negados e remove da principal por índice. Alterações simultâneas na planilha podem deslocar linhas. A relocalização do Apps Script reduz, mas não elimina, a janela de corrida; não use a planilha como mecanismo transacional.
5. **Retries:** o template descarta tentativas repetidas do Slack. Se a primeira tentativa falhou depois do ACK, não existe recuperação durável automática.
6. **Anexos:** um arquivo pode ser criado no Drive antes de falhar a gravação de seu marcador. Isso ainda permite uma cópia duplicada. Linhas já preenchidas são ignoradas; anexos adicionados depois e links parciais herdados exigem revisão. Não há migração automática das antigas pastas diárias.
7. **Validação de entradas:** várias obrigatoriedades são aplicadas pelo formulário. O validador não é uma validação completa de valores monetários, vencimento ou existência cadastral. A regra de boleto confere apenas faixa de quantidade de dígitos. CPF/CNPJ verificam formato/dígitos no código recebido; não comprovam titularidade. A chave Pix celular tem validação reduzida. O algoritmo de CNPJ recebido aceita somente o formato numérico de 14 posições; novos formatos exigem adaptação.
8. **Protocolo:** `PAG-` mais timestamp em milissegundos não garante unicidade global em envios simultâneos.
9. **Estado final:** nomes antigos de nós citam “Pago”/“Concluído”, mas o conteúdo atual usa PROGRAMADO. Não há confirmação bancária, liquidação nem conciliação. Prints antigos mostravam PAGO e não descrevem esta versão atual.
10. **Versão e agenda:** a versão exata do n8n e a frequência do acionador Apps Script não foram informadas. Compatibilidade de importação e execução deve ser testada no ambiente de destino.
11. **Permissões e dados:** credenciais e Script Properties são acessíveis a quem tem privilégios no projeto; limite editores. Logs do n8n podem guardar dados do pedido. Configuração de retenção e compartilhamento precisa acompanhar a implantação.

## Validação desta entrega

Verificação local de JSON, nomes/conexões, sintaxe dos nós e expressões JavaScript, simulações do processamento de anexos, busca de identificadores internos conhecidos e inspeção das imagens fictícias. Não houve importação em n8n real, envio Slack, alteração Google, ativação de gatilhos, commit ou push.

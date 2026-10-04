// Nó: Extrair Decisão (Aprovado/Negado)
// Referência extraída do JSON; executa no contexto do n8n.
const entrada = $input.item.json || {};
const payload = entrada.payload || {};
const action = payload.actions?.[0] || {};
const userId = payload.user?.id || entrada.userId || '';

const actionId =
  entrada.actionId ||
  action.action_id ||
  '';

const protocolo =
  entrada.actionValue ||
  action.value ||
  '';

const responseUrl =
  entrada.response_url ||
  payload.response_url ||
  '';

const motivoNegacao = String(
  entrada.motivoNegacao ||
  payload.state?.values
    ?.motivo_negacao_msg
    ?.motivo_negacao_input
    ?.value ||
  ''
).trim();

let decisao;
if (actionId === 'aprovar_pagamento') decisao = 'APROVADO';
else if (actionId === 'negar_pagamento') decisao = 'NEGADO';
else if (actionId === 'concluir_pagamento') decisao = 'PROGRAMADO';
else decisao = 'DESCONHECIDO';

const nomesAprovacao = {
  'UDEMO000003': 'Aprovador Exemplo A',
  'UDEMO000002': 'Aprovador Exemplo B',
  'UDEMO000001': 'Aprovador Exemplo C'
};

const nomesConclusao = {
  'UDEMO000002': 'Aprovador Exemplo B',
  'UDEMO000004': 'Financeiro Exemplo D'
};

const nomeFallback =
  payload.user?.real_name ||
  payload.user?.realName ||
  payload.user?.name ||
  payload.user?.username ||
  entrada.userName ||
  userId;

const gestorNome = actionId === 'concluir_pagamento'
  ? (nomesConclusao[userId] || nomeFallback)
  : (nomesAprovacao[userId] || nomeFallback);

return [{
  json: {
    protocolo,
    gestorId: userId,
    gestorNome,
    decisao,
    actionId,
    responseUrl,
    motivoNegacao,
    dataDecisao: new Date().toISOString(),
    status: decisao
  }
}];

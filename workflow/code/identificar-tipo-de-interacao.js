// Nó: Identificar Tipo de Interação
// Referência extraída do JSON; executa no contexto do n8n.
const body = $input.item.json.body || {};
let raw = body.payload;
let payload = raw;

if (typeof raw === 'string') {
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    payload = {};
  }
}

payload = payload || {};

const headers = $input.item.json.headers || {};
const normalizedHeaders = {};
for (const k of Object.keys(headers)) {
  normalizedHeaders[String(k).toLowerCase()] = headers[k];
}

const retryNum = normalizedHeaders['x-slack-retry-num'];
const retryReason = normalizedHeaders['x-slack-retry-reason'] || '';
const isRetry =
  retryNum !== undefined &&
  retryNum !== null &&
  String(retryNum).trim() !== '';

const stateValues =
  payload.state?.values ||
  payload.view?.state?.values ||
  {};

const motivoNegacao = String(
  stateValues
    ?.motivo_negacao_msg
    ?.motivo_negacao_input
    ?.value || ''
).trim();

return [{
  json: {
    type: payload.type || '',
    trigger_id: payload.trigger_id || '',
    response_url: payload.response_url || '',
    channelId:
      payload.channel?.id ||
      payload.container?.channel_id ||
      '',
    userId: payload.user?.id || '',
    userName:
      payload.user?.real_name ||
      payload.user?.name ||
      payload.user?.username ||
      '',
    actionId: payload.actions?.[0]?.action_id || '',
    actionValue: payload.actions?.[0]?.value || '',
    motivoNegacao,
    viewState: stateValues,
    callbackId: payload.view?.callback_id || '',
    payload,
    _slackRetry: isRetry,
    _slackRetryNum: retryNum || '',
    _slackRetryReason: retryReason || ''
  }
}];

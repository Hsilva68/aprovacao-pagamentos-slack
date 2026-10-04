// Nó: Validar Decisão Única
// Referência extraída do JSON; executa no contexto do n8n.
const decisao = $('Extrair Decisão (Aprovado/Negado)').item.json;
const row = $input.item.json || {};

const aprovacaoAtual = String(row['Aprovação'] || '').trim().toUpperCase();
const pagamentoAtual = String(row['Pagamento'] || '').trim().toUpperCase();
const protocoloPlanilha = String(row['ID'] || '').trim();

let permitido = true;
let motivo = '';

if (!protocoloPlanilha) {
  permitido = false;
  motivo = 'Solicitação não encontrada na planilha.';
}

if (['APROVADO', 'NEGADO'].includes(decisao.decisao) && aprovacaoAtual) {
  permitido = false;
  motivo = `Esta solicitação já foi decidida como ${aprovacaoAtual}.`;
}

if (decisao.decisao === 'PROGRAMADO' && aprovacaoAtual !== 'APROVADO') {
  permitido = false;
  motivo = 'Esta solicitação ainda não foi aprovada, então não pode ser marcada como PROGRAMADO.';
}

if (decisao.decisao === 'PROGRAMADO' && pagamentoAtual === 'PROGRAMADO') {
  permitido = false;
  motivo = 'Este pagamento já foi marcado como PROGRAMADO.';
}

return [{
  json: {
    ...row,
    ...decisao,
    _decisaoPermitida: permitido,
    _motivoBloqueio: motivo,
    aprovacaoAtual,
    pagamentoAtual
  }
}];

// Nó: Preparar dados para Sheets (Negado)
// Referência extraída do JSON; executa no contexto do n8n.
const item = $input.item.json;

const dataAprovacao = (function(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day:'2-digit',
      month:'2-digit',
      year:'numeric',
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    });
  } catch(e) {
    return ts;
  }
})(item.dataDecisao);

const observacoesNegado = [
  item.observacoes || '',
  item.motivoNegacao ? ('Motivo da reprovação: ' + item.motivoNegacao) : ''
].filter(Boolean).join('\n\n');

return [{
  json: {
    'ID': item.protocolo,
    'Razão Social ': item.razaoSocial,
    'CNPJ/CPF': item.cnpjCpf,
    'Valor': item.valor,
    'Vencimento': item.vencimento,
    'Forma de Pagamento': item.formaPagamento,
    'Dados bancários': item.dadosBancarios,
    'Código de barras do boleto': item.codigoBoleto,
    'Chave PIX': item.chavePix,
    'Tipo de Chave PIX': item.tipoChavePix,
    'Observações': observacoesNegado,
    'Aprovação': 'NEGADO',
    'Anexo': item.anexo,
    'Quem enviou': item.solicitanteNome,
    'Solicitante ID': item.solicitanteId,
    'Data e hora': item.dataEnvio,
    'Aprovador': item.gestorNome,
    'Data da Aprovação': dataAprovacao,
    'Quem concluiu': '',
    'Data da Conclusão': '',
    'Pagamento': '',
    'Anexo no Drive': item.anexoDrive || '',

    protocolo: item.protocolo,
    rowNumber: item.rowNumber,
    motivoNegacao: item.motivoNegacao || '',
    gestorId: item.gestorId,
    gestorNome: item.gestorNome,
    responseUrl: item.responseUrl
  }
}];

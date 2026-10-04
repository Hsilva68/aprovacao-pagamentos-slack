// Nó: Preparar dados iniciais para Sheets
// Referência extraída do JSON; executa no contexto do n8n.
const item = $input.item.json;

return [{
  json: {
    'ID': item.protocolo,
    'Razão Social ': item.razaoSocial,
    'CNPJ/CPF': item.cnpjCpf,
    'Valor': item.valor,
    'Vencimento': item.vencimento,
    'Forma de Pagamento': item.formaPagamento,
    'Dados Bancários': item.dadosBancarios,
    'Código de barras do boleto': item.codigoBoleto,
    'Chave PIX': item.chavePix,
    'Tipo de Chave PIX': item.tipoChavePix,
    'Observações': item.observacoes,
    'Aprovação': '',
    'Anexo': (item.anexoIds || []).join(', '),
    'Quem enviou': item.solicitanteNome,
    'Solicitante ID': item.solicitanteId,
    'Data e hora': item.timestamp || '',
    'Aprovador': '',
    'Data da Aprovação': '',
    'Quem concluiu': '',
    'Data da Conclusão': '',
    'Pagamento': ''
  }
}];

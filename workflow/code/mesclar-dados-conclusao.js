// Nó: Mesclar Dados Conclusão
// Referência extraída do JSON; executa no contexto do n8n.
const decisao = $('Extrair Decisão (Aprovado/Negado)').item.json;
const row = $input.item.json;

const anexo = row['Anexo'] || '';
const anexoTexto = String(anexo || '').split(',').map(function(u) {
  u = String(u || '').trim();
  if (!u) return '';
  return /^https?:\/\//.test(u) ? '• <' + u + '|Ver arquivo>' : '• Arquivo `' + u + '`';
}).filter(Boolean).join('\n');

return [{
  json: {
    protocolo: decisao.protocolo,
    financeiroId: decisao.gestorId,
    financeiroNome: decisao.gestorNome,
    dataConclusao: (function(d) { return d.toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit'}); })(new Date()),
    responseUrl: decisao.responseUrl,
    status: 'PROGRAMADO',
    razaoSocial: row['Razão Social '] || row['Razão Social'] || '',
    cnpjCpf: row['CNPJ/CPF'] || '',
    valor: row['Valor'] || '',
    vencimento: row['Vencimento'] || '',
    formaPagamento: row['Forma de Pagamento'] || '',
    codigoBoleto: row['Código de barras do boleto'] || '',
    chavePix: row['Chave PIX'] || '',
    tipoChavePix: row['Tipo de Chave PIX'] || '',
    dadosBancarios: row['Dados Bancários'] || row['Dados bancários'] || '',
    observacoes: row['Observações'] || '',
    solicitanteId: row['Solicitante ID'] || '',
    solicitanteNome: row['Quem enviou'] || '',
    aprovadorNome: row['Aprovador'] || '',
    dataAprovacao: row['Data da Aprovação'] || '',
    anexo: anexo,
    anexoTexto: anexoTexto,
    dataEnvio: row['Data e hora'] || ''
  }
}];

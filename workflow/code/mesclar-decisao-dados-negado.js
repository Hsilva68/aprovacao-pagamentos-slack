// Nó: Mesclar Decisão + Dados (Negado)
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
    gestorId: decisao.gestorId,
    gestorNome: decisao.gestorNome,
    decisao: decisao.decisao,
    responseUrl: decisao.responseUrl,
    dataDecisao: decisao.dataDecisao,
    status: decisao.status,
    motivoNegacao: decisao.motivoNegacao || '',

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
    departamento: row['Departamento'] || '',
    anexo: anexo,
    anexoTexto: anexoTexto,
    dataEnvio: row['Data e hora'] || '',
    pagamento: row['Pagamento'] || '',
    anexoDrive: row['Anexo no Drive'] || '',
    rowNumber: row['row_number'] || row.row_number || ''
  }
}];

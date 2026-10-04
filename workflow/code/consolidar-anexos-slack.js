// Nó: Consolidar Anexos Slack
// Referência extraída do JSON; executa no contexto do n8n.
const d = $('Extrair Dados do Formulário').item.json;
const arquivos = (Array.isArray(d.anexoArquivos) ? d.anexoArquivos : []).slice(0, 10);

function pickFileId(fileObj) {
  if (!fileObj) return '';
  return fileObj.id || fileObj.file_id || '';
}

function pickNativePermalink(fileObj) {
  if (!fileObj) return '';
  // Usar o permalink nativo do Slack: https://workspace-exemplo.slack.com/files/...
  // Não usar permalink_public / slack-files.com neste fluxo.
  return fileObj.permalink || '';
}

const anexosFinais = arquivos.map(function(f) {
  const link = pickNativePermalink(f);
  const id = pickFileId(f);
  return link || id;
}).filter(Boolean);

const anexoTexto = arquivos.map(function(f, i) {
  const link = pickNativePermalink(f);
  const id = pickFileId(f);
  const label = f.name || f.title || f.filename || ('arquivo ' + (i + 1));

  if (link) return '• <' + link + '|Ver ' + label + '>';
  return '• Arquivo `' + (id || ('anexo ' + (i + 1))) + '`';
}).filter(Boolean).join('\n');

return [{
  json: {
    ...d,
    aprovadorOriginalId: d.aprovadorOriginalId || '',
    aprovadorId: d.aprovadorId || d.aprovadorOriginalId || '',
    anexoIds: anexosFinais,
    anexoTexto,
    anexoPublicoGerado: false,
    anexoPublicoErros: '',
    totalAnexos: arquivos.length
  }
}];

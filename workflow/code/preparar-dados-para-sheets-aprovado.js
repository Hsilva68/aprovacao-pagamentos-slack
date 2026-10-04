// Nó: Preparar dados para Sheets (Aprovado)
// Referência extraída do JSON; executa no contexto do n8n.
const item = $input.item.json;

return [{
  json: {
    'ID': item.protocolo,
    'Aprovação': item.decisao,
    'Aprovador': item.gestorNome,
    'Data da Aprovação': (function(ts) { if (!ts) return ''; try { const d = new Date(ts); return d.toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit'}); } catch(e) { return ts; } })(item.dataDecisao),
    protocolo: item.protocolo,
    gestorId: item.gestorId,
    gestorNome: item.gestorNome,
    decisao: item.decisao,
    dataDecisao: item.dataDecisao,
    responseUrl: item.responseUrl
  }
}];

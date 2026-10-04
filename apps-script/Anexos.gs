/** Versão pública adaptada: configuração externa, trava e retomada por solicitação.
 * Em falha parcial, deixa Anexo no Drive vazio; arquivos já salvos são reutilizados.
 * Não cria gatilhos. Configure a periodicidade manualmente no ambiente de teste.
 */
function configuracaoAnexos_() {
  const p=PropertiesService.getScriptProperties();
  function req(k) { const v=p.getProperty(k); if(!v) throw new Error('Configure '+k); return v; }
  return {token:req('SLACK_BOT_TOKEN'),folder:req('GDRIVE_FOLDER_ID'),spreadsheet:req('SPREADSHEET_ID'),
    abas:['Respostas do formulário','Negados']};
}
function processarAnexosPendentes() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(10000)) throw new Error('Outra execução de anexos está em andamento.');
  try {
    const cfg=configuracaoAnexos_(), ss=SpreadsheetApp.openById(cfg.spreadsheet), pasta=DriveApp.getFolderById(cfg.folder);
    const resumo={processadas:0,ignoradas:0,arquivos:0,erros:0};
    for(const nome of cfg.abas) {
      const sheet=ss.getSheetByName(nome); if(!sheet) throw new Error('Aba ausente: '+nome);
      const last=sheet.getLastRow(); if(last<2) continue;
      const width=sheet.getLastColumn();
      const h=sheet.getRange(1,1,1,width).getDisplayValues()[0].map(v=>String(v).trim());
      const indices=['ID','Anexo','Anexo no Drive','Quem enviou'].map(x=>h.indexOf(x));
      if(indices.includes(-1)) throw new Error('Cabeçalhos ausentes em '+nome+'. Confira ID, Anexo, Anexo no Drive e Quem enviou.');
      const [idCol,anexoCol,driveCol,nomeCol]=indices;
      const dados=sheet.getRange(2,1,last-1,width).getDisplayValues();
      for(let i=0;i<dados.length;i++) {
        const row=dados[i],protocolo=String(row[idCol]).trim();
        if(String(row[driveCol]).trim()) {resumo.ignoradas++;continue;}
        if(!protocolo||!String(row[anexoCol]).trim()) continue;
        let ids;
        try {ids=extrairIdsAnexos(row[anexoCol]);}
        catch(e) {resumo.erros++;console.warn(nome+' linha '+(i+2)+': referência de anexo inválida.');continue;}
        if(!ids.length) continue;
        const pastaPedido=obterPastaSolicitacao_(pasta,protocolo);
        const links=[];let falhou=false;
        for(const id of ids) {
          try {const file=salvarAnexoDoSlackNoDrive(id,pastaPedido,row[nomeCol],cfg.token);links.push(file.getUrl());resumo.arquivos++;}
          catch(e) {falhou=true;resumo.erros++;console.warn(nome+' linha '+(i+2)+': '+e.message);}
        }
        if(!falhou&&links.length===ids.length) {
          // Relocaliza pelo protocolo: o n8n pode mover linhas durante a execução.
          const fim=sheet.getLastRow();
          if(fim<2) continue;
          const atuais=sheet.getRange(2,idCol+1,fim-1,1).getDisplayValues();
          const matches=[];atuais.forEach((v,j)=>{if(String(v[0]).trim()===protocolo) matches.push(j+2);});
          if(matches.length!==1) {resumo.erros++;console.warn('Protocolo ausente ou duplicado; links não gravados.');continue;}
          const cel=sheet.getRange(matches[0],driveCol+1);
          if(!String(cel.getDisplayValue()).trim()&&!cel.getFormula()) {cel.setValue(links.join('\n'));resumo.processadas++;}
        }
      }
    }
    console.info(JSON.stringify(resumo));
  } finally {lock.releaseLock();}
}
function extrairUrls(valor) {
  return [...new Set((String(valor||'').match(/https?:\/\/[^\s,;]+/gi)||[]).map(u=>u.replace(/[)\]}>.,;]+$/g,'')))];
}
function extrairIdArquivoSlack(url) {
  const s=String(url).trim();
  if(/^F[A-Z0-9]+$/.test(s)) return s;
  const formatos=[/\/files\/[^/]+\/(F[A-Z0-9]+)/i,/slack-files\.com\/[^/]*-(F[A-Z0-9]+)-/i,/files-pri\/[^-]+-(F[A-Z0-9]+)\//i];
  for(const f of formatos) {const m=s.match(f);if(m)return m[1].toUpperCase();}
  throw new Error('Não foi possível identificar o arquivo Slack.');
}
function extrairIdsAnexos(v) {
  const tokens=String(v||'').split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean);
  return [...new Set(tokens.map(extrairIdArquivoSlack))];
}
function obterPastaSolicitacao_(base,protocolo) {
  // Usa o protocolo inteiro codificado para evitar colisões por remoção de caracteres.
  const nome=encodeURIComponent(protocolo), pastas=base.getFoldersByName(nome);
  return pastas.hasNext()?pastas.next():base.createFolder(nome);
}
function localizarArquivoPorSlackId(folder,fileId) {
  const marcador='SLACK_FILE_ID:'+fileId, files=folder.getFiles();
  while(files.hasNext()) {const f=files.next();if(String(f.getDescription()||'').split('\n').includes(marcador))return f;}
  return null;
}
function salvarAnexoDoSlackNoDrive(ref,folder,nomeSolicitante,token) {
  const id=extrairIdArquivoSlack(ref),existente=localizarArquivoPorSlackId(folder,id);
  if(existente)return existente;
  const headers={Authorization:'Bearer '+token};
  const res=UrlFetchApp.fetch('https://slack.com/api/files.info?file='+encodeURIComponent(id),{method:'get',headers,muteHttpExceptions:true});
  if(res.getResponseCode()!==200)throw new Error('files.info HTTP '+res.getResponseCode());
  const data=JSON.parse(res.getContentText());
  if(!data.ok)throw new Error('Slack: '+String(data.error||'falha'));
  const file=data.file||{},url=file.url_private_download||file.url_private;
  // Não envia o token para hosts arbitrários nem segue redirecionamento com credencial.
  if(!/^https:\/\/files\.slack\.com\//i.test(url||''))throw new Error('URL de download não permitida.');
  const download=UrlFetchApp.fetch(url,{method:'get',headers,muteHttpExceptions:true,followRedirects:false});
  if(download.getResponseCode()!==200)throw new Error('Download HTTP '+download.getResponseCode());
  const nome=String(nomeSolicitante||'').trim();
  return folder.createFile(download.getBlob()).setName((nome?nome+' - ':'')+(file.name||'anexo-'+id))
    .setDescription('Origem: Slack\nSLACK_FILE_ID:'+id);
}

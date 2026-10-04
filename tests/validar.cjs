const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const wf=JSON.parse(fs.readFileSync(path.join(root,'workflow/aprovacao-pagamentos.public.json'),'utf8'));
assert.equal(wf.nodes.length,46);assert.equal(wf.active,false);
const names=new Set(wf.nodes.map(n=>n.name));assert.equal(names.size,wf.nodes.length);
let codes=0,expressions=0;
for(const n of wf.nodes) {
 assert.ok(!n.credentials);
 if(n.parameters.jsCode) {new Function('$input','$',n.parameters.jsCode);codes++;}
 const raw=JSON.stringify(n.parameters);
 for(const m of raw.matchAll(/\$\('([^']+)'\)/g))assert.ok(names.has(m[1]),'Referência ausente: '+m[1]);
 const body=n.parameters.jsonBody;
 if(typeof body==='string'&&body.startsWith('={{')&&body.endsWith('}}')) {new Function('$','$input','$json','return ('+body.slice(3,-2)+');');expressions++;}
}
for(const [from,branches] of Object.entries(wf.connections)) {
 assert.ok(names.has(from));
 for(const outputs of Object.values(branches))for(const targets of outputs)for(const t of targets)assert.ok(names.has(t.node));
}
for(const file of ['examples/config.example.json','examples/estrutura-planilha.json','apps-script/appsscript.json'])JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const gs=fs.readFileSync(path.join(root,'apps-script/Anexos.gs'),'utf8');new vm.Script(gs);
const ctx=vm.createContext({console:{info(){},warn(){}},encodeURIComponent});vm.runInContext(gs,ctx);
assert.equal(ctx.extrairIdArquivoSlack('FDEMO001'),'FDEMO001');
assert.equal(ctx.extrairIdArquivoSlack('https://workspace-exemplo.slack.com/files/UDEMO001/FDEMO001/file.pdf'),'FDEMO001');
assert.equal(ctx.extrairIdArquivoSlack('https://files.slack.com/files-pri/TDEMO001-FDEMO001/file.pdf'),'FDEMO001');
assert.equal(ctx.extrairIdsAnexos('FDEMO001, FDEMO001; FDEMO002').length,2);
assert.throws(()=>ctx.extrairIdsAnexos('arquivo-sem-id'));
// Simulação com planilhas em memória. Nenhum serviço Google ou Slack é chamado.
function sheet(rows) {return {
 rows,getLastRow(){return rows.length},getLastColumn(){return rows[0].length},
 getRange(r,c,h=1,w=1) {return {
  getDisplayValues(){return rows.slice(r-1,r-1+h).map(x=>x.slice(c-1,c-1+w));},
  getDisplayValue(){return rows[r-1][c-1];},getFormula(){return '';},
  setValue(v){rows[r-1][c-1]=v;}
 };}
};}
const headers=['ID','Anexo','Anexo no Drive','Quem enviou'];
const main=sheet([headers,['PAG-DEMO','FDEMO001, FDEMO002','','Pessoa Exemplo']]);
const rejected=sheet([headers]);
let released=0,failSecond=true,created=0;
const saved=new Map();
ctx.LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released++})};
ctx.configuracaoAnexos_=()=>({token:'DEMO',folder:'DEMO',spreadsheet:'DEMO',abas:['Principal','Negados']});
ctx.SpreadsheetApp={openById:()=>({getSheetByName:n=>n==='Principal'?main:rejected})};
ctx.DriveApp={getFolderById:()=>({})};
ctx.obterPastaSolicitacao_=()=>({});
ctx.salvarAnexoDoSlackNoDrive=(id)=>{
 if(id==='FDEMO002'&&failSecond)throw new Error('Falha simulada');
 if(!saved.has(id)){saved.set(id,{getUrl:()=> 'https://example.com/'+id});created++;}
 return saved.get(id);
};
ctx.processarAnexosPendentes();assert.equal(main.rows[1][2],'');assert.equal(created,1);assert.equal(released,1);
failSecond=false;ctx.processarAnexosPendentes();assert.equal(main.rows[1][2].split('\n').length,2);assert.equal(created,2);
ctx.processarAnexosPendentes();assert.equal(created,2);assert.equal(released,3);
console.log('OK: 46 nós; conexões e referências; '+codes+' nós de código; '+expressions+' expressões HTTP; JSONs; Apps Script; extração e retomada de anexos.');
console.log('Sem importação no n8n ou execução de serviços externos.');

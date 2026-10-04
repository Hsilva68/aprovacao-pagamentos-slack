// Gera cópia privada configurada; nunca edita a versão pública.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const configPath=path.resolve(process.argv[2]||path.join(root,'config.local.json'));
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const example=JSON.parse(fs.readFileSync(path.join(root,'examples/config.example.json'),'utf8'));
let text=fs.readFileSync(path.join(root,'workflow/aprovacao-pagamentos.public.json'),'utf8');
for(const key of Object.keys(example)) {
 const value=String(config[key]||'').trim();
 if(!value||value===key)throw new Error('Preencha '+key);
 if(key.startsWith('UDEMO')&&!/^[UW][A-Z0-9]+$/.test(value))throw new Error('ID Slack inválido: '+key);
 if(['CONFIGURE_MAIN_SHEET_ID','CONFIGURE_REJECTED_SHEET_ID'].includes(key)&&!/^\d+$/.test(value))throw new Error('Use gid numérico em '+key);
 if(key==='CONFIGURE_SPREADSHEET_ID'&&!/^[A-Za-z0-9_-]+$/.test(value))throw new Error('ID de planilha inválido.');
 text=text.split(key).join(value);
}
const data=JSON.parse(text);data.active=false;
fs.mkdirSync(path.join(root,'private'),{recursive:true});
fs.writeFileSync(path.join(root,'private/workflow.configurado.json'),JSON.stringify(data,null,2));
console.log('Criado private/workflow.configurado.json. Credenciais ainda devem ser selecionadas no n8n.');

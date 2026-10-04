# Publicar o portfólio no GitHub

Extraia o ZIP, abra a pasta no VS Code e abra um terminal **PowerShell**. Requer Git e GitHub CLI instalados. Os comandos publicam o repositório como **público**. Não é necessário configurar tokens ou executar o workflow para publicar o portfólio.

## Opção automática: todos os passos no script

```powershell
if (Test-Path .\aprovacao-pagamentos-slack\README.md) { Set-Location .\aprovacao-pagamentos-slack }
if (-not (Test-Path .\scripts\Publicar-GitHub.ps1)) { throw 'Abra a pasta extraida do pacote.' }
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Publicar-GitHub.ps1
if ($LASTEXITCODE -ne 0) { throw 'Publicacao interrompida. Confira a mensagem antes de repetir.' }
```

O script verifica a conta Hsilva68, procura padrões sensíveis, inicia o Git, configura o autor local, faz o commit, cria o repositório público, envia os arquivos, adiciona tópicos e abre o navegador. Se já houver `.git`, ele interrompe para não repetir uma publicação sem verificar o estado.

## Passos equivalentes para copiar

```powershell
$ErrorActionPreference = 'Stop'
if (Test-Path .\aprovacao-pagamentos-slack\README.md) { Set-Location .\aprovacao-pagamentos-slack }
if (-not (Test-Path .\workflow\aprovacao-pagamentos.public.json)) { throw 'Pasta incorreta.' }
gh auth status
if ($LASTEXITCODE -ne 0) { gh auth login; if ($LASTEXITCODE -ne 0) { throw 'Falha no login.' } }
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Verificar-Publicacao.ps1
if ($LASTEXITCODE -ne 0) { throw 'Corrija a verificacao antes de publicar.' }
git init -b main
if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar Git.' }
git config user.name 'Henrique Silva'
git config user.email 'henrique16868@hotmail.com'
git add .
if ($LASTEXITCODE -ne 0) { throw 'Falha no git add.' }
git commit -m 'feat: aprovacao de pagamentos pelo Slack com n8n e Google Drive'
if ($LASTEXITCODE -ne 0) { throw 'Falha no commit.' }
gh repo create Hsilva68/aprovacao-pagamentos-slack --public --source . --remote origin --push --description 'Solicitacao, aprovacao e acompanhamento de pagamentos no Slack com n8n, Google Sheets e Apps Script. Versao publica adaptada.'
if ($LASTEXITCODE -ne 0) { throw 'Falha na criacao ou no push; confira antes de repetir.' }
gh repo edit Hsilva68/aprovacao-pagamentos-slack --add-topic n8n --add-topic slack-api --add-topic google-apps-script --add-topic google-sheets --add-topic workflow-automation --add-topic approval-workflow
git status
gh repo view Hsilva68/aprovacao-pagamentos-slack --web
```

Escolha **uma** das opções. O `--push` faz o envio inicial. Se o repositório já existir ou ocorrer erro depois do commit, confira `git status` e `git remote -v`; não apague o repositório nem repita cegamente. Nenhum commit ou push foi feito na preparação do pacote.

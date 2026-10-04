$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
function Verificar-Saida([string]$mensagem) { if ($LASTEXITCODE -ne 0) { throw $mensagem } }
Get-Command git -ErrorAction Stop | Out-Null
Get-Command gh -ErrorAction Stop | Out-Null
gh auth status
if ($LASTEXITCODE -ne 0) { gh auth login; Verificar-Saida 'Falha no login do GitHub.' }
$conta = gh api user --jq .login
Verificar-Saida 'Nao foi possivel conferir a conta.'
if ($conta.Trim() -ne 'Hsilva68') { throw 'Use gh auth switch --user Hsilva68 e tente novamente.' }
& (Join-Path $PSScriptRoot 'Verificar-Publicacao.ps1')
if (Test-Path .git) { throw 'Esta pasta ja tem Git. Confira o estado antes de repetir a publicacao inicial.' }
git init -b main
Verificar-Saida 'Falha ao iniciar Git.'
git config user.name 'Henrique Silva'
Verificar-Saida 'Falha na configuracao do nome.'
git config user.email 'henrique16868@hotmail.com'
Verificar-Saida 'Falha na configuracao do e-mail.'
git add .
Verificar-Saida 'Falha ao adicionar arquivos.'
git commit -m 'feat: aprovacao de pagamentos pelo Slack com n8n e Google Drive'
Verificar-Saida 'Falha no commit.'
gh repo create Hsilva68/aprovacao-pagamentos-slack --public --source . --remote origin --push --description 'Solicitacao, aprovacao e acompanhamento de pagamentos no Slack com n8n, Google Sheets e Apps Script. Versao publica adaptada.'
Verificar-Saida 'Falha na criacao ou no push. Nao repita o script sem conferir o estado.'
gh repo edit Hsilva68/aprovacao-pagamentos-slack --add-topic n8n --add-topic slack-api --add-topic google-apps-script --add-topic google-sheets --add-topic workflow-automation --add-topic approval-workflow
Verificar-Saida 'Push realizado; falha apenas ao adicionar os topicos.'
git status
gh repo view Hsilva68/aprovacao-pagamentos-slack --web

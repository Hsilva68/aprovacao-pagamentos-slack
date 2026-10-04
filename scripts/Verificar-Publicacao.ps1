$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
$padroes = @('xox[baprs]-[A-Za-z0-9-]{15,}', 'https://hooks\.slack\.com/(services|commands)/', ('grupo' + 'sbf'), ('Felipe' + ' Morais'), ('Natal' + ' Arruda'), ('Janaine' + ' Pimentel'), ('Juliana' + ' Silva Santos'))
$arquivos = Get-ChildItem $raiz -Recurse -File | Where-Object {
  $_.FullName -notmatch '[\\/](\.git|private|node_modules)[\\/]' -and
  $_.Name -ne 'config.local.json' -and
  $_.Extension -in '.json','.gs','.js','.cjs','.md','.txt','.html','.svg','.ps1'
}
$achados = $arquivos | Select-String -Pattern $padroes
if ($achados) {
  $achados | ForEach-Object { Write-Host ($_.Path + ':' + $_.LineNumber + ' - revisar dado interno') }
  throw 'Publicacao interrompida: revise os arquivos indicados.'
}
$wf = Get-Content (Join-Path $raiz 'workflow\aprovacao-pagamentos.public.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($wf.active) { throw 'O workflow publico deve estar desativado.' }
foreach ($n in $wf.nodes) {
  if ($n.PSObject.Properties.Name -contains 'credentials') { throw 'Remova os vinculos de credenciais do JSON publico.' }
}
Write-Host 'Verificacao textual concluida. As imagens de demonstracao nao contêm dados reais.'

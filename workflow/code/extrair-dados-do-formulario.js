// Nó: Extrair Dados do Formulário
// Referência extraída do JSON; executa no contexto do n8n.
const payload = $input.item.json.payload;
const values = payload.view?.state?.values || payload.state?.values || {};

const razaoSocial = (values?.razao_social?.razao_social_input?.value || '').trim();
const cnpjCpf = (values?.cnpj_cpf?.cnpj_cpf_input?.value || '').trim();
const valor = (values?.valor?.valor_input?.value || '').trim();
const vencimento = values?.vencimento?.vencimento_input?.selected_date || '';
const formaPagamento = values?.forma_pagamento?.forma_pagamento_input?.selected_option?.value || '';
const codigoBoleto = (values?.codigo_boleto?.codigo_boleto_input?.value || '').trim();
const tipoChavePix = values?.tipo_chave_pix?.tipo_chave_pix_input?.selected_option?.value || '';
const chavePixOriginal = (values?.chave_pix?.chave_pix_input?.value || '').trim();
const dadosBancarios = (values?.dados_bancarios?.dados_bancarios_input?.value || '').trim();
const observacoes = (values?.observacoes?.observacoes_input?.value || '').trim();
const aprovadorOriginalId = values?.aprovador?.aprovador_input?.selected_option?.value || '';
const aprovadorId = aprovadorOriginalId;
const rawAnexos = values?.anexo?.anexo_input?.files || values?.anexo?.anexo_input?.selected_files || [];

function normalizeFile(f) {
  if (!f) return null;
  if (typeof f === 'string') {
    return { id: f, name: '', user: payload.user?.id || '', permalink: '', permalink_public: '' };
  }
  return {
    id: f.id || f.file_id || '',
    name: f.name || f.title || f.filename || '',
    user: f.user || f.user_id || payload.user?.id || '',
    // IMPORTANTE: usar o permalink nativo do Slack, formato workspace-exemplo.slack.com/files/...
    // Não usar permalink_public/slack-files.com porque trouxe problema de permissão/arquivo não encontrado.
    permalink: f.permalink || '',
    permalink_public: f.permalink_public || ''
  };
}

const anexoArquivos = rawAnexos
  .map(normalizeFile)
  .filter(function(f) { return f && (f.id || f.permalink); })
  .slice(0, 10);

const anexoIds = anexoArquivos
  .map(function(f) { return f.permalink || f.id; })
  .filter(Boolean);

const anexoTexto = anexoArquivos.map(function(f, i) {
  const link = f.permalink || '';
  const label = f.name ? f.name : ('arquivo ' + (i + 1));
  if (link) return '• <' + link + '|Ver ' + label + '>';
  return '• Arquivo `' + f.id + '`';
}).join('\n');

const solicitanteId = payload.user?.id || '';
const solicitanteNome = payload.user?.name || '';
const timestamp = new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit'});
const protocolo = 'PAG-' + Date.now();

// ── Helpers ──────────────────────────────────────────────
function onlyDigits(s) { return String(s || '').replace(/\D/g, ''); }
function cleanDoc(s) { return String(s || '').replace(/[\.\-\/\s]/g, ''); }

function validarCNPJ(cnpj) {
  const c = cleanDoc(cnpj);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  let sum = 0, len = c.length - 2, nums = c.split('').map(Number);
  let pos = len - 7;
  for (let i = len; i >= 1; i--) { sum += nums[len - i] * pos--; if (pos < 2) pos = 9; }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== nums[len]) return false;
  sum = 0; len = c.length - 1; pos = len - 7;
  for (let i = len; i >= 1; i--) { sum += nums[len - i] * pos--; if (pos < 2) pos = 9; }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === nums[len];
}

function validarCPF(cpf) {
  const c = cleanDoc(cpf);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i], 10) * (10 - i);
  let r = (sum * 10) % 11; if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i], 10) * (11 - i);
  r = (sum * 10) % 11; if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10], 10);
}

function validarBoleto(codigo) {
  const c = String(codigo || '').replace(/[\s\.\-]/g, '');
  return /^\d{44,48}$/.test(c);
}

function formatarPixCelular(chave) {
  // Sem validação/normalização de telefone em modo teste.
  // Mantém exatamente o que o solicitante digitou.
  return String(chave || '').trim();
}

function normalizarChavePix(tipo, chave) {
  const c = String(chave || '').trim();
  if (tipo === 'Celular' || tipo === 'Telefone') return formatarPixCelular(c);
  if (tipo === 'CPF' || tipo === 'CNPJ') return onlyDigits(c);
  if (tipo === 'Email') return c.toLowerCase();
  return c;
}

function validarChavePix(tipo, chave) {
  const c = String(chave || '').trim();
  if (!tipo) return false;
  if (!c) return false;
  if (tipo === 'CPF') return validarCPF(c);
  if (tipo === 'CNPJ') return validarCNPJ(c);
  if (tipo === 'Email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
  if (tipo === 'Celular' || tipo === 'Telefone') return c.length > 0;
  if (tipo === 'Aleatoria') return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c);
  return c.length > 0;
}

// ── Validações ───────────────────────────────────────────
const errors = {};

if (cnpjCpf) {
  const d = cleanDoc(cnpjCpf);
  if (d.length === 11) {
    if (!validarCPF(cnpjCpf)) errors['cnpj_cpf'] = '❌ CPF inválido. Verifique os dígitos informados.';
  } else if (d.length === 14) {
    if (!validarCNPJ(cnpjCpf)) errors['cnpj_cpf'] = '❌ CNPJ inválido. Verifique os dígitos informados.';
  } else {
    errors['cnpj_cpf'] = '❌ CNPJ/CPF deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).';
  }
}

if (formaPagamento === 'Boleto') {
  if (!codigoBoleto) {
    errors['codigo_boleto'] = '❌ Informe o código de barras do boleto.';
  } else if (!validarBoleto(codigoBoleto)) {
    errors['codigo_boleto'] = '❌ Código de barras inválido. Use 44 a 48 dígitos numéricos.';
  }
}

if (formaPagamento === 'Pix') {
  if (!tipoChavePix) {
    errors['tipo_chave_pix'] = '❌ Selecione o tipo da chave PIX.';
  }
  if (!chavePixOriginal) {
    errors['chave_pix'] = '❌ Informe a chave PIX.';
  } else if (!validarChavePix(tipoChavePix, chavePixOriginal)) {
    const msgs = {
      CPF: '❌ CPF da chave PIX inválido.',
      CNPJ: '❌ CNPJ da chave PIX inválido.',
      Email: '❌ E-mail da chave PIX inválido.',
      Celular: '❌ Informe a chave PIX de celular.',
      Telefone: '❌ Informe a chave PIX de telefone.',
      Aleatoria: '❌ Chave aleatória PIX inválida. Deve ser um UUID válido.'
    };
    errors['chave_pix'] = msgs[tipoChavePix] || '❌ Chave PIX inválida para o tipo selecionado.';
  }
}

if (formaPagamento === 'Transferencia' && !dadosBancarios) {
  errors['dados_bancarios'] = '❌ Informe os dados bancários para transferência.';
}

if (anexoArquivos.length === 0) {
  errors['anexo'] = '❌ Inclua pelo menos um anexo para enviar a solicitação.';
}

const hasErrors = Object.keys(errors).length > 0;
const chavePix = normalizarChavePix(tipoChavePix, chavePixOriginal);

return [{
  json: {
    _hasErrors: hasErrors,
    _validationErrors: errors,
    protocolo: hasErrors ? '' : protocolo,
    razaoSocial,
    cnpjCpf,
    valor,
    vencimento,
    formaPagamento,
    codigoBoleto,
    tipoChavePix,
    chavePix,
    chavePixOriginal,
    dadosBancarios,
    observacoes,
    aprovadorId,
    aprovadorOriginalId,
    anexoIds,
    anexoArquivos,
    anexoTexto,
    solicitanteId,
    solicitanteNome,
    timestamp,
    status: hasErrors ? 'INVALIDO' : 'PENDENTE'
  }
}];

# Estrutura da planilha

Crie as abas **Respostas do formulário** e **Negados**, com a mesma sequência de cabeçalhos na linha 1. A aba Negados recebe a solicitação antes de o workflow remover sua linha da aba principal. Faça testes somente em uma cópia.

| Coluna | Cabeçalho |
|---|---|
| A | `ID` |
| B | `Razão Social ` |
| C | `CNPJ/CPF` |
| D | `Valor` |
| E | `Vencimento` |
| F | `Forma de Pagamento` |
| G | `Dados bancários` |
| H | `Código de barras do boleto` |
| I | `Chave PIX` |
| J | `Tipo de Chave PIX` |
| K | `Observações` |
| L | `Aprovação` |
| M | `Anexo` |
| N | `Quem enviou` |
| O | `Solicitante ID` |
| P | `Data e hora` |
| Q | `Aprovador` |
| R | `Data da Aprovação` |
| S | `Quem concluiu` |
| T | `Data da Conclusão` |
| U | `Pagamento` |
| V | `Anexo no Drive` |

O cabeçalho `Razão Social ` possui um espaço ao final no fluxo original. Preserve-o enquanto utilizar este JSON. `Dados bancários` é o nome da coluna, embora um objeto interno use `Dados Bancários`. `Anexo no Drive` ocupa V. Os identificadores de aba são os números `gid` da URL.

A automação registra eventos do processo; não consulta extrato bancário nem executa pagamento.

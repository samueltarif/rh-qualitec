import { createError } from 'h3'
import puppeteer from 'puppeteer'
import { calcularRescisao } from '../../utils/rescisao-calculator'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { colaborador, dadosRescisao, empresa } = body

    if (!colaborador || !dadosRescisao || !empresa) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados incompletos para gerar TRCT'
      })
    }

    // Calcular rescisão usando o mesmo motor do simulador
    const calculos = calcularRescisao(colaborador, dadosRescisao)

    // Gerar HTML do TRCT
    const htmlContent = gerarHTMLTRCT(empresa, colaborador, dadosRescisao, calculos)

    // Gerar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      printBackground: true
    })

    await browser.close()

    // Definir headers para download
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="TRCT_${colaborador.nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf"`)
    
    return pdfBuffer

  } catch (error: any) {
    console.error('Erro ao gerar TRCT:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erro ao gerar TRCT: ${error.message}`
    })
  }
})

function gerarHTMLTRCT(empresa: any, colaborador: any, dadosRescisao: any, calculos: any): string {
  const codigosVerbas: Record<string, string> = {
    'Saldo de Salário': '001',
    'Aviso Prévio Indenizado': '002', 
    'Aviso Prévio Trabalhado': '003',
    '13º Salário Proporcional': '004',
    'Férias Proporcionais': '005',
    'Férias Vencidas': '006',
    '1/3 Constitucional Férias': '007',
    'Horas Extras': '008',
    'Adicional Noturno': '009',
    'Adicional Insalubridade': '010',
    'Adicional Periculosidade': '011',
    'Comissões': '012',
    'Gratificações': '013',
    'INSS': '101',
    'IRRF': '102',
    'Faltas Injustificadas': '103',
    'Adiantamento Salarial': '104',
    'Vale Transporte': '105',
    'Vale Refeição': '106',
    'Pensão Alimentícia': '107',
    'Empréstimo Consignado': '108'
  }

  const getCodigoVerba = (descricao: string): string => {
    return codigosVerbas[descricao] || '999'
  }

  const getReferencia = (item: any): string => {
    if (item.descricao.includes('Saldo')) return 'Dias trabalhados'
    if (item.descricao.includes('13º')) return 'Meses/avos'
    if (item.descricao.includes('Férias')) return 'Período aquisitivo'
    if (item.descricao.includes('Aviso')) return '30 dias'
    if (item.descricao.includes('Horas')) return 'Horas extras'
    return '-'
  }

  const getTipoRescisaoDescricao = (tipo: string): string => {
    const tipos: Record<string, string> = {
      'dispensa_sem_justa_causa': 'Dispensa sem Justa Causa',
      'dispensa_com_justa_causa': 'Dispensa com Justa Causa',
      'pedido_demissao': 'Pedido de Demissão',
      'acordo_mutuo': 'Rescisão por Acordo Mútuo (Art. 484-A CLT)',
      'termino_experiencia': 'Término de Contrato de Experiência',
      'termino_determinado': 'Término de Contrato por Prazo Determinado',
      'rescisao_indireta': 'Rescisão Indireta',
      'morte': 'Morte do Empregado',
      'aposentadoria': 'Aposentadoria'
    }
    return tipos[tipo] || tipo
  }

  const getInformativoSaque = (tipo: string): string => {
    switch (tipo) {
      case 'dispensa_sem_justa_causa':
      case 'rescisao_indireta':
        return 'Saque autorizado com código 01 - Dispensa sem justa causa'
      case 'acordo_mutuo':
        return 'Saque de 80% autorizado com código 03 - Acordo mútuo'
      case 'pedido_demissao':
        return 'Saque não autorizado - Permanece bloqueado na conta FGTS'
      case 'aposentadoria':
        return 'Saque autorizado com código 05 - Aposentadoria'
      case 'termino_determinado':
        return 'Saque autorizado com código 04 - Término de contrato determinado'
      default:
        return 'Consulte as regras de saque na Caixa Econômica Federal'
    }
  }

  const getPrazoPagamento = (tipo: string): string => {
    switch (tipo) {
      case 'dispensa_sem_justa_causa':
      case 'dispensa_com_justa_causa':
      case 'rescisao_indireta':
        return 'Até o 1º dia útil imediato ao término do contrato (Art. 477 §6º CLT)'
      case 'pedido_demissao':
      case 'acordo_mutuo':
        return 'Até o 10º dia corrido, contado da data da notificação da demissão (Art. 477 §6º CLT)'
      default:
        return 'Conforme Art. 477 §6º da CLT'
    }
  }

  const necessitaHomologacao = (): boolean => {
    const dataAdmissao = new Date(colaborador.data_admissao)
    const dataDesligamento = new Date(dadosRescisao.data_desligamento)
    const diffTime = Math.abs(dataDesligamento.getTime() - dataAdmissao.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 365
  }

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const formatarData = (data: string): string => {
    if (!data) return ''
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const formatarCPF = (cpf: string): string => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatarCNPJ = (cnpj: string): string => {
    if (!cnpj) return ''
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TRCT - ${colaborador.nome}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
        }
        
        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
        }
        
        .border-2 {
            border: 2px solid #000;
        }
        
        .border {
            border: 1px solid #000;
        }
        
        .border-b {
            border-bottom: 1px solid #000;
        }
        
        .border-r {
            border-right: 1px solid #000;
        }
        
        .border-t {
            border-top: 1px solid #000;
        }
        
        .border-t-2 {
            border-top: 2px solid #000;
        }
        
        .p-2 {
            padding: 8px;
        }
        
        .p-3 {
            padding: 12px;
        }
        
        .p-4 {
            padding: 16px;
        }
        
        .mb-4 {
            margin-bottom: 16px;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .font-bold {
            font-weight: bold;
        }
        
        .uppercase {
            text-transform: uppercase;
        }
        
        .bg-gray-100 {
            background-color: #f3f4f6;
        }
        
        .bg-blue-100 {
            background-color: #dbeafe;
        }
        
        .bg-red-100 {
            background-color: #fee2e2;
        }
        
        .bg-yellow-50 {
            background-color: #fefce8;
        }
        
        .grid {
            display: grid;
        }
        
        .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .grid-cols-4 {
            grid-template-columns: repeat(4, 1fr);
        }
        
        .grid-cols-12 {
            grid-template-columns: repeat(12, 1fr);
        }
        
        .col-span-1 {
            grid-column: span 1;
        }
        
        .col-span-2 {
            grid-column: span 2;
        }
        
        .col-span-3 {
            grid-column: span 3;
        }
        
        .col-span-5 {
            grid-column: span 5;
        }
        
        .col-span-7 {
            grid-column: span 7;
        }
        
        .col-span-9 {
            grid-column: span 9;
        }
        
        .gap-4 {
            gap: 16px;
        }
        
        .gap-8 {
            gap: 32px;
        }
        
        .space-y-1 > * + * {
            margin-top: 4px;
        }
        
        .space-y-2 > * + * {
            margin-top: 8px;
        }
        
        .text-xs {
            font-size: 10px;
        }
        
        .text-sm {
            font-size: 11px;
        }
        
        .text-lg {
            font-size: 14px;
        }
        
        .warning-box {
            background-color: #fefce8;
            border: 1px solid #facc15;
            padding: 8px;
            border-radius: 4px;
            margin-top: 8px;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            height: 60px;
            margin-bottom: 8px;
        }
        
        @media print {
            .container {
                max-width: none;
                margin: 0;
                padding: 0;
            }
            
            .bg-gray-100,
            .bg-blue-100,
            .bg-red-100,
            .bg-yellow-50 {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Cabeçalho Oficial -->
        <div class="border-2 p-4 mb-4">
            <div class="text-center mb-4">
                <h1 class="text-lg font-bold uppercase">TERMO DE RESCISÃO DO CONTRATO DE TRABALHO</h1>
                <p class="text-sm">(Artigo 477 da CLT e Lei nº 7.998/90)</p>
            </div>

            <!-- Identificação -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="border p-2">
                    <h3 class="font-bold text-sm mb-2">EMPREGADOR</h3>
                    <div class="space-y-1 text-xs">
                        <p><strong>Razão Social:</strong> ${empresa.razao_social || 'Não informado'}</p>
                        <p><strong>CNPJ:</strong> ${formatarCNPJ(empresa.cnpj || '')}</p>
                        <p><strong>Endereço:</strong> ${empresa.endereco || 'Não informado'}</p>
                        <p><strong>CEP:</strong> ${empresa.cep || 'Não informado'} - ${empresa.cidade || 'Não informado'}/${empresa.estado || 'Não informado'}</p>
                        <p><strong>CNAE:</strong> ${empresa.cnae || 'Não informado'}</p>
                    </div>
                </div>

                <div class="border p-2">
                    <h3 class="font-bold text-sm mb-2">EMPREGADO</h3>
                    <div class="space-y-1 text-xs">
                        <p><strong>Nome:</strong> ${colaborador.nome}</p>
                        <p><strong>CPF:</strong> ${formatarCPF(colaborador.cpf || '')}</p>
                        <p><strong>PIS/PASEP:</strong> ${colaborador.pis || 'Não informado'}</p>
                        <p><strong>Cargo:</strong> ${colaborador.cargo?.nome || 'Não informado'}</p>
                        <p><strong>CBO:</strong> ${colaborador.cbo || 'Não informado'}</p>
                        <p><strong>Matrícula:</strong> ${colaborador.matricula || 'Não informado'}</p>
                    </div>
                </div>
            </div>

            <!-- Dados do Contrato -->
            <div class="border p-2 mb-4">
                <h3 class="font-bold text-sm mb-2">DADOS DO CONTRATO</h3>
                <div class="grid grid-cols-4 gap-4 text-xs">
                    <div>
                        <p><strong>Data Admissão:</strong></p>
                        <p>${formatarData(colaborador.data_admissao)}</p>
                    </div>
                    <div>
                        <p><strong>Data Desligamento:</strong></p>
                        <p>${formatarData(dadosRescisao.data_desligamento)}</p>
                    </div>
                    <div>
                        <p><strong>Tipo de Rescisão:</strong></p>
                        <p>${getTipoRescisaoDescricao(dadosRescisao.tipo_rescisao)}</p>
                    </div>
                    <div>
                        <p><strong>Tempo de Contrato:</strong></p>
                        <p>${calculos.tempo_casa}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quadro de Verbas -->
        <div class="border-2 mb-4">
            <div class="bg-gray-100 p-2 border-b">
                <h3 class="font-bold text-sm text-center">DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS</h3>
            </div>

            <!-- Cabeçalho da Tabela -->
            <div class="grid grid-cols-12 border-b text-xs font-bold bg-gray-100">
                <div class="col-span-1 p-2 border-r text-center">CÓD</div>
                <div class="col-span-5 p-2 border-r text-center">DESCRIÇÃO DA VERBA</div>
                <div class="col-span-2 p-2 border-r text-center">REFERÊNCIA</div>
                <div class="col-span-2 p-2 border-r text-center">VENCIMENTOS</div>
                <div class="col-span-2 p-2 text-center">DESCONTOS</div>
            </div>

            <!-- Proventos -->
            ${calculos.proventos.map((item: any) => `
            <div class="grid grid-cols-12 border-b text-xs">
                <div class="col-span-1 p-2 border-r text-center">${getCodigoVerba(item.descricao)}</div>
                <div class="col-span-5 p-2 border-r">${item.descricao}</div>
                <div class="col-span-2 p-2 border-r text-center">${getReferencia(item)}</div>
                <div class="col-span-2 p-2 border-r text-right">${formatarMoeda(item.valor)}</div>
                <div class="col-span-2 p-2 text-right">-</div>
            </div>
            `).join('')}

            <!-- Descontos -->
            ${calculos.descontos.map((item: any) => `
            <div class="grid grid-cols-12 border-b text-xs">
                <div class="col-span-1 p-2 border-r text-center">${getCodigoVerba(item.descricao)}</div>
                <div class="col-span-5 p-2 border-r">${item.descricao}</div>
                <div class="col-span-2 p-2 border-r text-center">${getReferencia(item)}</div>
                <div class="col-span-2 p-2 border-r text-right">-</div>
                <div class="col-span-2 p-2 text-right">${formatarMoeda(item.valor)}</div>
            </div>
            `).join('')}

            <!-- Totais -->
            <div class="grid grid-cols-12 border-t-2 text-xs font-bold bg-gray-100">
                <div class="col-span-7 p-2 border-r text-right">TOTAIS:</div>
                <div class="col-span-2 p-2 border-r text-right">${formatarMoeda(calculos.total_proventos)}</div>
                <div class="col-span-2 p-2 border-r text-right">${formatarMoeda(calculos.total_descontos)}</div>
                <div class="col-span-1 p-2 text-right"></div>
            </div>

            <!-- Valor Líquido -->
            <div class="grid grid-cols-12 border-t text-sm font-bold bg-yellow-50">
                <div class="col-span-9 p-2 border-r text-right">VALOR LÍQUIDO A RECEBER:</div>
                <div class="col-span-3 p-2 text-right text-lg">${formatarMoeda(calculos.valor_liquido)}</div>
            </div>
        </div>

        <!-- Quadro FGTS -->
        <div class="border-2 mb-4">
            <div class="bg-blue-100 p-2 border-b">
                <h3 class="font-bold text-sm text-center">FUNDO DE GARANTIA DO TEMPO DE SERVIÇO - FGTS</h3>
            </div>

            <div class="p-3 space-y-2 text-xs">
                ${calculos.fgts.map((item: any) => `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
                    <span>${item.descricao}</span>
                    <span style="font-family: monospace;">${formatarMoeda(item.valor)}</span>
                </div>
                `).join('')}
                
                <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 2px solid #000; padding-top: 8px;">
                    <span>TOTAL FGTS + MULTA:</span>
                    <span style="font-family: monospace;">${formatarMoeda(calculos.total_fgts)}</span>
                </div>

                <div class="warning-box">
                    <p class="text-xs font-bold text-center">
                        ⚠️ INFORMATIVO: O FGTS será liberado diretamente pela Caixa Econômica Federal
                    </p>
                    <p class="text-xs text-center" style="margin-top: 4px;">
                        ${getInformativoSaque(dadosRescisao.tipo_rescisao)}
                    </p>
                </div>
            </div>
        </div>

        <!-- Observações Legais -->
        <div class="border-2 mb-4">
            <div class="bg-red-100 p-2 border-b">
                <h3 class="font-bold text-sm text-center">OBSERVAÇÕES LEGAIS</h3>
            </div>
            
            <div class="p-3 space-y-2 text-xs">
                ${calculos.observacoes.map((obs: string) => `
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                    <span class="font-bold">•</span>
                    <span>${obs}</span>
                </div>
                `).join('')}
                
                <div style="border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 12px;">
                    <p class="font-bold">PRAZO PARA PAGAMENTO:</p>
                    <p>${getPrazoPagamento(dadosRescisao.tipo_rescisao)}</p>
                </div>
            </div>
        </div>

        <!-- Base Legal -->
        <div class="border-2 mb-4">
            <div class="bg-gray-100 p-2 border-b">
                <h3 class="font-bold text-sm text-center">BASE LEGAL</h3>
            </div>
            
            <div class="p-3 text-xs space-y-1">
                <p><strong>CLT - Consolidação das Leis do Trabalho:</strong> Arts. 477, 478, 479, 487, 488</p>
                <p><strong>Lei nº 8.036/90:</strong> FGTS - Fundo de Garantia do Tempo de Serviço</p>
                <p><strong>Lei nº 7.998/90:</strong> Seguro-Desemprego</p>
                <p><strong>Lei nº 15.270/2025:</strong> Nova tabela do Imposto de Renda (vigente a partir de 01/01/2026)</p>
            </div>
        </div>

        <!-- Campos de Assinatura -->
        <div class="border-2">
            <div class="bg-gray-100 p-2 border-b">
                <h3 class="font-bold text-sm text-center">ASSINATURAS</h3>
            </div>
            
            <div class="p-4">
                <div class="grid grid-cols-2 gap-8 text-xs">
                    <!-- Empregado -->
                    <div class="text-center">
                        <div class="signature-line"></div>
                        <p class="font-bold">${colaborador.nome}</p>
                        <p>EMPREGADO</p>
                        <p>CPF: ${formatarCPF(colaborador.cpf || '')}</p>
                    </div>
                    
                    <!-- Empregador -->
                    <div class="text-center">
                        <div class="signature-line"></div>
                        <p class="font-bold">${empresa.representante_legal || 'REPRESENTANTE LEGAL'}</p>
                        <p>EMPREGADOR</p>
                        <p>${empresa.razao_social}</p>
                    </div>
                </div>

                ${necessitaHomologacao() ? `
                <!-- Homologação -->
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #9ca3af;">
                    <div class="text-center text-xs">
                        <p class="font-bold" style="margin-bottom: 8px;">HOMOLOGAÇÃO SINDICAL</p>
                        <p style="margin-bottom: 16px;">(Obrigatória para contratos com mais de 1 ano - Art. 477 §1º CLT)</p>
                        
                        <div class="signature-line" style="margin: 0 80px;"></div>
                        <p class="font-bold">REPRESENTANTE SINDICAL</p>
                        <p>Data: ___/___/______</p>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Rodapé -->
        <div style="margin-top: 16px; font-size: 10px; text-align: center; color: #6b7280;">
            <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <p>Sistema de Gestão de RH - Conforme legislação trabalhista brasileira vigente</p>
        </div>
    </div>
</body>
</html>
  `
}
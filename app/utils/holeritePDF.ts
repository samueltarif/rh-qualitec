import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface HoleriteData {
  id: string
  mes: number
  ano: number
  nome_colaborador: string
  cpf: string
  cargo?: string
  departamento?: string
  codigo_colaborador?: string
  cbo?: string
  matricula?: string
  data_admissao?: string
  salario_base: number
  outros_proventos?: number
  descricao_outros_proventos?: string
  total_proventos: number
  inss?: number
  irrf?: number
  valor_adiantamento?: number
  plano_saude?: number
  outros_descontos?: number
  descricao_outros_descontos?: string
  total_descontos: number
  salario_liquido: number
  fgts?: number
  tipo?: string
  observacoes?: string
}

interface EmpresaData {
  nome: string
  cnpj: string
  responsavel_nome?: string
  responsavel_cpf?: string
}

/**
 * Gera holerite no formato OFICIAL da empresa
 * Exatamente igual ao modelo mostrado na imagem de referência
 */
export function gerarHoleritePDFOficial(holerite: HoleriteData, empresa?: EmpresaData) {
  const doc = new jsPDF()
  
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)
  }

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return ''
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  let yPos = 10

  // ===== LINHA 1: NOME DA EMPRESA + CNPJ + CC + TIPO FOLHA =====
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(empresa?.nome || 'SPEED GESTÃO E SERVIÇOS ADMINISTRATIVOS LTDA', 10, yPos)
  
  yPos += 5
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  
  const tipoFolha = holerite.tipo === 'decimo_terceiro' ? '13º Salário' : 
                    holerite.tipo === 'adiantamento' ? 'Adiantamento' : 'Folha Mensal'
  
  doc.text(`CNPJ: ${formatCNPJ(empresa?.cnpj || '')}`, 10, yPos)
  doc.text('CC: GERAL', 105, yPos, { align: 'center' })
  doc.text(tipoFolha, 200, yPos, { align: 'right' })
  
  yPos += 4
  doc.text('Mensalista', 105, yPos, { align: 'center' })
  doc.text(`${meses[holerite.mes - 1]} de ${holerite.ano}`, 200, yPos, { align: 'right' })
  
  yPos += 8

  // ===== LINHA 2: DADOS DO COLABORADOR =====
  doc.setFontSize(7)
  
  // Cabeçalhos
  doc.text('Código', 10, yPos)
  doc.text('Nome do Funcionário', 30, yPos)
  doc.text('CBO', 120, yPos)
  doc.text('Departamento', 145, yPos)
  doc.text('Mat', 185, yPos)
  
  yPos += 4
  doc.setFont('helvetica', 'bold')
  doc.text(holerite.codigo_colaborador || '8', 10, yPos)
  doc.text(holerite.nome_colaborador.toUpperCase(), 30, yPos)
  doc.text(holerite.cbo || '354125', 120, yPos)
  doc.text(holerite.departamento || '1', 145, yPos)
  doc.text(holerite.matricula || '1', 185, yPos)
  
  yPos += 4
  doc.setFont('helvetica', 'normal')
  doc.text(holerite.cargo?.toUpperCase() || 'AUX COMERCIAL', 30, yPos)
  doc.text('Admissão:', 145, yPos)
  doc.text(formatDate(holerite.data_admissao || ''), 165, yPos)
  
  yPos += 8

  // ===== TABELA PRINCIPAL (5 COLUNAS) =====
  const linhasTabela: any[] = []
  
  // PROVENTOS
  if (holerite.salario_base > 0) {
    linhasTabela.push(['8781', 'DIAS NORMAIS', '30,00', formatCurrency(holerite.salario_base), ''])
  }
  
  if (holerite.valor_horas_extras_50 && holerite.valor_horas_extras_50 > 0) {
    linhasTabela.push(['002', 'HORAS EXTRAS 50%', String(holerite.horas_extras_50 || 0), formatCurrency(holerite.valor_horas_extras_50), ''])
  }
  
  if (holerite.valor_horas_extras_100 && holerite.valor_horas_extras_100 > 0) {
    linhasTabela.push(['003', 'HORAS EXTRAS 100%', String(holerite.horas_extras_100 || 0), formatCurrency(holerite.valor_horas_extras_100), ''])
  }
  
  if (holerite.bonus && holerite.bonus > 0) {
    linhasTabela.push(['010', 'BÔNUS / GRATIFICAÇÕES', '', formatCurrency(holerite.bonus), ''])
  }
  
  if (holerite.comissoes && holerite.comissoes > 0) {
    linhasTabela.push(['011', 'COMISSÕES', '', formatCurrency(holerite.comissoes), ''])
  }
  
  if (holerite.adicional_insalubridade && holerite.adicional_insalubridade > 0) {
    linhasTabela.push(['012', 'ADICIONAL INSALUBRIDADE', '', formatCurrency(holerite.adicional_insalubridade), ''])
  }
  
  if (holerite.adicional_periculosidade && holerite.adicional_periculosidade > 0) {
    linhasTabela.push(['013', 'ADICIONAL PERICULOSIDADE', '', formatCurrency(holerite.adicional_periculosidade), ''])
  }
  
  if (holerite.adicional_noturno && holerite.adicional_noturno > 0) {
    linhasTabela.push(['014', 'ADICIONAL NOTURNO', '', formatCurrency(holerite.adicional_noturno), ''])
  }
  
  if (holerite.outros_proventos && holerite.outros_proventos > 0) {
    linhasTabela.push([
      '19',
      holerite.descricao_outros_proventos || 'OUTROS PROVENTOS',
      '',
      formatCurrency(holerite.outros_proventos),
      ''
    ])
  }
  
  // ITENS PERSONALIZADOS - PROVENTOS
  const itensPersonalizados = (holerite as any).itens_personalizados || []
  itensPersonalizados
    .filter((item: any) => item.tipo === 'provento')
    .forEach((item: any) => {
      linhasTabela.push([
        item.codigo || '---',
        item.descricao || 'ITEM PERSONALIZADO',
        item.referencia || '',
        formatCurrency(item.valor || 0),
        ''
      ])
    })
  
  // DESCONTOS
  if (holerite.inss && holerite.inss > 0) {
    const aliquotaINSS = ((holerite.inss / holerite.salario_base) * 100).toFixed(2)
    linhasTabela.push(['998', 'I.N.S.S.', aliquotaINSS, '', formatCurrency(holerite.inss)])
  }
  
  if (holerite.irrf && holerite.irrf > 0) {
    linhasTabela.push(['999', 'I.R.R.F.', '', '', formatCurrency(holerite.irrf)])
  }
  
  if (holerite.adiantamento && holerite.adiantamento > 0) {
    linhasTabela.push(['910', 'ADIANTAMENTO SALARIAL', '', '', formatCurrency(holerite.adiantamento)])
  }
  
  if (holerite.emprestimos && holerite.emprestimos > 0) {
    linhasTabela.push(['911', 'EMPRÉSTIMOS / CONSIGNADOS', '', '', formatCurrency(holerite.emprestimos)])
  }
  
  if (holerite.faltas && holerite.faltas > 0) {
    linhasTabela.push(['903', 'FALTAS', '', '', formatCurrency(holerite.faltas)])
  }
  
  if (holerite.atrasos && holerite.atrasos > 0) {
    linhasTabela.push(['904', 'ATRASOS', '', '', formatCurrency(holerite.atrasos)])
  }
  
  if (holerite.plano_saude && holerite.plano_saude > 0) {
    linhasTabela.push(['920', 'PLANO DE SAÚDE', '', '', formatCurrency(holerite.plano_saude)])
  }
  
  if (holerite.plano_odontologico && holerite.plano_odontologico > 0) {
    linhasTabela.push(['921', 'PLANO ODONTOLÓGICO', '', '', formatCurrency(holerite.plano_odontologico)])
  }
  
  if (holerite.seguro_vida && holerite.seguro_vida > 0) {
    linhasTabela.push(['922', 'SEGURO DE VIDA', '', '', formatCurrency(holerite.seguro_vida)])
  }
  
  if (holerite.auxilio_creche && holerite.auxilio_creche > 0) {
    linhasTabela.push(['923', 'AUXÍLIO CRECHE', '', '', formatCurrency(holerite.auxilio_creche)])
  }
  
  if (holerite.auxilio_educacao && holerite.auxilio_educacao > 0) {
    linhasTabela.push(['924', 'AUXÍLIO EDUCAÇÃO', '', '', formatCurrency(holerite.auxilio_educacao)])
  }
  
  if (holerite.auxilio_combustivel && holerite.auxilio_combustivel > 0) {
    linhasTabela.push(['925', 'AUXÍLIO COMBUSTÍVEL', '', '', formatCurrency(holerite.auxilio_combustivel)])
  }
  
  if (holerite.outros_beneficios && holerite.outros_beneficios > 0) {
    linhasTabela.push(['926', 'OUTROS BENEFÍCIOS', '', '', formatCurrency(holerite.outros_beneficios)])
  }
  
  if (holerite.outros_descontos && holerite.outros_descontos > 0) {
    linhasTabela.push([
      '905',
      holerite.descricao_outros_descontos || 'OUTROS DESCONTOS',
      '',
      '',
      formatCurrency(holerite.outros_descontos)
    ])
  }
  
  // ITENS PERSONALIZADOS - DESCONTOS
  itensPersonalizados
    .filter((item: any) => item.tipo === 'desconto')
    .forEach((item: any) => {
      linhasTabela.push([
        item.codigo || '---',
        item.descricao || 'ITEM PERSONALIZADO',
        item.referencia || '',
        '',
        formatCurrency(item.valor || 0)
      ])
    })

  // Tabela
  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Descrição', 'Referência', 'Vencimentos', 'Descontos']],
    body: linhasTabela,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 90, halign: 'left' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: 10, right: 10 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 3

  // ===== TOTAIS (FORMATO OFICIAL) =====
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  
  // Calcular totais corretos
  let totalProventos = holerite.salario_base || 0
  totalProventos += holerite.valor_horas_extras_50 || 0
  totalProventos += holerite.valor_horas_extras_100 || 0
  totalProventos += holerite.bonus || 0
  totalProventos += holerite.comissoes || 0
  totalProventos += holerite.adicional_insalubridade || 0
  totalProventos += holerite.adicional_periculosidade || 0
  totalProventos += holerite.adicional_noturno || 0
  totalProventos += holerite.outros_proventos || 0
  
  let totalDescontos = 0
  totalDescontos += holerite.inss || 0
  totalDescontos += holerite.irrf || 0
  totalDescontos += holerite.adiantamento || 0
  totalDescontos += holerite.emprestimos || 0
  totalDescontos += holerite.faltas || 0
  totalDescontos += holerite.atrasos || 0
  totalDescontos += holerite.plano_saude || 0
  totalDescontos += holerite.plano_odontologico || 0
  totalDescontos += holerite.seguro_vida || 0
  totalDescontos += holerite.auxilio_creche || 0
  totalDescontos += holerite.auxilio_educacao || 0
  totalDescontos += holerite.auxilio_combustivel || 0
  totalDescontos += holerite.outros_beneficios || 0
  totalDescontos += holerite.outros_descontos || 0
  
  // Adicionar itens personalizados aos totais
  itensPersonalizados.forEach((item: any) => {
    if (item.tipo === 'provento') {
      totalProventos += item.valor || 0
    } else {
      totalDescontos += item.valor || 0
    }
  })
  
  const salarioLiquido = totalProventos - totalDescontos
  
  // Linha 1: Total Vencimentos e Total Descontos
  doc.text('Total de Vencimentos', 126, yPos, { align: 'right' })
  doc.text(formatCurrency(totalProventos), 154, yPos, { align: 'right' })
  doc.text('Total de Descontos', 182, yPos, { align: 'right' })
  doc.text(formatCurrency(totalDescontos), 200, yPos, { align: 'right' })
  
  yPos += 5
  // Linha 2: Valor Líquido
  doc.text('Valor Líquido', 182, yPos, { align: 'right' })
  doc.setFontSize(9)
  doc.text(formatCurrency(salarioLiquido), 200, yPos, { align: 'right' })
  
  yPos += 10

  // ===== ASSINATURA DIGITAL =====
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  const responsavelNome = empresa?.responsavel_nome || 'SILVANA APARECIDA BARDUCHI'
  const responsavelCPF = empresa?.responsavel_cpf || '04487488869'
  const agora = new Date()
  const dataHora = `${agora.getFullYear()}.${String(agora.getMonth() + 1).padStart(2, '0')}.${String(agora.getDate()).padStart(2, '0')} ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:${String(agora.getSeconds()).padStart(2, '0')} -03'00'`
  
  doc.text(`Assinado de forma digital por ${responsavelNome}:${responsavelCPF}`, 10, yPos)
  yPos += 3
  doc.setFont('helvetica', 'normal')
  doc.text(`Dados: ${dataHora}`, 10, yPos)
  
  yPos += 8

  // ===== RODAPÉ TÉCNICO =====
  const baseINSS = holerite.total_proventos
  const baseFGTS = holerite.total_proventos
  const fgts = holerite.fgts || (baseFGTS * 0.08)
  const baseIRRF = baseINSS - (holerite.inss || 0)
  const faixaIRRF = holerite.irrf || 0

  autoTable(doc, {
    startY: yPos,
    head: [['Salário Base', 'Sal. Contr. INSS', 'Base Cálc. FGTS', 'F.G.T.S do Mês', 'Base Cálc. IRRF', 'Faixa IRRF']],
    body: [[
      formatCurrency(holerite.salario_base),
      formatCurrency(baseINSS),
      formatCurrency(baseFGTS),
      formatCurrency(fgts),
      formatCurrency(baseIRRF),
      formatCurrency(faixaIRRF),
    ]],
    theme: 'grid',
    styles: {
      fontSize: 6,
      cellPadding: 1.5,
      halign: 'center',
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 6,
    },
    margin: { left: 10, right: 10 },
  })

  return doc
}

export function downloadHoleritePDFOficial(holerite: HoleriteData, empresa?: EmpresaData) {
  const doc = gerarHoleritePDFOficial(holerite, empresa)
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const nomeArquivo = `Holerite_${holerite.nome_colaborador.replace(/\s+/g, '_')}_${meses[holerite.mes - 1]}_${holerite.ano}.pdf`
  doc.save(nomeArquivo)
}


// Aliases para manter compatibilidade com código existente
export const gerarHoleritePDF = gerarHoleritePDFOficial
export const downloadHoleritePDF = downloadHoleritePDFOficial

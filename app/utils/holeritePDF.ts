// Importações condicionais para evitar problemas no servidor
let jsPDF: any = null
let autoTable: any = null

// Função para importar bibliotecas apenas no cliente
async function loadPDFLibs() {
  if (process.client && !jsPDF) {
    try {
      const jsPDFModule = await import('jspdf')
      const autoTableModule = await import('jspdf-autotable')
      
      jsPDF = jsPDFModule.default || jsPDFModule
      autoTable = autoTableModule.default || autoTableModule
      
      return true
    } catch (error) {
      console.error('❌ Erro ao carregar bibliotecas PDF:', error)
      return false
    }
  }
  return !!jsPDF
}

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
  parcela_13?: string
  meses_trabalhados?: number
  observacoes?: string
  // Campos adicionais que podem existir
  [key: string]: any
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
export async function gerarHoleritePDFOficial(holerite: HoleriteData, empresa?: EmpresaData) {
  // Verificar se estamos no cliente e carregar bibliotecas
  if (!await loadPDFLibs()) {
    throw new Error('Bibliotecas PDF não disponíveis no servidor')
  }
  
  const doc = new jsPDF()
  
  // Verificar se os dados necessários estão presentes
  if (!holerite.tipo) {
    console.warn('Tipo do holerite não definido, assumindo "mensal"')
    holerite.tipo = 'mensal'
  }
  
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
  
  // Determinar o tipo de folha baseado no campo 'tipo' do holerite
  let tipoFolha = 'Folha Mensal'
  let periodoTexto = `${meses[holerite.mes - 1]} de ${holerite.ano}`
  
  // Verificar se é 13º salário
  if (holerite.tipo === 'decimo_terceiro') {
    const parcela13 = (holerite as any).parcela_13
    if (parcela13 === '2') {
      tipoFolha = '13º Salário'
      periodoTexto = `Dezembro de ${holerite.ano}`
    } else if (parcela13 === '1') {
      tipoFolha = '13º Salário - 1ª Parcela'
      periodoTexto = `Novembro de ${holerite.ano}`
    } else {
      tipoFolha = '13º Salário'
      periodoTexto = `Dezembro de ${holerite.ano}`
    }
  } else if (holerite.tipo === 'adiantamento') {
    tipoFolha = 'Adiantamento'
  }
  
  doc.text(`CNPJ: ${formatCNPJ(empresa?.cnpj || '')}`, 10, yPos)
  doc.text('CC: GERAL', 105, yPos, { align: 'center' })
  doc.text(tipoFolha, 200, yPos, { align: 'right' })
  
  yPos += 4
  doc.text('Mensalista', 105, yPos, { align: 'center' })
  doc.text(periodoTexto, 200, yPos, { align: 'right' })
  
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
  
  // ===== PROVENTOS =====
  if (holerite.tipo === 'decimo_terceiro') {
    // ✅ REGRA CORRETA PARA 13º SALÁRIO
    const valorCorreto = holerite.total_proventos || 0
    const mesesTrabalhados = holerite.meses_trabalhados || 12
    const parcela13 = (holerite as any).parcela_13
    
    if (valorCorreto > 0) {
      // Determinar descrição e referência corretas
      let descricao = '13º SALÁRIO'
      let referencia = '12/12' // Padrão para direito integral
      
      if (parcela13 === '2') {
        descricao = '13º SALÁRIO - 2ª PARCELA'
      } else if (parcela13 === '1') {
        descricao = '13º SALÁRIO - 1ª PARCELA'
      }
      
      // Calcular avos corretos (1/12 por mês trabalhado)
      if (mesesTrabalhados < 12) {
        referencia = `${mesesTrabalhados}/12`
      }
      
      linhasTabela.push(['8781', descricao, referencia, formatCurrency(valorCorreto), ''])
    }
  } else {
    // Para holerites mensais, usar salario_base normalmente
    if (holerite.salario_base > 0) {
      linhasTabela.push(['8781', 'DIAS NORMAIS', '30,00', formatCurrency(holerite.salario_base), ''])
    }
  }
  
  // HORAS EXTRAS
  if (holerite.valor_horas_extras_50 && holerite.valor_horas_extras_50 > 0) {
    linhasTabela.push(['002', 'HORAS EXTRAS 50%', String(holerite.horas_extras_50 || 0), formatCurrency(holerite.valor_horas_extras_50), ''])
  }
  
  if (holerite.valor_horas_extras_100 && holerite.valor_horas_extras_100 > 0) {
    linhasTabela.push(['003', 'HORAS EXTRAS 100%', String(holerite.horas_extras_100 || 0), formatCurrency(holerite.valor_horas_extras_100), ''])
  }
  
  // ADICIONAIS
  if (holerite.adicional_noturno && holerite.adicional_noturno > 0) {
    linhasTabela.push(['014', 'ADICIONAL NOTURNO', '', formatCurrency(holerite.adicional_noturno), ''])
  }
  
  if (holerite.adicional_insalubridade && holerite.adicional_insalubridade > 0) {
    linhasTabela.push(['012', 'ADICIONAL INSALUBRIDADE', '', formatCurrency(holerite.adicional_insalubridade), ''])
  }
  
  if (holerite.adicional_periculosidade && holerite.adicional_periculosidade > 0) {
    linhasTabela.push(['013', 'ADICIONAL PERICULOSIDADE', '', formatCurrency(holerite.adicional_periculosidade), ''])
  }
  
  // BONIFICAÇÕES E COMISSÕES
  if (holerite.bonus && holerite.bonus > 0) {
    linhasTabela.push(['010', 'BÔNUS / GRATIFICAÇÕES', '', formatCurrency(holerite.bonus), ''])
  }
  
  if (holerite.comissoes && holerite.comissoes > 0) {
    linhasTabela.push(['011', 'COMISSÕES', '', formatCurrency(holerite.comissoes), ''])
  }
  
  // OUTROS PROVENTOS
  if (holerite.outros_proventos && holerite.outros_proventos > 0) {
    linhasTabela.push([
      '019',
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
  
  // ===== DESCONTOS =====
  // INSS (obrigatório)
  if (holerite.inss && holerite.inss > 0) {
    const baseCalculo = holerite.salario_base || holerite.total_proventos || 0
    const aliquotaINSS = baseCalculo > 0 ? ((holerite.inss / baseCalculo) * 100).toFixed(2) : '0,00'
    linhasTabela.push(['998', 'I.N.S.S.', aliquotaINSS, '', formatCurrency(holerite.inss)])
  }
  
  // IRRF (se houver)
  if (holerite.irrf && holerite.irrf > 0) {
    linhasTabela.push(['999', 'I.R.R.F.', '', '', formatCurrency(holerite.irrf)])
  }
  
  // ADIANTAMENTO SALARIAL
  if (holerite.adiantamento && holerite.adiantamento > 0) {
    linhasTabela.push(['910', 'ADIANTAMENTO SALARIAL', '', '', formatCurrency(holerite.adiantamento)])
  }
  
  // EMPRÉSTIMOS/CONSIGNADOS
  if (holerite.emprestimos && holerite.emprestimos > 0) {
    linhasTabela.push(['911', 'EMPRÉSTIMOS / CONSIGNADOS', '', '', formatCurrency(holerite.emprestimos)])
  }
  
  // FALTAS E ATRASOS
  if (holerite.faltas && holerite.faltas > 0) {
    linhasTabela.push(['903', 'FALTAS', '', '', formatCurrency(holerite.faltas)])
  }
  
  if (holerite.atrasos && holerite.atrasos > 0) {
    linhasTabela.push(['904', 'ATRASOS', '', '', formatCurrency(holerite.atrasos)])
  }
  
  // BENEFÍCIOS (que são descontados do salário)
  if (holerite.plano_saude && holerite.plano_saude > 0) {
    linhasTabela.push(['920', 'PLANO DE SAÚDE', '', '', formatCurrency(holerite.plano_saude)])
  }
  
  if (holerite.plano_odontologico && holerite.plano_odontologico > 0) {
    linhasTabela.push(['921', 'PLANO ODONTOLÓGICO', '', '', formatCurrency(holerite.plano_odontologico)])
  }
  
  if (holerite.seguro_vida && holerite.seguro_vida > 0) {
    linhasTabela.push(['922', 'SEGURO DE VIDA', '', '', formatCurrency(holerite.seguro_vida)])
  }
  
  // VALE TRANSPORTE (se houver desconto)
  if (holerite.vale_transporte && holerite.vale_transporte > 0) {
    linhasTabela.push(['930', 'VALE TRANSPORTE', '', '', formatCurrency(holerite.vale_transporte)])
  }
  
  // VALE REFEIÇÃO (se houver desconto)
  if (holerite.vale_refeicao && holerite.vale_refeicao > 0) {
    linhasTabela.push(['931', 'VALE REFEIÇÃO', '', '', formatCurrency(holerite.vale_refeicao)])
  }
  
  // VALE ALIMENTAÇÃO (se houver desconto)
  if (holerite.vale_alimentacao && holerite.vale_alimentacao > 0) {
    linhasTabela.push(['932', 'VALE ALIMENTAÇÃO', '', '', formatCurrency(holerite.vale_alimentacao)])
  }
  
  // AUXÍLIOS (se houver desconto)
  if (holerite.auxilio_creche && holerite.auxilio_creche > 0) {
    linhasTabela.push(['923', 'AUXÍLIO CRECHE', '', '', formatCurrency(holerite.auxilio_creche)])
  }
  
  if (holerite.auxilio_educacao && holerite.auxilio_educacao > 0) {
    linhasTabela.push(['924', 'AUXÍLIO EDUCAÇÃO', '', '', formatCurrency(holerite.auxilio_educacao)])
  }
  
  if (holerite.auxilio_combustivel && holerite.auxilio_combustivel > 0) {
    linhasTabela.push(['925', 'AUXÍLIO COMBUSTÍVEL', '', '', formatCurrency(holerite.auxilio_combustivel)])
  }
  
  // OUTROS BENEFÍCIOS
  if (holerite.outros_beneficios && holerite.outros_beneficios > 0) {
    linhasTabela.push(['926', 'OUTROS BENEFÍCIOS', '', '', formatCurrency(holerite.outros_beneficios)])
  }
  
  // OUTROS DESCONTOS
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
  
  // USAR OS VALORES JÁ CALCULADOS DO BANCO DE DADOS
  // Isso garante que o PDF mostre exatamente os mesmos valores da visualização
  const totalProventos = holerite.total_proventos || 0
  const totalDescontos = holerite.total_descontos || 0
  const salarioLiquido = holerite.salario_liquido || 0
  
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
  let salarioBaseRodape = holerite.salario_base
  let baseINSS = holerite.total_proventos
  let baseFGTS = holerite.total_proventos
  let baseIRRF = 0
  let faixaIRRF = holerite.irrf || 0
  
  if (holerite.tipo === 'decimo_terceiro') {
    // ✅ REGRAS CORRETAS PARA 13º SALÁRIO
    // Salário Base = valor bruto do 13º (antes dos descontos)
    salarioBaseRodape = holerite.total_proventos
    
    // Base INSS = valor total do 13º (INSS incide sobre valor total)
    baseINSS = holerite.total_proventos
    
    // Base FGTS = valor total do 13º (FGTS calculado sobre valor total)
    baseFGTS = holerite.total_proventos
    
    // Base IRRF = 13º bruto - INSS do 13º (conforme legislação)
    baseIRRF = holerite.total_proventos - (holerite.inss || 0)
  } else {
    // Para salário mensal
    baseIRRF = baseINSS - (holerite.inss || 0)
  }
  
  const fgts = holerite.fgts || (baseFGTS * 0.08)

  autoTable(doc, {
    startY: yPos,
    head: [['Salário Base', 'Sal. Contr. INSS', 'Base Cálc. FGTS', 'F.G.T.S do Mês', 'Base Cálc. IRRF', 'Faixa IRRF']],
    body: [[
      formatCurrency(salarioBaseRodape),
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

export async function downloadHoleritePDFOficial(holerite: HoleriteData, empresa?: EmpresaData) {
  const doc = await gerarHoleritePDFOficial(holerite, empresa)
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
  // Determinar o nome do arquivo baseado no tipo
  let nomeArquivo = ''
  if (holerite.tipo === 'decimo_terceiro') {
    const parcela13 = (holerite as any).parcela_13
    if (parcela13 === '2') {
      nomeArquivo = `13_Salario_2Parcela_${holerite.nome_colaborador.replace(/\s+/g, '_')}_Dezembro_${holerite.ano}.pdf`
    } else if (parcela13 === '1') {
      nomeArquivo = `13_Salario_1Parcela_${holerite.nome_colaborador.replace(/\s+/g, '_')}_Novembro_${holerite.ano}.pdf`
    } else {
      nomeArquivo = `13_Salario_${holerite.nome_colaborador.replace(/\s+/g, '_')}_Dezembro_${holerite.ano}.pdf`
    }
  } else if (holerite.tipo === 'adiantamento') {
    nomeArquivo = `Adiantamento_${holerite.nome_colaborador.replace(/\s+/g, '_')}_${meses[holerite.mes - 1]}_${holerite.ano}.pdf`
  } else {
    nomeArquivo = `Holerite_${holerite.nome_colaborador.replace(/\s+/g, '_')}_${meses[holerite.mes - 1]}_${holerite.ano}.pdf`
  }
  
  doc.save(nomeArquivo)
}


// Aliases para manter compatibilidade com código existente
export const gerarHoleritePDF = gerarHoleritePDFOficial
export const downloadHoleritePDF = downloadHoleritePDFOficial

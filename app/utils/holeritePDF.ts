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
  salario_base: number
  horas_trabalhadas?: number
  horas_extras_50?: number
  horas_extras_100?: number
  valor_horas_extras_50?: number
  valor_horas_extras_100?: number
  adicional_noturno?: number
  adicional_insalubridade?: number
  adicional_periculosidade?: number
  outros_proventos?: number
  descricao_outros_proventos?: string
  total_proventos: number
  inss?: number
  irrf?: number
  vale_transporte?: number
  vale_refeicao?: number
  plano_saude?: number
  faltas?: number
  atrasos?: number
  outros_descontos?: number
  descricao_outros_descontos?: string
  total_descontos: number
  salario_bruto: number
  salario_liquido: number
  fgts?: number
  banco?: string
  agencia?: string
  conta?: string
  data_pagamento?: string
}

interface EmpresaData {
  nome: string
  cnpj: string
  endereco?: string
  cidade?: string
  estado?: string
}

export function gerarHoleritePDF(holerite: HoleriteData, empresa?: EmpresaData) {
  const doc = new jsPDF()
  
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return ''
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  let yPos = 20

  // Cabeçalho da Empresa
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(empresa?.nome || 'EMPRESA', 105, yPos, { align: 'center' })
  
  yPos += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (empresa?.cnpj) {
    doc.text(`CNPJ: ${formatCNPJ(empresa.cnpj)}`, 105, yPos, { align: 'center' })
    yPos += 5
  }
  if (empresa?.endereco) {
    doc.text(empresa.endereco, 105, yPos, { align: 'center' })
    yPos += 5
  }
  if (empresa?.cidade && empresa?.estado) {
    doc.text(`${empresa.cidade} - ${empresa.estado}`, 105, yPos, { align: 'center' })
    yPos += 5
  }

  yPos += 5
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 190, yPos)
  yPos += 10

  // Título
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE PAGAMENTO DE SALÁRIO', 105, yPos, { align: 'center' })
  yPos += 10

  // Período
  doc.setFontSize(11)
  doc.text(`Referência: ${meses[holerite.mes - 1]}/${holerite.ano}`, 105, yPos, { align: 'center' })
  yPos += 10

  // Dados do Funcionário
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DO FUNCIONÁRIO', 20, yPos)
  yPos += 7

  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${holerite.nome_colaborador}`, 20, yPos)
  yPos += 5
  doc.text(`CPF: ${formatCPF(holerite.cpf)}`, 20, yPos)
  yPos += 5
  if (holerite.cargo) {
    doc.text(`Cargo: ${holerite.cargo}`, 20, yPos)
    yPos += 5
  }
  if (holerite.departamento) {
    doc.text(`Departamento: ${holerite.departamento}`, 20, yPos)
    yPos += 5
  }

  yPos += 5

  // Tabela de Proventos e Descontos
  const proventos: any[] = []
  const descontos: any[] = []

  // Proventos
  if (holerite.salario_base > 0) {
    proventos.push(['Salário Base', formatCurrency(holerite.salario_base)])
  }
  if (holerite.valor_horas_extras_50 && holerite.valor_horas_extras_50 > 0) {
    proventos.push([`Horas Extras 50% (${holerite.horas_extras_50 || 0}h)`, formatCurrency(holerite.valor_horas_extras_50)])
  }
  if (holerite.valor_horas_extras_100 && holerite.valor_horas_extras_100 > 0) {
    proventos.push([`Horas Extras 100% (${holerite.horas_extras_100 || 0}h)`, formatCurrency(holerite.valor_horas_extras_100)])
  }
  if (holerite.adicional_noturno && holerite.adicional_noturno > 0) {
    proventos.push(['Adicional Noturno', formatCurrency(holerite.adicional_noturno)])
  }
  if (holerite.adicional_insalubridade && holerite.adicional_insalubridade > 0) {
    proventos.push(['Adicional Insalubridade', formatCurrency(holerite.adicional_insalubridade)])
  }
  if (holerite.adicional_periculosidade && holerite.adicional_periculosidade > 0) {
    proventos.push(['Adicional Periculosidade', formatCurrency(holerite.adicional_periculosidade)])
  }
  if (holerite.outros_proventos && holerite.outros_proventos > 0) {
    proventos.push([holerite.descricao_outros_proventos || 'Outros Proventos', formatCurrency(holerite.outros_proventos)])
  }

  // Descontos
  if (holerite.inss && holerite.inss > 0) {
    descontos.push(['INSS', formatCurrency(holerite.inss)])
  }
  if (holerite.irrf && holerite.irrf > 0) {
    descontos.push(['IRRF', formatCurrency(holerite.irrf)])
  }
  if (holerite.vale_transporte && holerite.vale_transporte > 0) {
    descontos.push(['Vale Transporte', formatCurrency(holerite.vale_transporte)])
  }
  if (holerite.vale_refeicao && holerite.vale_refeicao > 0) {
    descontos.push(['Vale Refeição', formatCurrency(holerite.vale_refeicao)])
  }
  if (holerite.plano_saude && holerite.plano_saude > 0) {
    descontos.push(['Plano de Saúde', formatCurrency(holerite.plano_saude)])
  }
  if (holerite.faltas && holerite.faltas > 0) {
    descontos.push(['Faltas', formatCurrency(holerite.faltas)])
  }
  if (holerite.atrasos && holerite.atrasos > 0) {
    descontos.push(['Atrasos', formatCurrency(holerite.atrasos)])
  }
  if (holerite.outros_descontos && holerite.outros_descontos > 0) {
    descontos.push([holerite.descricao_outros_descontos || 'Outros Descontos', formatCurrency(holerite.outros_descontos)])
  }

  // Tabela lado a lado
  autoTable(doc, {
    startY: yPos,
    head: [['PROVENTOS', 'VALOR']],
    body: proventos.length > 0 ? proventos : [['Nenhum provento', '-']],
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 20, right: 105 },
  })

  autoTable(doc, {
    startY: yPos,
    head: [['DESCONTOS', 'VALOR']],
    body: descontos.length > 0 ? descontos : [['Nenhum desconto', '-']],
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 110, right: 20 },
  })

  // Pegar a posição Y final das tabelas
  const finalY = Math.max(
    (doc as any).lastAutoTable.finalY || yPos + 40
  )

  yPos = finalY + 10

  // Totais
  autoTable(doc, {
    startY: yPos,
    body: [
      ['Total de Proventos', formatCurrency(holerite.total_proventos)],
      ['Total de Descontos', formatCurrency(holerite.total_descontos)],
      ['SALÁRIO LÍQUIDO', formatCurrency(holerite.salario_liquido)],
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 140, fontStyle: 'bold', halign: 'right' },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [34, 197, 94]
        data.cell.styles.textColor = 255
        data.cell.styles.fontSize = 12
      }
    }
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // Informações Adicionais
  if (holerite.fgts && holerite.fgts > 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`FGTS (8% - depositado pela empresa): ${formatCurrency(holerite.fgts)}`, 20, yPos)
    yPos += 5
  }

  // Dados Bancários
  if (holerite.banco || holerite.agencia || holerite.conta) {
    yPos += 5
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS BANCÁRIOS', 20, yPos)
    yPos += 6
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    if (holerite.banco) {
      doc.text(`Banco: ${holerite.banco}`, 20, yPos)
      yPos += 5
    }
    if (holerite.agencia) {
      doc.text(`Agência: ${holerite.agencia}`, 20, yPos)
      yPos += 5
    }
    if (holerite.conta) {
      doc.text(`Conta: ${holerite.conta}`, 20, yPos)
      yPos += 5
    }
  }

  // Rodapé
  yPos = 270
  doc.setLineWidth(0.3)
  doc.line(20, yPos, 190, yPos)
  yPos += 5
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Este documento é um comprovante de pagamento de salário.', 105, yPos, { align: 'center' })
  yPos += 4
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, yPos, { align: 'center' })

  return doc
}

export function downloadHoleritePDF(holerite: HoleriteData, empresa?: EmpresaData) {
  const doc = gerarHoleritePDF(holerite, empresa)
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const nomeArquivo = `Holerite_${holerite.nome_colaborador.replace(/\s+/g, '_')}_${meses[holerite.mes - 1]}_${holerite.ano}.pdf`
  doc.save(nomeArquivo)
}

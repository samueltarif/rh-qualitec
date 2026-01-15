// ========================================
// TESTE OFICIAL DE CÁLCULO DE IRRF - 2026
// ========================================

console.log('🧪 INICIANDO TESTES DE CÁLCULO DE IRRF 2026\n')

// Função de cálculo de INSS (progressivo)
function calcularINSS(salarioBruto) {
  let inss = 0
  
  if (salarioBruto <= 1412.00) {
    inss = salarioBruto * 0.075
  } else if (salarioBruto <= 2666.68) {
    inss = 1412.00 * 0.075
    inss += (salarioBruto - 1412.00) * 0.09
  } else if (salarioBruto <= 4000.03) {
    inss = 1412.00 * 0.075
    inss += (2666.68 - 1412.00) * 0.09
    inss += (salarioBruto - 2666.68) * 0.12
  } else {
    inss = 1412.00 * 0.075
    inss += (2666.68 - 1412.00) * 0.09
    inss += (4000.03 - 2666.68) * 0.12
    inss += (salarioBruto - 4000.03) * 0.14
    
    // Teto máximo
    if (inss > 908.85) {
      inss = 908.85
    }
  }
  
  return Math.round(inss * 100) / 100
}

// Função de cálculo de IRRF 2026 (OFICIAL)
function calcularIRRF2026(salarioBruto, numeroDependentes = 0) {
  // 1. Calcular INSS
  const inss = calcularINSS(salarioBruto)
  
  // 2. Deduzir dependentes
  const deducaoDependentes = numeroDependentes * 189.59
  
  // 3. Calcular base IRRF
  const baseIRRF = salarioBruto - inss - deducaoDependentes
  
  let irrf = 0
  let faixa = ''
  
  // REGRA 1: ISENÇÃO REAL até R$ 2.428,80 (Receita Federal 2026)
  if (baseIRRF <= 2428.80) {
    irrf = 0
    faixa = 'Isento (até R$ 2.428,80)'
  }
  // REGRA 2: FAIXA DE TRANSIÇÃO COM REDUTOR (R$ 2.428,81 a R$ 7.350,00)
  // Aplicar redutor progressivo baseado na distância da isenção real
  // Fórmula: f = (base - 2.428,80) / (7.350 - 2.428,80)
  // IR_final = IR_tabela × f
  else if (baseIRRF <= 7350.00) {
    // Calcular IR pela tabela progressiva normal
    let irrfTabela = 0
    
    if (baseIRRF <= 2259.20) {
      irrfTabela = 0
    } else if (baseIRRF <= 2826.65) {
      irrfTabela = (baseIRRF * 0.075) - 169.44
    } else if (baseIRRF <= 3751.05) {
      irrfTabela = (baseIRRF * 0.15) - 381.44
    } else if (baseIRRF <= 4664.68) {
      irrfTabela = (baseIRRF * 0.225) - 662.77
    } else {
      irrfTabela = (baseIRRF * 0.275) - 896.00
    }
    
    // Aplicar redutor progressivo baseado na isenção real
    const fatorReducao = (baseIRRF - 2428.80) / (7350.00 - 2428.80)
    irrf = irrfTabela * fatorReducao
    faixa = 'Transição c/ Redutor'
  }
  // REGRA 3: ACIMA DE R$ 7.350,00 - Tabela Normal
  else {
    if (baseIRRF <= 2259.20) {
      irrf = 0
      faixa = 'Isento'
    } else if (baseIRRF <= 2826.65) {
      irrf = (baseIRRF * 0.075) - 169.44
      faixa = '7,5%'
    } else if (baseIRRF <= 3751.05) {
      irrf = (baseIRRF * 0.15) - 381.44
      faixa = '15%'
    } else if (baseIRRF <= 4664.68) {
      irrf = (baseIRRF * 0.225) - 662.77
      faixa = '22,5%'
    } else {
      irrf = (baseIRRF * 0.275) - 896.00
      faixa = '27,5%'
    }
  }
  
  irrf = Math.max(0, Math.round(irrf * 100) / 100)
  
  return {
    salarioBruto,
    inss,
    deducaoDependentes,
    baseIRRF,
    irrf,
    faixa,
    salarioLiquido: salarioBruto - inss - irrf
  }
}

// ========================================
// CASOS DE TESTE OBRIGATÓRIOS
// ========================================

const testes = [
  { nome: 'TESTE 1 - Não mais isento (correção)', bruto: 4500, dependentes: 0, irrfEsperadoMin: 80, irrfEsperadoMax: 85 },
  { nome: 'TESTE 2 - Acima da isenção real', bruto: 5000, dependentes: 0, irrfEsperadoMin: 140, irrfEsperadoMax: 150 },
  { nome: 'TESTE 3 - Início da transição', bruto: 5500, dependentes: 0, irrfEsperadoMin: 225, irrfEsperadoMax: 235 },
  { nome: 'TESTE 4 - Meio da transição', bruto: 6200, dependentes: 0, irrfEsperadoMin: 385, irrfEsperadoMax: 395 },
  { nome: 'TESTE 5 - Transição avançada', bruto: 7000, dependentes: 0, irrfEsperadoMin: 615, irrfEsperadoMax: 625 },
  { nome: 'TESTE 6 - Limite da transição', bruto: 7350, dependentes: 0, irrfEsperadoMin: 735, irrfEsperadoMax: 745 },
  { nome: 'TESTE 7 - Caso REAL (CRÍTICO)', bruto: 8000, dependentes: 0, irrfEsperadoMin: 995, irrfEsperadoMax: 1005 },
  { nome: 'TESTE 8 - Acima da regra', bruto: 9000, dependentes: 0, irrfEsperadoMin: 1320, irrfEsperadoMax: 1335 },
  { nome: 'TESTE 9 - Com dependentes', bruto: 6200, dependentes: 2, irrfEsperadoMin: 280, irrfEsperadoMax: 290 },
]

let testesPassaram = 0
let testesFalharam = 0

console.log('═'.repeat(100))
console.log('EXECUTANDO TESTES')
console.log('═'.repeat(100))

testes.forEach((teste, index) => {
  console.log(`\n${teste.nome}`)
  console.log('─'.repeat(100))
  
  const resultado = calcularIRRF2026(teste.bruto, teste.dependentes)
  
  console.log(`💰 Salário Bruto: R$ ${resultado.salarioBruto.toFixed(2)}`)
  console.log(`📉 INSS: R$ ${resultado.inss.toFixed(2)}`)
  console.log(`👨‍👩‍👧‍👦 Dependentes: ${teste.dependentes} (Dedução: R$ ${resultado.deducaoDependentes.toFixed(2)})`)
  console.log(`📊 Base IRRF: R$ ${resultado.baseIRRF.toFixed(2)}`)
  console.log(`🎯 IRRF Calculado: R$ ${resultado.irrf.toFixed(2)}`)
  console.log(`📋 Faixa: ${resultado.faixa}`)
  console.log(`💵 Salário Líquido: R$ ${resultado.salarioLiquido.toFixed(2)}`)
  
  // Validar resultado
  let passou = false
  
  if (teste.irrfEsperado !== undefined) {
    passou = resultado.irrf === teste.irrfEsperado
    console.log(`\n✓ Esperado: R$ ${teste.irrfEsperado.toFixed(2)}`)
  } else if (teste.irrfEsperadoMin !== undefined && teste.irrfEsperadoMax !== undefined) {
    passou = resultado.irrf >= teste.irrfEsperadoMin && resultado.irrf <= teste.irrfEsperadoMax
    console.log(`\n✓ Esperado: R$ ${teste.irrfEsperadoMin.toFixed(2)} a R$ ${teste.irrfEsperadoMax.toFixed(2)}`)
  }
  
  if (passou) {
    console.log('✅ TESTE PASSOU')
    testesPassaram++
  } else {
    console.log('❌ TESTE FALHOU')
    testesFalharam++
  }
})

console.log('\n' + '═'.repeat(100))
console.log('RESULTADO FINAL')
console.log('═'.repeat(100))
console.log(`✅ Testes que passaram: ${testesPassaram}/${testes.length}`)
console.log(`❌ Testes que falharam: ${testesFalharam}/${testes.length}`)

if (testesFalharam === 0) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM! CÁLCULO DE IRRF 2026 ESTÁ CORRETO!')
} else {
  console.log('\n⚠️ ALGUNS TESTES FALHARAM. REVISAR CÁLCULO.')
}

console.log('═'.repeat(100))

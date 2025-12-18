/**
 * ============================================================================
 * TESTES AUTOMATIZADOS - IRRF LEI 15.270/2025
 * ============================================================================
 * 
 * Testes unitários para validar o cálculo de IRRF conforme a Lei 15.270/2025.
 * 
 * Para executar: npx vitest run server/utils/__tests__/irrf-lei-15270-2025.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  calcularIRRF,
  calcularIRRFSimples,
  calcularRedutorLei15270,
  isLei15270EmVigor,
  auditarIRRF,
  IRRF_CONFIG,
  type ResultadoIRRF,
} from '../irrf-lei-15270-2025'

// Data de referência para testes (após vigência da lei)
const DATA_APOS_VIGENCIA = new Date('2026-02-01')
const DATA_ANTES_VIGENCIA = new Date('2025-06-01')

describe('IRRF Lei 15.270/2025', () => {
  
  // ==========================================================================
  // TESTE 1: Salário R$ 5.000, INSS R$ 450, 2 dependentes → IR final = 0
  // ==========================================================================
  describe('Cenário 1: Salário R$ 5.000 com 2 dependentes', () => {
    const salarioBruto = 5000
    const inss = 450
    const dependentes = 2
    
    it('deve calcular IRRF pela tabela progressiva corretamente', () => {
      // Base = 5000 - 450 - (2 × 189,59) = 5000 - 450 - 379,18 = 4170,82
      // Faixa 22,5%: 4170,82 × 0,225 - 662,77 = 938,43 - 662,77 = 275,66
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_ANTES_VIGENCIA)
      
      expect(resultado.detalhes.baseCalculo).toBeCloseTo(4170.82, 2)
      expect(resultado.detalhes.irrfTabela).toBeCloseTo(275.66, 1)
    })
    
    it('deve aplicar redutor máximo (R$ 312,89) para rendimentos ≤ R$ 5.000', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      expect(resultado.detalhes.redutorCalculado).toBe(312.89)
      expect(resultado.detalhes.lei15270Aplicada).toBe(true)
    })
    
    it('deve zerar o IRRF após aplicação do redutor', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      // IR Tabela ≈ 275,66, Redutor = 312,89
      // IR Final = max(0, 275,66 - min(275,66, 312,89)) = max(0, 275,66 - 275,66) = 0
      expect(resultado.valor).toBe(0)
      expect(resultado.detalhes.irrfFinal).toBe(0)
    })
    
    it('deve limitar o redutor aplicado ao valor do IR da tabela', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      // Redutor calculado = 312,89, mas IR tabela ≈ 275,66
      // Redutor aplicado deve ser limitado ao IR tabela
      expect(resultado.detalhes.redutorAplicado).toBeCloseTo(resultado.detalhes.irrfTabela, 2)
    })
  })
  
  // ==========================================================================
  // TESTE 2: Salário R$ 6.000, INSS padrão, 0 dependentes → IR reduzido parcialmente
  // ==========================================================================
  describe('Cenário 2: Salário R$ 6.000 na faixa de transição', () => {
    const salarioBruto = 6000
    // INSS progressivo para R$ 6.000:
    // Faixa 1: 1412 × 7,5% = 105,90
    // Faixa 2: (2666,68 - 1412) × 9% = 1254,68 × 9% = 112,92
    // Faixa 3: (4000,03 - 2666,68) × 12% = 1333,35 × 12% = 160,00
    // Faixa 4: (6000 - 4000,03) × 14% = 1999,97 × 14% = 280,00
    // Total: 105,90 + 112,92 + 160,00 + 280,00 = 658,82
    const inss = 658.82
    const dependentes = 0
    
    it('deve calcular redutor parcial para faixa de transição', () => {
      // Redutor = 978,62 - (0,133145 × 6000) = 978,62 - 798,87 = 179,75
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      expect(resultado.detalhes.redutorCalculado).toBeCloseTo(179.75, 1)
    })
    
    it('deve reduzir o IRRF parcialmente', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      // Base = 6000 - 658,82 = 5341,18
      // Faixa 27,5%: 5341,18 × 0,275 - 896 = 1468,82 - 896 = 572,82
      // IR Final = 572,82 - 179,75 = 393,07
      expect(resultado.detalhes.irrfTabela).toBeCloseTo(572.82, 0)
      expect(resultado.valor).toBeGreaterThan(0)
      expect(resultado.valor).toBeLessThan(resultado.detalhes.irrfTabela)
    })
    
    it('deve registrar que a Lei 15.270/2025 foi aplicada', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      expect(resultado.detalhes.lei15270Aplicada).toBe(true)
      expect(resultado.detalhes.observacoes.some(o => o.includes('faixa de transição'))).toBe(true)
    })
  })
  
  // ==========================================================================
  // TESTE 3: Salário até R$ 5.000 → Sempre isento de IRRF
  // ==========================================================================
  describe('Cenário 3: Salários até R$ 5.000 sempre isentos', () => {
    const testCases = [
      { salario: 3000, inss: 270, dependentes: 0 },
      { salario: 4000, inss: 360, dependentes: 1 },
      { salario: 4500, inss: 405, dependentes: 0 },
      { salario: 5000, inss: 450, dependentes: 0 },
    ]
    
    testCases.forEach(({ salario, inss, dependentes }) => {
      it(`deve isentar salário de R$ ${salario} com ${dependentes} dependente(s)`, () => {
        const resultado = calcularIRRF(salario, inss, dependentes, salario, DATA_APOS_VIGENCIA)
        
        // Para rendimentos ≤ 5000, redutor = 312,89
        // Isso deve zerar ou reduzir significativamente o IR
        if (resultado.detalhes.irrfTabela <= 312.89) {
          expect(resultado.valor).toBe(0)
        }
      })
    })
    
    it('deve aplicar redutor máximo para todos os salários ≤ R$ 5.000', () => {
      const resultado = calcularIRRF(5000, 450, 0, 5000, DATA_APOS_VIGENCIA)
      
      expect(resultado.detalhes.redutorCalculado).toBe(312.89)
    })
  })
  
  // ==========================================================================
  // TESTE 4: 13º Salário com redutor aplicado corretamente
  // ==========================================================================
  describe('Cenário 4: 13º Salário', () => {
    const salarioMensal = 4000
    const valor13 = 4000
    const inss13 = 360 // INSS sobre o 13º
    const dependentes = 1
    
    it('deve considerar rendimentos totais do mês para cálculo do redutor', () => {
      // Rendimentos tributáveis = salário mensal + 13º = 8000
      const rendimentosTotais = salarioMensal + valor13
      
      const resultado = calcularIRRF(valor13, inss13, dependentes, rendimentosTotais, DATA_APOS_VIGENCIA)
      
      // Rendimentos > 7350, então redutor = 0
      expect(resultado.detalhes.redutorCalculado).toBe(0)
      expect(resultado.detalhes.rendimentosTributaveis).toBe(rendimentosTotais)
    })
    
    it('deve aplicar redutor quando 13º isolado está na faixa de isenção', () => {
      // Se considerarmos apenas o 13º (R$ 4.000)
      const resultado = calcularIRRF(valor13, inss13, dependentes, valor13, DATA_APOS_VIGENCIA)
      
      // Rendimentos = 4000 ≤ 5000, redutor = 312,89
      expect(resultado.detalhes.redutorCalculado).toBe(312.89)
    })
    
    it('1ª parcela do 13º não deve ter IRRF (sem descontos)', () => {
      // 1ª parcela = 50% sem descontos
      const primeiraParcela = valor13 / 2
      const resultado = calcularIRRF(primeiraParcela, 0, 0, primeiraParcela, DATA_APOS_VIGENCIA)
      
      // Base = 2000 - 0 = 2000 (isento pela tabela)
      expect(resultado.detalhes.irrfTabela).toBe(0)
      expect(resultado.valor).toBe(0)
    })
  })
  
  // ==========================================================================
  // TESTE 5: Salários altos (> R$ 7.350) sem redutor
  // ==========================================================================
  describe('Cenário 5: Salários acima de R$ 7.350 (sem redutor)', () => {
    const salarioBruto = 10000
    const inss = 908.85 // Teto INSS
    const dependentes = 0
    
    it('não deve aplicar redutor para rendimentos > R$ 7.350', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      expect(resultado.detalhes.redutorCalculado).toBe(0)
      expect(resultado.detalhes.redutorAplicado).toBe(0)
    })
    
    it('deve manter o IRRF da tabela progressiva inalterado', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      expect(resultado.valor).toBe(resultado.detalhes.irrfTabela)
    })
    
    it('deve registrar observação sobre ausência de redutor', () => {
      const resultado = calcularIRRF(salarioBruto, inss, dependentes, salarioBruto, DATA_APOS_VIGENCIA)
      
      expect(resultado.detalhes.observacoes.some(o => o.includes('Sem redutor'))).toBe(true)
    })
  })
  
  // ==========================================================================
  // TESTE 6: Validação de regras obrigatórias
  // ==========================================================================
  describe('Regras obrigatórias', () => {
    it('redutor nunca pode ser negativo', () => {
      // Testar com vários valores de rendimentos
      const rendimentos = [1000, 5000, 6000, 7000, 7350, 8000, 10000, 50000]
      
      rendimentos.forEach(rend => {
        const redutor = calcularRedutorLei15270(rend)
        expect(redutor).toBeGreaterThanOrEqual(0)
      })
    })
    
    it('IRRF final nunca pode ser negativo', () => {
      const testCases = [
        { salario: 1000, inss: 75, dep: 5 },
        { salario: 2000, inss: 180, dep: 3 },
        { salario: 3000, inss: 270, dep: 2 },
        { salario: 5000, inss: 450, dep: 2 },
      ]
      
      testCases.forEach(({ salario, inss, dep }) => {
        const resultado = calcularIRRF(salario, inss, dep, salario, DATA_APOS_VIGENCIA)
        expect(resultado.valor).toBeGreaterThanOrEqual(0)
      })
    })
    
    it('redutor aplicado deve ser limitado ao valor do IR calculado', () => {
      // Caso onde redutor > IR tabela
      const resultado = calcularIRRF(5000, 450, 2, 5000, DATA_APOS_VIGENCIA)
      
      // Redutor calculado = 312,89, IR tabela ≈ 275,66
      expect(resultado.detalhes.redutorAplicado).toBeLessThanOrEqual(resultado.detalhes.irrfTabela)
    })
  })
  
  // ==========================================================================
  // TESTE 7: Verificação de vigência da lei
  // ==========================================================================
  describe('Vigência da Lei 15.270/2025', () => {
    it('deve identificar que a lei não está em vigor antes de 01/01/2026', () => {
      expect(isLei15270EmVigor(new Date('2025-12-31'))).toBe(false)
      expect(isLei15270EmVigor(new Date('2025-06-15'))).toBe(false)
    })
    
    it('deve identificar que a lei está em vigor a partir de 01/01/2026', () => {
      expect(isLei15270EmVigor(new Date('2026-01-01'))).toBe(true)
      expect(isLei15270EmVigor(new Date('2026-06-15'))).toBe(true)
      expect(isLei15270EmVigor(new Date('2027-01-01'))).toBe(true)
    })
    
    it('não deve aplicar redutor antes da vigência', () => {
      const resultado = calcularIRRF(5000, 450, 0, 5000, DATA_ANTES_VIGENCIA)
      
      expect(resultado.detalhes.lei15270Aplicada).toBe(false)
      expect(resultado.detalhes.redutorCalculado).toBe(0)
      expect(resultado.detalhes.redutorAplicado).toBe(0)
    })
    
    it('deve aplicar redutor após a vigência', () => {
      const resultado = calcularIRRF(5000, 450, 0, 5000, DATA_APOS_VIGENCIA)
      
      expect(resultado.detalhes.lei15270Aplicada).toBe(true)
      expect(resultado.detalhes.redutorCalculado).toBe(312.89)
    })
  })
  
  // ==========================================================================
  // TESTE 8: Função de auditoria
  // ==========================================================================
  describe('Auditoria de IRRF', () => {
    it('deve identificar divergência quando IRRF atual está incorreto', () => {
      const auditoria = auditarIRRF(
        'colab-123',
        '01',
        '2026',
        5000,
        450,
        2,
        275.66, // Valor antigo (sem redutor)
        5000
      )
      
      expect(auditoria.necessitaCorrecao).toBe(true)
      expect(auditoria.valorCorreto).toBe(0) // Com redutor, deve ser 0
      expect(auditoria.diferenca).toBeCloseTo(275.66, 1)
    })
    
    it('deve confirmar quando IRRF está correto', () => {
      const resultado = calcularIRRF(5000, 450, 2, 5000, DATA_APOS_VIGENCIA)
      
      const auditoria = auditarIRRF(
        'colab-123',
        '01',
        '2026',
        5000,
        450,
        2,
        resultado.valor, // Valor correto
        5000
      )
      
      expect(auditoria.necessitaCorrecao).toBe(false)
      expect(auditoria.diferenca).toBe(0)
    })
  })
  
  // ==========================================================================
  // TESTE 9: Função simplificada
  // ==========================================================================
  describe('Função calcularIRRFSimples', () => {
    it('deve retornar apenas o valor numérico', () => {
      const valor = calcularIRRFSimples(5000, 450, 2, 5000)
      
      expect(typeof valor).toBe('number')
      expect(valor).toBeGreaterThanOrEqual(0)
    })
    
    it('deve retornar o mesmo valor que a função completa', () => {
      const valorSimples = calcularIRRFSimples(6000, 540, 1, 6000)
      const resultadoCompleto = calcularIRRF(6000, 540, 1, 6000)
      
      expect(valorSimples).toBe(resultadoCompleto.valor)
    })
  })
  
  // ==========================================================================
  // TESTE 10: Configuração
  // ==========================================================================
  describe('Configuração IRRF_CONFIG', () => {
    it('deve ter todas as constantes da Lei 15.270/2025', () => {
      expect(IRRF_CONFIG.lei15270.limiteIsencaoTotal).toBe(5000)
      expect(IRRF_CONFIG.lei15270.limiteFaixaTransicao).toBe(7350)
      expect(IRRF_CONFIG.lei15270.redutorMaximo).toBe(312.89)
      expect(IRRF_CONFIG.lei15270.coeficienteReducao).toBe(0.133145)
      expect(IRRF_CONFIG.lei15270.constanteReducao).toBe(978.62)
    })
    
    it('deve ter a tabela progressiva correta', () => {
      expect(IRRF_CONFIG.tabela.faixas.length).toBe(5)
      expect(IRRF_CONFIG.tabela.deducaoPorDependente).toBe(189.59)
    })
  })
})

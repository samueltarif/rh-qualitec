import { test, expect } from '@playwright/test'

/**
 * Teste de exemplo - Sistema RH Qualitec
 * Este arquivo será substituído pelos testes reais
 */

test.describe('Exemplo - Verificação Básica', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Qualitec/i)
  })

  test('deve ter um link para login', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se existe link/botão de login
    const loginLink = page.getByRole('link', { name: /login/i })
    await expect(loginLink).toBeVisible()
  })
})

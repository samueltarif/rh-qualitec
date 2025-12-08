import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para testes E2E
 * Sistema RH Qualitec
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout para cada teste
  timeout: 30 * 1000,
  
  // Configuração de expect
  expect: {
    timeout: 5000
  },
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Falhar build se houver testes com .only
  forbidOnly: !!process.env.CI,
  
  // Retry em caso de falha
  retries: process.env.CI ? 2 : 0,
  
  // Workers (paralelo)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: 'html',
  
  // Configurações compartilhadas
  use: {
    // URL base da aplicação
    baseURL: 'http://localhost:3000',
    
    // Trace em caso de falha
    trace: 'on-first-retry',
    
    // Screenshot em caso de falha
    screenshot: 'only-on-failure',
    
    // Video em caso de falha
    video: 'retain-on-failure',
  },

  // Projetos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Testes mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})

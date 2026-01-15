<template>
  <div>
    <UiPageHeader title="Configurações da Empresa" description="Configure as informações da empresa e do sistema" />

    <!-- Dados da Empresa -->
    <UiCard title="🏢 Dados da Empresa" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <UiInput v-model="empresa.nome" label="Nome da Empresa" required />
        </div>
        <UiInput v-model="empresa.cnpj" label="CNPJ" required placeholder="00.000.000/0000-00" />
        <UiInput v-model="empresa.emailHolerites" type="email" label="Email para Envio de Holerites" placeholder="rh@empresa.com" />
        <div class="md:col-span-2">
          <UiInput v-model="empresa.endereco" label="Endereço" />
        </div>
        <UiInput v-model="empresa.telefone" label="Telefone" />
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Logo da Empresa</label>
          <div class="flex items-center gap-4">
            <UiAvatar name="RH" size="lg" />
            <UiButton variant="ghost">📷 Alterar Logo</UiButton>
          </div>
        </div>
      </div>
      <div class="mt-6 flex justify-end">
        <UiButton icon="💾" @click="salvarEmpresa">Salvar Dados da Empresa</UiButton>
      </div>
    </UiCard>

    <!-- Configurações do Holerite -->
    <UiCard title="📄 Informações no Holerite" class="mb-6">
      <div class="space-y-4">
        <UiCheckbox v-model="configHolerite.mostrarLogo" label="Mostrar logo da empresa no holerite" />
        <UiCheckbox v-model="configHolerite.mostrarEndereco" label="Mostrar endereço da empresa" />
        <UiCheckbox v-model="configHolerite.mostrarCNPJ" label="Mostrar CNPJ da empresa" />
        <UiCheckbox v-model="configHolerite.mostrarDetalhesINSS" label="Mostrar detalhamento do cálculo de INSS" />
        <UiCheckbox v-model="configHolerite.mostrarDetalhesIRRF" label="Mostrar detalhamento do cálculo de IRRF" />
      </div>
    </UiCard>

    <!-- Tabelas de INSS e IRRF -->
    <UiCard title="📊 Tabelas de INSS e IRRF (2026)">
      <template #header>
        <UiBadge variant="success">✓ Atualizadas</UiBadge>
      </template>

      <UiAlert variant="info" class="mb-6">
        As tabelas de INSS e IRRF são atualizadas anualmente pelo governo. 
        O sistema permite atualização fácil sem necessidade de alteração no código.
      </UiAlert>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tabela INSS -->
        <div>
          <h3 class="text-lg font-bold text-gray-800 mb-4">INSS - Tabela Progressiva</h3>
          <div class="border rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">Faixa Salarial</th>
                  <th class="px-4 py-3 text-right font-semibold text-gray-600">Alíquota</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="faixa in tabelaINSS" :key="faixa.id">
                  <td class="px-4 py-3">{{ faixa.faixa }}</td>
                  <td class="px-4 py-3 text-right font-semibold">{{ faixa.aliquota }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela IRRF -->
        <div>
          <h3 class="text-lg font-bold text-gray-800 mb-4">IRRF - Tabela Progressiva</h3>
          <div class="border rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">Base de Cálculo</th>
                  <th class="px-4 py-3 text-right font-semibold text-gray-600">Alíquota</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="faixa in tabelaIRRF" :key="faixa.id">
                  <td class="px-4 py-3">{{ faixa.faixa }}</td>
                  <td class="px-4 py-3 text-right font-semibold">{{ faixa.aliquota }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <UiButton variant="ghost">✏️ Atualizar Tabelas</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const empresa = ref({
  nome: 'Empresa Exemplo LTDA',
  cnpj: '12.345.678/0001-90',
  emailHolerites: 'rh@empresa.com',
  endereco: 'Rua Exemplo, 123 - São Paulo/SP',
  telefone: '(11) 3333-4444'
})

const configHolerite = ref({
  mostrarLogo: true,
  mostrarEndereco: true,
  mostrarCNPJ: true,
  mostrarDetalhesINSS: false,
  mostrarDetalhesIRRF: false
})

const tabelaINSS = [
  { id: 1, faixa: 'Até R$ 1.518,00', aliquota: 7.5 },
  { id: 2, faixa: 'R$ 1.518,01 a R$ 2.793,88', aliquota: 9 },
  { id: 3, faixa: 'R$ 2.793,89 a R$ 4.190,83', aliquota: 12 },
  { id: 4, faixa: 'R$ 4.190,84 a R$ 8.157,41', aliquota: 14 },
]

const tabelaIRRF = [
  { id: 1, faixa: 'Até R$ 2.259,20', aliquota: 'Isento' },
  { id: 2, faixa: 'R$ 2.259,21 a R$ 2.826,65', aliquota: '7,5%' },
  { id: 3, faixa: 'R$ 2.826,66 a R$ 3.751,05', aliquota: '15%' },
  { id: 4, faixa: 'R$ 3.751,06 a R$ 4.664,68', aliquota: '22,5%' },
  { id: 5, faixa: 'Acima de R$ 4.664,68', aliquota: '27,5%' },
]

const salvarEmpresa = () => alert('Dados da empresa salvos com sucesso!')
</script>

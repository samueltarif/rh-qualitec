/**
 * Composable para gerenciar configurações do sistema
 */

export interface ConfigSection {
  id: string
  title: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'indigo' | 'cyan' | 'pink' | 'emerald' | 'orange' | 'slate' | 'teal'
}

export const useConfiguracoes = () => {
  const sections: ConfigSection[] = [
    {
      id: 'empresa',
      title: 'Dados da Empresa',
      description: 'Razão social, CNPJ, endereço, contatos',
      icon: 'heroicons:building-office-2',
      color: 'blue',
    },
    {
      id: 'folha',
      title: 'Parâmetros de Folha',
      description: 'Alíquotas, benefícios, descontos padrão',
      icon: 'heroicons:calculator',
      color: 'green',
    },
    {
      id: 'jornadas',
      title: 'Jornadas de Trabalho',
      description: 'Horários, escalas, turnos',
      icon: 'heroicons:clock',
      color: 'purple',
    },
    {
      id: 'documentos',
      title: 'Tipos de Documentos',
      description: 'Categorias de documentos RH',
      icon: 'heroicons:document-text',
      color: 'amber',
    },
    {
      id: 'notificacoes',
      title: 'Notificações e Alertas',
      description: 'Configurar avisos automáticos',
      icon: 'heroicons:bell',
      color: 'red',
    },
    {
      id: 'seguranca',
      title: 'Backup e Segurança',
      description: 'Backups automáticos, logs de acesso',
      icon: 'heroicons:shield-check',
      color: 'indigo',
    },
    {
      id: 'integracoes',
      title: 'Integrações',
      description: 'APIs externas, contabilidade, bancos',
      icon: 'heroicons:link',
      color: 'cyan',
    },
    {
      id: 'campos-customizados',
      title: 'Campos Customizados',
      description: 'Campos adicionais para colaboradores e outras entidades',
      icon: 'heroicons:squares-plus',
      color: 'pink',
    },
    {
      id: 'relatorios',
      title: 'Relatórios Personalizados',
      description: 'Criar, agendar e gerar relatórios customizados',
      icon: 'heroicons:chart-bar',
      color: 'emerald',
    },
    {
      id: 'email',
      title: 'E-mail e Comunicação',
      description: 'SMTP, templates de e-mail',
      icon: 'heroicons:envelope',
      color: 'orange',
    },
    {
      id: 'compliance',
      title: 'Políticas e Compliance',
      description: 'LGPD, termos de uso, políticas internas',
      icon: 'heroicons:document-check',
      color: 'slate',
    },
    {
      id: 'importacao',
      title: 'Importação/Exportação',
      description: 'Importar dados em lote, exportar relatórios',
      icon: 'heroicons:arrow-down-tray',
      color: 'teal',
    },
  ]

  const abrirSecao = (secaoId: string) => {
    // Seções implementadas
    if (secaoId === 'empresa') {
      navigateTo('/configuracoes/empresa')
      return
    }
    
    if (secaoId === 'folha') {
      navigateTo('/configuracoes/folha')
      return
    }

    if (secaoId === 'jornadas') {
      navigateTo('/configuracoes/jornadas')
      return
    }

    if (secaoId === 'documentos') {
      navigateTo('/configuracoes/documentos')
      return
    }

    if (secaoId === 'notificacoes') {
      navigateTo('/configuracoes/notificacoes')
      return
    }

    if (secaoId === 'seguranca') {
      navigateTo('/configuracoes/seguranca')
      return
    }

    if (secaoId === 'integracoes') {
      navigateTo('/configuracoes/integracoes')
      return
    }

    if (secaoId === 'campos-customizados') {
      navigateTo('/configuracoes/campos-customizados')
      return
    }

    if (secaoId === 'relatorios') {
      navigateTo('/configuracoes/relatorios')
      return
    }

    if (secaoId === 'email') {
      navigateTo('/configuracoes/email')
      return
    }

    if (secaoId === 'compliance') {
      navigateTo('/configuracoes/politicas')
      return
    }

    if (secaoId === 'importacao') {
      navigateTo('/configuracoes/importacao-exportacao')
      return
    }

    // Seções ainda não implementadas
    const secao = sections.find(s => s.id === secaoId)
    if (secao) {
      alert(`🚧 Configuração de "${secao.title}" ainda será implementada.\n\nEsta seção permitirá configurar todos os parâmetros relacionados.`)
    }
  }

  return {
    sections,
    abrirSecao,
  }
}

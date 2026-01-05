import { AlertTriangle, ExternalLink, Mail, Shield } from 'lucide-react';

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-6 text-slate-200">
      <div className="rounded-lg border border-red-900/30 bg-red-950/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-bold uppercase tracking-wider text-sm">
            Termos de Uso & Responsabilidade
          </h3>
        </div>
        <p className="text-sm text-red-200/80 leading-relaxed">
          Este sistema ("DevOps Tracker") é uma ferramenta de produtividade técnica.
          <span className="font-bold text-red-300"> É estritamente proibido</span> inserir Dados
          Pessoais Sensíveis (como senhas, chaves privadas, dados de saúde, biometria) ou Dados
          Pessoais de terceiros nos campos de descrição livre. O desenvolvedor não atua como
          controlador desses dados excedentes e não se responsabiliza pelo uso indevido da
          plataforma.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-2">
          <Shield className="h-5 w-5" />
          <h3 className="font-bold text-lg">Política de Privacidade</h3>
        </div>

        <div className="space-y-4 text-sm text-slate-400">
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018),
            informamos como seus dados são tratados:
          </p>

          <ul className="space-y-3 list-disc list-inside ml-2">
            <li>
              <strong className="text-slate-300 pr-2">Coleta Mínima (Art. 6º, III):</strong>
              Armazenamos apenas seu{' '}
              <span className="font-mono text-xs bg-slate-800 px-1 rounded">UID</span> e{' '}
              <span className="font-mono text-xs bg-slate-800 px-1 rounded">E-mail</span> fornecidos
              pelo provedor de login (Google/GitHub) estritamente para vincular suas tarefas à sua
              conta.
            </li>
            <li>
              <strong className="text-slate-300 pr-2">Armazenamento:</strong>
              Seus dados primários residem no seu dispositivo (LocalStorage). O backup em nuvem
              utiliza o Google Firestore (EUA), garantindo segurança e criptografia em repouso.
            </li>
            <li>
              <strong className="text-slate-300 pr-2">Cookies & Analytics:</strong>
              Utilizamos armazenamento local apenas para preferências funcionais (tema,
              configurações). As métricas de performance (Vercel Analytics) são anônimas e não
              rastreiam IP individualmente.
            </li>
            <li>
              <strong className="text-slate-300 pr-2">Seus Direitos (Art. 18):</strong>
              Você possui controle total. Pode desvincular sua conta ou excluir permanentemente seus
              dados da nuvem através da "Zona de Perigo" nas configurações.
            </li>
            <li>
              <strong className="text-slate-300 pr-2">Faixa Etária (Art. 14):</strong>
              Este serviço não é destinado a menores de 13 anos. Caso identifiquemos cadastro de
              crianças sem consentimento parental verificado, a conta e os dados serão excluídos
              imediatamente.
            </li>

            <li>
              <strong className="text-slate-300 pr-2">Atualizações:</strong>
              Podemos atualizar esta política ocasionalmente. O uso contínuo do serviço após
              alterações constitui aceitação dos novos termos.
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h4 className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Mail className="w-4 h-4 text-emerald-400" />
          Canal de Comunicação
        </h4>
        <p className="text-xs text-slate-500">
          Para exercer seus direitos ou tirar dúvidas sobre privacidade, utilize nosso formulário
          oficial. Não é necessário expor seus dados publicamente.
        </p>

        <div className="pt-1">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfphSYhDkdc41NETHAys9Zwlm5l395R3b6P6j_dDWV5AtVOZA/viewform?usp=sharing&ouid=116830705957809593604"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-md bg-slate-800 px-4 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 border border-slate-700"
          >
            Abrir Formulário de Contato
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 italic">
          * <strong>Segurança:</strong> Em caso de incidentes relevantes de segurança, utilizaremos
          o e-mail vinculado à sua conta (Google/GitHub) para realizar a comunicação direta,
          conforme exigido pelo Art. 48 da LGPD.
        </p>
      </div>
      <div className="pt-6 mt-6 border-t border-slate-800 text-center space-y-1">
        <p className="text-xs text-slate-400 font-medium">© 2026 DevOps Tracker</p>
        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[280px] mx-auto">
          Disponível para uso pessoal e gratuito.
          <span className="block mt-0.5 text-slate-600">
            A reprodução, cópia ou redistribuição deste software e de seu design são estritamente
            proibidas.
          </span>
        </p>
      </div>
    </div>
  );
}

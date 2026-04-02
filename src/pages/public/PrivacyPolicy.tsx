import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const { t } = useLanguage();
  const config = useTherapist();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('Voltar ao início', 'Back to home')}
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl font-extralight text-foreground tracking-wider mb-10">
          {t('Política de Privacidade', 'Privacy Policy')}
        </h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">
          <p className="text-xs text-muted-foreground/60">
            {t('Última atualização: Março 2026', 'Last updated: March 2026')}
          </p>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('1. Responsável pelo Tratamento', '1. Data Controller')}
            </h2>
            <p>
              {t(
                `${config.fullBusinessName}, com sede em ${config.address.full}, ${config.address.country}. Contacto: ${config.email} | ${config.phoneFormatted}.`,
                `${config.fullBusinessName}, located at ${config.address.full}, ${config.address.country}. Contact: ${config.email} | ${config.phoneFormatted}.`
              )}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('2. Dados Pessoais Recolhidos', '2. Personal Data Collected')}
            </h2>
            <p>
              {t(
                'Recolhemos os seguintes dados pessoais, fornecidos voluntariamente por si:',
                'We collect the following personal data, voluntarily provided by you:'
              )}
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>{t('Nome completo', 'Full name')}</li>
              <li>{t('Endereço de email', 'Email address')}</li>
              <li>{t('Número de telefone', 'Phone number')}</li>
              <li>{t('Informações de saúde relevantes para a sessão terapêutica (ficha de anamnese)', 'Health information relevant to the therapeutic session (anamnesis form)')}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('3. Finalidade do Tratamento', '3. Purpose of Processing')}
            </h2>
            <p>
              {t(
                'Os seus dados são utilizados exclusivamente para: agendamento e gestão de sessões terapêuticas, personalização do tratamento com base no seu histórico de saúde, envio de informações pré e pós-sessão, e comunicação relacionada com os nossos serviços.',
                'Your data is used exclusively for: scheduling and managing therapeutic sessions, personalizing treatment based on your health history, sending pre and post-session information, and communication related to our services.'
              )}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('4. Base Legal', '4. Legal Basis')}
            </h2>
            <p>
              {t(
                'O tratamento dos seus dados baseia-se no seu consentimento explícito (Art. 6.º, n.º 1, al. a) do RGPD) e na necessidade de execução do contrato de prestação de serviços terapêuticos (Art. 6.º, n.º 1, al. b) do RGPD). Os dados de saúde são tratados com base no seu consentimento explícito (Art. 9.º, n.º 2, al. a) do RGPD).',
                'The processing of your data is based on your explicit consent (Art. 6(1)(a) GDPR) and on the necessity for the performance of the therapeutic services contract (Art. 6(1)(b) GDPR). Health data is processed based on your explicit consent (Art. 9(2)(a) GDPR).'
              )}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('5. Conservação dos Dados', '5. Data Retention')}
            </h2>
            <p>
              {t(
                'Os seus dados pessoais são conservados pelo período necessário à prestação dos serviços e pelo período legalmente exigido. Pode solicitar a eliminação dos seus dados a qualquer momento.',
                'Your personal data is retained for the period necessary to provide services and for the legally required period. You may request the deletion of your data at any time.'
              )}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('6. Os Seus Direitos', '6. Your Rights')}
            </h2>
            <p>
              {t(
                `Nos termos do RGPD, tem direito a: aceder aos seus dados pessoais, retificar dados incorretos, solicitar a eliminação dos seus dados, limitar o tratamento, portabilidade dos dados e opor-se ao tratamento. Para exercer os seus direitos, contacte-nos através de ${config.email}.`,
                `Under the GDPR, you have the right to: access your personal data, rectify incorrect data, request deletion of your data, restrict processing, data portability and object to processing. To exercise your rights, contact us at ${config.email}.`
              )}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('7. Cookies', '7. Cookies')}
            </h2>
            <p>
              {t(
                'Este website utiliza apenas cookies técnicos essenciais ao funcionamento do site. Não utilizamos cookies de rastreamento ou de terceiros para fins publicitários.',
                'This website uses only essential technical cookies for site functionality. We do not use tracking cookies or third-party cookies for advertising purposes.'
              )}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('8. Segurança', '8. Security')}
            </h2>
            <p>
              {t(
                'Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados pessoais contra acesso não autorizado, perda ou destruição.',
                'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss or destruction.'
              )}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">
              {t('9. Contacto e Reclamações', '9. Contact and Complaints')}
            </h2>
            <p>
              {t(
                `Para questões relacionadas com a proteção dos seus dados, contacte ${config.email}. Tem o direito de apresentar uma reclamação junto da Comissão Nacional de Proteção de Dados (CNPD) em www.cnpd.pt.`,
                `For questions related to the protection of your data, contact ${config.email}. You have the right to file a complaint with the Portuguese Data Protection Authority (CNPD) at www.cnpd.pt.`
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Database, Globe2, Mail, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  pt: {
    back: "Voltar ao início",
    eyebrow: "Privacidade e transparência",
    title: "Política de Privacidade — NiñoPulse Global",
    updated: "Última atualização: 7 de novembro de 2026",
    intro:
      "O NiñoPulse Global é uma plataforma educacional de monitoramento climático focada em ENSO, El Niño, La Niña, dados meteorológicos, mapas e indicadores climáticos. Esta política explica como o app/site lida com informações dos usuários.",
    sections: [
      {
        icon: ShieldCheck,
        title: "1. Coleta de dados pessoais",
        text:
          "O NiñoPulse Global não exige cadastro, login, senha ou criação de conta. O app não solicita nome, endereço, telefone, documentos, dados bancários ou outras informações pessoais sensíveis.",
      },
      {
        icon: Database,
        title: "2. Dados usados para funcionamento",
        text:
          "Idioma, tema, cidades salvas, previsões recentes e preferências de acompanhamento ficam no dispositivo. Meu Clima guarda até oito amostras diárias por cidade, para até 24 locais. Para apagar essas informações, limpe os dados do app no Android ou do site no navegador.",
      },
      {
        icon: Globe2,
        title: "3. Fontes externas e APIs",
        text:
          "Os termos da busca e as coordenadas consultadas vão ao Open-Meteo. O ponto público de uma cidade pode ser enviado ao serviço hospedado do NiñoPulse e ao NWS para consultar avisos. No Brasil, o app cruza o ponto da cidade com o feed público da Defesa Civil. A NOAA/CPC fornece dados climáticos. Provedores podem receber o IP e outros dados técnicos de conexão.",
      },
      {
        icon: ShieldCheck,
        title: "4. Compartilhamento e venda de dados",
        text:
          "O NiñoPulse Global não vende dados dos usuários e não compartilha dados pessoais para publicidade, rastreamento comercial ou criação de perfis. Serviços externos usados para mapas, clima, hospedagem e APIs podem processar dados técnicos de acordo com suas próprias políticas.",
      },
      {
        icon: ShieldCheck,
        title: "5. Localização e notificações",
        text:
          "Ao tocar em Usar localização, o app explica o uso e solicita permissão. Envia ao Open-Meteo coordenadas arredondadas a duas casas decimais e guarda essa posição só durante a sessão. A busca manual funciona sem essa permissão. Notificações são opcionais e dependem de verificações feitas com o app aberto. Revogue permissões nas configurações do sistema ou navegador.",
      },
      {
        icon: ShieldCheck,
        title: "6. Crianças e adolescentes",
        text:
          "O projeto tem finalidade educacional e pode ser usado por estudantes, professores e pessoas interessadas em ciência. O app não coleta intencionalmente dados pessoais de crianças ou adolescentes.",
      },
      {
        icon: ShieldCheck,
        title: "7. Segurança e alterações",
        text:
          "O app busca usar apenas dados necessários para funcionamento e pode atualizar esta política no futuro para refletir mudanças no produto, novas funcionalidades ou exigências legais.",
      },
    ],
    contactTitle: "8. Contato",
    contactText: "Em caso de dúvidas sobre esta Política de Privacidade, entre em contato pelo e-mail:",
  },
  en: {
    back: "Back to home",
    eyebrow: "Privacy and transparency",
    title: "Privacy Policy — NiñoPulse Global",
    updated: "Last updated: November 7, 2026",
    intro:
      "NiñoPulse Global is an educational climate monitoring platform focused on ENSO, El Niño, La Niña, weather data, maps and climate indicators. This policy explains how the app/site handles user information.",
    sections: [
      {
        icon: ShieldCheck,
        title: "1. Personal data collection",
        text:
          "NiñoPulse Global does not require registration, login, password or account creation. The app does not request name, address, phone number, documents, banking data or other sensitive personal information.",
      },
      {
        icon: Database,
        title: "2. Data used for functionality",
        text:
          "Language, theme, saved cities, recent forecasts, and follow preferences stay on the device. My Weather keeps up to eight daily snapshots per city, for up to 24 locations. To erase this information, clear app data on Android or site data in your browser.",
      },
      {
        icon: Globe2,
        title: "3. External sources and APIs",
        text:
          "Search terms and selected coordinates go to Open-Meteo. A public city point may go to the hosted NiñoPulse service and NWS for alerts. For Brazil, the app matches the point against the public Civil Defense feed. Climate indicators come from NOAA/CPC. Providers may receive the IP address and technical connection data.",
      },
      {
        icon: ShieldCheck,
        title: "4. Sharing and selling data",
        text:
          "NiñoPulse Global does not sell user data and does not share personal data for advertising, commercial tracking or profiling. External services used for maps, weather, hosting and APIs may process technical data according to their own policies.",
      },
      {
        icon: ShieldCheck,
        title: "5. Location and notifications",
        text:
          "When you select Use location, the app explains its use and asks for permission. It sends coordinates rounded to two decimal places to Open-Meteo and keeps this position only for the session. Manual search works without location permission. Optional notifications rely on checks while the app is open. Revoke permissions in your system or browser settings.",
      },
      {
        icon: ShieldCheck,
        title: "6. Children and teenagers",
        text:
          "The project has an educational purpose and may be used by students, teachers and people interested in science. The app does not intentionally collect personal data from children or teenagers.",
      },
      {
        icon: ShieldCheck,
        title: "7. Security and changes",
        text:
          "The app aims to use only data necessary for functionality and may update this policy in the future to reflect product changes, new features or legal requirements.",
      },
    ],
    contactTitle: "8. Contact",
    contactText: "For questions about this Privacy Policy, contact:",
  },
};

export default function PrivacyPage() {
  const { language } = useLanguage();
  const l = content[language] || content.pt;

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {l.back}
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{l.eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{l.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{l.updated}</p>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{l.intro}</p>
        </section>

        <div className="mt-6 space-y-4">
          {l.sections.map(({ icon: Icon, title, text }) => (
            <section key={title} className="rounded-2xl border border-border bg-card/70 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-lg font-bold">{title}</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
            </section>
          ))}

          <section className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/70 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold">{l.contactTitle}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {l.contactText} <a className="font-semibold text-primary hover:underline" href="mailto:vekkai595@gmail.com">vekkai595@gmail.com</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Database, Globe2, Mail, ArrowLeft } from "lucide-react";
import NavBar from "@/components/elnino/NavBar";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  pt: {
    back: "Voltar ao início",
    eyebrow: "Privacidade e transparência",
    title: "Política de Privacidade — NiñoPulse Global",
    updated: "Última atualização: 28 de junho de 2026",
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
          "O app pode usar dados técnicos básicos necessários para funcionar, como conexão com a internet, carregamento de mapas, gráficos e dados climáticos. Preferências como idioma, tema e favoritos podem ficar salvas localmente no próprio dispositivo/navegador do usuário.",
      },
      {
        icon: Globe2,
        title: "3. Fontes externas e APIs",
        text:
          "O NiñoPulse Global exibe informações climáticas e meteorológicas obtidas de fontes externas, incluindo dados públicos da NOAA/CPC, Open-Meteo e serviços de consulta de países, estados e cidades. Ao pesquisar ou selecionar uma cidade, o nome da cidade/estado/país pode ser enviado a APIs externas para localizar coordenadas e retornar a previsão do tempo. O NiñoPulse não usa esses dados para identificar o usuário.",
      },
      {
        icon: ShieldCheck,
        title: "4. Compartilhamento e venda de dados",
        text:
          "O NiñoPulse Global não vende dados dos usuários e não compartilha dados pessoais para publicidade, rastreamento comercial ou criação de perfis. Serviços externos usados para mapas, clima, hospedagem e APIs podem processar dados técnicos de acordo com suas próprias políticas.",
      },
      {
        icon: ShieldCheck,
        title: "5. Localização, anúncios e login",
        text:
          "O app não pede localização GPS precisa, não possui login obrigatório e não exibe anúncios nesta versão. A consulta de clima local acontece pela cidade escolhida manualmente pelo usuário.",
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
    updated: "Last updated: June 28, 2026",
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
          "The app may use basic technical data needed to function, such as internet connection, map loading, charts and climate data. Preferences such as language, theme and favorites may be stored locally on the user's own device/browser.",
      },
      {
        icon: Globe2,
        title: "3. External sources and APIs",
        text:
          "NiñoPulse Global displays climate and weather information obtained from external sources, including public NOAA/CPC data, Open-Meteo and country/state/city lookup services. When searching for or selecting a city, the city/state/country name may be sent to external APIs to locate coordinates and return weather forecasts. NiñoPulse does not use this information to identify the user.",
      },
      {
        icon: ShieldCheck,
        title: "4. Sharing and selling data",
        text:
          "NiñoPulse Global does not sell user data and does not share personal data for advertising, commercial tracking or profiling. External services used for maps, weather, hosting and APIs may process technical data according to their own policies.",
      },
      {
        icon: ShieldCheck,
        title: "5. Location, ads and login",
        text:
          "The app does not request precise GPS location, does not require login and does not display ads in this version. Local weather search works through the city selected manually by the user.",
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
      <NavBar />
      <main id="main-content" className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6">
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

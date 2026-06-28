import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  GraduationCap,
  Heart,
  Layers3,
  Mail,
  ShieldCheck,
  Smartphone,
  Target,
} from "lucide-react";

import NavBar from "@/components/elnino/NavBar";
import FooterSection from "@/components/elnino/FooterSection";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  const workEmail = "vekkai595@gmail.com";

  const cases = [
    {
      icon: Target,
      title: t("about.caseProblem"),
      text: t("about.caseProblemText"),
    },
    {
      icon: Layers3,
      title: t("about.caseSolution"),
      text: t("about.caseSolutionText"),
    },
    {
      icon: Code2,
      title: t("about.caseEngineering"),
      text: t("about.caseEngineeringText"),
    },
    {
      icon: GraduationCap,
      title: t("about.caseImpact"),
      text: t("about.caseImpactText"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 pb-16 pt-28"
      >
        <header className="max-w-3xl">
          <p className="section-kicker">NIÑOPULSE GLOBAL</p>

          <h1 className="section-title text-4xl sm:text-6xl">
            {t("about.title")}
          </h1>

          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {t("about.project")}
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <AboutCard
            icon={Database}
            title={t("about.dataTitle")}
            text={t("about.data")}
          />

          <AboutCard
            icon={ShieldCheck}
            title={t("about.methodTitle")}
            text={t("about.method")}
          />
        </div>

        <section className="mt-10 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-6 sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:h-32 sm:w-32">
              <Code2 className="h-12 w-12" />
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <GraduationCap className="h-4 w-4" />
                {t("kicker.student")}
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                {t("about.devTitle")}
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                {t("about.dev")}
              </p>

              <div className="mt-6">
                <a
                  href={"mailto:" + workEmail}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label={t("about.email") + " " + workEmail}
                >
                  <Mail className="h-5 w-5" />
                  <span>{t("about.email")}</span>
                  <span className="hidden font-normal text-muted-foreground sm:inline">
                    {workEmail}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 max-w-3xl">
            <p className="section-kicker">{t("about.caseKicker")}</p>

            <h2 className="section-title">
              {t("about.caseTitle")}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cases.map(({ icon: Icon, title, text }) => (
              <AboutCard
                key={title}
                icon={Icon}
                title={title}
                text={text}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_.8fr]">
          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />

              <h2 className="font-display text-2xl font-bold">
                {t("about.principles")}
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <Principle
                icon={ShieldCheck}
                text={t("about.p1")}
              />

              <Principle
                icon={Smartphone}
                text={t("about.p2")}
              />

              <Principle
                icon={Code2}
                text={t("about.p3")}
              />
            </div>

            <p className="mt-6 rounded-xl bg-secondary/50 p-4 text-sm leading-6 text-muted-foreground">
              {t("about.privacy")}
            </p>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />

              <h2 className="font-display text-2xl font-bold">
                {t("about.credits")}
              </h2>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
              <p>{t("about.noaa")}</p>
              <p>{t("about.school")}</p>

              <div className="flex flex-col items-start gap-2">
                <a
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                  href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NOAA/CPC ENSO Discussion
                </a>

                <a
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open-Meteo Weather API
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}

function AboutCard({ icon: Icon, title, text }) {
  return (
    <article className="surface-card p-6">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>

      <h2 className="mt-5 font-display text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {text}
      </p>
    </article>
  );
}

function Principle({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

      <div>
        <Icon className="mb-1 h-4 w-4 text-muted-foreground" />

        <p className="text-sm leading-6">
          {text}
        </p>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, ArrowRight, CloudSun, Compass, Database, Globe2, Layers3, Thermometer, Waves } from "lucide-react";
import { PageHeading, SectionTitle, SourceLink, useCopy } from "@/components/pulse/ui";

const NOAA = "https://www.noaa.gov/education/resource-collections/weather-atmosphere/el-nino";
const guides = [
  {
    id: "weather-climate", Icon: CloudSun, pt: "Tempo e clima", en: "Weather and climate",
    lead: ["Previsão local e tendência de longo prazo.", "Local forecasts and long-term patterns."],
    text: [
      "Tempo é o estado da atmosfera em um lugar e momento. Clima descreve padrões e variações observados ao longo de décadas. A previsão para amanhã ajuda a decidir se vale levar guarda-chuva. Uma perspectiva sazonal informa as chances de a chuva acumulada de vários meses ficar acima, perto ou abaixo de uma referência.",
      "Weather is the state of the atmosphere at a place and time. Climate describes patterns and variability over decades. Tomorrow’s forecast can help you decide whether to bring an umbrella. A seasonal outlook gives the odds that rainfall over several months falls above, near, or below a reference.",
    ], url: "https://www.ncei.noaa.gov/news/weather-vs-climate",
  },
  {
    id: "enso", Icon: Activity, pt: "Como o ENSO funciona?", en: "How does ENSO work?",
    lead: ["O elo entre o oceano e a atmosfera no Pacífico.", "The link between ocean and atmosphere in the Pacific."],
    text: [
      "ENSO significa El Niño–Oscilação Sul. É uma variação natural da temperatura do Pacífico equatorial, dos ventos e da circulação atmosférica. El Niño é a fase quente e La Niña é a fase fria. Nos períodos neutros, o conjunto de condições fica mais próximo dos padrões típicos.",
      "ENSO stands for El Niño–Southern Oscillation. It is a natural variation in equatorial Pacific temperature, winds, and atmospheric circulation. El Niño is the warm phase and La Niña is the cool phase. In neutral periods, conditions stay closer to typical patterns.",
    ], url: NOAA,
  },
  {
    id: "el-nino", Icon: Thermometer, pt: "O que é El Niño?", en: "What is El Niño?",
    lead: ["A fase quente do Pacífico equatorial.", "The warm phase of the equatorial Pacific."],
    text: [
      "As águas do Pacífico equatorial central e oriental ficam mais quentes que o habitual e os ventos alísios costumam enfraquecer. As áreas de chuva tropical podem mudar de posição e influenciar a circulação em regiões distantes. Esses efeitos variam por região, estação e evento.",
      "The central and eastern equatorial Pacific becomes warmer than usual and trade winds often weaken. Tropical rainfall can shift and affect circulation far away. The effects vary by region, season, and event.",
    ], url: NOAA,
  },
  {
    id: "la-nina", Icon: Waves, pt: "O que é La Niña?", en: "What is La Niña?",
    lead: ["A fase fria e o papel dos ventos alísios.", "The cool phase and the role of the trade winds."],
    text: [
      "As águas do Pacífico equatorial central e oriental ficam mais frias que o habitual. Alísios mais fortes podem deslocar águas superficiais quentes para oeste e favorecer a subida de águas frias no leste. Certas regiões observam padrões aproximadamente opostos aos de El Niño, com diferenças de força e duração.",
      "The central and eastern equatorial Pacific becomes cooler than usual. Stronger trade winds can push warm surface water west and favor upwelling of cool water in the east. Some regions see patterns roughly opposite to El Niño, with differences in strength and duration.",
    ], url: NOAA,
  },
  {
    id: "anomalies", Icon: Layers3, pt: "O que é uma anomalia?", en: "What is an anomaly?",
    lead: ["A diferença em relação a uma média de referência.", "The departure from a reference average."],
    text: [
      "Anomalia é o valor observado menos a média de referência para o lugar e a época do ano. Se a média fosse 26 °C e o oceano medisse 27 °C, a anomalia seria +1 °C. O gráfico semanal Niño usa a base 1991–2020. O RONI usa médias sazonais e ajusta a variação mais ampla dos trópicos.",
      "An anomaly is the observation minus a reference average for the same place and time of year. If the average were 26 °C and the ocean measured 27 °C, the anomaly would be +1 °C. The weekly Niño chart uses a 1991–2020 baseline. RONI uses seasonal averages and adjusts for broader tropical variability.",
    ], url: "https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/",
  },
  {
    id: "charts", Icon: Compass, pt: "Como ler mapas e gráficos?", en: "How do I read maps and charts?",
    lead: ["Comece pela unidade, pela data e pela área.", "Start with the unit, date, and area."],
    text: [
      "Os pontos no Earth Live mostram consultas de modelo e as áreas Niño representam médias oceânicas. Na tabela sazonal, SON significa setembro, outubro e novembro. Uma chance de 70% de El Niño em SON descreve a probabilidade dessa fase para a janela. A chance de chuva da sua cidade vem da previsão local.",
      "Earth Live points show model lookups and Niño areas represent ocean averages. In the seasonal table, SON means September, October, and November. A 70% El Niño chance for SON describes the odds of that phase for the season. Local rain chances come from the city forecast.",
    ], url: "https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/",
  },
];

export default function ExplorePage() {
  const { copy } = useCopy();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash]);
  return <main id="main-content" className="np-content" tabIndex={-1}>
    <PageHeading title={copy("Explorar", "Explore")} description={copy("Entenda o que você vê nas previsões, nos gráficos e no mapa.", "Understand what you see in forecasts, charts, and maps.")} />
    <div className="np-guide-grid">{guides.map(({ id, Icon, pt, en, lead, text, url }, index) => <details className="np-panel np-guide" key={id} id={id} open={hash === `#${id}` || undefined}>
      <summary><span><Icon size={20} aria-hidden="true" />{String(index + 1).padStart(2, "0")}</span><strong>{copy(pt, en)}</strong><small>{copy(lead[0], lead[1])}</small></summary>
      <p>{copy(text[0], text[1])}</p><SourceLink href={url}>NOAA</SourceLink>
    </details>)}</div>
    <div className="np-two">
      <section className="np-panel"><SectionTitle icon={Globe2} title={copy("Contexto por região", "Regional context")} description={copy("Padrões típicos em diferentes países.", "Typical patterns across different countries.")} /><Link className="np-link" to="/explore/regions">{copy("Ver perfis regionais", "View regional profiles")}<ArrowRight size={16} /></Link></section>
      <section className="np-panel"><SectionTitle icon={Database} title={copy("Pesquisa e dados", "Research and data")} description={copy("Consulte fontes e exporte indicadores.", "Check sources and export indicators.")} /><Link className="np-link" to="/research">{copy("Abrir área de pesquisa", "Open the research area")}<ArrowRight size={16} /></Link></section>
    </div>
  </main>;
}

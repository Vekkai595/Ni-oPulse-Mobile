function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function calculateExperimentalOutlook(data) {
  const anomaly = Number(data.current?.weeklySst?.regions?.nino34?.anomaly || 0);
  const seasons = data.forecast?.seasons || [];
  const first = Number(seasons[0]?.probability?.elNino || 0);
  const last = Number(seasons.at(-1)?.probability?.elNino || first);
  const direction = last - first;
  const dominantProbability = Math.max(
    ...seasons.flatMap((season) => [
      Number(season.probability?.elNino || 0),
      Number(season.probability?.neutral || 0),
      Number(season.probability?.laNina || 0),
    ]),
    0,
  );
  const availableSources = (data.sources || []).filter((source) => source.available).length;
  const totalSources = Math.max((data.sources || []).length, 1);

  const components = {
    dataQuality: Math.round((availableSources / totalSources) * 25),
    anomalySignal: Math.round(clamp(Math.abs(anomaly) / 2.5, 0, 1) * 25),
    forecastAgreement: Math.round(clamp(dominantProbability / 100, 0, 1) * 30),
    trendClarity: Math.round(clamp(Math.abs(direction) / 40, 0, 1) * 20),
  };
  const signalIndex = Object.values(components).reduce((sum, value) => sum + value, 0);

  const trend = direction >= 10 || anomaly >= 1
    ? "strengthening"
    : direction <= -10 || anomaly <= -0.5
      ? "weakening"
      : "stable";

  return {
    anomaly,
    first,
    last,
    direction,
    signalIndex,
    components,
    dominantProbability,
    trend,
  };
}

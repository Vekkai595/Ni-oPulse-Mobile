const points = [
  { period: "1982", value: 0.2, year: 1982, season: "DJF", sequence: 1982 * 12 },
  { period: "1983", value: 2.2, year: 1983, season: "DJF", sequence: 1983 * 12 },
  { period: "1984", value: -0.8, year: 1984, season: "DJF", sequence: 1984 * 12 },
  { period: "1988", value: -1.8, year: 1988, season: "DJF", sequence: 1988 * 12 },
  { period: "1992", value: 1.7, year: 1992, season: "DJF", sequence: 1992 * 12 },
  { period: "1997", value: 2.4, year: 1997, season: "DJF", sequence: 1997 * 12 },
  { period: "1999", value: -1.6, year: 1999, season: "DJF", sequence: 1999 * 12 },
  { period: "2010", value: 1.6, year: 2010, season: "DJF", sequence: 2010 * 12 },
  { period: "2011", value: -1.4, year: 2011, season: "DJF", sequence: 2011 * 12 },
  { period: "2016", value: 2.6, year: 2016, season: "DJF", sequence: 2016 * 12 },
  { period: "2021", value: -1.0, year: 2021, season: "DJF", sequence: 2021 * 12 },
  { period: "2024", value: 2.0, year: 2024, season: "DJF", sequence: 2024 * 12 },
];

export const historyFallback = {
  ok: true,
  stale: true,
  condensed: true,
  generatedAt: null,
  primary: "oni",
  datasets: {
    oni: {
      key: "oni",
      label: "Oceanic Niño Index (ONI)",
      description: "Condensed offline fallback",
      points,
      episodes: [],
      firstYear: 1982,
      lastYear: 2024,
    },
  },
  sources: [],
};

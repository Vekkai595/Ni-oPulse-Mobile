import { useQuery } from "@tanstack/react-query";
import { fetchLocalWeather, readWeather, recordForecast, WEATHER_TTL } from "@/lib/weather";

export function localWeatherOptions(place) {
  return {
    queryKey: ["local-weather-v3", place?.id, place?.latitude, place?.longitude],
    enabled: Boolean(place),
    initialData: () => readWeather(place),
    initialDataUpdatedAt: () => Date.parse(readWeather(place)?.fetchedAt ?? "") || undefined,
    queryFn: async ({ signal }) => {
      const forecast = await fetchLocalWeather(place, signal);
      recordForecast(place, forecast);
      return forecast;
    },
    staleTime: WEATHER_TTL, refetchInterval: WEATHER_TTL, refetchOnWindowFocus: true, retry: 1,
  };
}

export const useLocalWeather = (place) => useQuery(localWeatherOptions(place));

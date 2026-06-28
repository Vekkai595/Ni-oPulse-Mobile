# Scientific methodology and limits

## Official observations

NiñoPulse retrieves current ENSO discussion text, seasonal probability tables and weekly Niño-region SST anomalies from NOAA/CPC sources. The backend applies timeouts, parsing validation, a short in-memory cache and a last-valid fallback.

## Historical series

The history service retrieves NOAA's Relative Oceanic Niño Index (RONI), the current official monitoring index, and the ONI table for historical comparison. Rows are parsed into overlapping three-month seasons. Warm and cold episodes are detected only after at least five consecutive seasons at or beyond ±0.5 °C. The interface identifies the source and whether a local fallback dataset is being shown.

## Live country weather

NiñoPulse retrieves current conditions and a seven-day forecast from Open-Meteo for one representative monitoring location in each of the 30 countries. The server requests all locations in one batch, caches the normalized response for ten minutes and preserves the last valid snapshot if the provider is temporarily unavailable. Current values are weather-model estimates, not a national average, station observation or official emergency warning. Open-Meteo data are attributed under CC BY 4.0.

## Country scenarios

Country profiles are manually curated educational summaries of commonly discussed historical ENSO impacts. The current global phase and official seasonal probability are used to select a scenario label and a relative display signal. This does not model local rainfall, temperature, crops or economic losses. Users should consult national meteorological and emergency agencies for operational guidance.

## Experimental Signal Index

The Signal Index is a bounded 0–100 exploratory score built from:

- availability/quality of official inputs;
- magnitude of the weekly Niño 3.4 anomaly;
- agreement of seasonal probabilities;
- clarity of probability trend.

It is not machine learning, a calibrated probability, a confidence interval or an official NOAA product. The application exposes the ingredients and labels the result as experimental.

## Map layers

Map layers classify the static educational country profiles by historical threat categories. They are not satellite rasters, drought-monitor layers, flood polygons or live hazard maps.

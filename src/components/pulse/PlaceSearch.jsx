import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { usePlaces } from "@/contexts/PlacesContext";
import { useOnline } from "@/hooks/useOnline";
import { placeRegion, searchPlaces } from "@/lib/weather";
import { Note, SourceLink, useCopy } from "./ui";

export default function PlaceSearch() {
  const { language, copy } = useCopy();
  const { select } = usePlaces();
  const online = useOnline();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [location, setLocation] = useState("closed");
  const attempt = useRef(0);
  const query = useQuery({
    queryKey: ["city-search", submitted, language],
    queryFn: ({ signal }) => searchPlaces(submitted, language, signal),
    enabled: submitted.length >= 2 && online, staleTime: 30 * 60 * 1000, retry: false,
  });

  function closeLocation() {
    attempt.current++;
    setLocation("closed");
  }

  async function locate() {
    const id = ++attempt.current;
    setLocation("loading");
    try {
      const { deviceLocation } = await import("@/services/deviceLocation");
      const point = await deviceLocation();
      if (attempt.current !== id) return;
      select(point);
      closeLocation();
      setSubmitted("");
      setText("");
    } catch {
      if (attempt.current === id) setLocation("error");
    }
  }

  return <section className="np-search-area">
    <div className="np-search-line">
      <form className="np-search" role="search" onSubmit={(event) => {
        event.preventDefault();
        const value = text.trim();
        if (value === submitted && query.isError) query.refetch();
        setSubmitted(value);
      }}>
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor="np-city">{copy("Pesquisar cidade", "Search for a city")}</label>
        <input id="np-city" type="search" placeholder={copy("Buscar uma cidade", "Find a city")} value={text} onChange={(event) => { setText(event.target.value); if (!event.target.value) setSubmitted(""); }} maxLength={100} />
        <button type="submit" className="np-search-submit" disabled={!online || text.trim().length < 2}>{copy("Buscar", "Search")}</button>
      </form>
      <button className="np-button" type="button" aria-expanded={location !== "closed"} onClick={() => location === "closed" ? setLocation("consent") : closeLocation()}><LocateFixed size={17} aria-hidden="true" />{copy("Usar localização", "Use location")}</button>
    </div>
    {location !== "closed" && <div className="np-panel np-search-results">
      <p>{copy("Ao continuar, o app pedirá permissão e enviará coordenadas arredondadas ao Open-Meteo. A localização fica disponível apenas nesta sessão.", "If you continue, the app will ask for permission and send rounded coordinates to Open-Meteo. Your location is available only for this session.")}</p>
      <button className="np-button mt-2" type="button" disabled={location === "loading" || !online} onClick={locate}>{location === "loading" ? copy("Localizando…", "Locating…") : copy("Continuar com localização", "Continue with location")}</button>
      {location === "error" && <Note warning>{copy("Localização indisponível. Confira a permissão ou pesquise a cidade.", "Location unavailable. Check permission or search for your city.")}</Note>}
    </div>}
    {submitted && <div className="np-panel np-search-results">
      <div className="np-section-title"><p>{copy("Resultados para", "Results for")} <strong>{submitted}</strong></p><button className="np-button np-icon" type="button" aria-label={copy("Fechar resultados", "Close results")} onClick={() => setSubmitted("")}><X size={17} /></button></div>
      {(!online || query.isError) && <Note warning>{copy("Busca indisponível. Confira a conexão e tente de novo.", "Search unavailable. Check your connection and try again.")}</Note>}
      {query.isFetching && <Note>{copy("Buscando cidades…", "Searching cities…")}</Note>}
      {query.isSuccess && !query.data.length && <Note>{copy("Nenhuma cidade encontrada.", "No cities found.")}</Note>}
      <ul>{query.data?.map((place) => <li key={place.id}><button type="button" onClick={() => { closeLocation(); select(place); setSubmitted(""); setText(""); }}>
        <MapPin size={17} aria-hidden="true" /><span><strong>{place.name}</strong><small>{placeRegion(place, language)}</small></span>
      </button></li>)}</ul>
      {query.isSuccess && <SourceLink href="https://open-meteo.com/en/docs/geocoding-api">GeoNames · Open-Meteo</SourceLink>}
    </div>}
  </section>;
}

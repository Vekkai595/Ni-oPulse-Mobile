import { GeoJSON, Polyline } from "react-leaflet";
import land from "@/data/land-110m.json";

// The original Natural Earth rings are already split at the antimeridian.
const geometry = /** @type {import("geojson").GeoJsonObject} */ (/** @type {unknown} */ (land));
/** @type {import("leaflet").LatLngTuple[][]} */
const parallels = [-60, -30, 0, 30, 60].map((latitude) => [[latitude, -180], [latitude, 180]]);
/** @type {import("leaflet").LatLngTuple[][]} */
const meridians = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((longitude) => [[-84, longitude], [84, longitude]]);

export default function Basemap({ grid = false }) {
  return <>
    <GeoJSON data={geometry} interactive={false} attribution='<a href="https://www.naturalearthdata.com/">Natural Earth</a>' style={{ color: "var(--np-muted)", fillColor: "var(--np-panel)", fillOpacity: 1, weight: 1 }} />
    {grid && [...parallels, ...meridians].map((line, i) => <Polyline key={i} positions={line} interactive={false} pathOptions={{ color: "var(--np-muted)", weight: 1, opacity: .35, dashArray: "2 5" }} />)}
  </>;
}

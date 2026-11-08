import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export async function deviceLocation() {
  if (Capacitor.isNativePlatform()) {
    const { coarseLocation } = await Geolocation.requestPermissions({ permissions: ["coarseLocation"] });
    if (coarseLocation !== "granted") throw new Error("Location permission denied");
  }
  const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 });
  const latitude = Number(coords.latitude.toFixed(2));
  const longitude = Number(coords.longitude.toFixed(2));
  return { id: `device-${latitude}-${longitude}`, name: "", device: true, latitude, longitude };
}

import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { countries } from "@/lib/elNinoData";
import { localizeCountries } from "@/lib/localizedContent";

function downloadBlob(content, type, filename) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function writeAndShareText(content, filename, title) {
  const result = await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  await Share.share({ title, files: [result.uri], dialogTitle: title });
  return "shared";
}

async function writeAndShareBase64(base64, filename, title) {
  const result = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });
  await Share.share({ title, files: [result.uri], dialogTitle: title });
  return "shared";
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function exportJson(data) {
  const filename = `ninopulse-enso-${new Date().toISOString().slice(0, 10)}.json`;
  const content = JSON.stringify(data, null, 2);
  if (Capacitor.isNativePlatform()) return writeAndShareText(content, filename, "NiñoPulse ENSO JSON");
  downloadBlob(content, "application/json;charset=utf-8", filename);
  return "exported";
}

export async function exportCsv(data, language) {
  const localized = localizeCountries(countries, language);
  const header = ["country_id", "country", "continent", "risk", "threats", "enso_phase", "nino34_anomaly", "generated_at"];
  const rows = localized.map((country) => [country.id, country.nome, country.continente, country.nivelDeRisco, country.ameacas.join("|"), data.current?.phase, data.current?.weeklySst?.regions?.nino34?.anomaly, data.generatedAt]);
  const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n")}`;
  const filename = `ninopulse-countries-${new Date().toISOString().slice(0, 10)}.csv`;
  if (Capacitor.isNativePlatform()) return writeAndShareText(csv, filename, "NiñoPulse country data");
  downloadBlob(csv, "text/csv;charset=utf-8", filename);
  return "exported";
}

export async function exportPdf(data, language) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pt = language === "pt";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("NiñoPulse Global", 48, 58);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(pt ? "Relatório resumido do ENSO" : "ENSO summary report", 48, 82);
  doc.setDrawColor(180);
  doc.line(48, 96, 547, 96);
  const lines = [
    `${pt ? "Gerado" : "Generated"}: ${new Date(data.generatedAt || Date.now()).toLocaleString(pt ? "pt-BR" : "en-US")}`,
    `${pt ? "Fase oficial" : "Official phase"}: ${data.current?.phase || "—"}`,
    `${pt ? "Status" : "Status"}: ${data.current?.alertStatus || "—"}`,
    `Niño 3.4: ${data.current?.weeklySst?.regions?.nino34?.anomaly ?? "—"} °C`,
    `${pt ? "Período principal" : "Primary season"}: ${data.forecast?.selectedSeason?.season || "—"}`,
    `${pt ? "Probabilidade El Niño" : "El Niño probability"}: ${data.forecast?.selectedSeason?.probability?.elNino ?? "—"}%`,
  ];
  let y = 128;
  for (const line of lines) { doc.text(line, 48, y); y += 24; }
  doc.setFont("helvetica", "bold");
  doc.text(pt ? "Resumo oficial" : "Official synopsis", 48, y + 12);
  doc.setFont("helvetica", "normal");
  const synopsis = doc.splitTextToSize(data.current?.synopsis || "—", 490);
  doc.text(synopsis, 48, y + 34);
  const footerY = 790;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(pt ? "Dados oficiais NOAA/CPC. Perfis nacionais são conteúdo educacional." : "Official NOAA/CPC data. Country profiles are educational content.", 48, footerY);

  const filename = `ninopulse-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  if (Capacitor.isNativePlatform()) {
    const dataUri = doc.output("datauristring");
    return writeAndShareBase64(dataUri.split(",")[1], filename, pt ? "Relatório NiñoPulse" : "NiñoPulse report");
  }
  doc.save(filename);
  return "exported";
}

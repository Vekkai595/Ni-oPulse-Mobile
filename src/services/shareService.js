import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to create PNG")), "image/png"));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function shareDashboardImage({ elementId = "ninopulse-share-card", title, text, fallbackUrl }) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Share card was not found");
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(element, {
    scale: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: null,
    useCORS: true,
    logging: false,
    windowWidth: Math.max(element.scrollWidth, element.clientWidth),
  });
  const filename = `ninopulse-${new Date().toISOString().slice(0, 10)}.png`;

  if (Capacitor.isNativePlatform()) {
    const dataUrl = canvas.toDataURL("image/png");
    const result = await Filesystem.writeFile({
      path: filename,
      data: dataUrl.split(",")[1],
      directory: Directory.Cache,
    });
    await Share.share({ title, text, files: [result.uri], dialogTitle: title });
    return "shared";
  }

  const blob = await canvasToBlob(canvas);
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, text, url: fallbackUrl, files: [file] });
    return "shared";
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

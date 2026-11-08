import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const CHANNEL = "ninopulse-updates-v3";
export const notificationsSupported = () => Capacitor.isNativePlatform() || "Notification" in window;

export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions();
    if (result.display !== "granted") return false;
    if (Capacitor.getPlatform() === "android") await LocalNotifications.createChannel({ id: CHANNEL, name: "NiñoPulse Global", importance: 3 });
    return true;
  }
  return notificationsSupported() && (await Notification.requestPermission()) === "granted";
}

export async function sendLocalNotification({ title, body, id = Date.now() % 2147483647 }) {
  if (Capacitor.isNativePlatform()) {
    if ((await LocalNotifications.checkPermissions()).display === "granted") {
      await LocalNotifications.schedule({ notifications: [{ id, title, body, channelId: CHANNEL }] });
    }
    return;
  }
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration?.active) await registration.showNotification(title, { body, tag: String(id) });
  else new Notification(title, { body });
}

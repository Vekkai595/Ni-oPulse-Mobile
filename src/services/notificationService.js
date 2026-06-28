import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export function notificationsSupported() {
  return Capacitor.isNativePlatform() || (typeof window !== "undefined" && "Notification" in window);
}

export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions();
    if (Capacitor.getPlatform() === "android") {
      await LocalNotifications.createChannel({
        id: "enso-updates",
        name: "ENSO updates",
        description: "NiñoPulse global phase and selected country scenario updates",
        importance: 4,
        visibility: 1,
      }).catch(() => undefined);
    }
    return result.display === "granted";
  }
  if (!("Notification" in window)) return false;
  return (await Notification.requestPermission()) === "granted";
}

export async function sendLocalNotification({ title, body, id = Date.now() % 2147483647 }) {
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.schedule({
      notifications: [{ id, title, body, channelId: "enso-updates", schedule: { at: new Date(Date.now() + 250) } }],
    });
    return;
  }
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" });
  }
}

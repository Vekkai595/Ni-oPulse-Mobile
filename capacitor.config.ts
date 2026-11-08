import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.vekkai.ninopulse",
  appName: "NiñoPulse Global",
  webDir: "dist",
  backgroundColor: "#08121f",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#08121f",
  },
  plugins: {
    SystemBars: { insetsHandling: "css", initialViewportFitValueHint: "cover" },
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: false,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 300,
      launchFadeOutDuration: 250,
      backgroundColor: "#08121fff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_ninopulse",
      iconColor: "#0ab6c8",
    },
  },
};

export default config;

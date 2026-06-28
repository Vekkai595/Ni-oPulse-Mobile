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
    adjustMarginsForEdgeToEdge: "auto",
    allowMixedContent: false,
    backgroundColor: "#08121f",
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: false,
    },
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 3000,
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

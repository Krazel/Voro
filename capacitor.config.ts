import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.dmkr.voro',
  appName: 'VORO',
  webDir: 'mobile-dist',
  backgroundColor: '#030b12',
  ios: { contentInset: 'never', scrollEnabled: false },
};
export default config;

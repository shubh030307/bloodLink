import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bloodlink.app',
  appName: 'BloodLink',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'bloodlink-frontend.shubhrojyotisaha.workers.dev'
  }
};

export default config;

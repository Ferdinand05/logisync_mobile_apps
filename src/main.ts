import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonicVue } from '@ionic/vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createApp } from 'vue';

import App from './App.vue';
import { useAuth } from './composables/useAuth';
import router from './router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Self-hosted Inter; unicode-range keeps the download to the used subset */
import '@fontsource-variable/inter';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App).use(IonicVue).use(router).use(VueQueryPlugin);

const { hydrate } = useAuth();

const bootSplash = document.getElementById('boot-splash');
const bootStartedAt = Date.now();
const MIN_BOOT_SPLASH_MS = 900;

function dismissBootSplash() {
  if (!bootSplash) return;

  const wait = Math.max(0, MIN_BOOT_SPLASH_MS - (Date.now() - bootStartedAt));

  window.setTimeout(() => {
    bootSplash.classList.add('is-hidden');
    window.setTimeout(() => bootSplash.remove(), 300);
  }, wait);
}

async function prepareNativeShell() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    // Status bar styling is not available on every native build.
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // The launch splash can already be gone.
  }
}

// Restore the persisted session before the first route guard runs.
hydrate().then(() => {
  router.isReady().then(() => {
    app.mount('#app');
    dismissBootSplash();
    prepareNativeShell().catch(() => undefined);
  });
});

<template>
  <ion-page>
    <app-header title="Beranda" />

    <ion-content :fullscreen="true">
      <div class="page">
        <section class="greeting">
          <p class="greeting-label">{{ greeting }}</p>
          <h2 class="greeting-name">{{ displayName }}</h2>
          <p class="greeting-role">{{ roleLabel }}</p>
        </section>

        <h3 class="section-title">Akses Cepat</h3>

        <div class="quick-grid">
          <button
            v-for="action in quickActions"
            :key="action.label"
            type="button"
            class="quick-card"
            @click="handleAction(action)"
          >
            <span class="quick-icon">
              <img :src="action.icon" alt="" class="quick-icon-img" width="512" height="512" />
            </span>
            <span class="quick-label">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        :duration="2600"
        position="top"
        @didDismiss="toastOpen = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonToast } from '@ionic/vue';
import type { RouteLocationRaw } from 'vue-router';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';
import { useAuth } from '@/composables/useAuth';
import { getErrorMessage } from '@/utils/errors';
import { isScannerAvailable, scanBarcode } from '@/utils/scanner';

interface QuickAction {
  label: string;
  icon: string;
  route?: RouteLocationRaw;
  scan?: boolean;
}

const router = useRouter();
const { user } = useAuth();

const toastOpen = ref(false);
const toastMessage = ref('');

const quickActions: QuickAction[] = [
  {
    label: 'Barang Masuk',
    icon: '/img/menu_icons/opt/items_in.webp',
    route: { name: 'transaction', query: { type: 'in' } },
  },
  {
    label: 'Barang Keluar',
    icon: '/img/menu_icons/opt/items_out.webp',
    route: { name: 'transaction', query: { type: 'out' } },
  },
  {
    label: 'Scan Barcode',
    icon: '/img/menu_icons/opt/scanbarcode.webp',
    scan: true,
  },
  {
    label: 'Opname',
    icon: '/img/menu_icons/opt/opname.webp',
    route: { name: 'opname' },
  },
  {
    label: 'Lokasi',
    icon: '/img/menu_icons/opt/locations.webp',
    route: { name: 'stock' },
  },
  {
    label: 'Riwayat',
    icon: '/img/menu_icons/opt/transaction_history.webp',
    route: { name: 'history' },
  },
];

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
});

const displayName = computed(() => user.value?.name ?? 'Staf Gudang');

const roleLabel = computed(() => {
  const role = user.value?.role;
  if (!role) return 'Logisync';
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
});

function showToast(message: string) {
  toastMessage.value = message;
  toastOpen.value = true;
}

async function handleAction(action: QuickAction) {
  if (action.scan) {
    if (!isScannerAvailable()) {
      showToast('Scanner barcode hanya tersedia di aplikasi Android/iOS.');
      return;
    }
    try {
      const result = await scanBarcode();
      if (result) {
        await router.push({ name: 'transaction', query: { sku: result.value } });
      }
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal membuka kamera.'));
    }
    return;
  }

  if (action.route) {
    await router.push(action.route);
  }
}
</script>

<style scoped>
.page {
  padding: 20px 16px 32px;
}

.greeting {
  padding: 4px 4px 20px;
}

.greeting-label {
  margin: 0;
  font-size: 14px;
  color: var(--logisync-text-muted);
}

.greeting-name {
  margin: 4px 0 2px;
  font-size: 22px;
  font-weight: 700;
  color: var(--logisync-text);
}

.greeting-role {
  margin: 0;
  font-size: 13px;
  color: var(--logisync-text-muted);
}

.section-title {
  margin: 0 0 12px 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--logisync-text);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 14px;
  border: none;
  border-radius: 16px;
  background: var(--logisync-surface);
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.quick-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(31, 41, 55, 0.08);
}

.quick-card:focus-visible {
  outline: 2px solid var(--logisync-primary);
  outline-offset: 2px;
}

@media (hover: hover) {
  .quick-card:hover {
    box-shadow: 0 6px 18px rgba(31, 41, 55, 0.09);
  }
}

.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 108px;
  border-radius: 13px;
  background: var(--logisync-primary-soft);
}

.quick-icon-img {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.quick-label {
  display: block;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--logisync-text);
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .quick-card {
    transition: none;
  }

  .quick-card:active {
    transform: none;
  }
}
</style>

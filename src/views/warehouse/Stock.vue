<template>
  <ion-page>
    <app-header title="Lokasi" back />

    <ion-content :fullscreen="true">
      <div class="page">
        <div v-if="isLoading" class="center">
          <ion-spinner name="crescent" />
        </div>

        <template v-else-if="isError">
          <empty-state :icon="alertCircleOutline" title="Gagal memuat lokasi" :description="errorMessage" />
          <ion-button expand="block" fill="outline" @click="retry">Coba lagi</ion-button>
        </template>

        <empty-state
          v-else-if="locations.length === 0"
          :icon="locationOutline"
          title="Belum ada lokasi"
          description="Data lokasi gudang belum tersedia."
        />

        <div v-else class="list">
          <button
            v-for="location in locations"
            :key="location.id"
            type="button"
            class="location-card"
            @click="openLocation(location)"
          >
            <span class="code">{{ location.code }}</span>
            <span class="name">{{ location.name }}</span>
            <ion-icon :icon="chevronForwardOutline" class="chevron" />
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/vue';
import { alertCircleOutline, chevronForwardOutline, locationOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useLocations } from '@/api/features/location/location.queries';
import type { Location } from '@/api/features/location/types';
import AppHeader from '@/components/AppHeader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getErrorMessage } from '@/utils/errors';

const router = useRouter();
const query = useLocations();

const locations = computed<Location[]>(() => query.data.value?.items ?? []);
const isLoading = computed(() => query.isPending.value);
const isError = computed(() => query.isError.value);
const errorMessage = computed(() => getErrorMessage(query.error.value, 'Periksa koneksi lalu coba lagi.'));

function openLocation(location: Location) {
  router.push({ name: 'location-detail', params: { locationId: location.id } });
}

function retry() {
  query.refetch();
}
</script>

<style scoped>
.page {
  padding: 20px 16px 40px;
}

.center {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.location-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: var(--logisync-surface);
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
  text-align: left;
  cursor: pointer;
}

.code {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 40px;
  padding: 0 10px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--logisync-primary);
  font-size: 13px;
  font-weight: 700;
}

.name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--logisync-text);
}

.chevron {
  color: var(--logisync-text-muted);
  font-size: 18px;
}
</style>

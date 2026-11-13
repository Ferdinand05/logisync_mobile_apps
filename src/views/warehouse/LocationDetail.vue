<template>
  <ion-page>
    <app-header :title="detail?.name ?? 'Detail Lokasi'" back back-href="/stock" />

    <ion-content :fullscreen="true">
      <div class="page">
        <div v-if="isLoading" class="center">
          <ion-spinner name="crescent" />
        </div>

        <template v-else-if="isError">
          <empty-state :icon="alertCircleOutline" title="Gagal memuat stok" :description="errorMessage" />
          <ion-button expand="block" fill="outline" @click="retry">Coba lagi</ion-button>
        </template>

        <template v-else>
          <section v-if="detail" class="summary">
            <span class="code">{{ detail.code }}</span>
            <div>
              <p class="name">{{ detail.name }}</p>
              <p class="count">{{ entries.length }} jenis barang</p>
            </div>
          </section>

          <empty-state
            v-if="entries.length === 0"
            :icon="cubeOutline"
            title="Lokasi masih kosong"
            description="Belum ada barang yang tercatat pada lokasi ini."
          />

          <div v-else class="list">
            <article v-for="entry in entries" :key="entry.key" class="stock-row">
              <div class="stock-main">
                <p class="stock-name">{{ entry.name }}</p>
                <p class="stock-sku">{{ entry.sku }}</p>
              </div>
              <span class="stock-qty">{{ formatQty(entry.qty) }}</span>
            </article>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonPage, IonSpinner } from '@ionic/vue';
import { alertCircleOutline, cubeOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useLocationDetail } from '@/api/features/location/location.queries';
import { toStockEntryView } from '@/api/features/location/types';
import AppHeader from '@/components/AppHeader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getErrorMessage } from '@/utils/errors';
import { formatQty } from '@/utils/format';

const route = useRoute();
const locationId = computed(() => Number(route.params.locationId));

const query = useLocationDetail(locationId);

const detail = computed(() => query.data.value ?? null);
const entries = computed(() => (detail.value?.items ?? []).map(toStockEntryView));
const isLoading = computed(() => query.isPending.value);
const isError = computed(() => query.isError.value);
const errorMessage = computed(() => getErrorMessage(query.error.value, 'Periksa koneksi lalu coba lagi.'));

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

.summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  margin-bottom: 16px;
  background: var(--logisync-surface);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
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
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--logisync-text);
}

.count {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--logisync-text-muted);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--logisync-surface);
  border-radius: 12px;
}

.stock-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--logisync-text);
}

.stock-sku {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--logisync-text-muted);
}

.stock-qty {
  font-size: 16px;
  font-weight: 700;
  color: var(--logisync-primary);
}
</style>

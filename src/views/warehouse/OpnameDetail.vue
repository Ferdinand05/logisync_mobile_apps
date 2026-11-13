<template>
  <ion-page>
    <app-header :title="session?.audit_number ?? 'Detail Opname'" back back-href="/opname" />

    <ion-content :fullscreen="true">
      <div class="page">
        <div v-if="isLoading" class="center">
          <ion-spinner name="crescent" />
        </div>

        <template v-else-if="isError">
          <empty-state :icon="alertCircleOutline" title="Gagal memuat sesi" :description="errorMessage" />
          <ion-button expand="block" fill="outline" @click="retry">Coba lagi</ion-button>
        </template>

        <template v-else>
          <section v-if="session" class="summary">
            <div class="summary-head">
              <span class="status-badge" :style="badgeStyle(session.status)">
                {{ toLabel(session.status) }}
              </span>
              <span class="method">{{ toLabel(session.audit_method) }}</span>
            </div>
            <p class="meta">
              <ion-icon :icon="locationOutline" />
              {{ sessionLocationLabel }}
            </p>
            <p class="meta">
              <ion-icon :icon="calendarOutline" />
              {{ formatDateTime(session.created_at) }}
            </p>
          </section>

          <ion-button expand="block" class="scan-button" @click="openPanel">
            <ion-icon slot="start" :icon="scanOutline" />
            Scan / Input Item
          </ion-button>

          <section v-if="panelOpen" class="scan-panel">
            <div class="panel-head">
              <h3 class="panel-title">Input Hasil Hitung</h3>
              <ion-button fill="clear" size="small" @click="closePanel">Tutup</ion-button>
            </div>

            <div class="field">
              <label class="field-label" for="audit-sku">SKU Barang</label>
              <div class="sku-row">
                <ion-input
                  id="audit-sku"
                  v-model="sku"
                  placeholder="Scan atau ketik SKU"
                  autocomplete="off"
                  :disabled="isPending"
                />
                <ion-button class="icon-button" fill="outline" :disabled="isPending" @click="scanIntoPanel">
                  <ion-icon slot="icon-only" :icon="scanOutline" />
                </ion-button>
              </div>
            </div>

            <div v-if="!session?.location_id" class="field">
              <label class="field-label" for="audit-location">Lokasi</label>
              <ion-select
                id="audit-location"
                v-model="manualLocationId"
                interface="action-sheet"
                placeholder="Pilih lokasi"
                :disabled="isPending"
                :cancel-text="'Batal'"
              >
                <ion-select-option v-for="location in locations" :key="location.id" :value="location.id">
                  {{ location.code }} — {{ location.name }}
                </ion-select-option>
              </ion-select>
            </div>

            <div class="field">
              <label class="field-label" for="audit-qty">Qty Aktual</label>
              <ion-input
                id="audit-qty"
                v-model.number="actualQty"
                type="number"
                inputmode="numeric"
                min="0"
                placeholder="0"
                :disabled="isPending"
              />
            </div>

            <ion-button expand="block" color="success" class="save-button" :disabled="isPending" @click="save">
              <ion-spinner v-if="isPending" name="crescent" />
              <span v-else>Simpan Hasil Audit</span>
            </ion-button>
          </section>

          <h3 class="section-title">Item Audit</h3>

          <div v-if="itemsLoading" class="center">
            <ion-spinner name="crescent" />
          </div>

          <empty-state
            v-else-if="items.length === 0"
            :icon="cubeOutline"
            title="Belum ada item"
            description="Item audit akan muncul setelah sesi memiliki daftar barang."
          />

          <div v-else class="list">
            <article v-for="item in items" :key="item.id" class="item-row">
              <div class="item-main">
                <p class="item-name">{{ item.item.name }}</p>
                <p class="item-sku">{{ item.item.sku }} · {{ item.location.code }}</p>
              </div>
              <div class="item-qty">
                <p class="qty-value">{{ formatQty(item.actual_qty ?? item.system_qty) }}</p>
                <p class="qty-label">
                  sistem {{ formatQty(item.system_qty) }}
                  <template v-if="item.variance !== null && item.variance !== 0">
                    · selisih {{ item.variance > 0 ? '+' : '' }}{{ formatQty(item.variance) }}
                  </template>
                </p>
              </div>
              <span class="scan-state" :class="{ scanned: item.is_scanned }">
                {{ item.is_scanned ? 'Sudah' : 'Belum' }}
              </span>
            </article>

            <ion-infinite-scroll :disabled="!hasNextPage" @ionInfinite="loadMore">
              <ion-infinite-scroll-content loading-spinner="crescent" loading-text="Memuat..." />
            </ion-infinite-scroll>
          </div>
        </template>
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
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToast,
} from '@ionic/vue';
import { alertCircleOutline, calendarOutline, cubeOutline, locationOutline, scanOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useAuditItems, useAuditSession } from '@/api/features/audit/audit.queries';
import { useScanAuditItem } from '@/api/features/audit/audit.mutate';
import type { AuditItem, AuditSessionDetail } from '@/api/features/audit/types';
import { useLocations } from '@/api/features/location/location.queries';
import AppHeader from '@/components/AppHeader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getErrorMessage } from '@/utils/errors';
import { formatDateTime, formatQty, toLabel } from '@/utils/format';
import { isScannerAvailable, scanBarcode } from '@/utils/scanner';

const route = useRoute();
const sessionId = computed(() => Number(route.params.auditSessionId));

const sessionQuery = useAuditSession(sessionId);
const itemsQuery = useAuditItems(sessionId);
const scanMutation = useScanAuditItem(sessionId);
const locationsQuery = useLocations();

const session = computed<AuditSessionDetail | null>(() => sessionQuery.data.value ?? null);
const items = computed<AuditItem[]>(() => itemsQuery.data.value?.pages.flatMap((page) => page.items) ?? []);
const locations = computed(() => locationsQuery.data.value?.items ?? []);

const isLoading = computed(() => sessionQuery.isPending.value);
const isError = computed(() => sessionQuery.isError.value);
const itemsLoading = computed(() => itemsQuery.isPending.value);
const hasNextPage = computed(() => Boolean(itemsQuery.hasNextPage.value));
const isPending = computed(() => scanMutation.isPending.value);
const errorMessage = computed(() => getErrorMessage(sessionQuery.error.value, 'Periksa koneksi lalu coba lagi.'));

const panelOpen = ref(false);
const sku = ref('');
const actualQty = ref<number | null>(null);
const manualLocationId = ref<number | null>(null);
const toastOpen = ref(false);
const toastMessage = ref('');

const sessionLocationLabel = computed(() => {
  const locationId = session.value?.location_id;
  if (!locationId) {
    return 'Semua lokasi';
  }
  const location = locations.value.find((entry) => entry.id === locationId);
  return location ? `${location.code} — ${location.name}` : `Lokasi #${locationId}`;
});

const statusColors: Record<string, { color: string; tint: string }> = {
  draft: { color: 'var(--logisync-text-muted)', tint: 'rgba(107, 114, 128, 0.12)' },
  in_progress: { color: 'var(--logisync-warning)', tint: 'rgba(217, 119, 6, 0.12)' },
  completed: { color: 'var(--logisync-success)', tint: 'rgba(5, 150, 105, 0.12)' },
  cancelled: { color: 'var(--logisync-danger)', tint: 'rgba(220, 38, 38, 0.12)' },
};

function badgeStyle(status: string) {
  const meta = statusColors[status] ?? statusColors.draft;
  return { color: meta.color, background: meta.tint };
}

function showToast(message: string) {
  toastMessage.value = message;
  toastOpen.value = true;
}

function openPanel() {
  panelOpen.value = true;
}

function closePanel() {
  panelOpen.value = false;
}

async function scanIntoPanel() {
  if (!isScannerAvailable()) {
    showToast('Scanner barcode hanya tersedia di aplikasi Android/iOS.');
    return;
  }
  try {
    const result = await scanBarcode();
    if (result) {
      sku.value = result.value;
    }
  } catch (error) {
    showToast(getErrorMessage(error, 'Gagal membuka kamera.'));
  }
}

async function save() {
  const locationId = session.value?.location_id ?? manualLocationId.value;

  if (!sku.value.trim()) {
    showToast('SKU barang wajib diisi.');
    return;
  }
  if (!locationId) {
    showToast('Pilih lokasi terlebih dahulu.');
    return;
  }
  if (actualQty.value === null || Number(actualQty.value) < 0) {
    showToast('Qty aktual tidak valid.');
    return;
  }

  try {
    await scanMutation.mutateAsync({
      sku: sku.value.trim(),
      location_id: locationId,
      actual_qty: Number(actualQty.value),
    });
    showToast('Hasil audit berhasil disimpan.');
    sku.value = '';
    actualQty.value = null;
    panelOpen.value = false;
  } catch (error) {
    showToast(getErrorMessage(error));
  }
}

async function loadMore(event: CustomEvent) {
  const target = event.target as HTMLIonInfiniteScrollElement;
  if (hasNextPage.value) {
    await itemsQuery.fetchNextPage();
  }
  await target.complete();
}

function retry() {
  sessionQuery.refetch();
  itemsQuery.refetch();
}
</script>

<style scoped>
.page {
  padding: 20px 16px 40px;
}

.center {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.summary {
  padding: 16px;
  margin-bottom: 14px;
  background: var(--logisync-surface);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.method {
  font-size: 12px;
  color: var(--logisync-text-muted);
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--logisync-text-muted);
}

.scan-button {
  --border-radius: 10px;
  height: 46px;
  font-weight: 600;
  text-transform: none;
  margin-bottom: 14px;
}

.scan-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  margin-bottom: 20px;
  background: var(--logisync-surface);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--logisync-text);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--logisync-text);
}

ion-input,
ion-select {
  --background: #f9fafb;
  --border-radius: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  border: 1px solid var(--logisync-border);
  border-radius: 10px;
  font-size: 15px;
}

.sku-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.sku-row ion-input {
  flex: 1;
}

.icon-button {
  margin: 0;
  height: auto;
  --color: var(--logisync-warning);
  --border-color: var(--logisync-warning);
}

.save-button {
  --border-radius: 10px;
  height: 44px;
  font-weight: 600;
  text-transform: none;
}

.section-title {
  margin: 4px 0 10px 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--logisync-text);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--logisync-surface);
  border-radius: 12px;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--logisync-text);
}

.item-sku {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--logisync-text-muted);
}

.item-qty {
  text-align: right;
}

.qty-value {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--logisync-text);
}

.qty-label {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--logisync-text-muted);
}

.scan-state {
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(107, 114, 128, 0.12);
  color: var(--logisync-text-muted);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.scan-state.scanned {
  background: rgba(5, 150, 105, 0.12);
  color: var(--logisync-success);
}
</style>

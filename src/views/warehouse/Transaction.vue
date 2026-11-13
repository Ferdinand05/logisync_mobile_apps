<template>
  <ion-page>
    <app-header title="Transaksi" />

    <ion-content :fullscreen="true">
      <div class="page">
        <ion-segment v-model="selectedType" class="segment">
          <ion-segment-button value="in">
            <ion-icon :icon="arrowDownCircleOutline" />
            <ion-label>Barang Masuk</ion-label>
          </ion-segment-button>
          <ion-segment-button value="out">
            <ion-icon :icon="arrowUpCircleOutline" />
            <ion-label>Barang Keluar</ion-label>
          </ion-segment-button>
        </ion-segment>

        <form class="movement-form" @submit.prevent="submit">
          <div class="field">
            <label class="field-label" for="sku">SKU Barang</label>
            <div class="sku-row">
              <ion-input
                id="sku"
                v-model="sku"
                placeholder="Scan atau ketik SKU"
                autocomplete="off"
                :disabled="isPending"
              />
              <ion-button class="scan-button" fill="outline" :disabled="isPending" @click="startScan">
                <ion-icon slot="icon-only" :icon="scanOutline" />
              </ion-button>
            </div>
            <p v-if="itemName" class="item-hint">
              <ion-icon :icon="cubeOutline" />
              {{ itemName }}
            </p>
            <p v-else-if="lookupSku && lookup.isError.value" class="item-hint hint-muted">SKU tidak ditemukan.</p>
          </div>

          <div class="field">
            <label class="field-label" for="location">Lokasi</label>
            <ion-select
              id="location"
              v-model="locationId"
              interface="action-sheet"
              placeholder="Pilih lokasi"
              :disabled="isPending || locationsQuery.isPending.value"
              :cancel-text="'Batal'"
            >
              <ion-select-option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.code }} — {{ location.name }}
              </ion-select-option>
            </ion-select>
          </div>

          <div class="field">
            <label class="field-label" for="qty">Jumlah (Qty)</label>
            <ion-input
              id="qty"
              v-model.number="qty"
              type="number"
              inputmode="numeric"
              min="1"
              placeholder="0"
              :disabled="isPending"
            />
          </div>

          <div class="field">
            <label class="field-label" for="reference">No. Referensi</label>
            <ion-input
              id="reference"
              v-model="referenceNo"
              placeholder="Contoh: PO-2026-001"
              autocomplete="off"
              :disabled="isPending"
            />
          </div>

          <div class="field">
            <label class="field-label" for="notes">Catatan (opsional)</label>
            <ion-textarea
              id="notes"
              v-model="notes"
              :rows="3"
              placeholder="Tambahkan catatan bila perlu"
              :disabled="isPending"
            />
          </div>

          <ion-button
            type="submit"
            expand="block"
            class="submit-button"
            :color="selectedType === 'in' ? 'success' : 'primary'"
            :disabled="isPending"
          >
            <ion-spinner v-if="isPending" name="crescent" />
            <span v-else>{{ selectedType === 'in' ? 'Catat Barang Masuk' : 'Catat Barang Keluar' }}</span>
          </ion-button>
        </form>
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
  IonInput,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonToast,
} from '@ionic/vue';
import { arrowDownCircleOutline, arrowUpCircleOutline, cubeOutline, scanOutline } from 'ionicons/icons';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useItemLookup } from '@/api/features/item/item.queries';
import { useLocations } from '@/api/features/location/location.queries';
import { useStockIn, useStockOut } from '@/api/features/transaction/transaction.mutate';
import type { StockMovementRequest } from '@/api/features/transaction/types';
import AppHeader from '@/components/AppHeader.vue';
import { getErrorMessage } from '@/utils/errors';
import { isScannerAvailable, scanBarcode } from '@/utils/scanner';

const route = useRoute();
const router = useRouter();

const selectedType = computed<'in' | 'out'>({
  get: () => (route.query.type === 'out' ? 'out' : 'in'),
  set: (value) => {
    router.replace({ name: 'transaction', query: { ...route.query, type: value } });
  },
});

const sku = ref(typeof route.query.sku === 'string' ? route.query.sku : '');
const locationId = ref<number | null>(null);
const qty = ref<number | null>(1);
const referenceNo = ref('');
const notes = ref('');
const toastOpen = ref(false);
const toastMessage = ref('');

// Debounce the lookup so typing a SKU does not fire a request per keystroke.
const lookupSku = ref(sku.value.trim());
let lookupTimer: ReturnType<typeof setTimeout> | undefined;

watch(sku, (value) => {
  clearTimeout(lookupTimer);
  lookupTimer = setTimeout(() => {
    lookupSku.value = value.trim();
  }, 500);
});

const lookup = useItemLookup(lookupSku);
const itemName = computed(() => lookup.data.value?.name ?? '');

const locationsQuery = useLocations();
const locations = computed(() => locationsQuery.data.value?.items ?? []);

const stockIn = useStockIn();
const stockOut = useStockOut();

const isPending = computed(() => stockIn.isPending.value || stockOut.isPending.value);

// Pre-select the only location so repeated entries are faster.
watch(locations, (list) => {
  if (locationId.value === null && list.length === 1) {
    locationId.value = list[0].id;
  }
});

// Keep the form in sync when the SKU arrives from the home scan shortcut.
watch(
  () => route.query.sku,
  (value) => {
    if (typeof value === 'string' && value !== sku.value) {
      sku.value = value;
    }
  },
);

function showToast(message: string) {
  toastMessage.value = message;
  toastOpen.value = true;
}

async function startScan() {
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

function resetForm() {
  sku.value = '';
  qty.value = 1;
  referenceNo.value = '';
  notes.value = '';
  lookupSku.value = '';
}

async function submit() {
  if (!sku.value.trim()) {
    showToast('SKU barang wajib diisi.');
    return;
  }
  if (!locationId.value) {
    showToast('Pilih lokasi terlebih dahulu.');
    return;
  }
  if (!qty.value || Number(qty.value) < 1) {
    showToast('Jumlah minimal 1.');
    return;
  }
  if (!referenceNo.value.trim()) {
    showToast('No. referensi wajib diisi.');
    return;
  }

  const payload: StockMovementRequest = {
    sku: sku.value.trim(),
    location_id: locationId.value,
    qty: Number(qty.value),
    reference_no: referenceNo.value.trim(),
    notes: notes.value.trim() || null,
  };

  try {
    if (selectedType.value === 'in') {
      await stockIn.mutateAsync(payload);
      showToast('Barang masuk berhasil dicatat.');
    } else {
      await stockOut.mutateAsync(payload);
      showToast('Barang keluar berhasil dicatat.');
    }
    resetForm();
  } catch (error) {
    showToast(getErrorMessage(error));
  }
}
</script>

<style scoped>
.page {
  padding: 20px 16px 40px;
}

.segment {
  --background: var(--logisync-surface);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.movement-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background: var(--logisync-surface);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
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
ion-select,
ion-textarea {
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

.scan-button {
  --border-radius: 10px;
  margin: 0;
  height: auto;
  --color: var(--logisync-warning);
  --border-color: var(--logisync-warning);
}

.item-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  color: var(--logisync-success);
}

.hint-muted {
  color: var(--logisync-text-muted);
}

.submit-button {
  margin-top: 4px;
  --border-radius: 10px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
}
</style>

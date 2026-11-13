<template>
  <ion-page>
    <app-header title="Riwayat Transaksi" />

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="refresh">
        <ion-refresher-content pulling-text="Tarik untuk memuat ulang" refreshing-text="Memuat..." />
      </ion-refresher>

      <div class="page">
        <ion-segment v-model="filter" class="segment">
          <ion-segment-button value="all"><ion-label>Semua</ion-label></ion-segment-button>
          <ion-segment-button value="in"><ion-label>Masuk</ion-label></ion-segment-button>
          <ion-segment-button value="out"><ion-label>Keluar</ion-label></ion-segment-button>
          <ion-segment-button value="adjustment"><ion-label>Adjust</ion-label></ion-segment-button>
        </ion-segment>

        <div v-if="isLoading" class="center">
          <ion-spinner name="crescent" />
        </div>

        <template v-else-if="isError">
          <empty-state :icon="alertCircleOutline" title="Gagal memuat riwayat" :description="errorMessage" />
          <ion-button expand="block" fill="outline" @click="retry">Coba lagi</ion-button>
        </template>

        <empty-state
          v-else-if="transactions.length === 0"
          :icon="timeOutline"
          title="Belum ada transaksi"
          description="Transaksi barang masuk dan keluar akan tercatat di sini."
        />

        <div v-else class="list">
          <article v-for="transaction in transactions" :key="transaction.id" class="card">
            <div class="card-head">
              <span class="type-badge" :style="badgeStyle(transaction.type)">
                {{ typeMeta(transaction.type).label }}
              </span>
              <span class="date">{{ formatDateTime(transaction.created_at) }}</span>
            </div>

            <div class="card-body">
              <div>
                <p class="item-name">{{ transaction.item?.name ?? 'Barang' }}</p>
                <p class="item-sku">{{ transaction.item?.sku ?? '-' }}</p>
              </div>
              <p class="qty" :style="{ color: typeMeta(transaction.type).color }">
                {{ typeMeta(transaction.type).sign }}{{ formatQty(transaction.quantity) }}
              </p>
            </div>

            <div class="card-foot">
              <span>
                <ion-icon :icon="locationOutline" />
                {{ transaction.location?.name ?? '-' }}
              </span>
              <span>
                <ion-icon :icon="documentTextOutline" />
                {{ transaction.reference_no ?? '-' }}
              </span>
            </div>

            <p v-if="transaction.notes" class="notes">{{ transaction.notes }}</p>
            <p v-if="transaction.user" class="user">oleh {{ transaction.user.name }}</p>
          </article>

          <ion-infinite-scroll :disabled="!hasNextPage" @ionInfinite="loadMore">
            <ion-infinite-scroll-content loading-spinner="crescent" loading-text="Memuat..." />
          </ion-infinite-scroll>
        </div>
      </div>
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
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/vue';
import { alertCircleOutline, documentTextOutline, locationOutline, timeOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';

import { useTransactions } from '@/api/features/transaction/transaction.queries';
import type { TransactionFilter } from '@/api/features/transaction/transaction.queries';
import type { Transaction, TransactionType } from '@/api/features/transaction/types';
import AppHeader from '@/components/AppHeader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getErrorMessage } from '@/utils/errors';
import { formatDateTime, formatQty } from '@/utils/format';

const filter = ref<TransactionFilter>('all');

const query = useTransactions(filter);

const transactions = computed<Transaction[]>(() => query.data.value?.pages.flatMap((page) => page.items) ?? []);
const isLoading = computed(() => query.isPending.value);
const isError = computed(() => query.isError.value);
const hasNextPage = computed(() => Boolean(query.hasNextPage.value));
const errorMessage = computed(() => getErrorMessage(query.error.value, 'Periksa koneksi lalu coba lagi.'));

const typeMetaMap: Record<TransactionType, { label: string; color: string; tint: string; sign: string }> = {
  in: { label: 'Masuk', color: 'var(--logisync-success)', tint: 'rgba(5, 150, 105, 0.12)', sign: '+' },
  out: { label: 'Keluar', color: 'var(--logisync-primary)', tint: 'rgba(37, 99, 235, 0.12)', sign: '-' },
  adjustment: {
    label: 'Penyesuaian',
    color: 'var(--logisync-warning)',
    tint: 'rgba(217, 119, 6, 0.12)',
    sign: '±',
  },
};

function typeMeta(type: TransactionType) {
  return typeMetaMap[type] ?? typeMetaMap.adjustment;
}

function badgeStyle(type: TransactionType) {
  const meta = typeMeta(type);
  return { color: meta.color, background: meta.tint };
}

async function refresh(event: CustomEvent) {
  await query.refetch();
  await (event.target as HTMLIonRefresherElement).complete();
}

async function loadMore(event: CustomEvent) {
  const target = event.target as HTMLIonInfiniteScrollElement;
  if (hasNextPage.value) {
    await query.fetchNextPage();
  }
  await target.complete();
}

function retry() {
  query.refetch();
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
  margin-bottom: 16px;
}

.center {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  padding: 14px 16px;
  background: var(--logisync-surface);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.type-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.date {
  font-size: 12px;
  color: var(--logisync-text-muted);
}

.card-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.item-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--logisync-text);
}

.item-sku {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--logisync-text-muted);
}

.qty {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.card-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--logisync-text-muted);
}

.card-foot span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.notes {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--logisync-text);
}

.user {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--logisync-text-muted);
}
</style>

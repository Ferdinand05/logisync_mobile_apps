<template>
  <ion-page>
    <app-header title="Opname" />

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="refresh">
        <ion-refresher-content pulling-text="Tarik untuk memuat ulang" refreshing-text="Memuat..." />
      </ion-refresher>

      <div class="page">
        <div v-if="isLoading" class="center">
          <ion-spinner name="crescent" />
        </div>

        <template v-else-if="isError">
          <empty-state :icon="alertCircleOutline" title="Gagal memuat sesi opname" :description="errorMessage" />
          <ion-button expand="block" fill="outline" @click="retry">Coba lagi</ion-button>
        </template>

        <empty-state
          v-else-if="sessions.length === 0"
          :icon="clipboardOutline"
          title="Belum ada sesi opname"
          description="Sesi audit stok yang dibuat akan tampil di sini."
        />

        <div v-else class="list">
          <button
            v-for="session in sessions"
            :key="session.id"
            type="button"
            class="session-card"
            @click="openSession(session)"
          >
            <div class="card-head">
              <span class="number">{{ session.audit_number }}</span>
              <span class="status-badge" :style="badgeStyle(session.status)">
                {{ toLabel(session.status) }}
              </span>
            </div>

            <p class="location">
              <ion-icon :icon="locationOutline" />
              {{ session.location?.name ?? 'Semua lokasi' }}
              <template v-if="session.category?.name"> · {{ session.category.name }}</template>
            </p>

            <div class="card-foot">
              <span>{{ toLabel(session.audit_method) }}</span>
              <span v-if="session.items_total">{{ progressLabel(session) }}</span>
              <span>{{ formatDateTime(session.created_at) }}</span>
            </div>
          </button>

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
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/vue';
import { alertCircleOutline, clipboardOutline, locationOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useAuditSessions } from '@/api/features/audit/audit.queries';
import type { AuditSessionSummary } from '@/api/features/audit/types';
import AppHeader from '@/components/AppHeader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getErrorMessage } from '@/utils/errors';
import { formatDateTime, toLabel } from '@/utils/format';

const router = useRouter();
const query = useAuditSessions();

const sessions = computed<AuditSessionSummary[]>(() => query.data.value?.pages.flatMap((page) => page.items) ?? []);
const isLoading = computed(() => query.isPending.value);
const isError = computed(() => query.isError.value);
const hasNextPage = computed(() => Boolean(query.hasNextPage.value));
const errorMessage = computed(() => getErrorMessage(query.error.value, 'Periksa koneksi lalu coba lagi.'));

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

function progressLabel(session: AuditSessionSummary) {
  return `${session.items_scanned ?? '0'}/${session.items_total ?? '0'} item`;
}

function openSession(session: AuditSessionSummary) {
  router.push({ name: 'opname-detail', params: { auditSessionId: session.id } });
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

.session-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: var(--logisync-surface);
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
  text-align: left;
  cursor: pointer;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.number {
  font-size: 15px;
  font-weight: 700;
  color: var(--logisync-text);
}

.status-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.location {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-size: 13px;
  color: var(--logisync-text);
}

.card-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--logisync-text-muted);
}
</style>

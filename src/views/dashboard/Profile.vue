<template>
  <ion-page>
    <app-header title="Profil" back />

    <ion-content :fullscreen="true">
      <div class="page">
        <section class="profile-card">
          <div class="avatar">{{ initials }}</div>
          <h2 class="name">{{ user?.name ?? 'Pengguna' }}</h2>
          <p class="email">{{ user?.email ?? '-' }}</p>
          <span class="role-badge">{{ roleLabel }}</span>
        </section>

        <ion-button
          expand="block"
          color="danger"
          fill="outline"
          class="logout-button"
          :disabled="isPending"
          @click="logout"
        >
          <ion-spinner v-if="isPending" name="crescent" slot="start" />
          <ion-icon v-else slot="start" :icon="logOutOutline" />
          Keluar
        </ion-button>

        <p class="version">Logisync v{{ appVersion }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useLogout } from '@/api/features/auth/auth.mutate';
import AppHeader from '@/components/AppHeader.vue';
import { useAuth } from '@/composables/useAuth';

const appVersion = '0.0.1';

const router = useRouter();
const { user } = useAuth();
const logoutMutation = useLogout();

const isPending = computed(() => logoutMutation.isPending.value);

const initials = computed(() => {
  const name = user.value?.name?.trim();
  if (!name) return 'LG';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
});

const roleLabel = computed(() => {
  const role = user.value?.role;
  if (!role) return 'Staf';
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
});

async function logout() {
  await logoutMutation.mutateAsync().catch(() => undefined);
  await router.replace({ name: 'login' });
}
</script>

<style scoped>
.page {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 20px;
  background: var(--logisync-surface);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: #ffffff;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
}

.name {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: var(--logisync-text);
}

.email {
  margin: 0;
  font-size: 14px;
  color: var(--logisync-text-muted);
}

.role-badge {
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--ion-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.logout-button {
  --border-radius: 10px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
}

.version {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: var(--logisync-text-muted);
}
</style>

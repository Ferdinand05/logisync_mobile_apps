<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <div class="header-row">
        <div class="header-left">
          <ion-buttons v-if="back">
            <ion-back-button :default-href="backHref ?? '/home'" text="" />
          </ion-buttons>
          <router-link v-else to="/home" class="brand" aria-label="Logisync, ke Beranda">
            <img src="/img/logo.png" alt="" class="brand-logo" />
            <span class="brand-word" aria-hidden="true">
              <span class="brand-logi">Logi</span><span class="brand-sync">Sync</span>
            </span>
          </router-link>

          <template v-if="title">
            <span v-if="!back" class="header-divider" aria-hidden="true" />
            <h1 class="header-title" :class="{ 'header-title-stack': back }">{{ title }}</h1>
          </template>
        </div>

        <ion-button fill="clear" class="profile-button" aria-label="Buka profil" @click="openProfile">
          <ion-icon slot="icon-only" :icon="personCircleOutline" />
        </ion-button>
      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonToolbar } from '@ionic/vue';
import { personCircleOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

defineProps<{
  title?: string;
  back?: boolean;
  backHref?: string;
}>();

const router = useRouter();

function openProfile() {
  router.push({ name: 'profile' });
}
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  text-decoration: none;
}

.brand-logo {
  display: block;
  height: 30px;
  width: auto;
  object-fit: contain;
}

.brand-word {
  display: inline-flex;
  align-items: baseline;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  transform: translateY(0.5px);
}

.brand-logi {
  color: var(--logisync-brand-ink);
}

.brand-sync {
  color: var(--logisync-brand-orange);
}

.header-divider {
  width: 1px;
  height: 18px;
  flex-shrink: 0;
  background: var(--logisync-border);
}

.header-title {
  margin: 0;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--logisync-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-title-stack {
  font-size: 17px;
  color: var(--logisync-text);
}

.profile-button {
  flex-shrink: 0;
  --padding-start: 6px;
  --padding-end: 6px;
  margin: 0;
  font-size: 28px;
  color: var(--logisync-primary);
}

@media (max-width: 360px) {
  .brand-logo {
    height: 28px;
  }

  .brand-word {
    font-size: 16px;
  }

  .header-title {
    font-size: 12px;
  }

  .header-title-stack {
    font-size: 16px;
  }
}
</style>

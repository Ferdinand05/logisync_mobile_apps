<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="app-tab-bar">
        <ion-tab-button tab="home" href="/home">
          <ion-icon :icon="homeOutline" aria-hidden="true" />
          <ion-label>Beranda</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="opname" href="/opname">
          <ion-icon :icon="clipboardOutline" aria-hidden="true" />
          <ion-label>Opname</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="transaction" href="/transaction">
          <ion-icon :icon="swapHorizontalOutline" aria-hidden="true" />
          <ion-label>Transaksi</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="history" href="/history">
          <ion-icon :icon="timeOutline" aria-hidden="true" />
          <ion-label>Riwayat</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { clipboardOutline, homeOutline, swapHorizontalOutline, timeOutline } from 'ionicons/icons';
</script>

<template>
  <div class="empty-state">
    <div class="icon-wrap">
      <ion-icon :icon="icon" aria-hidden="true" />
    </div>
    <h2 class="title">{{ title }}</h2>
    <p class="description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import type { Component } from 'vue';

defineProps<{
  icon: Component | string;
  title: string;
  description: string;
}>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  gap: 8px;
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.1);
  color: var(--logisync-primary);
  font-size: 30px;
  margin-bottom: 8px;
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--logisync-text);
}

.description {
  margin: 0;
  max-width: 280px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--logisync-text-muted);
}
</style>

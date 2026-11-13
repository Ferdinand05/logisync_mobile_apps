<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="login-wrapper">
        <div class="brand-block">
          <img src="/img/logo.png" alt="Logisync" class="logo" />
          <h1 class="title">Selamat datang</h1>
          <p class="subtitle">Masuk untuk mengelola stok gudang Anda</p>
        </div>

        <form class="login-card" @submit.prevent="submit">
          <label class="field-label" for="email">Email</label>
          <ion-input
            id="email"
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="nama@perusahaan.com"
            :disabled="isPending"
          />

          <label class="field-label" for="password">Password</label>
          <ion-input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Masukkan password"
            :disabled="isPending"
          />

          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <ion-button type="submit" expand="block" class="submit-button" :disabled="isPending || !canSubmit">
            <ion-spinner v-if="isPending" name="crescent" />
            <span v-else>Masuk</span>
          </ion-button>
        </form>

        <p class="footer-text">Logisync · Sistem Manajemen Gudang</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonInput, IonPage, IonSpinner } from '@ionic/vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useLogin } from '@/api/features/auth/auth.mutate';
import { getErrorMessage } from '@/utils/errors';

const router = useRouter();
const route = useRoute();
const loginMutation = useLogin();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const isPending = computed(() => loginMutation.isPending.value);
const canSubmit = computed(() => email.value.trim().length > 0 && password.value.length > 0);

async function submit() {
  if (!canSubmit.value) {
    errorMessage.value = 'Email dan password wajib diisi.';
    return;
  }

  errorMessage.value = '';

  try {
    await loginMutation.mutateAsync({
      email: email.value.trim(),
      password: password.value,
      device_name: 'logisync-mobile',
    });

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home';
    await router.replace(redirect.startsWith('/') ? redirect : '/home');
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Email atau password salah.');
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  padding: 32px 20px;
  gap: 28px;
}

.brand-block {
  text-align: center;
}

.logo {
  height: 64px;
  width: auto;
  object-fit: contain;
}

.title {
  margin: 20px 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--logisync-text);
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--logisync-text-muted);
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--logisync-surface);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.08);
}

.field-label {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--logisync-text);
}

ion-input {
  --background: #f9fafb;
  --border-radius: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  border: 1px solid var(--logisync-border);
  border-radius: 10px;
  font-size: 15px;
}

.error-text {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--logisync-danger);
}

.submit-button {
  margin-top: 16px;
  --border-radius: 10px;
  --background: var(--logisync-primary);
  font-weight: 600;
  text-transform: none;
  height: 48px;
}

.footer-text {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: var(--logisync-text-muted);
}
</style>

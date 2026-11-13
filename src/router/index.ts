import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import { getToken } from '@/utils/storage';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
  },
  {
    path: '/',
    component: () => import('@/views/TabsLayout.vue'),
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/dashboard/Home.vue'),
      },
      {
        path: 'opname',
        name: 'opname',
        component: () => import('@/views/warehouse/Opname.vue'),
      },
      {
        path: 'transaction',
        name: 'transaction',
        component: () => import('@/views/warehouse/Transaction.vue'),
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('@/views/warehouse/History.vue'),
      },
    ],
  },
  {
    path: '/opname/:auditSessionId',
    name: 'opname-detail',
    component: () => import('@/views/warehouse/OpnameDetail.vue'),
  },
  {
    path: '/stock',
    name: 'stock',
    component: () => import('@/views/warehouse/Stock.vue'),
  },
  {
    path: '/stock/:locationId',
    name: 'location-detail',
    component: () => import('@/views/warehouse/LocationDetail.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/dashboard/Profile.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const token = await getToken();

  if (to.name === 'login') {
    return token ? { name: 'home' } : true;
  }

  if (!token) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;

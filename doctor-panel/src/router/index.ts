import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/auth/login', component: () => import('@/views/auth/LoginView.vue') },
    { path: '/auth/register', component: () => import('@/views/auth/RegisterView.vue') },
    { path: '/auth/pending', component: () => import('@/views/auth/PendingView.vue') },
    { path: '/dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/patients', component: () => import('@/views/PatientsView.vue') },
    { path: '/schedule', component: () => import('@/views/ScheduleView.vue') },
    { path: '/statistics', component: () => import('@/views/StatisticsView.vue') },
    { path: '/profile', component: () => import('@/views/ProfileView.vue') },
    { path: '/results', component: () => import('@/views/ResultsView.vue') },
  ]
})

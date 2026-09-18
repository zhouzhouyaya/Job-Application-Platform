<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- 侧边栏 - 桌面端 -->
    <aside class="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div class="px-5 py-5 border-b border-slate-100">
        <h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span class="text-2xl">💼</span>
          求职工作台
        </h1>
        <p class="text-xs text-slate-400 mt-1">本地存储 · 数据安全</p>
      </div>
      <nav class="flex-1 p-3 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3',
            activeTab === item.id 
              ? 'bg-primary-50 text-primary-600' 
              : 'text-slate-600 hover:bg-slate-50'
          ]"
        >
          <span class="text-lg">{{ item.icon }}</span>
          {{ item.label }}
          <span v-if="item.badge" class="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {{ item.badge }}
          </span>
        </button>
      </nav>
      <div class="p-3 border-t border-slate-100 space-y-1">
        <button
          v-for="item in bottomNavItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3',
            activeTab === item.id 
              ? 'bg-primary-50 text-primary-600' 
              : 'text-slate-600 hover:bg-slate-50'
          ]"
        >
          <span class="text-lg">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </div>
    </aside>

    <!-- 移动端顶部导航 -->
    <div class="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40">
      <div class="px-4 py-3 flex items-center justify-between">
        <h1 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <span class="text-xl">💼</span>
          求职工作台
        </h1>
      </div>
      <div class="px-2 pb-2 flex gap-1 overflow-x-auto">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1',
            activeTab === item.id 
              ? 'bg-primary-500 text-white' 
              : 'bg-slate-100 text-slate-600'
          ]"
        >
          <span>{{ item.icon }}</span>
          {{ item.shortLabel || item.label }}
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="flex-1 min-h-screen md:ml-0 pt-20 md:pt-0">
      <div class="p-4 md:p-6 max-w-7xl mx-auto">
        <Dashboard v-if="activeTab === 'dashboard'" />
        <JobTracker v-else-if="activeTab === 'jobs'" />
        <OfferCompare v-else-if="activeTab === 'offers'" />
        <InterviewReview v-else-if="activeTab === 'interviews'" />
        <SchedulePanel v-else-if="activeTab === 'schedule'" />
        <ChecklistPanel v-else-if="activeTab === 'checklist'" />
        <DataManage v-else-if="activeTab === 'settings'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { state, getStats } from './store'
import Dashboard from './components/Dashboard.vue'
import JobTracker from './components/JobTracker.vue'
import OfferCompare from './components/OfferCompare.vue'
import InterviewReview from './components/InterviewReview.vue'
import SchedulePanel from './components/SchedulePanel.vue'
import ChecklistPanel from './components/ChecklistPanel.vue'
import DataManage from './components/DataManage.vue'

const activeTab = ref('dashboard')

const stats = computed(() => getStats())

const navItems = computed(() => [
  { id: 'dashboard', label: '数据看板', shortLabel: '看板', icon: '📊' },
  { id: 'jobs', label: '投递台账', shortLabel: '台账', icon: '📋', badge: stats.value.overtimeJobs.length || null },
  { id: 'offers', label: 'Offer对比', shortLabel: 'Offer', icon: '💰' },
  { id: 'interviews', label: '面试复盘', shortLabel: '复盘', icon: '🎤' },
  { id: 'schedule', label: '日程待办', shortLabel: '日程', icon: '📅', badge: stats.value.activeTodos || null },
])

const bottomNavItems = [
  { id: 'checklist', label: '面试Checklist', icon: '✅' },
  { id: 'settings', label: '数据管理', icon: '⚙️' },
]
</script>

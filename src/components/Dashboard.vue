<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
      📊 数据看板
    </h2>

    <!-- 核心指标卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="card p-4">
        <div class="text-3xl font-bold text-primary-600">{{ stats.total }}</div>
        <div class="text-sm text-slate-500 mt-1">总投递数</div>
      </div>
      <div class="card p-4">
        <div class="text-3xl font-bold text-purple-600">{{ interviewCount }}</div>
        <div class="text-sm text-slate-500 mt-1">面试机会</div>
      </div>
      <div class="card p-4">
        <div class="text-3xl font-bold text-emerald-600">{{ stats.statusCount.offer }}</div>
        <div class="text-sm text-slate-500 mt-1">Offer数量</div>
      </div>
      <div class="card p-4">
        <div class="text-3xl font-bold text-orange-600">{{ stats.overtimeJobs.length }}</div>
        <div class="text-sm text-slate-500 mt-1">超时待跟进</div>
      </div>
    </div>

    <!-- 转化率 -->
    <div class="card">
      <div class="card-header">📈 转化率分析</div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-3xl font-bold text-blue-600">{{ stats.interviewRate }}%</div>
            <div class="text-sm text-slate-600 mt-1">投递→面试转化率</div>
            <div class="text-xs text-slate-400 mt-2">
              {{ interviewCount }} / {{ stats.total }} 份投递
            </div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <div class="text-3xl font-bold text-purple-600">{{ stats.offerRate }}%</div>
            <div class="text-sm text-slate-600 mt-1">投递→Offer转化率</div>
            <div class="text-xs text-slate-400 mt-2">
              {{ stats.statusCount.offer }} / {{ stats.total }} 份投递
            </div>
          </div>
          <div class="text-center p-4 bg-emerald-50 rounded-xl">
            <div class="text-3xl font-bold text-emerald-600">{{ stats.interviewToOffer }}%</div>
            <div class="text-sm text-slate-600 mt-1">面试→Offer转化率</div>
            <div class="text-xs text-slate-400 mt-2">
              {{ stats.statusCount.offer }} / {{ interviewCount }} 次面试机会
            </div>
          </div>
        </div>

        <!-- 转化漏斗 -->
        <div class="mt-6">
          <div class="text-sm font-medium text-slate-700 mb-3">转化漏斗</div>
          <div class="flex flex-col items-center space-y-2">
            <div 
              class="h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-medium"
              :style="{ width: '100%' }"
            >
              投递 {{ stats.total }}
            </div>
            <div 
              class="h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-medium"
              :style="{ width: funnelWidths.interview + '%' }"
            >
              面试 {{ interviewCount }}
            </div>
            <div 
              class="h-10 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-medium"
              :style="{ width: funnelWidths.offer + '%' }"
            >
              Offer {{ stats.statusCount.offer }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 状态分布饼图 -->
      <div class="card">
        <div class="card-header">🥧 求职状态分布</div>
        <div class="card-body">
          <div class="aspect-square max-w-[300px] mx-auto">
            <canvas ref="statusChartRef"></canvas>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-4">
            <div v-for="item in statusLegend" :key="item.key" class="flex items-center gap-2 text-sm">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span class="text-slate-600">{{ item.label }}: {{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 优先级分布 -->
      <div class="card">
        <div class="card-header">🎯 岗位优先级分布</div>
        <div class="card-body">
          <div class="aspect-square max-w-[300px] mx-auto">
            <canvas ref="priorityChartRef"></canvas>
          </div>
          <div class="space-y-3 mt-4">
            <div class="flex items-center gap-3">
              <span class="w-16 text-sm text-slate-600">A级冲刺</span>
              <div class="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-red-500 rounded-full transition-all duration-500"
                  :style="{ width: priorityPercent.A + '%' }"
                ></div>
              </div>
              <span class="w-10 text-right text-sm font-medium text-slate-700">{{ stats.priorityCount.A }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-16 text-sm text-slate-600">B级匹配</span>
              <div class="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-amber-500 rounded-full transition-all duration-500"
                  :style="{ width: priorityPercent.B + '%' }"
                ></div>
              </div>
              <span class="w-10 text-right text-sm font-medium text-slate-700">{{ stats.priorityCount.B }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-16 text-sm text-slate-600">C级保底</span>
              <div class="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  :style="{ width: priorityPercent.C + '%' }"
                ></div>
              </div>
              <span class="w-10 text-right text-sm font-medium text-slate-700">{{ stats.priorityCount.C }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 面试趋势 -->
    <div v-if="state.interviews.length" class="card">
      <div class="card-header">📅 近期面试趋势</div>
      <div class="card-body">
        <div class="h-64">
          <canvas ref="trendChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- 超时提醒 -->
    <div v-if="stats.overtimeJobs.length" class="card border-orange-200 bg-orange-50">
      <div class="card-header border-orange-200 text-orange-700">
        ⚠️ 超时未跟进的投递（超过{{ state.settings.overtimeDays }}天）
      </div>
      <div class="card-body">
        <div class="space-y-2">
          <div 
            v-for="job in stats.overtimeJobs.slice(0, 5)" 
            :key="job.id"
            class="flex items-center justify-between p-3 bg-white rounded-lg"
          >
            <div>
              <div class="font-medium text-slate-800">{{ job.company }} - {{ job.position }}</div>
              <div class="text-xs text-slate-500">
                最后跟进：{{ job.lastFollowDate || job.applyDate }}
                （{{ daysSince(job.lastFollowDate || job.applyDate) }}天前）
              </div>
            </div>
            <span :class="['tag', `status-${job.status}`]">
              {{ JOB_STATUS_LABELS[job.status] }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { state, getStats, JOB_STATUS_LABELS } from '../store'

Chart.register(...registerables)

const stats = computed(() => getStats())
const statusChartRef = ref(null)
const priorityChartRef = ref(null)
const trendChartRef = ref(null)
let statusChart = null
let priorityChart = null
let trendChart = null

const interviewCount = computed(() => {
  return stats.value.statusCount.interview + stats.value.statusCount.offer
})

const funnelWidths = computed(() => {
  const total = stats.value.total || 1
  return {
    interview: Math.max(20, (interviewCount.value / total) * 100),
    offer: Math.max(20, (stats.value.statusCount.offer / total) * 100)
  }
})

const statusLegend = computed(() => [
  { key: 'applied', label: '已投递', count: stats.value.statusCount.applied, color: '#3b82f6' },
  { key: 'interview', label: '面试中', count: stats.value.statusCount.interview, color: '#a855f7' },
  { key: 'offer', label: '已Offer', count: stats.value.statusCount.offer, color: '#10b981' },
  { key: 'rejected', label: '已拒绝', count: stats.value.statusCount.rejected, color: '#94a3b8' },
  { key: 'ghosted', label: '已失联', count: stats.value.statusCount.ghosted, color: '#f97316' },
])

const priorityPercent = computed(() => {
  const total = stats.value.total || 1
  return {
    A: (stats.value.priorityCount.A / total) * 100,
    B: (stats.value.priorityCount.B / total) * 100,
    C: (stats.value.priorityCount.C / total) * 100
  }
})

function daysSince(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  return Math.floor((now - date) / (1000 * 60 * 60 * 24))
}

function initCharts() {
  nextTick(() => {
    // 状态饼图
    if (statusChartRef.value) {
      if (statusChart) statusChart.destroy()
      statusChart = new Chart(statusChartRef.value, {
        type: 'doughnut',
        data: {
          labels: Object.values(JOB_STATUS_LABELS),
          datasets: [{
            data: Object.keys(JOB_STATUS_LABELS).map(k => stats.value.statusCount[k]),
            backgroundColor: ['#3b82f6', '#a855f7', '#10b981', '#94a3b8', '#f97316'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false }
          },
          cutout: '65%'
        }
      })
    }

    // 优先级饼图
    if (priorityChartRef.value) {
      if (priorityChart) priorityChart.destroy()
      priorityChart = new Chart(priorityChartRef.value, {
        type: 'pie',
        data: {
          labels: ['A级 - 冲刺', 'B级 - 匹配', 'C级 - 保底'],
          datasets: [{
            data: [stats.value.priorityCount.A, stats.value.priorityCount.B, stats.value.priorityCount.C],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false }
          }
        }
      })
    }

    // 面试趋势图
    if (trendChartRef.value) {
      if (trendChart) trendChart.destroy()
      const { labels, data } = getInterviewTrendData()
      trendChart = new Chart(trendChartRef.value, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '面试次数',
            data,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      })
    }
  })
}

function getInterviewTrendData() {
  // 最近7天的面试趋势
  const days = []
  const counts = []
  const now = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const label = `${date.getMonth() + 1}/${date.getDate()}`
    days.push(label)
    
    const count = state.interviews.filter(iv => iv.date === dateStr).length
    counts.push(count)
  }
  
  return { labels: days, data: counts }
}

// 监听数据变化更新图表
watch(
  () => [state.jobs.length, state.interviews.length],
  () => {
    initCharts()
  },
  { deep: false }
)

onMounted(() => {
  initCharts()
})
</script>

<template>
  <div class="space-y-4">
    <!-- 顶部操作栏 -->
    <div class="flex flex-col sm:flex-row gap-3 justify-between">
      <div class="flex flex-wrap gap-2">
        <input 
          v-model="searchText" 
          type="text" 
          placeholder="搜索公司/岗位..." 
          class="input w-full sm:w-64"
        />
        <select v-model="filterStatus" class="select w-32">
          <option value="">全部状态</option>
          <option v-for="(label, key) in JOB_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="filterPriority" class="select w-32">
          <option value="">全部优先级</option>
          <option value="A">A级 - 冲刺</option>
          <option value="B">B级 - 匹配</option>
          <option value="C">C级 - 保底</option>
        </select>
      </div>
      <button @click="openAddModal" class="btn btn-primary">
        <span>➕</span> 新增投递
      </button>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div class="card p-3 text-center">
        <div class="text-2xl font-bold text-slate-800">{{ state.jobs.length }}</div>
        <div class="text-xs text-slate-500">总投递</div>
      </div>
      <div class="card p-3 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ statusCount.applied }}</div>
        <div class="text-xs text-slate-500">已投递</div>
      </div>
      <div class="card p-3 text-center">
        <div class="text-2xl font-bold text-purple-600">{{ statusCount.interview }}</div>
        <div class="text-xs text-slate-500">面试中</div>
      </div>
      <div class="card p-3 text-center">
        <div class="text-2xl font-bold text-emerald-600">{{ statusCount.offer }}</div>
        <div class="text-xs text-slate-500">已Offer</div>
      </div>
      <div class="card p-3 text-center">
        <div class="text-2xl font-bold text-orange-600">{{ overtimeJobs.length }}</div>
        <div class="text-xs text-slate-500">超时未跟进</div>
      </div>
    </div>

    <!-- 岗位列表 -->
    <div v-if="filteredJobs.length" class="space-y-3">
      <div 
        v-for="job in filteredJobs" 
        :key="job.id"
        class="card hover:shadow-md transition-shadow cursor-pointer"
        @click="openEditModal(job)"
      >
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-semibold text-slate-800 truncate">{{ job.company }}</h3>
                <span v-if="job.priority" :class="['tag', `priority-${String(job.priority).toLowerCase()}`]">
                  {{ job.priority }}级
                </span>
                <span v-if="job.status" :class="['tag', `status-${job.status}`]">
                  {{ JOB_STATUS_LABELS[job.status] || job.status }}
                </span>
                <span v-if="isOvertime(job)" class="tag bg-red-100 text-red-600 animate-pulse">
                  ⚠️ 超时
                </span>
              </div>
              <div class="text-sm text-slate-600 mt-1">{{ job.position }}</div>
              <div class="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                <span v-if="job.salary">💰 {{ job.salary }}</span>
                <span v-if="job.location">📍 {{ job.location }}</span>
                <span>📅 {{ job.applyDate }}</span>
              </div>
              <div v-if="job.tags && job.tags.length" class="flex gap-1.5 mt-2 flex-wrap">
                <span 
                  v-for="tag in job.tags" 
                  :key="tag"
                  class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            <div class="flex gap-1">
              <button 
                @click.stop="quickUpdateStatus(job)" 
                class="btn btn-ghost btn-sm"
                title="更新状态"
              >
                🔄
              </button>
              <button 
                @click.stop="deleteJobConfirm(job.id)" 
                class="btn btn-ghost btn-sm text-red-500"
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state card">
      <div class="empty-state-icon">{{ hasActiveFilter ? '🔍' : '📭' }}</div>
      <div class="empty-state-text">
        {{ hasActiveFilter ? '没有符合当前筛选条件的投递记录' : '暂无投递记录，点击"新增投递"开始记录' }}
      </div>
      <button v-if="hasActiveFilter" @click="clearFilters" class="btn btn-secondary mt-3">
        清除筛选条件
      </button>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content max-w-2xl">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ editingJob ? '编辑投递' : '新增投递' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">公司名称 *</label>
              <input v-model="formData.company" type="text" class="input" placeholder="如：字节跳动">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">岗位名称 *</label>
              <input v-model="formData.position" type="text" class="input" placeholder="如：前端工程师">
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">优先级</label>
              <select v-model="formData.priority" class="select">
                <option value="A">A级 - 冲刺</option>
                <option value="B">B级 - 匹配</option>
                <option value="C">C级 - 保底</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">状态</label>
              <select v-model="formData.status" class="select">
                <option v-for="(label, key) in JOB_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">薪资范围</label>
              <input v-model="formData.salary" type="text" class="input" placeholder="如：25-35K">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">工作地点</label>
              <input v-model="formData.location" type="text" class="input" placeholder="如：北京">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">投递日期</label>
              <input v-model="formData.applyDate" type="date" class="input">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">最后跟进日期</label>
              <input v-model="formData.lastFollowDate" type="date" class="input">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">自定义标签（回车添加）</label>
            <div class="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg min-h-[42px]">
              <span 
                v-for="tag in formData.tags" 
                :key="tag"
                class="tag bg-primary-100 text-primary-700 gap-1"
              >
                #{{ tag }}
                <button @click="removeTag(tag)" class="hover:text-primary-900">×</button>
              </span>
              <input 
                v-model="newTag" 
                @keydown.enter.prevent="addTag"
                type="text" 
                class="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
                placeholder="输入标签后回车"
              >
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">岗位描述 (JD)</label>
            <textarea v-model="formData.jd" class="textarea" rows="4" placeholder="粘贴JD内容..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">跟进备注</label>
            <textarea v-model="formData.notes" class="textarea" rows="3" placeholder="记录投递渠道、内推人、跟进情况..."></textarea>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button @click="closeModal" class="btn btn-secondary">取消</button>
          <button @click="saveJob" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 快速状态更新弹窗 -->
    <div v-if="showQuickStatusModal" class="modal-overlay" @click.self="showQuickStatusModal = false">
      <div class="modal-content max-w-sm">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="text-lg font-semibold">更新状态</h3>
          <p class="text-sm text-slate-500 mt-1">{{ quickStatusJob?.company }} - {{ quickStatusJob?.position }}</p>
        </div>
        <div class="p-4 space-y-2">
          <button
            v-for="(label, key) in JOB_STATUS_LABELS"
            :key="key"
            @click="doQuickUpdate(key)"
            :class="[
              'w-full p-3 rounded-lg text-left text-sm font-medium transition-all',
              quickStatusJob?.status === key 
                ? 'bg-primary-50 text-primary-600 border-2 border-primary-500' 
                : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
            ]"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  state, 
  JOB_STATUS_LABELS, 
  JOB_STATUS,
  addJob, 
  updateJob, 
  deleteJob,
  getStats
} from '../store'

const searchText = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const showModal = ref(false)
const editingJob = ref(null)
const newTag = ref('')
const showQuickStatusModal = ref(false)
const quickStatusJob = ref(null)

const defaultForm = () => ({
  company: '',
  position: '',
  priority: 'B',
  status: JOB_STATUS.APPLIED,
  tags: [],
  jd: '',
  notes: '',
  salary: '',
  location: '',
  applyDate: new Date().toISOString().split('T')[0],
  lastFollowDate: new Date().toISOString().split('T')[0]
})

const formData = ref(defaultForm())

const statusCount = computed(() => {
  const count = {}
  Object.values(JOB_STATUS).forEach(s => {
    count[s] = state.jobs.filter(j => j.status === s).length
  })
  return count
})

const overtimeJobs = computed(() => getStats().overtimeJobs)

function isOvertime(job) {
  return overtimeJobs.value.some(j => j.id === job.id)
}

const hasActiveFilter = computed(() => 
  !!searchText.value || !!filterStatus.value || !!filterPriority.value
)

function clearFilters() {
  searchText.value = ''
  filterStatus.value = ''
  filterPriority.value = ''
}

const filteredJobs = computed(() => {
  return state.jobs.filter(job => {
    if (searchText.value) {
      const q = searchText.value.trim().toLowerCase()
      const haystack = [
        job.company, job.position, job.location, job.salary,
        ...(Array.isArray(job.tags) ? job.tags : [])
      ].filter(Boolean).join(' ').toLowerCase()
      if (q && !haystack.includes(q)) {
        return false
      }
    }
    if (filterStatus.value && (job.status || '') !== filterStatus.value) return false
    // 优先级忽略大小写，兼容导入数据中的 'a'/'A级' 等写法
    if (filterPriority.value) {
      const p = String(job.priority || '').trim().toUpperCase()
      const wanted = filterPriority.value.trim().toUpperCase()
      if (p !== wanted && !p.startsWith(wanted)) return false
    }
    return true
  })
})

function openAddModal() {
  editingJob.value = null
  formData.value = defaultForm()
  showModal.value = true
}

function openEditModal(job) {
  editingJob.value = job
  formData.value = { ...job, tags: [...(job.tags || [])] }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingJob.value = null
}

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
  newTag.value = ''
}

function removeTag(tag) {
  const idx = formData.value.tags.indexOf(tag)
  if (idx !== -1) formData.value.tags.splice(idx, 1)
}

function saveJob() {
  if (!formData.value.company.trim() || !formData.value.position.trim()) {
    alert('请填写公司名称和岗位名称')
    return
  }
  if (editingJob.value) {
    updateJob(editingJob.value.id, formData.value)
  } else {
    addJob(formData.value)
  }
  closeModal()
}

function deleteJobConfirm(id) {
  if (confirm('确定要删除这条投递记录吗？关联的面试和Offer也会被删除。')) {
    deleteJob(id)
  }
}

function quickUpdateStatus(job) {
  quickStatusJob.value = job
  showQuickStatusModal.value = true
}

function doQuickUpdate(status) {
  if (quickStatusJob.value) {
    updateJob(quickStatusJob.value.id, { 
      status,
      lastFollowDate: new Date().toISOString().split('T')[0]
    })
  }
  showQuickStatusModal.value = false
  quickStatusJob.value = null
}
</script>

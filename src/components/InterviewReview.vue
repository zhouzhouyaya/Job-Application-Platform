<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        🎤 面试复盘
      </h2>
      <button @click="openAddModal" class="btn btn-primary">
        <span>➕</span> 记录面试
      </button>
    </div>

    <!-- 统计 -->
    <div class="grid grid-cols-3 gap-3">
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-slate-800">{{ state.interviews.length }}</div>
        <div class="text-xs text-slate-500">总面试次数</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-purple-600">{{ thisWeekCount }}</div>
        <div class="text-xs text-slate-500">本周面试</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-emerald-600">{{ avgFeeling }}</div>
        <div class="text-xs text-slate-500">平均表现</div>
      </div>
    </div>

    <!-- 面试列表 -->
    <div v-if="state.interviews.length" class="space-y-3">
      <div 
        v-for="iv in state.interviews" 
        :key="iv.id"
        class="card hover:shadow-md transition-shadow cursor-pointer"
        @click="openDetail(iv)"
      >
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-semibold text-slate-800">{{ iv.company }}</h3>
                <span class="tag bg-purple-100 text-purple-700">{{ iv.round }}</span>
                <span class="text-amber-500 text-sm">{{ '⭐'.repeat(iv.overallFeeling) }}</span>
              </div>
              <div class="text-sm text-slate-600 mt-1">{{ iv.position }}</div>
              <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>📅 {{ iv.date }}</span>
                <span>❓ {{ iv.questions?.length || 0 }} 道题</span>
              </div>
            </div>
            <button 
              @click.stop="deleteInterviewConfirm(iv.id)" 
              class="btn btn-ghost btn-sm text-red-500"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state card">
      <div class="empty-state-icon">🎤</div>
      <div class="empty-state-text">还没有面试记录，记录你的第一次面试吧</div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content max-w-2xl">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ editingInterview ? '编辑面试' : '记录面试' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">公司名称 *</label>
              <input v-model="formData.company" type="text" class="input" placeholder="公司名">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">岗位名称 *</label>
              <input v-model="formData.position" type="text" class="input" placeholder="岗位名">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">面试轮次</label>
              <select v-model="formData.round" class="select">
                <option v-for="r in interviewRounds" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">面试日期</label>
              <input v-model="formData.date" type="date" class="input">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              整体表现：<span class="text-amber-500">{{ '⭐'.repeat(formData.overallFeeling) }}</span>
            </label>
            <input 
              v-model.number="formData.overallFeeling" 
              type="range" 
              min="1" 
              max="5" 
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            >
          </div>

          <!-- 面试题目 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-slate-700">面试题目</label>
              <button @click="addQuestion" class="text-xs text-primary-600 hover:text-primary-700">
                + 添加题目
              </button>
            </div>
            <div class="space-y-3">
              <div 
                v-for="(q, idx) in formData.questions" 
                :key="idx"
                class="p-3 bg-slate-50 rounded-lg space-y-2"
              >
                <div class="flex gap-2">
                  <input 
                    v-model="q.question" 
                    type="text" 
                    class="input flex-1 text-sm"
                    placeholder="题目"
                  >
                  <button 
                    @click="removeQuestion(idx)" 
                    class="text-red-400 hover:text-red-600 px-2"
                  >
                    ✕
                  </button>
                </div>
                <textarea 
                  v-model="q.answer" 
                  class="textarea text-xs" 
                  rows="2"
                  placeholder="我的回答..."
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">踩坑点</label>
            <textarea v-model="formData.pitfalls" class="textarea" rows="3" placeholder="这次面试哪里没答好？卡在哪了？"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">改进方案</label>
            <textarea v-model="formData.improvements" class="textarea" rows="3" placeholder="下次怎么改进？需要补充哪些知识？"></textarea>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button @click="closeModal" class="btn btn-secondary">取消</button>
          <button @click="saveInterview" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-content max-w-2xl">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">{{ detailData.company }} - {{ detailData.position }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="tag bg-purple-100 text-purple-700">{{ detailData.round }}</span>
              <span class="text-amber-500 text-sm">{{ '⭐'.repeat(detailData.overallFeeling) }}</span>
              <span class="text-xs text-slate-400">{{ detailData.date }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="editFromDetail" class="text-slate-400 hover:text-primary-500">✏️</button>
            <button @click="showDetail = false" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-5">
          <div v-if="detailData.questions && detailData.questions.length">
            <h4 class="font-medium text-slate-800 mb-3 flex items-center gap-2">
              <span>❓</span> 面试题目
            </h4>
            <div class="space-y-3">
              <div 
                v-for="(q, idx) in detailData.questions" 
                :key="idx"
                class="p-3 bg-slate-50 rounded-lg"
              >
                <div class="font-medium text-slate-700 text-sm">{{ idx + 1 }}. {{ q.question }}</div>
                <div v-if="q.answer" class="mt-2 text-sm text-slate-600 pl-4 border-l-2 border-primary-300">
                  {{ q.answer }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="detailData.pitfalls">
            <h4 class="font-medium text-slate-800 mb-2 flex items-center gap-2">
              <span>⚠️</span> 踩坑点
            </h4>
            <div class="p-3 bg-red-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
              {{ detailData.pitfalls }}
            </div>
          </div>

          <div v-if="detailData.improvements">
            <h4 class="font-medium text-slate-800 mb-2 flex items-center gap-2">
              <span>💡</span> 改进方案
            </h4>
            <div class="p-3 bg-emerald-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
              {{ detailData.improvements }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { state, addInterview, updateInterview, deleteInterview, INTERVIEW_ROUNDS } from '../store'

const showModal = ref(false)
const showDetail = ref(false)
const editingInterview = ref(null)
const detailData = ref({})
const interviewRounds = INTERVIEW_ROUNDS

const defaultForm = () => ({
  company: '',
  position: '',
  round: '技术一面',
  date: new Date().toISOString().split('T')[0],
  questions: [{ question: '', answer: '' }],
  pitfalls: '',
  improvements: '',
  overallFeeling: 3
})

const formData = ref(defaultForm())

const thisWeekCount = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return state.interviews.filter(iv => new Date(iv.date) >= weekStart).length
})

const avgFeeling = computed(() => {
  if (!state.interviews.length) return '-'
  const sum = state.interviews.reduce((acc, iv) => acc + (iv.overallFeeling || 0), 0)
  return (sum / state.interviews.length).toFixed(1)
})

function openAddModal() {
  editingInterview.value = null
  formData.value = defaultForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingInterview.value = null
}

function openDetail(iv) {
  detailData.value = iv
  showDetail.value = true
}

function editFromDetail() {
  editingInterview.value = detailData.value
  formData.value = {
    ...detailData.value,
    questions: detailData.value.questions?.length 
      ? detailData.value.questions.map(q => ({ ...q })) 
      : [{ question: '', answer: '' }]
  }
  showDetail.value = false
  showModal.value = true
}

function addQuestion() {
  formData.value.questions.push({ question: '', answer: '' })
}

function removeQuestion(idx) {
  formData.value.questions.splice(idx, 1)
}

function saveInterview() {
  if (!formData.value.company.trim() || !formData.value.position.trim()) {
    alert('请填写公司名称和岗位名称')
    return
  }
  // 过滤空题目
  formData.value.questions = formData.value.questions.filter(q => q.question.trim())
  
  if (editingInterview.value) {
    updateInterview(editingInterview.value.id, formData.value)
  } else {
    addInterview(formData.value)
  }
  closeModal()
}

function deleteInterviewConfirm(id) {
  if (confirm('确定要删除这条面试记录吗？')) {
    deleteInterview(id)
  }
}
</script>

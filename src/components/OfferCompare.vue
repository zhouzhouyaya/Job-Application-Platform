<template>
  <div class="space-y-4">
    <!-- 顶部操作 -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        💰 Offer多维对比
      </h2>
      <button @click="openAddModal" class="btn btn-primary">
        <span>➕</span> 添加Offer
      </button>
    </div>

    <!-- 对比面板 -->
    <div v-if="state.offers.length" class="overflow-x-auto">
      <div class="min-w-[600px]">
        <!-- 对比卡片横向排列 -->
        <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${state.offers.length}, minmax(280px, 1fr))` }">
          <div 
            v-for="offer in state.offers" 
            :key="offer.id"
            class="card relative"
          >
            <button 
              @click="deleteOfferConfirm(offer.id)" 
              class="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-sm z-10"
            >
              🗑️
            </button>
            <button 
              @click="openEditModal(offer)" 
              class="absolute top-3 right-10 text-slate-400 hover:text-primary-500 text-sm z-10"
            >
              ✏️
            </button>
            
            <!-- 头部 -->
            <div class="p-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-800">{{ offer.company }}</h3>
              <p class="text-sm text-slate-500">{{ offer.position }}</p>
              <div class="mt-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-slate-500">个人意向</span>
                  <span class="text-sm font-bold text-primary-600">{{ offer.intentionScore }}/10</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all"
                    :class="scoreColor(offer.intentionScore)"
                    :style="{ width: `${offer.intentionScore * 10}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 薪资福利 -->
            <div class="p-4 space-y-3">
              <div class="flex items-start gap-3">
                <span class="text-lg">💵</span>
                <div>
                  <div class="text-xs text-slate-500">基础薪资</div>
                  <div class="font-semibold text-slate-800">{{ offer.baseSalary || '未填写' }}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-lg">🎁</span>
                <div>
                  <div class="text-xs text-slate-500">奖金/年终奖</div>
                  <div class="text-sm text-slate-700">{{ offer.bonus || '未填写' }}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-lg">📈</span>
                <div>
                  <div class="text-xs text-slate-500">股票/期权</div>
                  <div class="text-sm text-slate-700">{{ offer.stock || '未填写' }}</div>
                </div>
              </div>
            </div>

            <!-- 福利标签 -->
            <div v-if="offer.benefits && offer.benefits.length" class="px-4 pb-3">
              <div class="text-xs text-slate-500 mb-2">福利待遇</div>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="b in offer.benefits" 
                  :key="b"
                  class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs"
                >
                  {{ b }}
                </span>
              </div>
            </div>

            <!-- 多维度评分 -->
            <div class="p-4 border-t border-slate-100 space-y-3">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">⏰ 加班强度</span>
                  <span :class="overtimeColor(offer.overtime)">{{ overtimeLabel(offer.overtime) }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    class="h-1.5 rounded-full"
                    :class="overtimeBarColor(offer.overtime)"
                    :style="{ width: `${overtimePercent(offer.overtime)}%` }"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">🚀 业务前景</span>
                  <span :class="businessColor(offer.businessOutlook)">{{ businessLabel(offer.businessOutlook) }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    class="h-1.5 rounded-full bg-emerald-500"
                    :style="{ width: `${businessPercent(offer.businessOutlook)}%` }"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">⚠️ 风险等级</span>
                  <span :class="riskColor(offer.riskLevel)">{{ riskLabel(offer.riskLevel) }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    class="h-1.5 rounded-full"
                    :class="riskBarColor(offer.riskLevel)"
                    :style="{ width: `${riskPercent(offer.riskLevel)}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="offer.notes" class="p-4 border-t border-slate-100">
              <div class="text-xs text-slate-500 mb-1">备注</div>
              <p class="text-sm text-slate-600">{{ offer.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state card">
      <div class="empty-state-icon">💼</div>
      <div class="empty-state-text">还没有Offer记录，添加第一个Offer开始对比</div>
    </div>

    <!-- 综合排名 -->
    <div v-if="state.offers.length >= 2" class="card">
      <div class="card-header">
        🏆 综合意向排名
      </div>
      <div class="card-body">
        <div class="space-y-2">
          <div 
            v-for="(offer, idx) in rankedOffers" 
            :key="offer.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
              :class="idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'"
            >
              {{ idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-slate-800">{{ offer.company }} - {{ offer.position }}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-primary-600">{{ offer.intentionScore }}分</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content max-w-lg">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ editingOffer ? '编辑Offer' : '添加Offer' }}</h3>
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
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">基础薪资</label>
              <input v-model="formData.baseSalary" type="text" class="input" placeholder="如：30K*15">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">奖金</label>
              <input v-model="formData.bonus" type="text" class="input" placeholder="如：3个月年终奖">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">股票/期权</label>
              <input v-model="formData.stock" type="text" class="input" placeholder="如：RSU 1000股">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">福利待遇（点击选择）</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="b in benefitOptions"
                :key="b"
                @click="toggleBenefit(b)"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  formData.benefits.includes(b)
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
                ]"
              >
                {{ b }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">加班强度</label>
              <select v-model="formData.overtime" class="select">
                <option value="relaxed">轻松</option>
                <option value="normal">正常</option>
                <option value="busy">较忙</option>
                <option value="intense">高强度</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">业务前景</label>
              <select v-model="formData.businessOutlook" class="select">
                <option value="excellent">非常好</option>
                <option value="good">良好</option>
                <option value="normal">一般</option>
                <option value="poor">较差</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">风险等级</label>
              <select v-model="formData.riskLevel" class="select">
                <option value="low">低风险</option>
                <option value="medium">中风险</option>
                <option value="high">高风险</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              个人意向打分：<span class="text-primary-600 font-bold">{{ formData.intentionScore }}/10</span>
            </label>
            <input 
              v-model.number="formData.intentionScore" 
              type="range" 
              min="1" 
              max="10" 
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            >
            <div class="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span><span>5</span><span>10</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea v-model="formData.notes" class="textarea" rows="3" placeholder="其他需要记录的信息..."></textarea>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button @click="closeModal" class="btn btn-secondary">取消</button>
          <button @click="saveOffer" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { state, addOffer, updateOffer, deleteOffer } from '../store'

const showModal = ref(false)
const editingOffer = ref(null)

const benefitOptions = [
  '六险一金', '五险一金', '补充医疗', '年终奖', '股票期权',
  '带薪年假', '弹性工作', '远程办公', '免费三餐', '住房补贴',
  '交通补贴', '通讯补贴', '健身房', '下午茶', '团建旅游',
  '落户指标', '子女教育', '宠物友好'
]

const defaultForm = () => ({
  company: '',
  position: '',
  baseSalary: '',
  bonus: '',
  stock: '',
  benefits: [],
  overtime: 'normal',
  businessOutlook: 'good',
  riskLevel: 'low',
  intentionScore: 7,
  notes: ''
})

const formData = ref(defaultForm())

const rankedOffers = computed(() => {
  return [...state.offers].sort((a, b) => b.intentionScore - a.intentionScore)
})

function scoreColor(score) {
  if (score >= 8) return 'bg-emerald-500'
  if (score >= 6) return 'bg-primary-500'
  if (score >= 4) return 'bg-amber-500'
  return 'bg-red-500'
}

function overtimeLabel(v) {
  return { relaxed: '轻松', normal: '正常', busy: '较忙', intense: '996/高强度' }[v] || v
}
function overtimeColor(v) {
  return { 
    relaxed: 'text-emerald-600', 
    normal: 'text-blue-600', 
    busy: 'text-amber-600', 
    intense: 'text-red-600' 
  }[v] || ''
}
function overtimeBarColor(v) {
  return { 
    relaxed: 'bg-emerald-500', 
    normal: 'bg-blue-500', 
    busy: 'bg-amber-500', 
    intense: 'bg-red-500' 
  }[v] || 'bg-slate-400'
}
function overtimePercent(v) {
  return { relaxed: 25, normal: 50, busy: 75, intense: 100 }[v] || 50
}

function businessLabel(v) {
  return { excellent: '非常好', good: '良好', normal: '一般', poor: '较差' }[v] || v
}
function businessColor(v) {
  return { 
    excellent: 'text-emerald-600', 
    good: 'text-blue-600', 
    normal: 'text-amber-600', 
    poor: 'text-red-600' 
  }[v] || ''
}
function businessPercent(v) {
  return { excellent: 100, good: 75, normal: 50, poor: 25 }[v] || 50
}

function riskLabel(v) {
  return { low: '低风险', medium: '中风险', high: '高风险' }[v] || v
}
function riskColor(v) {
  return { low: 'text-emerald-600', medium: 'text-amber-600', high: 'text-red-600' }[v] || ''
}
function riskBarColor(v) {
  return { low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-red-500' }[v] || 'bg-slate-400'
}
function riskPercent(v) {
  return { low: 33, medium: 66, high: 100 }[v] || 33
}

function openAddModal() {
  editingOffer.value = null
  formData.value = defaultForm()
  showModal.value = true
}

function openEditModal(offer) {
  editingOffer.value = offer
  formData.value = { ...offer, benefits: [...(offer.benefits || [])] }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingOffer.value = null
}

function toggleBenefit(b) {
  const idx = formData.value.benefits.indexOf(b)
  if (idx === -1) {
    formData.value.benefits.push(b)
  } else {
    formData.value.benefits.splice(idx, 1)
  }
}

function saveOffer() {
  if (!formData.value.company.trim() || !formData.value.position.trim()) {
    alert('请填写公司名称和岗位名称')
    return
  }
  if (editingOffer.value) {
    updateOffer(editingOffer.value.id, formData.value)
  } else {
    addOffer(formData.value)
  }
  closeModal()
}

function deleteOfferConfirm(id) {
  if (confirm('确定要删除这个Offer吗？')) {
    deleteOffer(id)
  }
}
</script>

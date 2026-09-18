<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
      ✅ 面试 Checklist
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 面试前 -->
      <div class="card">
        <div class="card-header bg-blue-50 text-blue-700">
          🔍 面试前准备
        </div>
        <div class="card-body space-y-3">
          <div 
            v-for="(item, idx) in beforeInterview" 
            :key="idx"
            @click="toggleItem('before', idx)"
            :class="[
              'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
              item.checked ? 'bg-slate-50' : 'bg-white hover:bg-blue-50'
            ]"
          >
            <div 
              :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                item.checked 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-300'
              ]"
            >
              <span v-if="item.checked" class="text-xs">✓</span>
            </div>
            <div>
              <div :class="['text-sm font-medium', item.checked ? 'text-slate-400 line-through' : 'text-slate-700']">
                {{ item.title }}
              </div>
              <div v-if="item.tip" class="text-xs text-slate-400 mt-1">
                💡 {{ item.tip }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 面试中 -->
      <div class="card">
        <div class="card-header bg-purple-50 text-purple-700">
          🎤 面试中注意
        </div>
        <div class="card-body space-y-3">
          <div 
            v-for="(item, idx) in duringInterview" 
            :key="idx"
            @click="toggleItem('during', idx)"
            :class="[
              'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
              item.checked ? 'bg-slate-50' : 'bg-white hover:bg-purple-50'
            ]"
          >
            <div 
              :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                item.checked 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-300'
              ]"
            >
              <span v-if="item.checked" class="text-xs">✓</span>
            </div>
            <div>
              <div :class="['text-sm font-medium', item.checked ? 'text-slate-400 line-through' : 'text-slate-700']">
                {{ item.title }}
              </div>
              <div v-if="item.tip" class="text-xs text-slate-400 mt-1">
                💡 {{ item.tip }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 面试后 -->
      <div class="card">
        <div class="card-header bg-emerald-50 text-emerald-700">
          📝 面试后跟进
        </div>
        <div class="card-body space-y-3">
          <div 
            v-for="(item, idx) in afterInterview" 
            :key="idx"
            @click="toggleItem('after', idx)"
            :class="[
              'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
              item.checked ? 'bg-slate-50' : 'bg-white hover:bg-emerald-50'
            ]"
          >
            <div 
              :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                item.checked 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-300'
              ]"
            >
              <span v-if="item.checked" class="text-xs">✓</span>
            </div>
            <div>
              <div :class="['text-sm font-medium', item.checked ? 'text-slate-400 line-through' : 'text-slate-700']">
                {{ item.title }}
              </div>
              <div v-if="item.tip" class="text-xs text-slate-400 mt-1">
                💡 {{ item.tip }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 薪资谈判 -->
      <div class="card">
        <div class="card-header bg-amber-50 text-amber-700">
          💰 薪资谈判要点
        </div>
        <div class="card-body space-y-3">
          <div 
            v-for="(item, idx) in salaryNegotiation" 
            :key="idx"
            @click="toggleItem('salary', idx)"
            :class="[
              'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
              item.checked ? 'bg-slate-50' : 'bg-white hover:bg-amber-50'
            ]"
          >
            <div 
              :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                item.checked 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-300'
              ]"
            >
              <span v-if="item.checked" class="text-xs">✓</span>
            </div>
            <div>
              <div :class="['text-sm font-medium', item.checked ? 'text-slate-400 line-through' : 'text-slate-700']">
                {{ item.title }}
              </div>
              <div v-if="item.tip" class="text-xs text-slate-400 mt-1">
                💡 {{ item.tip }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 进度总览 -->
    <div class="card">
      <div class="card-header">📊 完成进度</div>
      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ beforeProgress }}%</div>
            <div class="text-xs text-slate-500 mt-1">面试前</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ duringProgress }}%</div>
            <div class="text-xs text-slate-500 mt-1">面试中</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ afterProgress }}%</div>
            <div class="text-xs text-slate-500 mt-1">面试后</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-600">{{ salaryProgress }}%</div>
            <div class="text-xs text-slate-500 mt-1">薪资谈判</div>
          </div>
        </div>
        <button @click="resetAll" class="btn btn-ghost w-full mt-4 text-sm text-slate-500">
          🔄 重置所有勾选状态
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const STORAGE_KEY = 'interview_checklist_state'

const beforeInterview = ref([
  { title: '深入了解公司背景和业务', tip: '官网、新闻、产品体验', checked: false },
  { title: '熟悉JD，准备对应案例', tip: 'STAR法则准备项目经历', checked: false },
  { title: '复习核心技术知识点', tip: '针对岗位要求重点复习', checked: false },
  { title: '准备自我介绍（1-3分钟版）', tip: '突出亮点，控制时长', checked: false },
  { title: '准备反问面试官的问题', tip: '团队、业务、技术栈等', checked: false },
  { title: '检查设备和网络（线上面试）', tip: '摄像头、麦克风、网速', checked: false },
  { title: '准备好简历和笔记', tip: '手边放简历便于参考', checked: false },
  { title: '确认面试时间和地点', tip: '提前10-15分钟到场', checked: false },
])

const duringInterview = ref([
  { title: '保持微笑和眼神交流', tip: '展现自信和亲和力', checked: false },
  { title: '听清楚问题再回答', tip: '没听清可以请面试官重复', checked: false },
  { title: '回答结构化、有条理', tip: '先说结论，再展开细节', checked: false },
  { title: '诚实面对不会的问题', tip: '不要瞎编，可以说思路', checked: false },
  { title: '控制语速，不要太快', tip: '给自己思考时间', checked: false },
  { title: '主动展示项目亮点', tip: '找机会展示自己的优势', checked: false },
  { title: '记录面试关键点', tip: '方便后续复盘', checked: false },
  { title: '结尾询问反馈和流程', tip: '了解下一步安排和时间线', checked: false },
])

const afterInterview = ref([
  { title: '及时记录面试复盘', tip: '趁热打铁记录题目和感受', checked: false },
  { title: '整理不会的问题并学习', tip: '查漏补缺，避免下次再踩坑', checked: false },
  { title: '发送感谢信（可选）', tip: '24小时内发送，简短真诚', checked: false },
  { title: '更新投递状态', tip: '在台账中更新当前进度', checked: false },
  { title: '等待3-5天后主动跟进', tip: '不要频繁追问，适度跟进', checked: false },
  { title: '总结面试经验教训', tip: '每一次面试都是成长', checked: false },
])

const salaryNegotiation = ref([
  { title: '了解市场薪资水平', tip: '对标同级别同岗位', checked: false },
  { title: '确定自己的期望薪资', tip: '有明确的底线和目标', checked: false },
  { title: '不要先报出期望薪资', tip: '尽量让对方先出价', checked: false },
  { title: '谈总包而不是基本工资', tip: '综合考虑薪资、奖金、股票', checked: false },
  { title: '用offer作为谈判筹码', tip: '有其他offer时议价能力更强', checked: false },
  { title: '考虑长期发展和成长', tip: '薪资不是唯一考量因素', checked: false },
  { title: '拿到书面offer再确认', tip: '口头offer不作数', checked: false },
])

function calcProgress(list) {
  if (!list.length) return 0
  const checked = list.filter(i => i.checked).length
  return Math.round((checked / list.length) * 100)
}

const beforeProgress = computed(() => calcProgress(beforeInterview.value))
const duringProgress = computed(() => calcProgress(duringInterview.value))
const afterProgress = computed(() => calcProgress(afterInterview.value))
const salaryProgress = computed(() => calcProgress(salaryNegotiation.value))

function toggleItem(category, idx) {
  const lists = {
    before: beforeInterview,
    during: duringInterview,
    after: afterInterview,
    salary: salaryNegotiation
  }
  lists[category].value[idx].checked = !lists[category].value[idx].checked
}

function resetAll() {
  if (confirm('确定要重置所有勾选状态吗？')) {
    ;[beforeInterview, duringInterview, afterInterview, salaryNegotiation].forEach(list => {
      list.value.forEach(item => item.checked = false)
    })
  }
}

// 保存到localStorage
function saveState() {
  const data = {
    before: beforeInterview.value.map(i => i.checked),
    during: duringInterview.value.map(i => i.checked),
    after: afterInterview.value.map(i => i.checked),
    salary: salaryNegotiation.value.map(i => i.checked),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      data.before?.forEach((c, i) => { if (beforeInterview.value[i]) beforeInterview.value[i].checked = c })
      data.during?.forEach((c, i) => { if (duringInterview.value[i]) duringInterview.value[i].checked = c })
      data.after?.forEach((c, i) => { if (afterInterview.value[i]) afterInterview.value[i].checked = c })
      data.salary?.forEach((c, i) => { if (salaryNegotiation.value[i]) salaryNegotiation.value[i].checked = c })
    }
  } catch (e) {
    console.error('加载checklist状态失败', e)
  }
}

watch(
  [beforeInterview, duringInterview, afterInterview, salaryNegotiation],
  () => saveState(),
  { deep: true }
)

onMounted(() => {
  loadState()
})
</script>

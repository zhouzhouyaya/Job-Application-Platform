import { reactive, watch } from 'vue'

const STORAGE_KEY = 'job_hunt_workbench_data'

// 求职状态枚举
export const JOB_STATUS = {
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected',
  GHOSTED: 'ghosted'
}

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.APPLIED]: '已投递',
  [JOB_STATUS.INTERVIEW]: '面试中',
  [JOB_STATUS.OFFER]: '已Offer',
  [JOB_STATUS.REJECTED]: '已拒绝',
  [JOB_STATUS.GHOSTED]: '已失联'
}

export const PRIORITY_LABELS = {
  A: 'A级 - 冲刺',
  B: 'B级 - 匹配',
  C: 'C级 - 保底'
}

// 面试轮次
export const INTERVIEW_ROUNDS = [
  '简历筛选', 'HR初面', '技术一面', '技术二面', '技术三面', '部门主管面', 'HR终面', 'Offer沟通'
]

// 加载数据
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return {
        jobs: data.jobs || [],
        interviews: data.interviews || [],
        offers: data.offers || [],
        todos: data.todos || [],
        settings: data.settings || { overtimeDays: 14 }
      }
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
  return {
    jobs: [],
    interviews: [],
    offers: [],
    todos: [],
    settings: { overtimeDays: 14 }
  }
}

// 创建响应式store
const state = reactive(loadData())

// 监听变化自动保存
watch(
  () => state,
  (newState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch (e) {
      console.error('保存数据失败:', e)
    }
  },
  { deep: true }
)

// 生成ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// ========== 岗位投递 ==========
export function addJob(job) {
  const now = new Date().toISOString()
  state.jobs.unshift({
    id: genId(),
    company: '',
    position: '',
    priority: 'B',
    status: JOB_STATUS.APPLIED,
    tags: [],
    jd: '',
    notes: '',
    salary: '',
    location: '',
    applyDate: now.split('T')[0],
    lastFollowDate: now.split('T')[0],
    interviewRound: 0,
    createdAt: now,
    updatedAt: now,
    ...job
  })
}

export function updateJob(id, updates) {
  const idx = state.jobs.findIndex(j => j.id === id)
  if (idx !== -1) {
    state.jobs[idx] = {
      ...state.jobs[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }
}

export function deleteJob(id) {
  const idx = state.jobs.findIndex(j => j.id === id)
  if (idx !== -1) {
    state.jobs.splice(idx, 1)
  }
  // 同时删除关联的面试记录
  state.interviews = state.interviews.filter(i => i.jobId !== id)
  // 删除关联的offer
  state.offers = state.offers.filter(o => o.jobId !== id)
}

export function getJob(id) {
  return state.jobs.find(j => j.id === id)
}

// ========== 面试复盘 ==========
export function addInterview(interview) {
  const now = new Date().toISOString()
  state.interviews.unshift({
    id: genId(),
    jobId: '',
    company: '',
    position: '',
    round: '',
    date: now.split('T')[0],
    questions: [],
    pitfalls: '',
    improvements: '',
    overallFeeling: 3,
    createdAt: now,
    ...interview
  })
}

export function updateInterview(id, updates) {
  const idx = state.interviews.findIndex(i => i.id === id)
  if (idx !== -1) {
    state.interviews[idx] = { ...state.interviews[idx], ...updates }
  }
}

export function deleteInterview(id) {
  const idx = state.interviews.findIndex(i => i.id === id)
  if (idx !== -1) {
    state.interviews.splice(idx, 1)
  }
}

// ========== Offer对比 ==========
export function addOffer(offer) {
  const now = new Date().toISOString()
  state.offers.unshift({
    id: genId(),
    jobId: '',
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
    notes: '',
    createdAt: now,
    ...offer
  })
}

export function updateOffer(id, updates) {
  const idx = state.offers.findIndex(o => o.id === id)
  if (idx !== -1) {
    state.offers[idx] = { ...state.offers[idx], ...updates }
  }
}

export function deleteOffer(id) {
  const idx = state.offers.findIndex(o => o.id === id)
  if (idx !== -1) {
    state.offers.splice(idx, 1)
  }
}

// ========== 待办事项 ==========
export function addTodo(todo) {
  const now = new Date().toISOString()
  state.todos.unshift({
    id: genId(),
    content: '',
    type: 'follow', // follow, interview, other
    jobId: '',
    dueDate: '',
    completed: false,
    createdAt: now,
    ...todo
  })
}

export function updateTodo(id, updates) {
  const idx = state.todos.findIndex(t => t.id === id)
  if (idx !== -1) {
    state.todos[idx] = { ...state.todos[idx], ...updates }
  }
}

export function deleteTodo(id) {
  const idx = state.todos.findIndex(t => t.id === id)
  if (idx !== -1) {
    state.todos.splice(idx, 1)
  }
}

// ========== 导入导出 ==========
export function exportJSON() {
  return JSON.stringify(state, null, 2)
}

export function importJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    if (data.jobs) state.jobs = data.jobs
    if (data.interviews) state.interviews = data.interviews
    if (data.offers) state.offers = data.offers
    if (data.todos) state.todos = data.todos
    if (data.settings) state.settings = data.settings
    return true
  } catch (e) {
    console.error('导入失败:', e)
    return false
  }
}

export function exportMarkdown() {
  let md = '# 求职工作台数据备份\n\n'
  md += `> 导出时间：${new Date().toLocaleString('zh-CN')}\n\n`
  
  // 投递统计
  md += '## 📊 投递概览\n\n'
  md += `- 总投递数：${state.jobs.length}\n`
  md += `- 面试中：${state.jobs.filter(j => j.status === JOB_STATUS.INTERVIEW).length}\n`
  md += `- Offer：${state.jobs.filter(j => j.status === JOB_STATUS.OFFER).length}\n\n`
  
  // 岗位列表
  md += '## 📋 投递台账\n\n'
  state.jobs.forEach((job, i) => {
    md += `### ${i + 1}. ${job.company} - ${job.position}\n\n`
    md += `- **优先级**：${PRIORITY_LABELS[job.priority] || job.priority}\n`
    md += `- **状态**：${JOB_STATUS_LABELS[job.status] || job.status}\n`
    md += `- **薪资**：${job.salary || '未填写'}\n`
    md += `- **地点**：${job.location || '未填写'}\n`
    md += `- **投递日期**：${job.applyDate}\n`
    if (job.tags && job.tags.length) {
      md += `- **标签**：${job.tags.join('、')}\n`
    }
    if (job.notes) {
      md += `- **备注**：${job.notes}\n`
    }
    md += '\n'
    if (job.jd) {
      md += '<details>\n<summary>JD详情</summary>\n\n'
      md += job.jd + '\n\n'
      md += '</details>\n\n'
    }
  })
  
  // Offer对比
  if (state.offers.length) {
    md += '## 💰 Offer对比\n\n'
    state.offers.forEach((offer, i) => {
      md += `### ${i + 1}. ${offer.company} - ${offer.position}\n\n`
      md += `- **基础薪资**：${offer.baseSalary}\n`
      md += `- **奖金**：${offer.bonus || '未填写'}\n`
      md += `- **股票/期权**：${offer.stock || '未填写'}\n`
      md += `- **意向打分**：${offer.intentionScore}/10\n`
      if (offer.notes) {
        md += `- **备注**：${offer.notes}\n`
      }
      md += '\n'
    })
  }
  
  // 面试复盘
  if (state.interviews.length) {
    md += '## 🎤 面试复盘\n\n'
    state.interviews.forEach((iv, i) => {
      md += `### ${i + 1}. ${iv.company} - ${iv.position}（${iv.round}）\n\n`
      md += `- **日期**：${iv.date}\n`
      md += `- **整体感受**：${'⭐'.repeat(iv.overallFeeling)}\n`
      if (iv.questions && iv.questions.length) {
        md += `\n**面试题目：**\n\n`
        iv.questions.forEach((q, qi) => {
          md += `${qi + 1}. **${q.question}**\n`
          if (q.answer) md += `   - 回答：${q.answer}\n`
        })
      }
      if (iv.pitfalls) {
        md += `\n**踩坑点：**\n${iv.pitfalls}\n`
      }
      if (iv.improvements) {
        md += `\n**改进方案：**\n${iv.improvements}\n`
      }
      md += '\n---\n\n'
    })
  }
  
  return md
}

// ========== 统计计算 ==========
export function getStats() {
  const total = state.jobs.length
  const statusCount = {}
  Object.values(JOB_STATUS).forEach(s => {
    statusCount[s] = state.jobs.filter(j => j.status === s).length
  })
  
  const priorityCount = {
    A: state.jobs.filter(j => j.priority === 'A').length,
    B: state.jobs.filter(j => j.priority === 'B').length,
    C: state.jobs.filter(j => j.priority === 'C').length
  }
  
  // 转化率
  const interviewRate = total > 0 ? ((statusCount.interview + statusCount.offer) / total * 100).toFixed(1) : 0
  const offerRate = total > 0 ? (statusCount.offer / total * 100).toFixed(1) : 0
  const interviewToOffer = (statusCount.interview + statusCount.offer) > 0 
    ? (statusCount.offer / (statusCount.interview + statusCount.offer) * 100).toFixed(1) : 0
  
  // 超时投递（超过N天无更新且状态非终态）
  const overtimeDays = state.settings.overtimeDays || 14
  const now = new Date()
  const overtimeJobs = state.jobs.filter(job => {
    if (job.status === JOB_STATUS.OFFER || job.status === JOB_STATUS.REJECTED) return false
    const lastDate = new Date(job.lastFollowDate || job.applyDate)
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
    return diffDays >= overtimeDays
  })
  
  // 即将到来的面试
  const upcomingInterviews = state.interviews
    .filter(iv => new Date(iv.date) >= new Date(now.toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)
  
  return {
    total,
    statusCount,
    priorityCount,
    interviewRate,
    offerRate,
    interviewToOffer,
    overtimeJobs,
    upcomingInterviews,
    activeTodos: state.todos.filter(t => !t.completed).length
  }
}

export { state }

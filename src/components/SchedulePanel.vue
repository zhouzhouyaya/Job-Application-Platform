<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
      📅 日程待办
    </h2>

    <!-- 即将到来的面试 -->
    <div class="card">
      <div class="card-header">🎤 即将到来的面试</div>
      <div class="card-body">
        <div v-if="upcomingInterviews.length" class="space-y-2">
          <div 
            v-for="iv in upcomingInterviews" 
            :key="iv.id"
            class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
          >
            <div class="text-center bg-white rounded-lg px-3 py-2 shadow-sm">
              <div class="text-xs text-slate-500">{{ getMonth(iv.date) }}月</div>
              <div class="text-xl font-bold text-purple-600">{{ getDay(iv.date) }}</div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-slate-800 truncate">{{ iv.company }} - {{ iv.position }}</div>
              <div class="text-sm text-slate-500">{{ iv.round }}</div>
            </div>
            <span :class="['tag', isToday(iv.date) ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-700']">
              {{ isToday(iv.date) ? '今天' : getWeekday(iv.date) }}
            </span>
          </div>
        </div>
        <div v-else class="text-center py-6 text-slate-400 text-sm">
          暂无即将到来的面试
        </div>
      </div>
    </div>

    <!-- 超时投递提醒 -->
    <div class="card" :class="overtimeJobs.length ? 'border-orange-200' : ''">
      <div class="card-header" :class="overtimeJobs.length ? 'text-orange-700' : ''">
        ⚠️ 超时投递提醒（{{ overtimeDays }}天未跟进）
      </div>
      <div class="card-body">
        <div v-if="overtimeJobs.length" class="space-y-2">
          <div 
            v-for="job in overtimeJobs" 
            :key="job.id"
            class="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
          >
            <div class="min-w-0">
              <div class="font-medium text-slate-800 truncate">{{ job.company }} - {{ job.position }}</div>
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
        <div v-else class="text-center py-6 text-emerald-500 text-sm">
          ✅ 所有投递都已及时跟进，做得好！
        </div>
      </div>
    </div>

    <!-- 待办清单 -->
    <div class="card">
      <div class="card-header flex items-center justify-between">
        <span>✅ 待办清单</span>
        <span class="text-xs text-slate-500">
          {{ activeTodos.length }} / {{ state.todos.length }} 待完成
        </span>
      </div>
      <div class="card-body">
        <!-- 添加待办 -->
        <div class="flex gap-2 mb-4">
          <input 
            v-model="newTodoText" 
            @keydown.enter="addTodoItem"
            type="text" 
            class="input flex-1"
            placeholder="添加待办事项..."
          >
          <select v-model="newTodoType" class="select w-24">
            <option value="follow">跟进</option>
            <option value="interview">面试</option>
            <option value="other">其他</option>
          </select>
          <button @click="addTodoItem" class="btn btn-primary btn-sm">添加</button>
        </div>

        <!-- 待办列表 -->
        <div v-if="state.todos.length" class="space-y-2">
          <div 
            v-for="todo in sortedTodos" 
            :key="todo.id"
            :class="[
              'flex items-center gap-3 p-3 rounded-lg transition-all',
              todo.completed ? 'bg-slate-50 opacity-60' : 'bg-white border border-slate-200 hover:border-primary-300'
            ]"
          >
            <button 
              @click="toggleTodo(todo.id)"
              :class="[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                todo.completed 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-300 hover:border-primary-500'
              ]"
            >
              <span v-if="todo.completed" class="text-xs">✓</span>
            </button>
            <div class="flex-1 min-w-0">
              <div :class="['text-sm', todo.completed ? 'line-through text-slate-400' : 'text-slate-700']">
                {{ todo.content }}
              </div>
              <div v-if="todo.dueDate" class="text-xs text-slate-400 mt-0.5">
                📅 {{ todo.dueDate }}
              </div>
            </div>
            <span :class="['tag', todoTypeColor(todo.type)]">
              {{ todoTypeLabel(todo.type) }}
            </span>
            <button 
              @click="deleteTodoItem(todo.id)" 
              class="text-slate-400 hover:text-red-500 text-sm"
            >
              🗑️
            </button>
          </div>
        </div>

        <div v-else class="text-center py-6 text-slate-400 text-sm">
          暂无待办事项
        </div>
      </div>
    </div>

    <!-- 超时天数设置 -->
    <div class="card">
      <div class="card-header">⚙️ 提醒设置</div>
      <div class="card-body">
        <div class="flex items-center gap-4">
          <label class="text-sm text-slate-700 whitespace-nowrap">投递超时提醒阈值：</label>
          <input 
            v-model.number="state.settings.overtimeDays" 
            type="number" 
            min="3" 
            max="60"
            class="input w-24"
          >
          <span class="text-sm text-slate-500">天</span>
        </div>
        <p class="text-xs text-slate-400 mt-2">
          超过设置天数未跟进的投递会被标记为超时，在台账和看板中提醒
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { state, addTodo, updateTodo, deleteTodo, getStats, JOB_STATUS_LABELS } from '../store'

const newTodoText = ref('')
const newTodoType = ref('follow')

const overtimeDays = computed(() => state.settings.overtimeDays || 14)
const overtimeJobs = computed(() => getStats().overtimeJobs)
const upcomingInterviews = computed(() => getStats().upcomingInterviews)

const activeTodos = computed(() => state.todos.filter(t => !t.completed))

const sortedTodos = computed(() => {
  return [...state.todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

function getMonth(dateStr) {
  return new Date(dateStr).getMonth() + 1
}

function getDay(dateStr) {
  return new Date(dateStr).getDate()
}

function getWeekday(dateStr) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date(dateStr).getDay()]
}

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

function daysSince(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  return Math.floor((now - date) / (1000 * 60 * 60 * 24))
}

function todoTypeLabel(type) {
  return { follow: '跟进', interview: '面试', other: '其他' }[type] || type
}

function todoTypeColor(type) {
  return {
    follow: 'bg-blue-100 text-blue-700',
    interview: 'bg-purple-100 text-purple-700',
    other: 'bg-slate-100 text-slate-600'
  }[type] || 'bg-slate-100 text-slate-600'
}

function addTodoItem() {
  if (!newTodoText.value.trim()) return
  addTodo({
    content: newTodoText.value.trim(),
    type: newTodoType.value
  })
  newTodoText.value = ''
}

function toggleTodo(id) {
  const todo = state.todos.find(t => t.id === id)
  if (todo) {
    updateTodo(id, { completed: !todo.completed })
  }
}

function deleteTodoItem(id) {
  if (confirm('确定删除这条待办吗？')) {
    deleteTodo(id)
  }
}
</script>

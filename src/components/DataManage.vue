<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
      ⚙️ 数据管理
    </h2>

    <!-- 数据概览 -->
    <div class="card">
      <div class="card-header">📊 数据概览</div>
      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="p-3 bg-slate-50 rounded-lg">
            <div class="text-2xl font-bold text-slate-800">{{ state.jobs.length }}</div>
            <div class="text-xs text-slate-500">投递记录</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ state.interviews.length }}</div>
            <div class="text-xs text-slate-500">面试复盘</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg">
            <div class="text-2xl font-bold text-emerald-600">{{ state.offers.length }}</div>
            <div class="text-xs text-slate-500">Offer记录</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ state.todos.length }}</div>
            <div class="text-xs text-slate-500">待办事项</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出数据 -->
    <div class="card">
      <div class="card-header">📤 导出备份</div>
      <div class="card-body space-y-3">
        <p class="text-sm text-slate-600">
          所有数据都保存在浏览器本地（localStorage），建议定期导出备份，防止数据丢失。
        </p>
        <div class="flex flex-wrap gap-3">
          <button @click="exportJSONFile" class="btn btn-primary">
            📄 导出 JSON
          </button>
          <button @click="exportMarkdownFile" class="btn btn-secondary">
            📝 导出 Markdown
          </button>
        </div>
        <p class="text-xs text-slate-400">
          JSON格式包含完整数据，可用于恢复；Markdown格式便于阅读和分享。
        </p>
      </div>
    </div>

    <!-- 导入数据 -->
    <div class="card">
      <div class="card-header">📥 导入恢复</div>
      <div class="card-body space-y-3">
        <p class="text-sm text-slate-600">
          导入JSON文件恢复数据，注意：导入后将<span class="text-red-500 font-medium">覆盖现有数据</span>。
        </p>
        <div class="flex gap-3 items-center">
          <input 
            ref="fileInputRef"
            type="file" 
            accept=".json"
            @change="handleImport"
            class="hidden"
          >
          <button @click="triggerImport" class="btn btn-warning">
            📂 选择文件导入
          </button>
        </div>
      </div>
    </div>

    <!-- 清空数据 -->
    <div class="card border-red-200">
      <div class="card-header text-red-600 border-red-100">⚠️ 危险操作</div>
      <div class="card-body space-y-3">
        <p class="text-sm text-slate-600">
          清空所有数据，此操作不可撤销，请确保已导出备份。
        </p>
        <button @click="clearAllData" class="btn btn-danger">
          🗑️ 清空所有数据
        </button>
      </div>
    </div>

    <!-- 关于 -->
    <div class="card">
      <div class="card-header">ℹ️ 关于</div>
      <div class="card-body space-y-2 text-sm text-slate-600">
        <p><strong>求职工作台</strong> - 你的求职好帮手</p>
        <p>✅ 纯前端应用，所有数据保存在浏览器本地</p>
        <p>✅ 不上传任何数据，隐私安全有保障</p>
        <p>✅ 支持多模块管理，求职全流程覆盖</p>
        <p class="text-xs text-slate-400 pt-2">
          提示：请定期导出备份，清理浏览器缓存可能会丢失数据
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { state, exportJSON, exportMarkdown, importJSON } from '../store'

const fileInputRef = ref(null)

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getDateStr() {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
}

function exportJSONFile() {
  const json = exportJSON()
  downloadFile(json, `求职数据备份_${getDateStr()}.json`, 'application/json')
}

function exportMarkdownFile() {
  const md = exportMarkdown()
  downloadFile(md, `求职数据备份_${getDateStr()}.md`, 'text/markdown')
}

function triggerImport() {
  fileInputRef.value?.click()
}

function handleImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  
  if (!file.name.endsWith('.json')) {
    alert('请选择JSON格式的文件')
    return
  }
  
  if (!confirm('导入将覆盖现有数据，确定继续吗？')) {
    e.target.value = ''
    return
  }
  
  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result
    if (typeof content === 'string') {
      const success = importJSON(content)
      if (success) {
        alert('导入成功！')
      } else {
        alert('导入失败，请检查文件格式是否正确')
      }
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function clearAllData() {
  if (!confirm('确定要清空所有数据吗？此操作不可撤销！')) return
  if (!confirm('再次确认：真的要清空所有投递、面试、Offer和待办数据吗？')) return
  
  state.jobs = []
  state.interviews = []
  state.offers = []
  state.todos = []
  
  alert('数据已清空')
}
</script>

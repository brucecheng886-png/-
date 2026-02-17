<script setup>
/**
 * NodeInspectorPanel — 從 GraphPage.vue 拆分
 * 節點檢查器 (頂部橫向面板): 編輯名稱/連結/描述/圖片/Tags + AI 建議連線
 */
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  visible: { type: Boolean, default: false },
  node: { type: Object, default: null },
  allTags: { type: Array, default: () => [] },
  graphComponentRef: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save', 'delete', 'highlight-node'])

// ===== State =====
const localNodeData = ref({
  id: '',
  name: '',
  link: '',
  description: '',
  image: null,
  tags: [],
})
const tagInput = ref('')
const suggestedLinks = ref([])
const selectedSuggestedLinks = ref(new Set())
const hoveredLinkTarget = ref(null)

// ===== Watch: 同步外部 node 到本地 =====
watch(() => props.node, (newNode) => {
  if (newNode) {
    localNodeData.value = {
      id: newNode.id,
      name: newNode.name,
      link: newNode.link || '',
      description: newNode.description || '',
      image: newNode.image || null,
      tags: Array.isArray(newNode.tags) ? [...newNode.tags] : [],
    }
    // 處理 AI 建議連線
    if (newNode.links && Array.isArray(newNode.links)) {
      suggestedLinks.value = newNode.links.map(link => ({
        ...link,
        id: `${newNode.id}_to_${link.target_id}`,
      }))
      selectedSuggestedLinks.value = new Set(suggestedLinks.value.map(l => l.id))
    } else {
      suggestedLinks.value = []
      selectedSuggestedLinks.value = new Set()
    }
  }
}, { immediate: true })

// ===== Methods =====
const close = () => {
  suggestedLinks.value = []
  selectedSuggestedLinks.value = new Set()
  hoveredLinkTarget.value = null
  tagInput.value = ''
  emit('close')
}

const save = () => {
  emit('save', {
    nodeData: { ...localNodeData.value },
    selectedLinks: Array.from(selectedSuggestedLinks.value)
      .map(id => suggestedLinks.value.find(l => l.id === id))
      .filter(Boolean),
  })
}

const remove = () => {
  emit('delete', localNodeData.value.id)
}

const openLink = () => {
  const url = localNodeData.value.link
  if (!url) {
    ElMessage.warning('⚠️ 連結為空')
    return
  }
  const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
  window.open(validUrl, '_blank')
}

// ===== 圖片變更 =====
const handleImageChange = async () => {
  try {
    await ElMessageBox.confirm('選擇圖片來源', '變更封面', {
      confirmButtonText: '輸入網址',
      cancelButtonText: '選擇檔案',
      distinguishCancelAndClose: true,
    })
    // 使用者選擇「輸入網址」
    const { value: url } = await ElMessageBox.prompt('請輸入圖片 URL', '封面圖片', {
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      inputPlaceholder: 'https://example.com/image.jpg',
    })
    if (url && url.trim()) {
      localNodeData.value.image = url.trim()
      ElMessage.success('🖼️ 封面已更新（請點 SAVE 保存）')
    }
  } catch (action) {
    if (action === 'cancel') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
          ElMessage.warning('圖片大小不能超過 5MB')
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          localNodeData.value.image = reader.result
          ElMessage.success('🖼️ 封面已更新（請點 SAVE 保存）')
        }
        reader.readAsDataURL(file)
      }
      input.click()
    }
  }
}

// ===== Tag 操作 =====
const addLocalTag = () => {
  const trimmed = tagInput.value.trim()
  if (!trimmed) return
  if (!localNodeData.value.tags) localNodeData.value.tags = []
  if (localNodeData.value.tags.includes(trimmed)) {
    tagInput.value = ''
    return
  }
  localNodeData.value.tags = [...localNodeData.value.tags, trimmed]
  tagInput.value = ''
}

const removeLocalTag = (index) => {
  localNodeData.value.tags = localNodeData.value.tags.filter((_, i) => i !== index)
}

const toggleLocalTag = (tagName) => {
  if (!localNodeData.value.tags) localNodeData.value.tags = []
  const idx = localNodeData.value.tags.indexOf(tagName)
  if (idx >= 0) {
    localNodeData.value.tags = localNodeData.value.tags.filter((_, i) => i !== idx)
  } else {
    localNodeData.value.tags = [...localNodeData.value.tags, tagName]
  }
}

// ===== AI 建議連線 =====
const toggleSuggestedLink = (linkId) => {
  if (selectedSuggestedLinks.value.has(linkId)) {
    selectedSuggestedLinks.value.delete(linkId)
  } else {
    selectedSuggestedLinks.value.add(linkId)
  }
  selectedSuggestedLinks.value = new Set(selectedSuggestedLinks.value)
}

const handleLinkHover = (targetId) => {
  hoveredLinkTarget.value = targetId
  emit('highlight-node', targetId)
}

const handleLinkLeave = () => {
  hoveredLinkTarget.value = null
  emit('highlight-node', null)
}

const getTargetNodeName = (targetId) => {
  // 嘗試從 props.node 的相鄰節點取得名稱，否則回傳 ID
  return targetId
}

// 暴露供父組件呼叫
defineExpose({ getTargetNodeName })
</script>

<template>
  <transition name="slide-down">
    <div 
      v-if="visible && node" 
      class="fixed top-16 left-1/2 -translate-x-1/2 w-[950px] max-h-[85vh] z-50 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden transition-all duration-300 bg-[#0f0f0f]/95 border-white/10"
    >
      <!-- 關閉按鈕 -->
      <button 
        class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg transition-all z-10 bg-white/10 hover:bg-white/20 text-white"
        @click="close" 
        title="關閉"
      >✕</button>

      <!-- 橫向佈局 -->
      <div class="flex items-stretch h-full">
        <!-- 左側: 預覽圖 -->
        <div class="w-64 flex-shrink-0">
          <div class="relative group h-full bg-white/5 border-r border-white/10">
            <div v-if="!localNodeData.image" class="w-full h-full flex flex-col items-center justify-center gap-2">
              <svg class="w-12 h-12 opacity-30 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span class="text-sm text-gray-400 font-medium">No Cover</span>
            </div>
            <img 
              v-else 
              :src="localNodeData.image" 
              alt="Node Cover"
              class="w-full h-full object-cover"
            />
            <!-- Hover Overlay -->
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" @click="handleImageChange">
              <span class="text-3xl">📷</span>
              <span class="text-sm text-white font-semibold">Change Cover</span>
            </div>
          </div>
        </div>

        <!-- 中間: 標題、輸入框與 AI 建議連線 -->
        <div class="flex-1 flex flex-col p-5 gap-3">
          <!-- 標題 -->
          <div>
            <input 
              v-model="localNodeData.name"
              type="text"
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-lg font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="節點標題..."
            />
          </div>

          <!-- SRL -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">SRL</label>
            <input 
              v-model="localNodeData.id"
              type="text"
              class="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              readonly
            />
          </div>

          <!-- LINK -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">LINK</label>
            <div class="flex gap-2">
              <input 
                v-model="localNodeData.link"
                type="text"
                class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="https://..."
              />
              <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all" @click="openLink">Go</button>
            </div>
          </div>

          <!-- TAGS -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏷️</span>
              <span>TAGS</span>
              <span class="text-xs font-normal text-gray-500">(Enter 新增)</span>
            </label>
            <div class="flex flex-wrap gap-1.5 min-h-[28px]">
              <span 
                v-for="(tag, idx) in localNodeData.tags" 
                :key="idx"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium rounded-full transition-all hover:bg-blue-500/25 group"
              >
                {{ tag }}
                <button 
                  class="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-red-500/40 hover:text-red-300 text-blue-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  @click="removeLocalTag(idx)"
                  title="移除"
                >×</button>
              </span>
              <span v-if="!localNodeData.tags || localNodeData.tags.length === 0" class="text-xs text-gray-500 italic py-1">尚無標籤</span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="tagInput"
                type="text"
                class="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="輸入標籤..."
                @keydown.enter.prevent="addLocalTag"
              />
              <button 
                class="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                :disabled="!tagInput.trim()"
                @click="addLocalTag"
              >+ 新增</button>
            </div>
            <div v-if="allTags.length > 0" class="flex flex-wrap gap-1 mt-0.5">
              <button
                v-for="t in allTags.slice(0, 8)"
                :key="t.name"
                class="px-2 py-0.5 text-[11px] rounded-full transition-all cursor-pointer"
                :class="localNodeData.tags?.includes(t.name) 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border border-transparent'"
                @click="toggleLocalTag(t.name)"
              >
                {{ t.name }} <span class="text-gray-600">({{ t.count }})</span>
              </button>
            </div>
          </div>

          <!-- AI 建議連線區塊 -->
          <div v-if="suggestedLinks.length > 0" class="flex flex-col gap-2 mt-2">
            <label class="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🤖</span>
              <span>AI 建議連線</span>
              <span class="text-xs font-normal text-gray-400">(取消勾選不儲存)</span>
            </label>
            <div class="max-h-32 overflow-y-auto space-y-2 pr-2">
              <div 
                v-for="link in suggestedLinks" 
                :key="link.id"
                class="group flex items-start gap-2 p-2.5 rounded-lg border transition-all cursor-pointer"
                :class="[
                  selectedSuggestedLinks.has(link.id)
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-white/5 border-white/10',
                  hoveredLinkTarget === link.target_id ? 'ring-2 ring-purple-500' : ''
                ]"
                @mouseenter="handleLinkHover(link.target_id)"
                @mouseleave="handleLinkLeave"
              >
                <input 
                  type="checkbox"
                  :checked="selectedSuggestedLinks.has(link.id)"
                  @change="toggleSuggestedLink(link.id)"
                  class="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                />
                <div class="flex-1 text-sm">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-white">{{ getTargetNodeName(link.target_id) }}</span>
                    <span class="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded">{{ link.relation }}</span>
                  </div>
                  <p class="text-xs text-gray-400 leading-relaxed">{{ link.reason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按鈕列 -->
          <div class="flex gap-3 mt-auto pt-2">
            <button 
              class="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all" 
              @click="save"
            >
              <span class="text-base">💾</span>
              <span>SAVE</span>
            </button>
            <button 
              class="px-4 py-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg shadow-red-500/30 transition-all" 
              @click="remove"
              title="刪除節點"
            >
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6 7v5M10 7v5M4 4l.8 9a1 1 0 001 .9h4.4a1 1 0 001-.9L12 4"/></svg>
              <span>DELETE</span>
            </button>
          </div>
        </div>

        <!-- 右側: 描述區域 -->
        <div class="w-80 flex-shrink-0 p-5 border-l border-white/10">
          <div class="flex flex-col gap-2 h-full">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">DESCRIPTION</label>
            <textarea 
              v-model="localNodeData.description"
              class="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm leading-relaxed text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              placeholder="節點描述..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px) translateX(-50%);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px) translateX(-50%);
}
</style>

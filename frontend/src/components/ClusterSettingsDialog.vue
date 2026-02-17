<script setup>
/**
 * ClusterSettingsDialog — 從 GraphPage.vue 拆分
 * 星系叢集自訂圖片面板（預設星球 / URL / 上傳）
 */
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  graphComponentRef: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

// ===== State =====
const clusterTypes = ref([])
const clusterImageUrl = ref('')
const editingClusterType = ref(null)
const showPresetPicker = ref(null)
const presetPlanets = ref([])
const presetGenerated = ref(false)

// ===== Methods =====
const open = () => {
  if (props.graphComponentRef?.getClusterTypes) {
    clusterTypes.value = props.graphComponentRef.getClusterTypes()
  }
}

const close = () => {
  emit('update:modelValue', false)
}

const setClusterImage = (type, url) => {
  if (props.graphComponentRef?.setClusterImage) {
    props.graphComponentRef.setClusterImage(type, url)
    clusterTypes.value = props.graphComponentRef.getClusterTypes()
  }
}

const removeClusterImage = (type) => {
  setClusterImage(type, null)
}

const startEditClusterImage = (type) => {
  editingClusterType.value = type
  const current = clusterTypes.value.find(t => t.type === type)
  clusterImageUrl.value = current?.image || ''
}

const confirmClusterImage = () => {
  if (editingClusterType.value && clusterImageUrl.value.trim()) {
    setClusterImage(editingClusterType.value, clusterImageUrl.value.trim())
  }
  editingClusterType.value = null
  clusterImageUrl.value = ''
}

const handleClusterImageUpload = (type, event) => {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    setClusterImage(type, e.target.result)
  }
  reader.readAsDataURL(file)
}

// ===== 預設星球生成 (Canvas) =====
const renderPlanetToDataUrl = (cfg) => {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const cx = size / 2, cy = size / 2, r = size * 0.42
  const [br, bg, bb] = cfg.base
  const [ar, ag, ab] = cfg.accent

  ctx.clearRect(0, 0, size, size)

  // 外層光暈
  const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.35)
  glow.addColorStop(0, `rgba(${ar},${ag},${ab},0.25)`)
  glow.addColorStop(1, `rgba(${ar},${ag},${ab},0)`)
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2)
  ctx.fillStyle = glow; ctx.fill()

  // 球體主體
  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip()

  const body = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r)
  body.addColorStop(0, `rgb(${Math.min(255, ar + 60)},${Math.min(255, ag + 60)},${Math.min(255, ab + 60)})`)
  body.addColorStop(0.3, `rgb(${br},${bg},${bb})`)
  body.addColorStop(1, `rgb(${Math.max(0, br - 60)},${Math.max(0, bg - 60)},${Math.max(0, bb - 60)})`)
  ctx.fillStyle = body
  ctx.fillRect(0, 0, size, size)

  // 表面紋路
  ctx.globalAlpha = 0.3
  if (cfg.pattern === 'bands') {
    for (let i = 0; i < 6; i++) {
      const y = cy - r + r * 2 * (i + 0.5) / 6
      const bw = 2 + Math.random() * 4
      ctx.fillStyle = i % 2 === 0 ? `rgba(${ar},${ag},${ab},0.3)` : `rgba(0,0,0,0.15)`
      ctx.fillRect(cx - r, y - bw / 2, r * 2, bw)
    }
  } else if (cfg.pattern === 'spots') {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * r * 0.75
      const sr = 3 + Math.random() * 8
      ctx.beginPath()
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, sr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.2 + Math.random() * 0.3})`
      ctx.fill()
    }
  } else if (cfg.pattern === 'swirl') {
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.25)`
    ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      for (let t = 0; t < Math.PI * 4; t += 0.1) {
        const sr = (t / (Math.PI * 4)) * r * 0.85
        const x = cx + Math.cos(t + i * 2) * sr
        const y = cy + Math.sin(t + i * 2) * sr * 0.5
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  } else if (cfg.pattern === 'cracks') {
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.6)`
    ctx.lineWidth = 1.5
    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      let x = cx + (Math.random() - 0.5) * r
      let y = cy + (Math.random() - 0.5) * r
      ctx.moveTo(x, y)
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - 0.5) * 20
        y += (Math.random() - 0.5) * 20
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.5)`
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  // 邊緣暗化
  const edge = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r)
  edge.addColorStop(0, 'rgba(0,0,0,0)')
  edge.addColorStop(0.7, 'rgba(0,0,0,0.1)')
  edge.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, size, size)

  // 高光
  const hl = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.5)
  hl.addColorStop(0, 'rgba(255,255,255,0.45)')
  hl.addColorStop(0.4, 'rgba(255,255,255,0.1)')
  hl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hl
  ctx.fillRect(0, 0, size, size)

  ctx.restore()

  // 光圈邊框
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.35)`
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 土星環
  if (cfg.ring) {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * 1.3, r * 0.25, -0.2, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.4)`
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.2)`
    ctx.lineWidth = 8
    ctx.stroke()
    ctx.restore()
  }

  return canvas.toDataURL('image/png')
}

const generatePresetPlanets = () => {
  if (presetGenerated.value) return
  presetGenerated.value = true

  const configs = [
    { name: '藍色星球', base: [40, 120, 220], accent: [100, 180, 255], ring: false, pattern: 'swirl' },
    { name: '紅色星球', base: [180, 50, 40], accent: [255, 120, 80], ring: false, pattern: 'bands' },
    { name: '翡翠星球', base: [30, 150, 100], accent: [80, 220, 160], ring: false, pattern: 'swirl' },
    { name: '紫色星球', base: [120, 50, 180], accent: [180, 120, 255], ring: false, pattern: 'spots' },
    { name: '金色星球', base: [190, 150, 40], accent: [255, 210, 80], ring: false, pattern: 'bands' },
    { name: '土星', base: [180, 160, 120], accent: [220, 200, 160], ring: true, pattern: 'bands' },
    { name: '冰藍星球', base: [60, 160, 200], accent: [180, 230, 255], ring: false, pattern: 'spots' },
    { name: '熔岩星球', base: [160, 40, 20], accent: [255, 160, 40], ring: false, pattern: 'cracks' },
    { name: '深空星球', base: [20, 25, 60], accent: [60, 80, 160], ring: false, pattern: 'spots' },
    { name: '粉色星球', base: [200, 80, 140], accent: [255, 150, 200], ring: false, pattern: 'swirl' },
    { name: '雙環星球', base: [80, 100, 160], accent: [140, 180, 240], ring: true, pattern: 'swirl' },
    { name: '綠洲星球', base: [40, 120, 60], accent: [100, 200, 120], ring: false, pattern: 'bands' },
  ]

  presetPlanets.value = configs.map(cfg => ({
    name: cfg.name,
    dataUrl: renderPlanetToDataUrl(cfg),
  }))
}

const openPresetPicker = (type) => {
  generatePresetPlanets()
  showPresetPicker.value = type
}

const selectPreset = (type, dataUrl) => {
  setClusterImage(type, dataUrl)
  showPresetPicker.value = null
}

// 當 modelValue 變為 true 時自動初始化
defineExpose({ open })
</script>

<template>
  <transition name="slide-down">
    <div v-if="modelValue" class="fixed inset-0 z-[60] flex items-center justify-center" @click.self="close">
      <div class="cluster-settings-panel">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
            </div>
            <div>
              <h3 class="text-white font-bold text-base m-0">星系自訂圖片</h3>
              <p class="text-gray-400 text-xs m-0 mt-0.5">為每個類型叢集設定專屬星球外觀</p>
            </div>
          </div>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none" @click="close">✕</button>
        </div>

        <div class="cluster-types-list">
          <div v-for="ct in clusterTypes" :key="ct.type" class="cluster-type-row">
            <!-- 預覽 -->
            <div class="cluster-preview" :style="{ borderColor: ct.color + '60' }">
              <img v-if="ct.image" :src="ct.image" class="w-full h-full object-cover rounded-lg" />
              <div v-else class="w-full h-full rounded-lg flex items-center justify-center" :style="{ background: `radial-gradient(circle, ${ct.color}44, ${ct.color}15)` }">
                <svg class="w-6 h-6 opacity-40 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>
              </div>
            </div>
            
            <!-- 資訊 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: ct.color }"></span>
                <span class="text-white font-semibold text-sm truncate">{{ ct.type }}</span>
                <span class="text-xs text-gray-400">({{ ct.count }})</span>
              </div>
              <p class="text-xs text-gray-500 mt-1 m-0 truncate">{{ ct.image ? '已設定自訂圖片' : '使用預設星球效果' }}</p>
            </div>

            <!-- 操作按鈕 -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button class="cluster-action-btn cluster-action-preset" title="選擇預設星球" @click="openPresetPicker(ct.type)">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              <label class="cluster-action-btn" title="上傳圖片">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <input type="file" accept="image/*" class="hidden" @change="handleClusterImageUpload(ct.type, $event)" />
              </label>
              <button class="cluster-action-btn" title="輸入圖片 URL" @click="startEditClusterImage(ct.type)">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              </button>
              <button v-if="ct.image" class="cluster-action-btn cluster-action-danger" title="移除圖片" @click="removeClusterImage(ct.type)">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          
          <!-- 空狀態 -->
          <div v-if="clusterTypes.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <p class="text-gray-400 text-sm m-0">需要至少 3 個同類型節點才會形成星系</p>
          </div>
        </div>

        <!-- URL 輸入面板 -->
        <transition name="slide-down">
          <div v-if="editingClusterType" class="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p class="text-xs text-gray-400 m-0 mb-2">為 <span class="text-blue-400 font-semibold">{{ editingClusterType }}</span> 設定圖片 URL</p>
            <div class="flex gap-2">
              <input 
                v-model="clusterImageUrl"
                type="text" 
                class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/galaxy.png"
                @keyup.enter="confirmClusterImage"
              />
              <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer border-none" @click="confirmClusterImage">確認</button>
              <button class="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all cursor-pointer border-none" @click="editingClusterType = null">取消</button>
            </div>
          </div>
        </transition>

        <!-- 預設星球選擇器 -->
        <transition name="slide-down">
          <div v-if="showPresetPicker" class="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs text-gray-400 m-0">為 <span class="text-purple-400 font-semibold">{{ showPresetPicker }}</span> 選擇預設星球</p>
              <button class="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none" @click="showPresetPicker = null">關閉</button>
            </div>
            <div class="preset-grid">
              <button 
                v-for="preset in presetPlanets" 
                :key="preset.name"
                class="preset-planet-btn"
                :title="preset.name"
                @click="selectPreset(showPresetPicker, preset.dataUrl)"
              >
                <img :src="preset.dataUrl" :alt="preset.name" class="w-full h-full object-contain" />
                <span class="preset-planet-name">{{ preset.name }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.cluster-settings-panel {
  width: 480px;
  max-height: 75vh;
  padding: 24px;
  background: rgba(15, 15, 20, 0.97);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.08);
  overflow-y: auto;
}

.cluster-types-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cluster-type-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.cluster-type-row:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.cluster-preview {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.cluster-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.cluster-action-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.cluster-action-danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.cluster-action-preset:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.preset-planet-btn {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preset-planet-btn:hover {
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(168, 85, 247, 0.08);
  transform: scale(1.05);
}

.preset-planet-name {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

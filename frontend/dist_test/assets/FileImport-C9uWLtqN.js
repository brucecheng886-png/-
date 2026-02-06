import { y as openBlock, D as createElementBlock, az as createStaticVNode, G as createBaseVNode, S as createTextVNode, I as normalizeClass, $ as withModifiers, U as toDisplayString, M as Fragment, a6 as renderList, R as createCommentVNode, H as normalizeStyle } from "./vue-vendor-rpbpBucb.js";
import { _ as _export_sfc } from "./index-DDdIzyMR.js";
import "./element-plus-DavumCtP.js";
const _sfc_main = {
  name: "FileImport",
  data() {
    return {
      isDragging: false,
      files: [],
      uploading: false,
      uploadedCount: 0,
      uploadProgress: 0,
      uploadResults: []
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      const selectedFiles = Array.from(event.target.files);
      this.addFiles(selectedFiles);
    },
    handleDrop(event) {
      this.isDragging = false;
      const droppedFiles = Array.from(event.dataTransfer.files);
      this.addFiles(droppedFiles);
    },
    addFiles(newFiles) {
      const existingNames = this.files.map((f) => f.name);
      const uniqueFiles = newFiles.filter((f) => !existingNames.includes(f.name));
      this.files.push(...uniqueFiles);
    },
    removeFile(index) {
      this.files.splice(index, 1);
    },
    clearFiles() {
      this.files = [];
      this.uploadResults = [];
    },
    async uploadFiles() {
      if (this.files.length === 0) {
        alert("請先選擇檔案");
        return;
      }
      this.uploading = true;
      this.uploadedCount = 0;
      this.uploadProgress = 0;
      this.uploadResults = [];
      try {
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i];
          try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/system/upload", {
              method: "POST",
              body: formData
            });
            const result = await response.json();
            if (response.ok) {
              this.uploadResults.push(result);
            } else {
              this.uploadResults.push({
                success: false,
                filename: file.name,
                error: result.detail || "上傳失敗"
              });
            }
          } catch (error) {
            this.uploadResults.push({
              success: false,
              filename: file.name,
              error: error.message || "網路錯誤"
            });
          }
          this.uploadedCount++;
          this.uploadProgress = this.uploadedCount / this.files.length * 100;
        }
        this.files = [];
        const successCount = this.uploadResults.filter((r) => r.success).length;
        alert(`上傳完成！成功: ${successCount}, 失敗: ${this.files.length - successCount}`);
      } catch (error) {
        console.error("上傳錯誤:", error);
        alert("上傳過程發生錯誤");
      } finally {
        this.uploading = false;
      }
    },
    getFileIcon(filename) {
      const ext = filename.split(".").pop().toLowerCase();
      const icons = {
        pdf: "📕",
        docx: "📘",
        xlsx: "📊",
        txt: "📄",
        md: "📝",
        default: "📎"
      };
      return icons[ext] || icons.default;
    },
    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    }
  }
};
const _hoisted_1 = { class: "min-h-screen h-screen overflow-y-auto bg-[#0a0e27] px-12 py-10 custom-scrollbar" };
const _hoisted_2 = { class: "max-w-5xl mx-auto" };
const _hoisted_3 = { class: "bg-[#1a1d3a] border-2 border-[#2d3154] rounded-3xl shadow-xl" };
const _hoisted_4 = { class: "p-12" };
const _hoisted_5 = { class: "text-center" };
const _hoisted_6 = { class: "text-2xl font-bold text-gray-300 mb-3" };
const _hoisted_7 = {
  key: 0,
  class: "mt-8"
};
const _hoisted_8 = { class: "text-xl font-bold text-white mb-4 flex items-center gap-2" };
const _hoisted_9 = { class: "space-y-3" };
const _hoisted_10 = { class: "flex items-center gap-3 flex-1" };
const _hoisted_11 = { class: "text-3xl" };
const _hoisted_12 = { class: "flex-1" };
const _hoisted_13 = { class: "font-semibold text-white" };
const _hoisted_14 = { class: "text-sm text-gray-400" };
const _hoisted_15 = ["onClick"];
const _hoisted_16 = { class: "mt-6 flex gap-4" };
const _hoisted_17 = ["disabled"];
const _hoisted_18 = { key: 0 };
const _hoisted_19 = { key: 1 };
const _hoisted_20 = ["disabled"];
const _hoisted_21 = {
  key: 1,
  class: "mt-6"
};
const _hoisted_22 = { class: "bg-gray-700 rounded-full h-4 overflow-hidden" };
const _hoisted_23 = { class: "text-center text-sm text-gray-400 mt-2" };
const _hoisted_24 = {
  key: 0,
  class: "mt-8"
};
const _hoisted_25 = { class: "bg-[#1a1d3a] border-2 border-[#2d3154] rounded-3xl shadow-xl overflow-hidden" };
const _hoisted_26 = { class: "p-6 space-y-3" };
const _hoisted_27 = { class: "flex items-start gap-3" };
const _hoisted_28 = { class: "text-2xl" };
const _hoisted_29 = { class: "flex-1" };
const _hoisted_30 = {
  key: 0,
  class: "text-xs text-gray-400 mt-1"
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1, [
    _cache[13] || (_cache[13] = createStaticVNode('<header class="text-center mb-12" data-v-bb9e4b7e><div class="flex flex-col items-center gap-3" data-v-bb9e4b7e><h1 class="flex items-center gap-4 m-0 text-5xl font-extrabold text-white" data-v-bb9e4b7e><span class="text-6xl" data-v-bb9e4b7e>📤</span><span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" data-v-bb9e4b7e>檔案上傳中心</span></h1><p class="text-base font-medium text-gray-400 uppercase tracking-widest m-0" data-v-bb9e4b7e>File Upload Center</p></div></header>', 1)),
    createBaseVNode("div", _hoisted_2, [
      _cache[12] || (_cache[12] = createStaticVNode('<div class="mb-8 p-6 bg-blue-900/10 border-2 border-blue-500/30 rounded-2xl" data-v-bb9e4b7e><div class="flex items-start gap-4" data-v-bb9e4b7e><span class="text-4xl" data-v-bb9e4b7e>💡</span><div class="flex-1" data-v-bb9e4b7e><h3 class="text-xl font-bold text-blue-300 mb-2" data-v-bb9e4b7e>支援功能</h3><ul class="space-y-2 text-gray-300" data-v-bb9e4b7e><li class="flex items-center gap-2" data-v-bb9e4b7e><span class="text-green-500" data-v-bb9e4b7e>✓</span><strong data-v-bb9e4b7e>拖曳上傳</strong> - 直接將檔案拖曳到上傳區域 </li><li class="flex items-center gap-2" data-v-bb9e4b7e><span class="text-green-500" data-v-bb9e4b7e>✓</span><strong data-v-bb9e4b7e>批次上傳</strong> - 同時上傳多個檔案 </li><li class="flex items-center gap-2" data-v-bb9e4b7e><span class="text-green-500" data-v-bb9e4b7e>✓</span><strong data-v-bb9e4b7e>自動監控</strong> - 上傳後自動觸發監控服務處理 </li><li class="flex items-center gap-2 mt-3" data-v-bb9e4b7e><span class="text-blue-500" data-v-bb9e4b7e>ℹ️</span><span data-v-bb9e4b7e>檔案將儲存至 <code class="px-2 py-1 bg-gray-700 rounded" data-v-bb9e4b7e>C:/BruV_Data/Auto_Import</code></span></li></ul></div></div></div>', 1)),
      createBaseVNode("div", _hoisted_3, [
        _cache[10] || (_cache[10] = createBaseVNode("div", { class: "px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 border-b border-white/10" }, [
          createBaseVNode("h2", { class: "text-2xl font-bold text-white flex items-center gap-3" }, [
            createBaseVNode("span", { class: "text-3xl" }, "📁"),
            createTextVNode(" 上傳檔案 ")
          ])
        ], -1)),
        createBaseVNode("div", _hoisted_4, [
          createBaseVNode("div", {
            onDrop: _cache[1] || (_cache[1] = withModifiers((...args) => $options.handleDrop && $options.handleDrop(...args), ["prevent"])),
            onDragover: _cache[2] || (_cache[2] = withModifiers(($event) => $data.isDragging = true, ["prevent"])),
            onDragleave: _cache[3] || (_cache[3] = withModifiers(($event) => $data.isDragging = false, ["prevent"])),
            onClick: _cache[4] || (_cache[4] = (...args) => $options.triggerFileInput && $options.triggerFileInput(...args)),
            class: normalizeClass(["relative border-4 border-dashed rounded-3xl p-16 transition-all cursor-pointer", $data.isDragging ? "border-blue-500 bg-blue-900/20 scale-105" : "border-[#2d3154] bg-white/5 hover:border-blue-400 hover:bg-blue-900/10"])
          }, [
            createBaseVNode("div", _hoisted_5, [
              _cache[7] || (_cache[7] = createBaseVNode("div", { class: "mb-6" }, [
                createBaseVNode("span", { class: "text-8xl animate-bounce inline-block" }, "📎")
              ], -1)),
              createBaseVNode("p", _hoisted_6, toDisplayString($data.isDragging ? "放開以上傳" : "拖曳檔案到此處"), 1),
              _cache[8] || (_cache[8] = createStaticVNode('<p class="text-lg text-gray-400 mb-6" data-v-bb9e4b7e> 或點擊此處選擇檔案 </p><div class="flex justify-center gap-3 flex-wrap" data-v-bb9e4b7e><span class="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg text-sm font-semibold" data-v-bb9e4b7e> PDF </span><span class="px-4 py-2 bg-green-900/30 text-green-300 rounded-lg text-sm font-semibold" data-v-bb9e4b7e> DOCX </span><span class="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-lg text-sm font-semibold" data-v-bb9e4b7e> XLSX </span><span class="px-4 py-2 bg-yellow-900/30 text-yellow-300 rounded-lg text-sm font-semibold" data-v-bb9e4b7e> TXT </span><span class="px-4 py-2 bg-red-900/30 text-red-300 rounded-lg text-sm font-semibold" data-v-bb9e4b7e> MD </span></div>', 2))
            ]),
            createBaseVNode("input", {
              ref: "fileInput",
              type: "file",
              multiple: "",
              onChange: _cache[0] || (_cache[0] = (...args) => $options.handleFileSelect && $options.handleFileSelect(...args)),
              class: "hidden",
              accept: ".pdf,.txt,.md,.docx,.xlsx"
            }, null, 544)
          ], 34),
          $data.files.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_7, [
            createBaseVNode("h3", _hoisted_8, [
              _cache[9] || (_cache[9] = createBaseVNode("span", null, "📋", -1)),
              createTextVNode(" 已選擇的檔案 (" + toDisplayString($data.files.length) + ") ", 1)
            ]),
            createBaseVNode("div", _hoisted_9, [
              (openBlock(true), createElementBlock(Fragment, null, renderList($data.files, (file, index) => {
                return openBlock(), createElementBlock("div", {
                  key: index,
                  class: "flex items-center justify-between p-4 bg-white/5 border border-[#2d3154] rounded-xl"
                }, [
                  createBaseVNode("div", _hoisted_10, [
                    createBaseVNode("span", _hoisted_11, toDisplayString($options.getFileIcon(file.name)), 1),
                    createBaseVNode("div", _hoisted_12, [
                      createBaseVNode("p", _hoisted_13, toDisplayString(file.name), 1),
                      createBaseVNode("p", _hoisted_14, toDisplayString($options.formatFileSize(file.size)), 1)
                    ])
                  ]),
                  createBaseVNode("button", {
                    onClick: ($event) => $options.removeFile(index),
                    class: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
                  }, " 移除 ", 8, _hoisted_15)
                ]);
              }), 128))
            ]),
            createBaseVNode("div", _hoisted_16, [
              createBaseVNode("button", {
                onClick: _cache[5] || (_cache[5] = (...args) => $options.uploadFiles && $options.uploadFiles(...args)),
                disabled: $data.uploading,
                class: "flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all font-bold text-lg shadow-lg disabled:cursor-not-allowed"
              }, [
                !$data.uploading ? (openBlock(), createElementBlock("span", _hoisted_18, "🚀 開始上傳")) : (openBlock(), createElementBlock("span", _hoisted_19, "⏳ 上傳中... (" + toDisplayString($data.uploadedCount) + "/" + toDisplayString($data.files.length) + ")", 1))
              ], 8, _hoisted_17),
              createBaseVNode("button", {
                onClick: _cache[6] || (_cache[6] = (...args) => $options.clearFiles && $options.clearFiles(...args)),
                disabled: $data.uploading,
                class: "px-8 py-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-bold text-lg disabled:cursor-not-allowed"
              }, " 清空列表 ", 8, _hoisted_20)
            ])
          ])) : createCommentVNode("", true),
          $data.uploading ? (openBlock(), createElementBlock("div", _hoisted_21, [
            createBaseVNode("div", _hoisted_22, [
              createBaseVNode("div", {
                class: "bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300",
                style: normalizeStyle({ width: `${$data.uploadProgress}%` })
              }, null, 4)
            ]),
            createBaseVNode("p", _hoisted_23, " 上傳進度: " + toDisplayString($data.uploadProgress.toFixed(0)) + "% ", 1)
          ])) : createCommentVNode("", true)
        ])
      ]),
      $data.uploadResults.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_24, [
        createBaseVNode("div", _hoisted_25, [
          _cache[11] || (_cache[11] = createBaseVNode("div", { class: "px-8 py-6 bg-gradient-to-r from-green-500 to-teal-500 border-b border-white/10" }, [
            createBaseVNode("h2", { class: "text-2xl font-bold text-white flex items-center gap-3" }, [
              createBaseVNode("span", { class: "text-3xl" }, "✅"),
              createTextVNode(" 上傳結果 ")
            ])
          ], -1)),
          createBaseVNode("div", _hoisted_26, [
            (openBlock(true), createElementBlock(Fragment, null, renderList($data.uploadResults, (result, index) => {
              return openBlock(), createElementBlock("div", {
                key: index,
                class: normalizeClass(["p-4 rounded-xl border-2", result.success ? "bg-green-900/10 border-green-500/30" : "bg-red-900/10 border-red-500/30"])
              }, [
                createBaseVNode("div", _hoisted_27, [
                  createBaseVNode("span", _hoisted_28, toDisplayString(result.success ? "✅" : "❌"), 1),
                  createBaseVNode("div", _hoisted_29, [
                    createBaseVNode("p", {
                      class: normalizeClass(["font-bold", result.success ? "text-green-300" : "text-red-300"])
                    }, toDisplayString(result.filename), 3),
                    createBaseVNode("p", {
                      class: normalizeClass(["text-sm", result.success ? "text-green-400" : "text-red-400"])
                    }, toDisplayString(result.success ? result.message : result.error), 3),
                    result.success ? (openBlock(), createElementBlock("p", _hoisted_30, " 儲存路徑: " + toDisplayString(result.saved_path), 1)) : createCommentVNode("", true)
                  ])
                ])
              ], 2);
            }), 128))
          ])
        ])
      ])) : createCommentVNode("", true)
    ])
  ]);
}
const FileImport = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bb9e4b7e"]]);
export {
  FileImport as default
};

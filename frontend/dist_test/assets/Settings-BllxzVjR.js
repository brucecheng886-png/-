import { j as onMounted, y as openBlock, D as createElementBlock, G as createBaseVNode, S as createTextVNode, az as createStaticVNode, P as withDirectives, an as vModelText, aD as vModelDynamic, U as toDisplayString, I as normalizeClass, R as createCommentVNode, E as createVNode, F as withCtx, W as Transition, r as ref } from "./vue-vendor-rpbpBucb.js";
import { _ as _export_sfc } from "./index-DDdIzyMR.js";
import "./element-plus-DavumCtP.js";
const _hoisted_1 = { class: "settings-container" };
const _hoisted_2 = {
  key: 0,
  class: "loading-state"
};
const _hoisted_3 = {
  key: 1,
  class: "settings-card"
};
const _hoisted_4 = { class: "config-section" };
const _hoisted_5 = { class: "form-group" };
const _hoisted_6 = { class: "form-group" };
const _hoisted_7 = { class: "input-with-toggle" };
const _hoisted_8 = ["type"];
const _hoisted_9 = ["title"];
const _hoisted_10 = { class: "config-section" };
const _hoisted_11 = { class: "form-group" };
const _hoisted_12 = { class: "form-group" };
const _hoisted_13 = { class: "input-with-toggle" };
const _hoisted_14 = ["type"];
const _hoisted_15 = ["title"];
const _hoisted_16 = { class: "form-actions" };
const _hoisted_17 = ["disabled"];
const _hoisted_18 = {
  key: 0,
  class: "btn-spinner"
};
const _hoisted_19 = {
  key: 1,
  class: "btn-icon"
};
const _hoisted_20 = ["disabled"];
const _hoisted_21 = ["disabled"];
const _hoisted_22 = {
  key: 0,
  class: "btn-spinner"
};
const _hoisted_23 = {
  key: 1,
  class: "btn-icon"
};
const _hoisted_24 = {
  key: 0,
  class: "test-result-box"
};
const _hoisted_25 = { class: "service-test-result" };
const _hoisted_26 = { class: "service-header" };
const _hoisted_27 = { class: "service-details" };
const _hoisted_28 = { class: "service-test-result" };
const _hoisted_29 = { class: "service-header" };
const _hoisted_30 = { class: "service-details" };
const _hoisted_31 = { class: "toast-icon" };
const _hoisted_32 = { class: "toast-message" };
const _sfc_main = {
  __name: "Settings",
  setup(__props) {
    const API_BASE_URL = "http://localhost:8000";
    const loading = ref(true);
    const saving = ref(false);
    const testing = ref(false);
    const hasChanges = ref(false);
    const showDifyKey = ref(false);
    const showRagflowKey = ref(false);
    const config = ref({
      dify_key: "",
      ragflow_key: "",
      dify_api_url: "",
      ragflow_api_url: ""
    });
    const testResult = ref(null);
    const toast = ref({
      show: false,
      type: "success",
      message: ""
    });
    const showToast = (type, message) => {
      toast.value = { show: true, type, message };
      setTimeout(() => {
        toast.value.show = false;
      }, 5e3);
    };
    const loadConfig = async () => {
      loading.value = true;
      try {
        const response = await fetch(`${API_BASE_URL}/api/system/config`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.success && data.config) {
          config.value = {
            dify_key: data.config.dify_key || "",
            ragflow_key: data.config.ragflow_key || "",
            dify_api_url: data.config.dify_api_url || "",
            ragflow_api_url: data.config.ragflow_api_url || ""
          };
          console.log("配置載入成功:", data.config);
        }
      } catch (error) {
        console.error("載入配置失敗:", error);
        showToast("error", `載入配置失敗: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };
    const saveConfig = async () => {
      saving.value = true;
      try {
        const payload = {};
        if (config.value.dify_key) {
          payload.dify_key = config.value.dify_key;
        }
        if (config.value.ragflow_key) {
          payload.ragflow_key = config.value.ragflow_key;
        }
        if (config.value.dify_api_url) {
          payload.dify_api_url = config.value.dify_api_url;
        }
        if (config.value.ragflow_api_url) {
          payload.ragflow_api_url = config.value.ragflow_api_url;
        }
        if (Object.keys(payload).length === 0) {
          showToast("error", "請至少填寫一個設定項目");
          saving.value = false;
          return;
        }
        console.log("準備發送的配置:", payload);
        const response = await fetch(`${API_BASE_URL}/api/system/config`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          showToast("success", "✅ 設定已保存到 config.json！修改將立即生效");
          hasChanges.value = false;
          await loadConfig();
        } else {
          throw new Error(data.message || "更新失敗");
        }
      } catch (error) {
        console.error("儲存配置失敗:", error);
        showToast("error", `儲存失敗: ${error.message}`);
      } finally {
        saving.value = false;
      }
    };
    const testConnection = async () => {
      testing.value = true;
      testResult.value = null;
      try {
        const response = await fetch(`${API_BASE_URL}/api/system/test-connection`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        testResult.value = data;
        if (data.success) {
          showToast("success", "✅ 所有服務連接正常！");
        } else {
          showToast("error", "⚠️ 部分服務連接失敗，請檢查測試結果");
        }
      } catch (error) {
        console.error("測試連接失敗:", error);
        showToast("error", `測試失敗: ${error.message}`);
      } finally {
        testing.value = false;
      }
    };
    onMounted(() => {
      loadConfig();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[35] || (_cache[35] = createBaseVNode("div", { class: "page-header" }, [
          createBaseVNode("h1", { class: "page-title" }, [
            createBaseVNode("span", { class: "title-icon" }, "⚙️"),
            createTextVNode(" 系統設定 ")
          ]),
          createBaseVNode("p", { class: "page-subtitle" }, "管理 API Keys 和系統配置")
        ], -1)),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_2, [..._cache[10] || (_cache[10] = [
          createBaseVNode("div", { class: "spinner" }, null, -1),
          createBaseVNode("p", null, "載入配置中...", -1)
        ])])) : (openBlock(), createElementBlock("div", _hoisted_3, [
          createBaseVNode("div", _hoisted_4, [
            _cache[15] || (_cache[15] = createStaticVNode('<div class="section-header" data-v-6fe58b30><h2 class="section-title" data-v-6fe58b30><span class="section-icon" data-v-6fe58b30>🤖</span> Dify 配置 </h2><div class="section-actions" data-v-6fe58b30><span class="section-badge" data-v-6fe58b30>AI 對話服務</span><a href="http://localhost:82" target="_blank" class="manage-link" data-v-6fe58b30><span class="link-icon" data-v-6fe58b30>🔗</span> 管理介面 </a></div></div>', 1)),
            createBaseVNode("div", _hoisted_5, [
              _cache[11] || (_cache[11] = createBaseVNode("label", { class: "form-label" }, [
                createTextVNode(" API URL "),
                createBaseVNode("span", { class: "label-badge" }, "可編輯")
              ], -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => config.value.dify_api_url = $event),
                type: "text",
                class: "form-input",
                placeholder: "http://localhost:80/v1",
                onInput: _cache[1] || (_cache[1] = ($event) => hasChanges.value = true)
              }, null, 544), [
                [vModelText, config.value.dify_api_url]
              ]),
              _cache[12] || (_cache[12] = createBaseVNode("p", { class: "form-hint" }, " Dify 服務的 API 端點（例如：http://localhost:80/v1 或 http://172.19.0.2:3000/v1） ", -1))
            ]),
            createBaseVNode("div", _hoisted_6, [
              _cache[13] || (_cache[13] = createBaseVNode("label", { class: "form-label" }, [
                createTextVNode(" API Key "),
                createBaseVNode("span", { class: "label-badge required" }, "必填")
              ], -1)),
              createBaseVNode("div", _hoisted_7, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => config.value.dify_key = $event),
                  type: showDifyKey.value ? "text" : "password",
                  class: "form-input",
                  placeholder: "app-xxxxxxxxxxxxxxxx",
                  onInput: _cache[3] || (_cache[3] = ($event) => hasChanges.value = true)
                }, null, 40, _hoisted_8), [
                  [vModelDynamic, config.value.dify_key]
                ]),
                createBaseVNode("button", {
                  type: "button",
                  class: "toggle-password-btn",
                  onClick: _cache[4] || (_cache[4] = ($event) => showDifyKey.value = !showDifyKey.value),
                  title: showDifyKey.value ? "隱藏" : "顯示"
                }, toDisplayString(showDifyKey.value ? "👁️" : "👁️‍🗨️"), 9, _hoisted_9)
              ]),
              _cache[14] || (_cache[14] = createBaseVNode("p", { class: "form-hint" }, " 從 Dify Web UI (http://localhost:80) 創建應用後獲取 ", -1))
            ])
          ]),
          _cache[33] || (_cache[33] = createBaseVNode("div", { class: "divider" }, null, -1)),
          createBaseVNode("div", _hoisted_10, [
            _cache[20] || (_cache[20] = createStaticVNode('<div class="section-header" data-v-6fe58b30><h2 class="section-title" data-v-6fe58b30><span class="section-icon" data-v-6fe58b30>📚</span> RAGFlow 配置 </h2><div class="section-actions" data-v-6fe58b30><span class="section-badge" data-v-6fe58b30>知識檢索服務</span><a href="http://localhost:81" target="_blank" class="manage-link" data-v-6fe58b30><span class="link-icon" data-v-6fe58b30>🔗</span> 管理介面 </a></div></div>', 1)),
            createBaseVNode("div", _hoisted_11, [
              _cache[16] || (_cache[16] = createBaseVNode("label", { class: "form-label" }, [
                createTextVNode(" API URL "),
                createBaseVNode("span", { class: "label-badge" }, "可編輯")
              ], -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => config.value.ragflow_api_url = $event),
                type: "text",
                class: "form-input",
                placeholder: "http://localhost:81/api/v1",
                onInput: _cache[6] || (_cache[6] = ($event) => hasChanges.value = true)
              }, null, 544), [
                [vModelText, config.value.ragflow_api_url]
              ]),
              _cache[17] || (_cache[17] = createBaseVNode("p", { class: "form-hint" }, " RAGFlow 服務的 API 端點（例如：http://localhost:81/api/v1 或自訂 URL） ", -1))
            ]),
            createBaseVNode("div", _hoisted_12, [
              _cache[18] || (_cache[18] = createBaseVNode("label", { class: "form-label" }, [
                createTextVNode(" API Key "),
                createBaseVNode("span", { class: "label-badge required" }, "必填")
              ], -1)),
              createBaseVNode("div", _hoisted_13, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => config.value.ragflow_key = $event),
                  type: showRagflowKey.value ? "text" : "password",
                  class: "form-input",
                  placeholder: "ragflow-xxxxxxxxxxxxxxxx",
                  onInput: _cache[8] || (_cache[8] = ($event) => hasChanges.value = true)
                }, null, 40, _hoisted_14), [
                  [vModelDynamic, config.value.ragflow_key]
                ]),
                createBaseVNode("button", {
                  type: "button",
                  class: "toggle-password-btn",
                  onClick: _cache[9] || (_cache[9] = ($event) => showRagflowKey.value = !showRagflowKey.value),
                  title: showRagflowKey.value ? "隱藏" : "顯示"
                }, toDisplayString(showRagflowKey.value ? "👁️" : "👁️‍🗨️"), 9, _hoisted_15)
              ]),
              _cache[19] || (_cache[19] = createBaseVNode("p", { class: "form-hint" }, " 從 RAGFlow Web UI (http://localhost:81) 設定頁面獲取 ", -1))
            ])
          ]),
          createBaseVNode("div", _hoisted_16, [
            createBaseVNode("button", {
              class: "btn btn-test",
              onClick: testConnection,
              disabled: testing.value
            }, [
              testing.value ? (openBlock(), createElementBlock("span", _hoisted_18, "⏳")) : (openBlock(), createElementBlock("span", _hoisted_19, "🔍")),
              createTextVNode(" " + toDisplayString(testing.value ? "測試中..." : "測試連接"), 1)
            ], 8, _hoisted_17),
            createBaseVNode("button", {
              class: "btn btn-secondary",
              onClick: loadConfig,
              disabled: saving.value
            }, [..._cache[21] || (_cache[21] = [
              createBaseVNode("span", { class: "btn-icon" }, "🔄", -1),
              createTextVNode(" 重新載入 ", -1)
            ])], 8, _hoisted_20),
            createBaseVNode("button", {
              class: "btn btn-primary",
              onClick: saveConfig,
              disabled: saving.value || !hasChanges.value
            }, [
              saving.value ? (openBlock(), createElementBlock("span", _hoisted_22, "⏳")) : (openBlock(), createElementBlock("span", _hoisted_23, "💾")),
              createTextVNode(" " + toDisplayString(saving.value ? "儲存中..." : "儲存設定"), 1)
            ], 8, _hoisted_21)
          ]),
          testResult.value ? (openBlock(), createElementBlock("div", _hoisted_24, [
            _cache[32] || (_cache[32] = createBaseVNode("h4", null, "連接測試結果", -1)),
            createBaseVNode("div", _hoisted_25, [
              createBaseVNode("div", _hoisted_26, [
                _cache[22] || (_cache[22] = createBaseVNode("span", { class: "service-icon" }, "🤖", -1)),
                _cache[23] || (_cache[23] = createBaseVNode("span", { class: "service-name" }, "Dify", -1)),
                createBaseVNode("span", {
                  class: normalizeClass(["status-badge", testResult.value.dify.status])
                }, toDisplayString(testResult.value.dify.status === "ok" ? "✅ 正常" : testResult.value.dify.status === "warning" ? "⚠️ 警告" : "❌ 錯誤"), 3)
              ]),
              createBaseVNode("div", _hoisted_27, [
                createBaseVNode("p", null, [
                  _cache[24] || (_cache[24] = createBaseVNode("strong", null, "URL:", -1)),
                  createTextVNode(" " + toDisplayString(testResult.value.dify.url), 1)
                ]),
                createBaseVNode("p", null, [
                  _cache[25] || (_cache[25] = createBaseVNode("strong", null, "狀態:", -1)),
                  createTextVNode(" " + toDisplayString(testResult.value.dify.message), 1)
                ]),
                createBaseVNode("p", null, [
                  _cache[26] || (_cache[26] = createBaseVNode("strong", null, "API Key:", -1)),
                  createTextVNode(" " + toDisplayString(testResult.value.dify.api_key_configured ? "已配置" : "未配置"), 1)
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_28, [
              createBaseVNode("div", _hoisted_29, [
                _cache[27] || (_cache[27] = createBaseVNode("span", { class: "service-icon" }, "📚", -1)),
                _cache[28] || (_cache[28] = createBaseVNode("span", { class: "service-name" }, "RAGFlow", -1)),
                createBaseVNode("span", {
                  class: normalizeClass(["status-badge", testResult.value.ragflow.status])
                }, toDisplayString(testResult.value.ragflow.status === "ok" ? "✅ 正常" : testResult.value.ragflow.status === "warning" ? "⚠️ 警告" : "❌ 錯誤"), 3)
              ]),
              createBaseVNode("div", _hoisted_30, [
                createBaseVNode("p", null, [
                  _cache[29] || (_cache[29] = createBaseVNode("strong", null, "URL:", -1)),
                  createTextVNode(" " + toDisplayString(testResult.value.ragflow.url), 1)
                ]),
                createBaseVNode("p", null, [
                  _cache[30] || (_cache[30] = createBaseVNode("strong", null, "狀態:", -1)),
                  createTextVNode(" " + toDisplayString(testResult.value.ragflow.message), 1)
                ]),
                createBaseVNode("p", null, [
                  _cache[31] || (_cache[31] = createBaseVNode("strong", null, "API Key:", -1)),
                  createTextVNode(" " + toDisplayString(testResult.value.ragflow.api_key_configured ? "已配置" : "未配置"), 1)
                ])
              ])
            ])
          ])) : createCommentVNode("", true),
          _cache[34] || (_cache[34] = createBaseVNode("div", { class: "info-box" }, [
            createBaseVNode("div", { class: "info-icon" }, "💡"),
            createBaseVNode("div", { class: "info-content" }, [
              createBaseVNode("h4", null, "重要提示"),
              createBaseVNode("ul", null, [
                createBaseVNode("li", null, [
                  createTextVNode("所有配置將保存在 "),
                  createBaseVNode("code", null, "C:/BruV_Data/config.json"),
                  createTextVNode(" 文件中")
                ]),
                createBaseVNode("li", null, "修改配置後將立即生效，無需重啟後端服務"),
                createBaseVNode("li", null, "配置優先級：config.json > 環境變數 > 默認值"),
                createBaseVNode("li", null, "請妥善保管 API Keys，不要分享給他人")
              ])
            ])
          ], -1))
        ])),
        createVNode(Transition, { name: "toast" }, {
          default: withCtx(() => [
            toast.value.show ? (openBlock(), createElementBlock("div", {
              key: 0,
              class: normalizeClass(["toast", toast.value.type])
            }, [
              createBaseVNode("span", _hoisted_31, toDisplayString(toast.value.type === "success" ? "✅" : "❌"), 1),
              createBaseVNode("span", _hoisted_32, toDisplayString(toast.value.message), 1)
            ], 2)) : createCommentVNode("", true)
          ]),
          _: 1
        })
      ]);
    };
  }
};
const Settings = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6fe58b30"]]);
export {
  Settings as default
};

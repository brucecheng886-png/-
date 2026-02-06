import { _ as _export_sfc, u as useGraphStore } from "./index-DDdIzyMR.js";
import { k as key_default, u as user_default, d as check_default, r as refresh_default, m as magic_stick_default, s as success_filled_default, e as circle_close_filled_default, E as ElMessage } from "./element-plus-DavumCtP.js";
import { j as onMounted, y as openBlock, D as createElementBlock, G as createBaseVNode, E as createVNode, F as withCtx, u as unref, S as createTextVNode, U as toDisplayString, I as normalizeClass, z as createBlock, R as createCommentVNode, ac as resolveComponent, l as reactive, r as ref } from "./vue-vendor-rpbpBucb.js";
const _hoisted_1 = { class: "knowledge-form-container" };
const _hoisted_2 = { class: "form-card" };
const _hoisted_3 = { class: "result-header" };
const _hoisted_4 = { class: "result-title" };
const _hoisted_5 = { class: "result-content" };
const _hoisted_6 = {
  key: 0,
  class: "result-data"
};
const _hoisted_7 = { class: "api-status" };
const _hoisted_8 = { class: "status-text" };
const API_BASE_URL = "";
const _sfc_main = {
  __name: "KnowledgeForm",
  setup(__props) {
    const graphStore = useGraphStore();
    const formRef = ref(null);
    const loading = ref(false);
    const lastResult = ref(null);
    const apiStatus = ref("checking");
    const apiStatusText = ref("檢查中...");
    const formData = reactive({
      id: "",
      name: "",
      type: "",
      description: ""
    });
    const rules = {
      id: [
        { required: true, message: "請輸入實體 ID", trigger: "blur" },
        { min: 3, message: "ID 長度至少 3 個字符", trigger: "blur" }
      ],
      name: [
        { required: true, message: "請輸入實體名稱", trigger: "blur" },
        { min: 2, message: "名稱長度至少 2 個字符", trigger: "blur" }
      ],
      type: [
        { required: true, message: "請選擇實體類型", trigger: "change" }
      ]
    };
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          apiStatus.value = data.services.kuzu === "connected" ? "connected" : "warning";
          apiStatusText.value = data.services.kuzu === "connected" ? "API 已連接 (KuzuDB 可用)" : "API 已連接 (KuzuDB 不可用)";
        } else {
          apiStatus.value = "error";
          apiStatusText.value = "API 連接失敗";
        }
      } catch (error) {
        apiStatus.value = "error";
        apiStatusText.value = "API 無法連接";
        console.error("API 健康檢查失敗:", error);
      }
    };
    const submitForm = async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        loading.value = true;
        lastResult.value = null;
        const result = await graphStore.createEntity({
          id: formData.id,
          name: formData.name,
          type: formData.type,
          description: formData.description || "",
          properties: {}
        });
        lastResult.value = result;
        ElMessage.success({
          message: result.message || "實體創建成功",
          duration: 3e3
        });
        setTimeout(() => {
          resetForm();
        }, 1500);
      } catch (error) {
        console.error("提交錯誤:", error);
        lastResult.value = {
          success: false,
          message: error.message || "請求失敗，請檢查後端服務",
          data: null
        };
        ElMessage.error({
          message: error.message || "請求失敗，請確認後端服務正在運行",
          duration: 5e3
        });
      } finally {
        loading.value = false;
      }
    };
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
      formData.id = "";
      formData.name = "";
      formData.type = "";
      formData.description = "";
      lastResult.value = null;
    };
    const fillMockData = () => {
      const mockData = {
        id: `ENT-${Math.floor(Math.random() * 9e3 + 1e3)}`,
        name: "測試實體_" + Date.now().toString().slice(-4),
        type: ["Person", "Company", "Product", "Event"][Math.floor(Math.random() * 4)],
        description: "這是一個測試實體，用於驗證 API 連接"
      };
      Object.assign(formData, mockData);
      ElMessage.info("已填充範例資料");
    };
    onMounted(() => {
      checkApiHealth();
      setInterval(checkApiHealth, 3e4);
    });
    return (_ctx, _cache) => {
      const _component_el_input = resolveComponent("el-input");
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_option = resolveComponent("el-option");
      const _component_el_select = resolveComponent("el-select");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_form = resolveComponent("el-form");
      const _component_el_icon = resolveComponent("el-icon");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[6] || (_cache[6] = createBaseVNode("h2", { class: "form-title" }, "🔮 創建知識實體", -1)),
          createVNode(_component_el_form, {
            ref_key: "formRef",
            ref: formRef,
            model: formData,
            rules,
            "label-width": "100px",
            "label-position": "left",
            class: "entity-form"
          }, {
            default: withCtx(() => [
              createVNode(_component_el_form_item, {
                label: "實體 ID",
                prop: "id"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: formData.id,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => formData.id = $event),
                    placeholder: "例如: ENT-0001",
                    "prefix-icon": unref(key_default),
                    clearable: ""
                  }, null, 8, ["modelValue", "prefix-icon"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, {
                label: "名稱",
                prop: "name"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: formData.name,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => formData.name = $event),
                    placeholder: "請輸入實體名稱",
                    "prefix-icon": unref(user_default),
                    clearable: ""
                  }, null, 8, ["modelValue", "prefix-icon"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, {
                label: "類型",
                prop: "type"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_select, {
                    modelValue: formData.type,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => formData.type = $event),
                    placeholder: "選擇實體類型",
                    style: { "width": "100%" }
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_option, {
                        label: "👤 Person (人物)",
                        value: "Person"
                      }),
                      createVNode(_component_el_option, {
                        label: "🏢 Company (公司)",
                        value: "Company"
                      }),
                      createVNode(_component_el_option, {
                        label: "📦 Product (產品)",
                        value: "Product"
                      }),
                      createVNode(_component_el_option, {
                        label: "📅 Event (事件)",
                        value: "Event"
                      }),
                      createVNode(_component_el_option, {
                        label: "📍 Location (地點)",
                        value: "Location"
                      }),
                      createVNode(_component_el_option, {
                        label: "📄 Document (文檔)",
                        value: "Document"
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, {
                label: "描述",
                prop: "description"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: formData.description,
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => formData.description = $event),
                    type: "textarea",
                    rows: 3,
                    placeholder: "請輸入實體描述...",
                    maxlength: "200",
                    "show-word-limit": ""
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, { class: "form-actions" }, {
                default: withCtx(() => [
                  createVNode(_component_el_button, {
                    type: "primary",
                    icon: unref(check_default),
                    loading: loading.value,
                    onClick: submitForm,
                    class: "submit-btn"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(loading.value ? "創建中..." : "創建實體"), 1)
                    ]),
                    _: 1
                  }, 8, ["icon", "loading"]),
                  createVNode(_component_el_button, {
                    icon: unref(refresh_default),
                    onClick: resetForm,
                    disabled: loading.value
                  }, {
                    default: withCtx(() => [..._cache[4] || (_cache[4] = [
                      createTextVNode(" 重置 ", -1)
                    ])]),
                    _: 1
                  }, 8, ["icon", "disabled"]),
                  createVNode(_component_el_button, {
                    icon: unref(magic_stick_default),
                    onClick: fillMockData,
                    disabled: loading.value
                  }, {
                    default: withCtx(() => [..._cache[5] || (_cache[5] = [
                      createTextVNode(" 填充範例 ", -1)
                    ])]),
                    _: 1
                  }, 8, ["icon", "disabled"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model"]),
          lastResult.value ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(["result-card", lastResult.value.success ? "success" : "error"])
          }, [
            createBaseVNode("div", _hoisted_3, [
              createVNode(_component_el_icon, { size: 20 }, {
                default: withCtx(() => [
                  lastResult.value.success ? (openBlock(), createBlock(unref(success_filled_default), { key: 0 })) : (openBlock(), createBlock(unref(circle_close_filled_default), { key: 1 }))
                ]),
                _: 1
              }),
              createBaseVNode("span", _hoisted_4, toDisplayString(lastResult.value.success ? "創建成功" : "創建失敗"), 1)
            ]),
            createBaseVNode("div", _hoisted_5, [
              createBaseVNode("p", null, toDisplayString(lastResult.value.message), 1),
              lastResult.value.data ? (openBlock(), createElementBlock("pre", _hoisted_6, toDisplayString(JSON.stringify(lastResult.value.data, null, 2)), 1)) : createCommentVNode("", true)
            ])
          ], 2)) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", _hoisted_7, [
          createBaseVNode("div", {
            class: normalizeClass(["status-dot", apiStatus.value])
          }, null, 2),
          createBaseVNode("span", _hoisted_8, toDisplayString(apiStatusText.value), 1)
        ])
      ]);
    };
  }
};
const KnowledgeForm = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d94aabb1"]]);
export {
  KnowledgeForm as default
};

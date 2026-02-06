import { y as openBlock, D as createElementBlock, G as createBaseVNode, $ as withModifiers, I as normalizeClass, az as createStaticVNode, S as createTextVNode, U as toDisplayString, E as createVNode, F as withCtx, M as Fragment, a6 as renderList, R as createCommentVNode, r as ref, ac as resolveComponent, z as createBlock, P as withDirectives, am as withKeys, an as vModelText, n as nextTick, l as reactive } from "./vue-vendor-rpbpBucb.js";
import { r as readSync, u as utils } from "./xlsx-CCI9vzZp.js";
import { _ as _export_sfc } from "./index-DDdIzyMR.js";
import "./element-plus-DavumCtP.js";
const _hoisted_1 = { class: "batch-repair-container custom-scrollbar" };
const _hoisted_2 = { class: "upload-content" };
const _hoisted_3 = { class: "upload-button" };
const _hoisted_4 = {
  key: 1,
  class: "table-area"
};
const _hoisted_5 = { class: "toolbar" };
const _hoisted_6 = { class: "toolbar-left" };
const _hoisted_7 = { class: "file-info" };
const _hoisted_8 = { class: "data-count" };
const _hoisted_9 = { class: "toolbar-right" };
const _hoisted_10 = ["disabled"];
const _hoisted_11 = { class: "table-wrapper" };
const _hoisted_12 = ["onClick"];
const _hoisted_13 = ["onUpdate:modelValue"];
const _hoisted_14 = {
  key: 1,
  class: "cell-text"
};
const _hoisted_15 = {
  key: 2,
  class: "edit-icon"
};
const _hoisted_16 = ["onClick"];
const _hoisted_17 = { class: "data-stats" };
const _hoisted_18 = { class: "stat-item" };
const _hoisted_19 = { class: "stat-item" };
const _hoisted_20 = {
  key: 0,
  class: "stat-item"
};
const _hoisted_21 = {
  key: 2,
  class: "loading-overlay"
};
const _sfc_main = {
  __name: "BatchRepair",
  setup(__props) {
    const isDragging = ref(false);
    const isLoading = ref(false);
    const hasChanges = ref(false);
    const fileName = ref("");
    const fileInput = ref(null);
    const tableData = ref([]);
    const columns = ref([]);
    const editingCell = reactive({
      row: null,
      column: null,
      originalValue: null
    });
    const editInput = ref(null);
    const headerCellStyle = {
      background: "rgba(59, 130, 246, 0.2)",
      color: "#ffffff",
      fontWeight: "600",
      borderColor: "rgba(255, 255, 255, 0.1)"
    };
    const cellStyle = {
      background: "rgba(20, 20, 30, 0.6)",
      color: "#e5e7eb",
      borderColor: "rgba(255, 255, 255, 0.1)"
    };
    const rowStyle = ({ rowIndex }) => {
      return {
        background: rowIndex % 2 === 0 ? "rgba(30, 30, 40, 0.5)" : "rgba(20, 20, 30, 0.5)"
      };
    };
    const handleDragOver = (e) => {
      e.preventDefault();
      isDragging.value = true;
    };
    const handleDragLeave = (e) => {
      e.preventDefault();
      isDragging.value = false;
    };
    const handleDrop = (e) => {
      e.preventDefault();
      isDragging.value = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    };
    const handleFileSelect = (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    };
    const processFile = async (file) => {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const validExtensions = ["xlsx", "xls", "csv"];
      if (!validExtensions.includes(fileExtension)) {
        alert("❌ 不支援的文件格式！請上傳 .xlsx、.xls 或 .csv 文件");
        return;
      }
      isLoading.value = true;
      fileName.value = file.name;
      try {
        const data = await file.arrayBuffer();
        const workbook = readSync(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet);
        if (jsonData.length === 0) {
          alert("⚠️ Excel 文件中沒有資料");
          isLoading.value = false;
          return;
        }
        columns.value = Object.keys(jsonData[0]);
        tableData.value = jsonData.map((row) => ({ ...row }));
        hasChanges.value = false;
        console.log("✅ Excel 文件解析成功:", {
          fileName: file.name,
          rows: jsonData.length,
          columns: columns.value
        });
      } catch (error) {
        console.error("❌ 處理文件失敗:", error);
        alert("處理文件時發生錯誤：" + error.message);
      } finally {
        isLoading.value = false;
      }
    };
    const startEdit = (rowIndex, columnName) => {
      editingCell.row = rowIndex;
      editingCell.column = columnName;
      editingCell.originalValue = tableData.value[rowIndex][columnName];
      nextTick(() => {
        if (editInput.value && editInput.value[0]) {
          editInput.value[0].focus();
          editInput.value[0].select();
        }
      });
    };
    const finishEdit = () => {
      if (editingCell.row !== null && editingCell.column !== null) {
        const currentValue = tableData.value[editingCell.row][editingCell.column];
        if (currentValue !== editingCell.originalValue) {
          hasChanges.value = true;
          console.log("📝 資料已修改:", {
            row: editingCell.row,
            column: editingCell.column,
            oldValue: editingCell.originalValue,
            newValue: currentValue
          });
        }
      }
      editingCell.row = null;
      editingCell.column = null;
      editingCell.originalValue = null;
    };
    const cancelEdit = () => {
      if (editingCell.row !== null && editingCell.column !== null) {
        tableData.value[editingCell.row][editingCell.column] = editingCell.originalValue;
      }
      editingCell.row = null;
      editingCell.column = null;
      editingCell.originalValue = null;
    };
    const addRow = () => {
      const newRow = {};
      columns.value.forEach((col) => {
        newRow[col] = "";
      });
      tableData.value.push(newRow);
      hasChanges.value = true;
      console.log("➕ 新增一行");
    };
    const deleteRow = (index) => {
      if (confirm("確定要刪除這一行嗎？")) {
        tableData.value.splice(index, 1);
        hasChanges.value = true;
        console.log("🗑️ 刪除行:", index);
      }
    };
    const saveData = () => {
      console.log("💾 保存資料 (Mock API)");
      console.log("=====================================");
      console.log("文件名稱:", fileName.value);
      console.log("總行數:", tableData.value.length);
      console.log("欄位:", columns.value);
      console.log("資料內容:");
      console.log(JSON.stringify(tableData.value, null, 2));
      console.log("=====================================");
      alert("✅ 資料已輸出到 Console\n請按 F12 查看詳細內容");
      hasChanges.value = false;
    };
    const resetUpload = () => {
      if (hasChanges.value) {
        if (!confirm("有未保存的變更，確定要重新上傳嗎？")) {
          return;
        }
      }
      tableData.value = [];
      columns.value = [];
      fileName.value = "";
      hasChanges.value = false;
      isDragging.value = false;
      if (fileInput.value) {
        fileInput.value.value = "";
      }
      console.log("🔄 已重置上傳區域");
    };
    return (_ctx, _cache) => {
      const _component_el_table_column = resolveComponent("el-table-column");
      const _component_el_table = resolveComponent("el-table");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[6] || (_cache[6] = createBaseVNode("div", { class: "page-header" }, [
          createBaseVNode("h1", { class: "page-title" }, "📊 批量資料處理"),
          createBaseVNode("p", { class: "page-subtitle" }, "拖曳上傳 Excel 文件，批量編輯資料")
        ], -1)),
        !tableData.value.length ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["upload-area", { "dragging": isDragging.value }]),
          onDragover: withModifiers(handleDragOver, ["prevent"]),
          onDragleave: withModifiers(handleDragLeave, ["prevent"]),
          onDrop: withModifiers(handleDrop, ["prevent"])
        }, [
          createBaseVNode("div", _hoisted_2, [
            _cache[1] || (_cache[1] = createStaticVNode('<div class="upload-icon" data-v-1b1eae72>📁</div><h3 class="upload-title" data-v-1b1eae72>拖曳 Excel 文件到此處</h3><p class="upload-hint" data-v-1b1eae72>或點擊下方按鈕選擇文件</p><div class="file-formats" data-v-1b1eae72><span class="format-badge" data-v-1b1eae72>.xlsx</span><span class="format-badge" data-v-1b1eae72>.xls</span><span class="format-badge" data-v-1b1eae72>.csv</span></div>', 4)),
            createBaseVNode("label", _hoisted_3, [
              createBaseVNode("input", {
                type: "file",
                accept: ".xlsx,.xls,.csv",
                onChange: handleFileSelect,
                ref_key: "fileInput",
                ref: fileInput,
                style: { "display": "none" }
              }, null, 544),
              _cache[0] || (_cache[0] = createBaseVNode("span", null, "📂 選擇文件", -1))
            ]),
            _cache[2] || (_cache[2] = createBaseVNode("div", { class: "upload-tips" }, [
              createBaseVNode("p", null, [
                createTextVNode("💡 "),
                createBaseVNode("strong", null, "建議格式：")
              ]),
              createBaseVNode("ul", null, [
                createBaseVNode("li", null, "第一行為欄位標題"),
                createBaseVNode("li", null, "後續行為資料內容"),
                createBaseVNode("li", null, "支援多個工作表（自動讀取第一個）")
              ])
            ], -1))
          ])
        ], 34)) : (openBlock(), createElementBlock("div", _hoisted_4, [
          createBaseVNode("div", _hoisted_5, [
            createBaseVNode("div", _hoisted_6, [
              createBaseVNode("span", _hoisted_7, [
                createTextVNode(" 📄 " + toDisplayString(fileName.value) + " ", 1),
                createBaseVNode("span", _hoisted_8, "（共 " + toDisplayString(tableData.value.length) + " 筆資料）", 1)
              ])
            ]),
            createBaseVNode("div", _hoisted_9, [
              createBaseVNode("button", {
                onClick: addRow,
                class: "toolbar-btn add-btn"
              }, " ➕ 新增行 "),
              createBaseVNode("button", {
                onClick: saveData,
                class: "toolbar-btn save-btn",
                disabled: !hasChanges.value
              }, " 💾 保存資料 ", 8, _hoisted_10),
              createBaseVNode("button", {
                onClick: resetUpload,
                class: "toolbar-btn reset-btn"
              }, " 🔄 重新上傳 ")
            ])
          ]),
          createBaseVNode("div", _hoisted_11, [
            createVNode(_component_el_table, {
              data: tableData.value,
              border: true,
              stripe: true,
              "header-cell-style": headerCellStyle,
              "cell-style": cellStyle,
              "row-style": rowStyle,
              style: { "width": "100%" },
              "max-height": "600",
              class: "data-table"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_table_column, {
                  type: "index",
                  label: "#",
                  width: "60",
                  align: "center",
                  fixed: ""
                }),
                (openBlock(true), createElementBlock(Fragment, null, renderList(columns.value, (column) => {
                  return openBlock(), createBlock(_component_el_table_column, {
                    key: column,
                    label: column,
                    prop: column,
                    "min-width": "150"
                  }, {
                    default: withCtx(({ row, $index }) => [
                      createBaseVNode("div", {
                        class: "editable-cell",
                        onClick: ($event) => startEdit($index, column)
                      }, [
                        editingCell.row === $index && editingCell.column === column ? withDirectives((openBlock(), createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": ($event) => row[column] = $event,
                          onBlur: finishEdit,
                          onKeyup: [
                            withKeys(finishEdit, ["enter"]),
                            withKeys(cancelEdit, ["esc"])
                          ],
                          ref_for: true,
                          ref_key: "editInput",
                          ref: editInput,
                          class: "cell-input",
                          autofocus: ""
                        }, null, 40, _hoisted_13)), [
                          [vModelText, row[column]]
                        ]) : (openBlock(), createElementBlock("span", _hoisted_14, toDisplayString(row[column] || "-"), 1)),
                        editingCell.row !== $index || editingCell.column !== column ? (openBlock(), createElementBlock("span", _hoisted_15, " ✏️ ")) : createCommentVNode("", true)
                      ], 8, _hoisted_12)
                    ]),
                    _: 2
                  }, 1032, ["label", "prop"]);
                }), 128)),
                createVNode(_component_el_table_column, {
                  label: "操作",
                  width: "100",
                  align: "center",
                  fixed: "right"
                }, {
                  default: withCtx(({ $index }) => [
                    createBaseVNode("button", {
                      onClick: ($event) => deleteRow($index),
                      class: "delete-btn",
                      title: "刪除此行"
                    }, " 🗑️ ", 8, _hoisted_16)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["data"])
          ]),
          createBaseVNode("div", _hoisted_17, [
            createBaseVNode("span", _hoisted_18, [
              _cache[3] || (_cache[3] = createTextVNode("總行數: ", -1)),
              createBaseVNode("strong", null, toDisplayString(tableData.value.length), 1)
            ]),
            createBaseVNode("span", _hoisted_19, [
              _cache[4] || (_cache[4] = createTextVNode("總欄位: ", -1)),
              createBaseVNode("strong", null, toDisplayString(columns.value.length), 1)
            ]),
            hasChanges.value ? (openBlock(), createElementBlock("span", _hoisted_20, "⚠️ 有未保存的變更")) : createCommentVNode("", true)
          ])
        ])),
        isLoading.value ? (openBlock(), createElementBlock("div", _hoisted_21, [..._cache[5] || (_cache[5] = [
          createBaseVNode("div", { class: "loading-content" }, [
            createBaseVNode("div", { class: "loading-spinner" }, "⏳"),
            createBaseVNode("p", null, "正在處理文件...")
          ], -1)
        ])])) : createCommentVNode("", true)
      ]);
    };
  }
};
const BatchRepair = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1b1eae72"]]);
export {
  BatchRepair as default
};

<template>
  <div class="formitem-box">
    <h2>快捷创建表单预览 | QuickCreatePreview</h2>

    <el-quick-form
      label-width="120px"
      labelPosition="right"
      ref="quickForm"
      v-if="renderForm"
      form-item-size="mini"
      :fields="fieldsConfig"
      v-bind="formConfig"
      v-model="quickFormData"
    />

    <el-divider />

    <h3>表单配置vue代码</h3>
    <p>复制这里的代码，将生成同样的表单。（注意，这里不含引入的代码）</p>

    <el-button
      style="margin-bottom:20px;"
      size="mini"
      @click="updateCode"
      type="success"
      >一键生成Vue文件代码</el-button
    >
    <el-button
      style="margin-bottom:20px;"
      size="mini"
      v-show="showCode"
      class="copy-btn"
      type="primary"
      :data-clipboard-text="vueCode"
      >复制Vue文件代码</el-button
    >
    <el-collapse class="collapse">
      <el-collapse-item>
        <template slot="title">
          <b>点击查看代码</b>
        </template>
        Vue 文件代码
        <pre v-highlightjs v-if="showCode" style="margin-top:20px;">
                    <code class="javascript">{{ vueCode }}</code>
                </pre>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { TypeList } from "./formItemEnum";
const store = require("store");
const dayjs = require("dayjs");
const ClipboardJS = require("clipboard");
import Test from "./test.vue";
// const localData = new LocalStorage("localData");
import { modes, cols, rows, options, treeParams } from "./quickCreateOptions";
import { storeListData } from "./store"; //树结构数据
import { getCodeOptionsData } from "../../service/api.js";

const optionsType = [
  "normal-select",
  "mutiple-select",
  "radio",
  "checkbox",
  "auto-complete-input",
  "dynamic-select"
];
// 针对选项进行拓展参数
function extendConfig(v) {
  if (optionsType.includes(v.type)) {
    v.options = options;
  } else if (v.type === "tree-select") {
    v.options = storeListData;
    v.treeParams = treeParams;
    v.defaultValue = [1];
    v.selectParams = {
      multiple: false,
      clearable: true,
      placeholder: "请输入"
    };
  } else if (v.type === "auto-complete-input") {
    v.getOptionsData = getCodeOptionsData;
    v.searchKey = "search";
    v.mainShowKey = "label";
    v.mainValueKey = "code";
  } else if (v.type === "component") {
    v.component = Test;
  }
}
export default {
  name: "quickCreatePreview",
  data() {
    return {
      htmlCode: "",
      curConfig: "",
      renderForm: true,
      quickFormData: {},
      formConfig: {
        formItemSize: "mini",
        labelPosition: "right",
        mode: "tableQuery",
        formItemCol: 8,
        labelWidth: "120px",
        defaultShowRows: 7,
        showFoldBtn: true,
        borderForm: false
      },
      fields: [
        {
          label: "",
          formConfig: {},
          children: [
            {
              label: "",
              type: "input",
              rules: []
            }
          ]
        }
      ],
      vueCode: "",
      addBlockLabel: "",
      addBlockLoading: false,
      addEleLoading: false,
      showCode: false,
      configList: [],
      modes: modes,
      rows: rows,
      cols: cols,
      TypeList
    };
  },

  computed: {
    fieldsConfig() {
      let result = JSON.parse(JSON.stringify(this.fields || []));

      function dealType(arr) {
        arr.forEach(v => {
          if (v.children && Array.isArray(v.children)) {
            dealType(v.children);
          } else {
            extendConfig(v);
          }
        });
      }

      dealType(result);

      return result;
    }
  },
  created() {
    const configObj = store.get("_configObj");
    if (!configObj) {
      store.set("_configObj", {});
    } else {
      this.configList = Object.values(configObj).map(v => {
        v.label = v.name + "_已存" + v.count + "次_长度" + v.len;
        return v;
      });
    }
  },
  mounted() {
    const clipboard = new ClipboardJS(".copy-btn");
    clipboard.on("success", () => {
      this.$message.success("复制成功");
    });

    const fileds = store.get("form_previewConfig");
    if (Array.isArray(fileds) && fileds.length >= 1) {
      this.fields = fileds;
      this.formConfig = fileds[0].formConfig;
    } else {
      console.error("预览表单配置数据异常");
    }

    // 预览
    window.onstorage = e => {
      if (e.key === "form_previewConfig") {
        console.log("更新预览表单设置");
        const fileds = JSON.parse(e.newValue);
        if (Array.isArray(fileds) && fileds.length >= 1) {
          this.fields = fileds;
          this.formConfig = fileds[0].formConfig;
        } else {
          console.error("预览表单配置数据异常");
        }

        // this.setConfigFields("previewConfig");
      }
    };
  },
  beforeDestroy() {
    window.onstorage = null;
  },
  watch: {
    formConfig: {
      handler: function() {
        this.$refs["quickForm"].$forceUpdate();
      },
      deep: true
    }
  },
  methods: {
    setConfigFields(val) {
      console.log(val);
      const { fields } = store.get(`form_${val}`);
      this.fields = fields;
      if (fields[0].formConfig) {
        this.formConfig = fields[0].formConfig;
      }
    },
    addBlock() {
      if (this.addBlockLoading) {
        return;
      }
      this.addBlockLoading = true;
      this.fields.push({
        label: this.addBlockLabel,
        children: [
          {
            label: "",
            type: "input",
            rules: []
          }
        ]
      });
      this.addBlockLabel = "";
      setTimeout(() => {
        this.addBlockLoading = false;
      }, 500);
    },

    addFormItem(children, i) {
      if (this.addEleLoading) {
        return;
      }
      this.addEleLoading = true;
      if (i === undefined) {
        children.push({
          label: "",
          type: "input",
          rules: []
        });
      } else {
        children.splice(i, 0, {
          label: "",
          type: "input",
          rules: []
        });
      }

      this.addBlockLabel = "";
      setTimeout(() => {
        this.addEleLoading = false;
      }, 200);
    },

    setRequired(formItem) {
      if (formItem.rules.length > 0) {
        formItem.rules.splice(0, 1);
      } else {
        formItem.rules.push({
          required: true,
          message: "请输入",
          trigger: ["blur", "change"]
        });
      }
    },

    deletItem(formItem, children) {
      const i = children.indexOf(formItem);
      children.splice(i, 1);
    },

    upItem(formItem, children) {
      const i = children.indexOf(formItem);
      // 先移除
      children.splice(i, 1);
      // 再插入到原索引-1 的地方
      children.splice(i - 1, 0, formItem);
    },
    downItem(formItem, children) {
      const i = children.indexOf(formItem);
      children.splice(i, 1);
      children.splice(i + 1, 0, formItem);
    },

    updateCode() {
      // 强制更新一遍组件的内容
      // this.$forceUpdate();
      this.showCode = false;
      this.getVueCode();
      this.$nextTick(() => {
        this.showCode = true;
      });
    },

    saveConfig() {
      const configObj = store.get("_configObj");
      const name = this.fields[0].label;
      if (!name) {
        this.$message.error("请先输入保存配置的名称");
        return;
      }
      let oldValue = store.get(`form_${name}`);
      const time = dayjs().format("YYYY-MM-DD hh:mm:ss");
      const len = this.fields[0].children.length;
      let obj = {
        name: name,
        len: len,
        time: time
      };
      const storeValue = JSON.parse(JSON.stringify(this.fields));
      storeValue[0].formConfig = this.formConfig;
      if (!oldValue) {
        store.set(`form_${name}`, {
          fields: storeValue,
          count: 1,
          ...obj
        });
        configObj[name] = { ...obj, count: 1 };
        store.set("_configObj", configObj);
        this.configList.push({ ...obj, count: 1 });
      } else {
        store.set(`form_${name}`, {
          fields: storeValue,
          count: oldValue.count + 1,
          ...obj
        });
        configObj[name] = {
          count: oldValue.count + 1,
          ...obj
        };
        store.set("_configObj", configObj);
        this.$message.success("保存成功");
      }
    },

    // 获取 Vue 的 code
    getVueCode() {
      const htmlCode = `<template>
            <div class="">
                <el-quick-form
                  label-width="120px"
                  labelPosition="right"
                  input-size="mini"
                  :border-form="false"
                  :form-item-col="8"
                  ref="form"
                  form-item-size="mini"
                  :fields="fields"
                />
            </div>
        </template>`;

      let fields = JSON.stringify(this.fields, null, 4).split("\n");
      fields = fields
        .map((rowText, index) => {
          if (index === 0) {
            return rowText;
          } else {
            // 除了第一行，每行前面加 4 个空格，用于提高代码可阅读性
            return "            " + rowText;
          }
        })
        .join("\n");

      const scriptCode = `%3Cscript%3E
            export default {
                name: 'quickForm',
                data () {
                    return {
                        fields: ${fields}
                    }
                },
                methods: {
                    submit () {
                        this.$refs.form.validate((isPass, data) => {
                            if (isPass) {
                                console.log('这是你刚提交的数据', data);
                            } else {
                                this.$message.error('校验失败！');
                            }
                        });
                    }
                }
            }
        %3C%2Fscript%3E

        %3Cstyle%20scoped%3E
        %3C%2Fstyle%3E`;

      this.htmlCode = htmlCode;

      // console.log(decodeURIComponent(htmlCode + '\n' + scriptCode));
      this.vueCode = decodeURIComponent(htmlCode + "\n" + scriptCode);
    }
  }
};
</script>

<style scoped lang="less">
.input {
  width: 200px;
}
h3,
p {
  text-align: left;
}

.item-span {
  width: 140px;
  margin-left: 10px;
}

.formitem-box {
  text-align: left;
  padding: 0 30px;
  .code-box {
    position: relative;
    width: 100%;
    .block-lv1 {
      border: 1px solid #ccc;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
    }

    .block-lv2 {
      padding: 5px 0px;
      border-radius: 10px;

      .ele-index {
        display: inline-block;
        width: 80px;
      }
    }
  }

  .submit-line {
    margin: 10px 0;

    .tips {
      margin-left: 24px;
      font-size: 10px;
    }
  }

  .collapse {
    position: relative;
    width: 100%;

    .code {
      white-space: pre;
      background: #fafafa;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 10px;
    }
  }
}
</style>

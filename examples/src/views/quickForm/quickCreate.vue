<template>
  <div class="formitem-box">
    <h2>快捷创建表单 | QuickCreate</h2>
    <p>这里，你可以通过快捷命令，快速创建出来一个表单的配置Vue 模板</p>
    <h3>表单快捷配置区</h3>
    <!-- <p>
      在这里，你可以通过通过选择和填写，快速生成一个表单的配置，并在下方可以预览到你要看的表单
    </p> -->
    <div class="code-box">
      <div class="block-lv1" v-for="(field, index) in fields" :key="index">
        <!-- 区块层 -->
        <div>
          表单配置：
          <el-select
            clearable
            filterable
            size="mini"
            v-model="curConfig"
            style="width:200px;margin-left:5px"
            placeholder="原有的配置列表"
            @change="setConfigFields"
          >
            <el-option
              v-for="item in configList"
              :key="item.name"
              :label="item.label"
              :value="item.name"
            >
            </el-option>
          </el-select>

          <el-select
            clearable
            filterable
            size="mini"
            v-model="formConfig.mode"
            class="item-span"
            placeholder="表单模式："
          >
            <el-option
              v-for="item in modes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-select
            clearable
            filterable
            size="mini"
            class="item-span"
            v-model="formConfig.formItemCol"
            placeholder="排列方式："
          >
            <el-option
              v-for="item in cols"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-select
            clearable
            filterable
            size="mini"
            class="item-span"
            v-model="formConfig.defaultShowRows"
            placeholder="初始展示行数："
          >
            <el-option
              v-for="item in rows"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-button
            @click="showTableColumns = !showTableColumns"
            size="mini"
            type="primary"
            >设置表头</el-button
          >
          <br />
          <br />
          表单名称：
          <el-input
            v-model="field.label"
            size="mini"
            class="input "
            style="margin-left:5px"
            placeholder="请输入表单配置名"
          />
          <el-button
            style="margin-left:10px"
            size="mini"
            type="primary"
            @click="addFormItem(field.children)"
          >
            新增字段
          </el-button>
          <el-button
            style="margin-left:10px"
            size="mini"
            type="success"
            :disabled="isEdit"
            @click="saveConfig"
          >
            保存配置到localStorage
          </el-button>
          <el-button
            style="margin-left:10px"
            size="mini"
            type="danger"
            @click="addNewConfig"
          >
            重新创建
          </el-button>
          <br />
          <br />
          <div
            class="block-lv2"
            v-for="(formItem, i) in field.children"
            :key="i"
          >
            <div>
              <span class="ele-index">字段{{ i + 1 }}：</span>
              <el-input
                v-model="formItem.label"
                size="mini"
                class="item-span"
                placeholder="字段的 label"
              />
              <el-input
                v-model="formItem.key"
                size="mini"
                class="item-span"
                placeholder="字段的 key"
              />
              <el-select
                clearable
                filterable
                placeholder="type:"
                class="item-span"
                v-model="formItem.type"
                size="mini"
              >
                <el-option
                  v-for="item in TypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>

              <el-input
                v-model="formItem.path"
                :disabled="!hasRemotePathArray.includes(formItem.type)"
                size="mini"
                class="item-span"
                placeholder="远程数据path"
              />
              <el-switch
                class="item-span"
                v-if="
                  formConfig.mode !== 'tableQuery' && formItem.rules.length > 0
                "
                :value="true"
                @change="setRequired(formItem)"
                active-text="必填"
                inactive-text="非必填"
              />
              <!-- 是否必填 -->
              <el-switch
                v-if="
                  formConfig.mode !== 'tableQuery' &&
                    formItem.rules.length === 0
                "
                :value="false"
                class="item-span"
                @change="setRequired(formItem)"
                active-text="必填"
                inactive-text="非必填"
              />
              <el-popover placement="right" width="400" trigger="click">
                <div class="one">
                  <el-button>添加</el-button>
                </div>
                <el-button size="mini" type="success" slot="reference"
                  >其他</el-button
                >
              </el-popover>

              <el-button
                :disabled="field.children.indexOf(formItem) === 0"
                size="mini"
                icon="el-icon-top"
                title="上移"
                @click="upItem(formItem, field.children)"
              >
              </el-button>
              <el-button
                :disabled="
                  field.children.indexOf(formItem) === field.children.length - 1
                "
                size="mini"
                icon="el-icon-bottom"
                title="下移"
                @click="downItem(formItem, field.children)"
              >
              </el-button>
              <el-button
                type="success"
                size="mini"
                @click="addFormItem(field.children, i + 1)"
              >
                新增
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="deletItem(formItem, field.children)"
              >
                删除
              </el-button>
            </div>
          </div>
          <div class="block lv2" v-if="field.children.length === 0">
            暂无字段
          </div>
        </div>
      </div>

      <div v-if="fields.length === 0" class="block">
        尚未添加区块
      </div>

      <!-- <div>
        新增区块：
        <el-input
          v-model="addBlockLabel"
          size="mini"
          class="input"
          placeholder="请输入区块名（非必须）"
        />
        <el-button
          size="mini"
          type="primary"
          style="margin-left:10px;"
          :loading="addBlockLoading"
          @click="addBlock"
        >
          新增
        </el-button>
      </div> -->
    </div>

    <el-drawer
      title="表头设置"
      size="600"
      :visible.sync="showTableColumns"
      direction="ltr"
    >
      <TableColumnsConfig :columns.sync="realTableColumns"></TableColumnsConfig>
    </el-drawer>

    <el-divider />

    <h3>表单预览区</h3>
    <p>这里将预览到你通过配置生成的表单</p>
    <div style="min-width:1024px">
      <el-quick-form
        label-width="120px"
        labelPosition="right"
        ref="quickForm"
        form-item-size="mini"
        :fields="fieldsConfig"
        v-bind="formConfig"
        v-model="quickFormData"
      />
    </div>

    <el-row>
      <el-col>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </el-col>
    </el-row>

    <div>
      <el-quick-table v-model="table"></el-quick-table>
    </div>

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
import { debounce, cloneDeep } from "lodash-es";
const hasRemotePathArray = [
  "normal-select",
  "mutiple-select",
  "tree-select",
  "radio",
  "checkbox",
  "auto-complete-input"
];

// const localData = new LocalStorage("localData");
import { modes, cols, rows, options, treeParams } from "./quickCreateOptions";
import { storeListData } from "./store"; //树结构数据
import { getCodeOptionsData } from "../../service/api.js";
import TableColumnsConfig from "../demo/sortable/index.vue";
const optionsType = [
  "normal-select",
  "mutiple-select",
  "radio",
  "checkbox",
  "auto-complete-input",
  "dynamic-select"
];

function setItemMockData(label) {
  const time = new RegExp("时间|日期");
  const status = new RegExp("状态");
  const people = new RegExp("人|顾问");
  const city = new RegExp("城市");
  const serviceItem = new RegExp("服务项");
  if (time.test(label)) {
    return dayjs().format("YYYY-MM-DD hh:mm:ss");
  } else if (status.test(label)) {
    return "状态" + Math.ceil(Math.random() * 5);
  } else if (people.test(label)) {
    return "张三";
  } else if (city.test(label)) {
    const citys = ["北京", "上海", "深圳"];
    const len = citys.length;
    return citys[Math.floor(Math.random() * len)];
  } else if (serviceItem.test(label)) {
    const items = ["保姆", "月嫂", "育儿嫂"];
    const len = items.length;
    return items[Math.floor(Math.random() * len)];
  } else {
    return label;
  }
}
// 针对选项进行拓展参数
function extendConfig(v) {
  v.valueBoxStyle = { width: "100%" };
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
  } else if (["date-range-input", "datetime-range-input"].includes(v.type)) {
    v.valueBoxStyle = { maxWidth: "240px" }; //设置 value 容器的样式
  } else if (v.type === "auto-complete-input") {
    v.getOptionsData = getCodeOptionsData;
    v.searchKey = "search";
    v.mainShowKey = "label";
    v.mainValueKey = "code";
  } else if (v.type === "component") {
    v.component = Test;
  }
}
let count = 0;
let countDebounce = 0;
export default {
  name: "FastCreate",
  components: {
    TableColumnsConfig
  },
  data() {
    return {
      /***
       *  htmlCode:''
       * */
      hasRemotePathArray: hasRemotePathArray,
      htmlCode: "",
      curConfig: "",
      quickFormData: {}, //生成表单反应的数据
      isEdit: false, //是否在编辑状态
      /**
       * 编辑表格，保存后，进行 表格同步确认
       * 1. 先得到tableColumns
       * 2. 处理后成为放入realTableColumns
       * 3. 当tableColumns是否有新增（）， 新增则默认插入（删除不处理）编辑文案只处理对应的同步的
       * 4.
       */

      baseColumns: [], //基础的 checkbox,index等
      tableColumns: [], //自动生成的 tableHeader
      realTableColumns: [], //手动处理后的tableHeader

      showTableColumns: false,
      table: {
        remotoDataPath: "",
        //表格数据配置
        border: true,
        "highlight-current-row": true,
        height: 700,
        stripe: true,
        query: {},
        data: [],
        columns: {},
        page: {
          enable: true
        },
        on: {}
      },
      formConfig: {
        // 实际用于配置保存的
        formItemSize: "mini",
        labelPosition: "right",
        mode: "tableQuery",
        formItemCol: 8,
        labelWidth: "120px",
        defaultShowRows: 7,
        showFoldBtn: false,
        borderForm: false
      },
      fields: [
        //当前被观察的
        {
          label: "",
          formConfig: {},
          tableConfig: {},
          children: [
            {
              label: "",
              key: "test",
              type: "input",
              rules: []
            }
          ]
        }
      ],
      fieldsConfig: [
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
    //   fieldsConfig() {
    //     let result = JSON.parse(JSON.stringify(this.fields));
    //     function dealType(arr) {
    //       arr.forEach(v => {
    //         if (v.children && Array.isArray(v.children)) {
    //           dealType(v.children);
    //         } else {
    //           extendConfig(v);
    //         }
    //       });
    //     }
    //     dealType(result);
    //     result[0].formConfig = this.formConfig;
    //     count++;
    //     console.log("----count:", count);
    //     debounce(() => {
    //       console.log("触发预览设置", result);
    //       store.set("form_previewConfig", result);
    //     }, 100);
    //     return result;
    //   }
  },

  created() {
    // 所有配置选项列表
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
    // 拿到预览的实时数据
    const fileds = store.get("form_previewConfig");
    if (fileds) {
      if (Array.isArray(fileds) && fileds.length >= 1) {
        this.fields = fileds;
        this.formConfig = fileds[0].formConfig;
        if (fileds[0].tableConfig) {
          // 存在表格配置数据
          this.table = cloneDeep(fileds[0].tableConfig);
          const columns = Object.values(fileds[0].tableConfig.columns);
          this.realTableColumns = cloneDeep(columns);
        }
      }
    } else {
      this.curConfig = "全部";
      this.setConfigFields("全部");
    }
  },
  watch: {
    formConfig: {
      handler: function() {
        this.$refs["quickForm"].$forceUpdate();
      },
      deep: true
    },
    fields: {
      handler: function() {
        console.log("WatchCount", count++);
        this.isEdit = true;
        this.getFieldsConfig();
      },
      deep: true
    },
    realTableColumns: {
      handler: function(val) {
        console.log("realTableColumns-change");
        this.setTableColumns(val);
      }
    },
    deep: true
  },

  methods: {
    setTableData(columns) {
      if (!Array.isArray(columns)) {
        console.log("数据格式不对");
        return false;
      }
      let data = [];
      for (let i = 0; i < 10; i++) {
        let o = {};
        columns.forEach(v => {
          o[v.prop] = setItemMockData(v.label);
        });
        // console.log(arr);
        data.push(o);
      }
      this.$set(this.table, "data", data);
    },
    setTableColumns(columns) {
      if (!Array.isArray(columns)) {
        console.log("数据格式不对");
        return false;
      }
      this.$set(this.table, "columns", cloneDeep(columns));
    },
    // 设置表格n
    setTable(fields) {
      let obj = {};
      let data = [];

      fields[0].children.forEach(v => {
        obj[v.key] = {
          label: v.label,
          prop: v.key,
          width: v.label.length * 10 + 60
        };
      });

      for (let i = 0; i < 20; i++) {
        let o = {};
        Object.values(obj).forEach(v => {
          o[v.prop] = setItemMockData(v.label);
        });
        // console.log(arr);
        data.push(o);
      }
      this.$set(this.table, "data", data);
      this.$set(this.table, "columns", obj);
    },
    // 获取字段配置
    getFieldsConfig: debounce(
      function() {
        console.log("countDebounce", countDebounce++);
        this.isEdit = false;
        let result = JSON.parse(JSON.stringify(this.fields));
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
        result[0].formConfig = this.formConfig; //表单配置
        result[0].tableConfig = this.table; //表格配置
        console.log("触发预览设置", result);
        store.set("form_previewConfig", result);
        this.fieldsConfig = result;
        // this.setTable(result);
        // return result;
      },
      3000,
      { leading: true }
    ),
    setConfigFields(val) {
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
    // 重新创建
    addNewConfig() {
      this.formConfig = {
        formItemSize: "mini",
        labelPosition: "right",
        mode: "tableQuery",
        formItemCol: 8,
        labelWidth: "120px",
        defaultShowRows: 7,
        showFoldBtn: true,
        borderForm: false
      };
      this.fields = [
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
      ];
      this.curConfig = "";
    },
    // 重置表单
    resetForm() {
      this.$refs["quickForm"].resetFields();
    },
    // 提交表单
    submitForm() {
      const data = this.$refs["quickForm"].getData(true);
      console.log("这是要提交时的数据", data);
    },
    // 清除校验信息
    clearValidate() {
      this.$refs["quickForm"].clearValidate();
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
      storeValue[0].tableConfig = this.table;
      if (!oldValue) {
        store.set(`form_${name}`, {
          fields: storeValue,
          table: this.table,
          count: 1,
          ...obj
        });
        store.set("form_previewConfig", storeValue);

        configObj[name] = { ...obj, count: 1 };
        store.set("_configObj", configObj);

        this.configList.push({ ...obj, count: 1 });
      } else {
        store.set("form_previewConfig", storeValue);
        store.set(`form_${name}`, {
          fields: storeValue,
          table: this.table,
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
      // 替换 % 进行编码
      fields = fields.replace(/%/g, "%25");

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

      // console.log(decodeURIComponent(scriptCode));
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
      box-sizing: border-box;
      min-width: 1046px;
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
// 针对特殊 文字影响排版的写法
/deep/ .el-form-item__label[for="firstCheckDate"] {
  width: 130px !important;
  margin-left: -10px;
}
</style>

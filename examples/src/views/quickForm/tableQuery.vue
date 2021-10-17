<template>
  <div class="testForm">
    <el-quick-form
      label-width="120px"
      labelPosition="right"
      input-size="mini"
      :all-disabled="disableStatus"
      :border-form="false"
      :show-fold-btn="true"
      :form-item-col="formItemCol"
      :fields="formFields"
      :data="initQuery"
      mode="tableQuery"
      :default-show-rows="3"
      v-model="query"
      ref="tableQuery"
    />
    <div class="oper">
      <el-button type="primary" @click="submit('tableQuery')"
        >提交按钮</el-button
      >
      <el-button type="primary" @click="resetForm('tableQuery')"
        >重置数据</el-button
      >
      <el-button type="success" @click="getComponet('tableQuery', 'test')"
        >自定义组件数据</el-button
      >
      <el-button type="primary" @click="disabledForm('tableQuery')"
        >禁用表格</el-button
      >

      <el-button type="info" @click="updateData('job')">
        更新职位数据
      </el-button>
      <el-button type="info" @click="emptyOptions('job')">
        清空职业数据
      </el-button>
      <el-button type="info" @click="disabledItem('cityIds')">
        禁用城市
      </el-button>
      <el-button type="info" @click="hiddenItem('storeIds')">
        隐藏门店
      </el-button>
    </div>
  </div>
</template>

<script>
import {
  getJobOptions,
  getOrderStatus,
  getCodeOptionsData
} from "../../service/api.js";
import { storeListData } from "./store";
import Test from "./test.vue";
const formConfig = [
  {
    // mode: "tableQuery", //"dialogForm , tableQuery, bigForm"
    // defaultShowRows:3,
    // showFlod:true,
    children: [
      {
        key: "test",
        type: "component",
        label: "自定义",
        class: "test-component",
        component: Test,
        span: 8
        // rules: [
        //   {
        //     required: true,
        //     message: "请输入"
        //   }
        // ]
      },
      {
        key: "name",
        type: "input",
        label: "用户名称",
        placeholder: "请输入用户名称",
        clearable: true,
        events: {
          input: function(val) {
            console.log("onInput", val);
          },
          focus: function(val, item, e) {
            console.log("focus", val, item, e);
          },
          change: function(val) {
            console.log("change", val);
          }
        },

        rules: [
          {
            required: true,
            message: "请输入",
            trigger: ["blur", "change"]
          }
        ]
      },
      {
        key: "phone",
        type: "input",
        label: "手机号",
        placeholder: "请输入用户手机号",
        limitInputRegExp: /[^0-9]/g,
        clearable: true,
        maxlength: 11,
        events: {
          input: function(val, item) {
            console.log(val, item);
          },
          blur: function(val, item, e) {
            console.log(val, item, e);
          }
        },
        rules: [
          {
            message: "请输入11位的手机号",
            max: 11,
            trigger: ["blur", "change"]
          }
        ]
      },
      {
        key: "orderStatus",
        label: "订单状态",
        placeholder: "请选择订单状态",
        type: "normal-select",
        getOptionsData: getOrderStatus,
        options: [],
        optionsConfig: {
          label: "label",
          value: "code"
        }
      },
      {
        options: [
          {
            label: "程序员",
            value: "1"
          },
          {
            label: "UI",
            value: "2"
          }
        ],
        key: "job",
        label: "职业",
        placeholder: "请选择",
        type: "normal-select",
        clearable: true,
        defaultValue: "1",
        valueLink: [
          // {
          //   value: ".",
          //   linkList: [
          //     {
          //       linkKey: "age",
          //       enableLinkValue: true,
          //       // enableLinkHidden: true,
          //       enableLinkDisable: true,
          //       enableLinkRequired: true, //开启关联必填
          //       // linkHidden: true,
          //       linkDisable: false,
          //       linkValue: 2,
          //       linkRequired: true //必填
          //     }
          //   ]
          // },
          {
            value: "1",
            linkList: [
              {
                linkKey: "age",
                enableLinkValue: true,
                // enableLinkHidden: true,
                enableLinkDisable: true,
                enableLinkRequired: true, //开启关联必填
                // linkHidden: true,
                linkDisable: false,
                linkValue: 3,
                linkRequired: true //必填
              }
            ]
          },
          {
            value: "",
            linkList: [
              {
                linkKey: "age",
                enableLinkValue: true,
                enableLinkDisable: true,
                enableLinkRequired: true, //开启关联必填
                linkValue: "",
                linkDisable: true,
                linkRequired: false //非必填
              }
            ]
          }
        ]
      },
      {
        key: "age",
        label: "年限",
        placeholder: "请输入",
        type: "normal-select",
        clearable: true,
        filterable: true,
        options: [
          {
            label: "2年",
            value: 2
          },
          {
            label: "3年",
            value: 3
          },
          {
            label: "5年",
            value: 5
          }
        ]
      },
      {
        options: [
          {
            label: "北京",
            value: 1
          },
          {
            label: "上海",
            value: 2
          }
        ],
        defaultValue: [1],
        key: "cityIds",
        label: "城市",
        size: "mini",
        clearable: true,
        filterable: true,
        type: "mutiple-select"
      },
      {
        placeholder: "请选择",
        type: "tree-select",
        options: storeListData,
        defaultValue: [1],
        key: "storeIds",
        label: "门店",
        size: "mini",
        clearable: true,
        filterable: true,
        selectParams: {
          multiple: false,
          clearable: true,
          placeholder: "请输入门店"
        },
        treeParams: {
          clickParent: false,
          filterable: true,
          "check-strictly": true,
          "default-expand-all": true,
          "expand-on-click-node": false,
          // "render-content": this.treeRenderFun,
          // data: storeListData,
          props: {
            children: "children",
            label: "text",
            disabled: "disabled",
            value: "id"
          }
        },
        onChange: function(val) {
          console.log(val);
        }
      },
      {
        // searchUrl: "/api/options/code",
        getOptionsData: getCodeOptionsData,
        searchKey: "search",
        mainShowKey: "label",
        mainValueKey: "code",
        key: "usercode",
        label: "用户码",
        placeholder: "请输入",
        otherSearchKeys: {
          aa: 1
        },
        autoCompleteKeys: ["userId"],
        onSelect(selectedItem, randomId) {
          console.log(selectedItem, randomId);
        },
        type: "auto-complete-input"
      },
      {
        key: "userId",
        label: "用户Id",
        type: "input",
        hiddenDefault: true
      },
      {
        key: "reg_date",
        label: "注册时间",
        placeholder: "请输入",
        type: "datetime-input",
        span: 8,
        format: "yyyy-MM-dd HH:mm",
        "value-format": "yyyy-MM-dd HH:mm"
      },
      {
        key: "ordertime",
        label: "订单时间",
        placeholder: "请输入",
        type: "datetime-range-input",
        valueFormat: "yyyy-MM-dd HH:mm",
        span: 12
      },

      {
        key: "dict_code",
        type: "dynamic-select",
        label: "动态下拉框",
        parentKey: "101",
        mutiple: "",
        size: "mini"
      }
    ]
  }
];
export default {
  data() {
    formConfig[0].children.forEach(v => {
      v.size = "mini";
    });
    const query = this.getInitQuery(formConfig);
    const initQuery = this.getInitQuery(formConfig);

    console.log(query);
    return {
      query: query,
      initQuery: initQuery,
      disabledCityIds: false,
      hiddenStoreIds: false,
      disableStatus: false,
      jobOptions: [],
      formItemCol: 8,
      formFields: formConfig
    };
  },
  created() {
    getJobOptions({ type: 1 }).then(({ data }) => {
      // console.log(111111, data);
      this.jobOptions = data;
    });
    // getJobOptions({ type: 2 });
  },
  methods: {
    getInitQuery(formConfig) {
      let result = {};
      let list = [];
      if (formConfig[0].children) {
        list = formConfig[0].children;
      }
      list.forEach(v => {
        const types = ["mutiple-select"];
        if (v.defaultValue !== undefined) {
          result[v.key] = v.defaultValue;
          if (v.extendKey) result[v.extendKey] = null;
        } else if (types.includes(v.type) && !v.defaultValue) {
          result[v.key] = [];
          if (v.extendKey) result[v.extendKey] = [];
        } else {
          result[v.key] = "";
          if (v.extendKey) result[v.extendKey] = "";
        }
      });
      return result;
    },
    disabledForm() {
      this.disableStatus = !this.disableStatus;
    },
    resetForm() {
      // this.query = this.initQuery;
      // this.$refs.tableQuery.resetFormData(this.initQuery);
      this.$refs.tableQuery.resetFields();
    },

    find(data, key) {
      let options = [];
      function check(list, key) {
        if (Array.isArray(list) && list.length > 0) {
          let len = list.length;
          for (let i = 0; i < len; i++) {
            let v = list[i];
            if (Array.isArray(v.children)) {
              check(v.children, key);
            } else if (Array.isArray(v.options) && v.key === key) {
              options = v.options;
              break;
            }
          }
        }
      }
      check(data, key);
      return options;
    },
    updateData(key) {
      switch (key) {
        case "job":
          this.quickUpdate(key, this.jobOptions);
          break;

        default:
          break;
      }
    },
    disabledItem(key) {
      this.disabledCityIds = !this.disabledCityIds;
      this.$refs.tableQuery.setElementDisable(key, this.disabledCityIds);
    },
    hiddenItem(key) {
      this.hiddenStoreIds = !this.hiddenStoreIds;
      this.$refs.tableQuery.setElementHidden(key, this.hiddenStoreIds);
    },
    quickUpdate(key, newOptions) {
      console.log(key);
      // const options = this.fields2[0].children[0].options;
      let options = this.find(this.formFields, key);
      console.log(options, 777);
      // options.concat(newOptions)
      if (Array.isArray(newOptions)) {
        newOptions.forEach(v => {
          options.push(v);
        });
      }
      //   const i = options.length;
      //   options.push({
      //     value: i,
      //     label: `第${i + 1}个选项`
      //   });
      //   this.$set(options, []);
      //   options = [
      //     {
      //       value: i,
      //       label: `第${i + 1}个选项`
      //     }
      //   ];
    },
    delOption(key) {
      let options = this.find(this.formFields, key);
      const i = options.length;
      if (i === 0) {
        return this.$message.error("已经删完了，不能再删了");
      }
      options.splice(i - 1, 1);
    },
    emptyOptions(key) {
      let options = this.find(this.formFields, key);
      const i = options.length;
      if (i !== 0) {
        options.splice(0, i);
      }
    },
    changeData() {
      this.formFields[0].children[1].options = [
        {
          value: "male",
          label: "男"
        }
      ];
      console.log((this.formFields[0].children[1].options = []));
    },
    getComponet(formName, key) {
      const $form = this.$refs[formName];
      const $co = $form.$refs[key];
      $co.test();
    },
    submit(formName) {
      console.log(
        "this.$refs[formName].getData()",
        this.$refs[formName].getData(true)
      );
      this.$refs[formName].validate((isPass, data) => {
        if (isPass) {
          console.log("这是你刚提交的数据", data);
        } else {
          this.$message.error("校验失败！");
        }
      }, true);
    }
  }
};
</script>

<style lang="scss">
.el-form-item {
  margin-bottom: 5px;
}
.testForm {
  text-align: left;
  min-width: 900px;
}
.el-input .el-input__inner {
  left: 0;
}
.el-range-editor--mini.el-input__inner {
  max-width: 320px;
}
.el-form-item__error {
  margin-top: -6px;
}
// .el-form-item__label {
//   width: 180px;
//   text-align: right !important;
// }
// .el-form-item__content {
//   margin-left: 12px;
//   flex: 1;
//   max-width: 300px;
// }
</style>

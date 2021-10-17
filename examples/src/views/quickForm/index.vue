<template>
  <div class="testForm">
    <el-quick-form
      label-width="180px"
      labelPosition="right"
      :border-form="true"
      :show-fold-btn="true"
      :form-item-col="formItemCol"
      :fields="fields1"
      ref="form1"
    />
    <el-button type="primary" @click="submit('form1')">提交按钮</el-button>
    <el-button type="info" @click="changeData"> 动态处理数据 </el-button>
  </div>
</template>

<script>
import { getJobOptions } from "../../service/api.js";
const formConfig = [
  {
    label: "用户信息登记1",
    children: [
      {
        key: "name",
        type: "input",
        label: "用户名称"
      },
      {
        options: [
          {
            value: "male",
            label: "男"
          },
          {
            value: "female",
            label: "女"
          }
        ],
        key: "gender",
        label: "性别",
        type: "radio"
      },
      {
        options: [
          {
            value: "自由职业者",
            label: "自由职业者"
          },
          {
            value: "体制内",
            label: "体制内"
          },
          {
            value: "打工人",
            label: "打工人"
          },
          {
            value: "其他",
            label: "其他"
          }
        ],
        key: "job",
        label: "职业",
        placeholder: "请选择",
        parentKey: "101",
        type: "normal-select"
      },
      {
        key: "money",
        type: "money-input",
        label: "定金",
        append: "元"
      },
      {
        autoCompleteKeys: [],
        searchUrl: "/autocomplete",
        searchKey: "search",
        mainShowKey: "search",
        key: "code",
        label: "code码",
        placeholder: "请输入",
        type: "auto-complete-input"
      },
      {
        key: "reg_date",
        label: "注册时间",
        placeholder: "请输入",
        type: "date-input"
      },
      {
        key: "timearea",
        label: "有效范围",
        placeholder: "请输入",
        type: "date-range-input"
      },
      {
        key: "notice_time",
        label: "时分",
        type: "hour-minute-input"
      },
      {
        key: "number_limit",
        type: "number-input",
        label: "数量限制",
        append: "个"
      },
      {
        key: "dict_code",
        type: "dynamic-select",
        label: "动态字典下拉框",
        parentKey: "101",
        span: 16
      },
      {
        key: "rate",
        type: "rate-input",
        label: "存款利率"
      },
      //   {
      //     key: "area",
      //     type: "mul-linkage",
      //     label: "三级联动下拉框，",
      //     linkLevel: 3,
      //     firstParentKey: "100",
      //   },
      {
        key: "address",
        type: "textarea",
        label: "详细地址",
        span: 24
      },
      {
        // key
        key: "testInput",
        // 小型表单
        type: "child-form",
        // 是否允许删除单个子表单，默认 true（允许）（未完成）
        deleteEnable: true,
        // 是否允许新增单个子表单，默认 true（允许）（未完成）
        addEnable: true,
        // 每个小表单头的文字部分，以及新增按钮的部分
        headerLabel: "面签人员信息",
        // 里面是表单的每一项，写法和外面的没区别
        childrenForm: [
          //   {
          //     key: "dict_code",
          //     type: "dynamic-select",
          //     label: "这是一个字典下拉框（想不出来用处了）",
          //     parentKey: "101",
          //   },
        ]
      }
    ]
  }
];
export default {
  data() {
    return {
      formItemCol: 24,
      fields1: formConfig
    };
  },
  created() {
    getJobOptions({ type: 1 });
    // getJobOptions({ type: 2 });
  },
  methods: {
    changeData() {
      this.fields1[0].children[1].options = [
        {
          value: "male",
          label: "男"
        }
      ];
      console.log((this.fields1[0].children[1].options = []));
    },
    submit(formName) {
      this.$refs[formName].validate((isPass, data) => {
        if (isPass) {
          console.log("这是你刚提交的数据", data);
        } else {
          this.$message.error("校验失败！");
        }
      });
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
}
.el-input .el-input__inner {
  left: 0;
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

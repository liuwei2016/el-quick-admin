export const allConfig = {
  fields: [
    {
      label: "全部",
      children: [
        {
          label: "文本框",
          type: "input",
          rules: [
            { required: true, message: "请输入", trigger: ["blur", "change"] }
          ],
          size: "mini",
          key: "input"
        },
        {
          label: "下拉框",
          type: "normal-select",
          rules: [],
          size: "mini",
          key: "normalSelect"
        },
        {
          label: "多选下拉框",
          type: "mutiple-select",
          rules: [],
          size: "mini",
          key: "mutiple"
        },
        {
          label: "自定义组件",
          type: "component",
          rules: [],
          size: "mini",
          key: "createTime"
        },
        {
          label: "树",
          type: "tree-select",
          rules: [],
          size: "mini",
          key: "organization"
        },
        {
          label: "时分",
          type: "hour-minute-input",
          rules: [],
          key: "datetime"
        },
        { label: "日期", type: "date-input", rules: [], key: "dateInput" },
        {
          label: "日期范围",
          type: "date-range-input",
          rules: [],
          key: "dateRange"
        },
        {
          label: "日期时间范围",
          type: "datetime-range-input",
          rules: [],
          key: "datetimeRange"
        },
        { label: "金额", type: "money-input", rules: [], key: "money" },
        {
          label: "搜索",
          type: "auto-complete-input",
          rules: [],
          key: "autocomplete"
        },
        {
          label: "单选框",
          type: "radio",
          rules: [],
          size: "mini",
          key: "contact"
        },
        { label: "多选框", type: "checkbox", rules: [], key: "checkbox" },
        { label: "数字", type: "normal-number", rules: [], key: "number" },
        { label: "利率", type: "rate-input", rules: [], key: "rate" },
        {
          label: "千分位数字",
          type: "number-input",
          rules: [],
          key: "number2"
        },
        { label: "字典", type: "dynamic-select", rules: [], key: "dict" },
        { label: "文本", type: "textarea", rules: [], key: "textarea" }
      ]
    }
  ],
  count: 15,
  name: "全部",
  len: 18,
  time: "2021-10-09 07:54:09"
};

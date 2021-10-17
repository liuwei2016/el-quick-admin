/**
 * 功能说明：
 * 枚举字典
 */

const FormItemTypeText = {
  Input: "文本输入框",
  NormalSelect: "普通下拉框",
  MutipleSelect: "多选下拉框",
  TreeSelect: "树结构下拉框",
  DateInput: "日期输入框",
  DateRangeInput: "日期范围输入框",
  DateTimeRangeInput: "日期时间范围输入框",
  Component: "自定义组件",
  Radio: "单选框",
  CheckBox: "多选框",
  MoneyInput: "金额输入框",
  AutoCompleteOption: "输入搜索下拉框",
  HourMinuteInput: "时分输入框",
  NormalNumber: "数字输入框",
  NumberInput: "千分位数字输入框",
  DynamicSelect: "字典下拉框",
  RateInput: "利率输入框",
  MulLinkage: "三级联动输入框",
  TextArea: "文本域输入框"
};

// rank 表示出现的场景的权重， 应根据个人使用着的情况来
const TypeList = [
  {
    // 文本输入框
    label: FormItemTypeText.Input,
    value: "input",
    rank: 20
  },
  {
    // 普通下拉框
    label: FormItemTypeText.NormalSelect,
    value: "normal-select",
    rank: 40
  },
  {
    // 多选下拉框
    label: FormItemTypeText.MutipleSelect,
    value: "mutiple-select",
    rank: 60
  },
  {
    // 自定义组件
    label: FormItemTypeText.Component,
    value: "component",
    rank: 4
  },

  {
    //tree下拉框
    label: FormItemTypeText.TreeSelect,
    value: "tree-select",
    rank: 10
  },
  {
    // 时间日期
    label: FormItemTypeText.DateTimeRangeInput,
    value: "datetime-range-input",
    rank: 6
  },

  {
    // 普通单选框
    label: FormItemTypeText.Radio,
    value: "radio",
    rank: 15
  },
  {
    // 普通多选
    label: FormItemTypeText.CheckBox,
    value: "checkbox",
    rank: 16
  },
  {
    // 金额输入框
    label: FormItemTypeText.MoneyInput,
    value: "money-input",
    rank: 13
  },
  {
    // 输入搜索下拉框
    label: FormItemTypeText.AutoCompleteOption,
    value: "auto-complete-input",
    rank: 30
  },
  {
    // 日期输入框（年月日）
    label: FormItemTypeText.DateInput,
    value: "date-input",
    rank: 30
  },
  {
    // 日期范围输入框（从 某年某月某日 ~ 某年某月某日）
    label: FormItemTypeText.DateRangeInput,
    value: "date-range-input",
    rank: 50
  },
  {
    // 时间输入框（时分）（注：只能选时分，但实际值是时分秒）
    label: FormItemTypeText.HourMinuteInput,
    value: "hour-minute-input",
    rank: 3
  },
  {
    // 数字输入框
    label: FormItemTypeText.NormalNumber,
    value: "normal-number",
    rank: 12
  },
  {
    // 千分位数字输入框
    label: FormItemTypeText.NumberInput,
    value: "number-input",
    rank: 1
  },
  {
    // 字典下拉框
    label: FormItemTypeText.DynamicSelect,
    value: "dynamic-select",
    rank: 10
  },
  {
    // 利率输入框
    label: FormItemTypeText.RateInput,
    value: "rate-input",
    rank: 3
  },
  {
    // 多级联动输入框
    label: FormItemTypeText.MulLinkage,
    value: "mul-linkage",
    rank: 4
  },
  {
    // 文本域输入框
    label: FormItemTypeText.TextArea,
    value: "textarea",
    rank: 6
  }
];

const GetTypeText = type => {
  let text = "";
  TypeList.forEach(item => {
    if (item.value === type) {
      text = item.label;
    }
  });
  return text;
};

export { FormItemTypeText, TypeList, GetTypeText };

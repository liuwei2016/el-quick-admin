<template>
  <!-- 小时、分钟 输入框 -->
  <div
    :style="item.valueWrapStyle || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-item-box"
  >
    <el-time-picker
      v-model="val"
      class="form-date-item"
      type="date"
      :style="item.valueBoxStyle || {}"
      :disabled="getDisabled"
      :placeholder="getPlaceholder(item)"
      @blur="e => onBlur(item, e)"
      @focus="e => onFocus(item, e)"
      :format="item.format || 'HH:mm'"
      :value-format="item['value-format'] || 'HH:mm:00'"
      v-bind="bindAttrs"
      v-if="!getTextModel"
    />
    <div v-else :style="item.textStyle || {}">{{ val || "-" }}</div>
  </div>
</template>

<script>
import FormMixin from "./mixin";

export default {
  name: "FormHourMinute",
  mixins: [FormMixin],
  methods: {}
};
</script>

<style scoped lang="less">
// .form-item-box /deep/ .el-input {
//   position: relative;
//   width: 100%;
//   height: 36px;

//   .el-input__inner {
//     position: absolute;
//     width: 100%;
//     height: 36px;
//     line-height: 36px;
//     padding-right: 10px;
//     padding-left: 12px;
//   }

//   .el-input__prefix {
//     left: inherit;
//     right: 5px;

//     .el-input__icon {
//       line-height: 100%;
//     }

//     .el-input__icon:before {
//       font-size: 16px;
//       line-height: 36px;
//     }
//   }
// }
</style>

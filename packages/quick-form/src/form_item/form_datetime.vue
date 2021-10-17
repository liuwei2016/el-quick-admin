<template>
  <!-- 日期选择框 -->
  <div
    :style="item.valueWrapStyle || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-item-box"
  >
    <el-date-picker
      v-model="val"
      class="form-date-item"
      type="datetime"
      :style="item.valueBoxStyle || {}"
      :disabled="getDisabled"
      :placeholder="getPlaceholder(item)"
      @blur="e => onBlur(item, e)"
      @focus="e => onFocus(item, e)"
      :picker-options="
        item.pickerOptions ? handlerDate(item.pickerOptions) : () => false
      "
      :clearable="true"
      v-bind="bindAttrs"
      v-if="!getTextModel"
    />
    <div v-else :style="item.textStyle || {}">{{ val || "-" }}</div>
  </div>
</template>

<script>
import FormMixin from "./mixin";

export default {
  name: "FormDate",
  mixins: [FormMixin],
  methods: {
    handlerDate(item) {
      const { before, after, maxOffset, minOffset } = item;
      return {
        disabledDate: time => {
          if (before) {
            // 限制当前时间之前
            return time.getTime() < Date.now() - 1000 * 60 * 60 * 24;
          } else if (after) {
            // 限制当前时间之后的时间
            return time.getTime() > Date.now();
          } else if (maxOffset && !minOffset) {
            return time.getTime() < maxOffset;
          } else if (minOffset && !maxOffset) {
            return time.getTime() > minOffset - 1000 * 60 * 60 * 24;
          } else if (maxOffset && minOffset) {
            return (
              time.getTime() > minOffset - 1000 * 60 * 60 * 24 ||
              time.getTime() < maxOffset
            );
          }
        }
      };
    }
  }
};
</script>

<style scoped lang="less">
// .form-item-box /deep/ .el-input {
//   position: relative;
//   width: 100%;
//   // height: 36px;

//   .el-input__inner {
//     position: absolute;
//     width: 100%;
//     // height: 36px;
//     line-height: 36px;
//     padding-right: 10px;
//     padding-left: 12px;
//   }

//   .el-input__prefix {
//     left: inherit;
//     // right: 5px;

//     .el-input__icon {
//       line-height: 100%;
//       display: block;
//     }

//     .el-input__icon:before {
//       font-size: 16px;
//       line-height: 36px;
//     }
//   }
// }
</style>

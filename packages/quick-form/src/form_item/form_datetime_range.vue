<template>
  <!-- 日期范围选择框 -->
  <div
    :style="item.valueWrapStyle || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-item-box"
  >
    <el-date-picker
      v-model="val"
      type="datetimerange"
      :disabled="getDisabled"
      :style="item.valueBoxStyle || {}"
      :placeholder="getPlaceholder(item)"
      @blur="e => onBlur(item, e)"
      @focus="e => onFocus(item, e)"
      :clearable="true"
      v-bind="bindAttrs"
      value-format="yyyy-MM-dd HH:mm"
      v-if="!getTextModel"
    />
    <div v-else :style="item.textStyle || {}">{{ textModelValue || "-" }}</div>
  </div>
</template>

<script>
import FormMixin from "./mixin";

export default {
  name: "FormDateTimeRange",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  mixins: [FormMixin],
  computed: {
    val: {
      get() {
        if (this.value) {
          return JSON.parse(this.value);
        } else {
          return [];
        }
      },
      set(v) {
        this.$emit("input", JSON.stringify(v));
        // 只有非子表单的情况下，才会冒泡上去数据变更
        if (this.formItemType !== "childForm") {
          this.statusChangeFn.valueUpdateEvent({
            [this.item.key]: v
          });
        } else {
          // 如果是子表单的话，执行内置的变更
          this.childChangeData.valueUpdateEvent();
        }
      }
    },
    textModelValue() {
      return this.val && this.val.join("至");
    }
  }
};
</script>

<style scoped lang="less">
// .form-item-box /deep/ .el-date-editor--daterange {
//   position: relative;
//   width: 100%;
//   height: 36px;
// }
</style>

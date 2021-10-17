<template>
  <div
    :style="item.valueWrapStyle || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-item-box"
  >
    <el-select
      :style="item.valueBoxStyle || {}"
      v-model="val"
      :disabled="getDisabled"
      :placeholder="getSelectPlaceholder(item)"
      v-bind="bindAttrs"
      v-if="!getTextModel"
    >
      <el-option
        v-for="option in item.options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
    <div v-else :style="item.textStyle || {}">{{ textModelValue || "-" }}</div>
  </div>
</template>

<script>
import FormMixin from "./mixin";
import FormSelectMixin from "./select-mixin";

export default {
  name: "FormNormalSelect",
  mixins: [FormMixin, FormSelectMixin],
  computed: {
    textModelValue() {
      if (this.item.options) {
        let val = "";
        this.item.options.forEach(item => {
          if (item.value === this.value) {
            val = item.label;
          }
        });
        return val;
      } else {
        return "";
      }
    },
    val: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
        this._valueLink(v);
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
    }
  }
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

//   .el-input__inner:focus {
//     border-color: #8d94a5;
//   }
// }

// .el-select-dropdown__item.selected {
//   color: #606266;
//   font-weight: normal;
// }
</style>

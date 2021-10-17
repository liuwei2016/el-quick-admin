<template>
  <div
    :style="item.valueWrapStyle || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-item-box"
  >
    <el-tree-select
      v-if="!getTextModel"
      :ref="`treeSelect_${item.key}`"
      :disabled="getDisabled"
      :placeholder="getSelectPlaceholder(item)"
      v-model="val"
      :style="item.valueBoxStyle || {}"
      :selectParams="selectParams"
      :treeParams="treeParams"
      @searchFun="treeSearchFun"
      v-on="bindEvents"
    />
    <div v-else :style="item.textStyle || {}">{{ textModelValue || "-" }}</div>
  </div>
</template>

<script>
import FormMixin from "./mixin";

export default {
  name: "FormNormalSelect",
  mixins: [FormMixin],
  computed: {
    selectParams() {
      let obj = this.item.selectParams || {};
      return { ...this.bindAttrs, ...obj };
    },
    treeParams() {
      /**
       * ！为保持数据一致性 treeParams下面的data 用options 来代替
       */
      let obj = this.item.treeParams || {};
      if (!this.item.options) {
        console.log("请用options");
      }
      console.log("this.item.options", this.item.options);
      if (!obj.data && this.item.options) {
        obj.data = this.item.options;
      }
      return obj;
    },
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
  },
  methods: {
    // 过滤
    treeSearchFun(value) {
      this.$refs[`treeSelect_${this.item.key}`].filterFun(value);
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .el-tree-select-input {
  width: 100%;
}

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

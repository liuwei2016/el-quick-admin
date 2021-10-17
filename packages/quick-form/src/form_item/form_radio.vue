<template>
  <!-- 普通输入框 -->
  <div
    :style="item.valueWrapStyle || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-input-box form-item-box"
  >
    <el-radio-group
      v-model.trim="val"
      :disabled="getDisabled"
      @blur="e => onBlur(item, e)"
      @focus="e => onFocus(item, e)"
      :style="item.valueBoxStyle || {}"
      :clearable="true"
      v-bind="bindAttrs"
      v-if="!getTextModel"
    >
      <el-radio
        v-for="opt in item.options"
        :key="opt.value"
        :label="opt.value"
        >{{ opt.label }}</el-radio
      >
    </el-radio-group>
    <div v-else :style="item.textStyle || {}">{{ textModelValue || "-" }}</div>
  </div>
</template>

<script>
import FormMixin from './mixin'

export default {
  name: 'FormRadio',
  mixins: [FormMixin],
  data () {
    return {
      prependMsg: '',
      appendMsg: ''
    }
  },
  computed: {
    textModelValue () {
      const content =
        this.item.options &&
        this.item.options.find(item => {
          return item.value === this.val
        })
      return (content && content.label) || ''
    },

    val: {
      get () {
        return this.value
      },
      set (v) {
        this.$emit('input', v)
        this._valueLink(v)
        // 只有非子表单的情况下，才会冒泡上去数据变更
        if (this.formItemType !== 'childForm') {
          this.statusChangeFn.valueUpdateEvent({
            [this.item.key]: v
          })
        } else {
          // 如果是子表单的话，执行内置的变更
          this.childChangeData.valueUpdateEvent()
        }
      }
    }
  },
  watch: {
    item: {
      handler (n) {
        if (n.prefixMsg) {
          this.prependMsg = n.prefixMsg
        }
        if (n.suffixMsg) {
          this.appendMsg = n.suffixMsg
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped lang="less">
.form-input-box /deep/ .el-input-group__prepend,
.single-input .form-input-box /deep/ .el-input-group__append {
  padding: 0 10px;
}
</style>

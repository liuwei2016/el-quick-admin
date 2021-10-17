<template>
  <!-- 输入搜索框 -->
  <div
    :style="item.valueWrapStyle || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-item-box"
  >
    <el-autocomplete
      v-model.trim="val"
      :style="item.valueBoxStyle || {}"
      :placeholder="getPlaceholder(item)"
      :disabled="getDisabled"
      class="auto-complte-input"
      @blur="e => onBlur(item, e)"
      @focus="e => onFocus(item, e)"
      value-key="value"
      :ref="`autocomplete_${item.key}`"
      :fetch-suggestions="querySearchAsync"
      @select="handleSelect"
      v-bind="bindAttrs"
      v-if="!getTextModel"
    >
      <i
        v-show="val"
        slot="suffix"
        class="el-input_icon el-icon-circle-close el-input__clear"
        @click="closeSelect($refs[`autocomplete_${item.key}`])"
      ></i>
    </el-autocomplete>
    <div v-else :style="item.textStyle || {}">{{ val || "-" }}</div>
  </div>
</template>

<script>
import FormMixin from './mixin'
import SelectMixin from './select-mixin'
// const axios = require("axios");

export default {
  name: 'FormAutoComplete',
  mixins: [FormMixin, SelectMixin],
  methods: {
    searchAsync (queryString) {
      this.getOptionsData({
        [this.item.searchKey]: queryString
      })
    },
    querySearchAsync (queryString, cb) {
      const payload = {
        [this.item.searchKey]: queryString
      }
      if (this.item.otherSearchKeys && this.item.otherSearchKeys.length > 0) {
        this.item.otherSearchKeys.forEach(obj => {
          payload[obj.key] = obj.value
        })
      }
      this.item.getOptionsData(payload).then(({ data }) => {
        if (data) {
          const d = data.map(item => {
            console.log('item', item)
            if (this.item.mainShowKey) {
              return {
                ...item,
                item,
                value: item[this.item.mainShowKey]
              }
            } else {
              return {
                ...item,
                item,
                value: item[this.item.autoCompleteKeys[0]]
              }
            }
          })
          console.log('ddddd', d)
          cb(d)
          if (this.item.fetchSuggestions) {
            this.item.fetchSuggestions(d, this.randomId)
          }
        } else {
          cb([])
          if (this.item.fetchSuggestions) {
            this.item.fetchSuggestions([], this.randomId)
          }
          this.$message.error('无匹配数据')
        }
      })
    },
    // fix element-ui 本身的一个bug
    closeSelect ($el) {
      // 这个问题是在清除之后，activated被设置了false，增加判断输入框是否在聚焦状态，如果是聚焦状态，下拉框也要显示出来
      try {
        $el.$children[0].clear()
        $el.$children[0].focus()
        $el.activated = true
      } catch (error) {
        console.log(error)
      }
    },
    handleSelect (selectedItem) {
      // console.log('selectedItem', selectedItem);
      const payload = {}
      // 将需要更新的数据的值，添加到 payload 里
      this.item.autoCompleteKeys.forEach(key => {
        payload[key] = selectedItem.item[this.item.mainValueKey]
      })
      console.log('his.statusChangeFn.updateFormData', payload)
      // 再调用方法，推到 quickForm 这个组件中
      this.statusChangeFn.updateFormData(payload)
      if (this.item.onSelect) {
        this.item.onSelect(selectedItem, this.randomId)
      }
    }
  }
}
</script>

<style scoped lang="less">
// .auto-complte-input {
//   width: 100%;
// }
</style>

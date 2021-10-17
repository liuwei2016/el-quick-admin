/**
 * Created by liuwei2016 on 2021/6/10.

 * 功能说明：
 * 一个表单元素的 mixin
 */

function isEmptyArray (arr) {
  return Array.isArray(arr) && arr.length
}
// function isFunction(f) {
//   return Object.prototype.toString.call(f) === "[Object Function]";
// }
export default {
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    value: [String, Number, Array],
    allDisabled: {
      type: Boolean,
      default: false
    },
    randomId: {
      type: String,
      default: ''
    }
  },
  inject: [
    'dynamicDict',
    'dynamicSelectOption',
    'changeData',
    'statusChangeFn',
    'formItemType',
    'childChangeData'
  ],
  computed: {
    // 扩展属性，直接将属性配置，传到表单组件内部（即 Element UI 上）
    // 忽略属性【key】
    bindAttrs () {
      const obj = Object.assign({}, this.item)
      const clearAttrList = [
        'key',
        'events',
        'onFocus',
        'onBlur',
        'onInput',
        'onChange',
        'type',
        'label',
        'readonly',
        'rules',
        'placeholder',
        'prepend',
        'append',
        'defaultValue',
        'optionsConfig',
        'getOptionsData'
      ]
      clearAttrList.forEach(v => {
        delete obj[v]
      })
      // delete obj.key;
      // delete obj.events;
      // delete obj.onFocus;
      // delete obj.onBlur;
      // delete obj.onInput;
      // delete obj.onChange;
      // // delete obj.size; //暂时不忽略size
      // delete obj.type;
      // delete obj.label;
      // delete obj.readonly;
      // delete obj.rules;
      // delete obj.placeholder;
      // delete obj.prepend;
      // delete obj.append;
      // delete obj.defaultValue;
      return obj
    },
    // 挂载事件
    bindEvents () {
      const obj = Object.assign({}, this.item.events)
      return obj
    },
    // 获取禁用状态
    getDisabled () {
      // 如果全部都被禁用了
      if (this.allDisabled) {
        return true
      }
      if (this.formItemType === 'childForm') {
        // 如果是子表单里的元素的话，采用三段匹配
        const formKey = this.childChangeData.formKey
        const randomId = this.randomId
        const key = this.item.key
        const keyText = `${formKey}_${randomId}_${key}`
        if (this.changeData.disableList.indexOf(keyText) > -1) {
          return true
        }
      } else {
        // 如果这个 key 在禁用列表里
        if (this.changeData.disableList.indexOf(this.item.key) > -1) {
          return true
        }
      }
      // 否则，非禁用
      return false
    },

    val: {
      get () {
        return this.value
      },
      set (v) {
        // console.log(`|${v}|`);
        this.$emit('input', v)
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
    },
    // 是否采用文字模式
    getTextModel () {
      if (this.item.isText) {
        return true
      }
      if (this.changeData.textModel) {
        return true
      }
      return false
    }
  },
  methods: {
    // 获取输入框的 placeholder
    getPlaceholder (formItem) {
      // todo 这里可能还要加一个全部 disable 的判断
      // 如果已禁用，那么不显示 placeholder
      if (formItem.disable) {
        return ''
      }
      // 如果有 placeholder，则直接返回
      if (formItem.placeholder) {
        return formItem.placeholder
      }
      // 否则返回默认的
      return `请输入${formItem.label}`
    },

    // 获取下拉框 placeholder
    getSelectPlaceholder (formItem) {
      // 如果已禁用，那么不显示 placeholder
      if (formItem.disable) {
        return ''
      }
      // 如果有 placeholder，则直接返回
      if (formItem.placeholder !== undefined && formItem.placeholder !== null) {
        return formItem.placeholder
      }
      // 否则返回默认的
      return `请选择${formItem.label}`
    },

    // 当取消焦点
    onFocus (item, e, val) {
      // 表单要素有 onFocus 事件，那么则触发
      if (item.onFocus) {
        item.onFocus(val, item, e)
      } else if (item.events && item.events.focus) {
        item.events.focus(val, item, e)
      }
    },

    // 当取消焦点
    onBlur (item, e, val) {
      // 表单要素有 onBlur 事件，那么则触发
      if (item.onBlur) {
        item.onBlur(val, item, e)
      } else if (item.events && item.events.blur) {
        item.events.blur(val, item, e)
      }
    },

    // 当数据改变
    onChange (item, val) {
      // 表单要素有 onChange 事件，那么则触发
      if (item.onChange) {
        item.onChange(val, item)
      } else if (item.events && item.events.change) {
        item.events.change(val, item)
      }
    },
    // 当键盘输入改变
    onInput (item, val) {
      // 表单要素有 onInput 事件，那么则触发
      if (item.limitInputRegExp) {
        const newVal = val.replace(item.limitInputRegExp, '')
        // console.log("onInput", val);
        this.$emit('input', newVal)
      }
      if (item.onInput) {
        item.onInput(val, item)
      } else if (item.events && item.events.input) {
        item.events.input(val, item)
      }
    },
    // 数值联动，部分自定义 setter 触发。
    _valueLink (v) {
      // 根据当前是普通表单还是子表单，走不同的联动逻辑
      if (this.formItemType === 'childForm') {
        this._valueLinkByChildForm(v)
      } else {
        this._valueLinkByForm(v)
      }
    },
    // 如果是普通表单元素，走这个联动
    _valueLinkByForm (v) {
      console.log('_valueLinkByForm', v)
      // 如果有联动项，那么则遍历每个联动项
      if (
        this.item.valueLink &&
        this.item.valueLink.length &&
        this.item.valueLink.length > 0
      ) {
        // 遍历
        this.item.valueLink.forEach(linkItem => {
          // 如果联动项的触发值不匹配，则跳过这一条
          // linkItem.value 为 "." 或者 "[.]" //表示有值,进行的联动
          // linkItem.value 为 "" 或者 "[]" //表示没有值时,进行的联动
          // 有值匹配
          if (v && (linkItem.value === '.' || linkItem.value === '[.]')) {
            console.log('设置有值时匹配联动')
          }
          // 无值匹配
          else if (
            (!v || isEmptyArray(v)) &&
            (linkItem.value === '' || linkItem.value === '[]')
          ) {
            console.log('设置无值时匹配联动')
          } else {
            // 精确匹配
            if (v !== linkItem.value) {
              return
            }
          }
          // 此时匹配，判断 linkList 有没有
          if (
            linkItem.linkList &&
            linkItem.linkList.length &&
            linkItem.linkList.length > 0
          ) {
            // 再遍历
            linkItem.linkList.forEach(triggerItem => {
              const linkKey = triggerItem.linkKey
              // 如果没有联动 key，则跳过（正常来说，不会没有）
              if (!linkKey) {
                return
              }
              // 如果联动值，则更新值
              if (triggerItem.enableLinkValue) {
                this.statusChangeFn.updateFormData({
                  [linkKey]: triggerItem.linkValue
                })
              }
              // 如果联动禁用/取消禁用，则更新禁用
              if (triggerItem.enableLinkDisable) {
                this.statusChangeFn.setElementDisable(
                  linkKey,
                  triggerItem.linkDisable
                )
              }
              // 如果联动隐藏/显示，则更新
              if (triggerItem.enableLinkHidden) {
                this.statusChangeFn.setElementHidden(
                  linkKey,
                  triggerItem.linkHidden
                )
              }
              // 如果联动必填/非必填，则更新
              if (triggerItem.enableLinkRequired) {
                this.statusChangeFn.setElementRequired(
                  linkKey,
                  triggerItem.linkRequired
                )
              }
            })
          }
        })
      }
    },
    // 如果是子表单的联动，走这个
    _valueLinkByChildForm (v) {
      // 如果有联动项，那么则遍历每个联动项
      if (
        this.item.valueLink &&
        this.item.valueLink.length &&
        this.item.valueLink.length > 0
      ) {
        // 遍历
        this.item.valueLink.forEach(linkItem => {
          // 如果联动项的触发值不匹配，则跳过这一条
          if (v !== linkItem.value) {
            return
          }
          // 此时匹配，判断 linkList 有没有
          if (
            linkItem.linkList &&
            linkItem.linkList.length &&
            linkItem.linkList.length > 0
          ) {
            // 再遍历
            linkItem.linkList.forEach(triggerItem => {
              const linkKey = triggerItem.linkKey
              // 如果没有联动 key，则跳过（正常来说，不会没有）
              if (!linkKey) {
                return
              }
              // 如果联动值，则更新值
              if (triggerItem.enableLinkValue) {
                this.childChangeData.updateFormData(
                  {
                    [linkKey]: triggerItem.linkValue
                  },
                  this.randomId
                )
              }
              // 如果是子表单里的元素的话，采用三段匹配
              const formKey = this.childChangeData.formKey
              const randomId = this.randomId
              const key = triggerItem.linkKey
              const keyText = `${formKey}_${randomId}_${key}`
              // 如果联动禁用/取消禁用，则更新禁用
              if (triggerItem.enableLinkDisable) {
                this.statusChangeFn.setElementDisable(
                  keyText,
                  triggerItem.linkDisable
                )
              }
              // 如果联动隐藏/显示，则更新
              if (triggerItem.enableLinkHidden) {
                this.statusChangeFn.setElementHidden(
                  keyText,
                  triggerItem.linkHidden
                )
              }
              // 如果联动必填/非必填，则更新
              if (triggerItem.enableLinkRequired) {
                this.childChangeData.setElementRequired(
                  linkKey,
                  randomId,
                  triggerItem.linkRequired
                )
              }
            })
          }
        })
      }
    },

    // 丢掉数字的小数点右边末尾的 0
    // 例如入参是 1.2000，出参是 1.2
    // 入参是 12.0000 ，出参是 12
    throwPointRightZero (v) {
      const n = String(v)
      if (n.indexOf('.') > -1) {
        // 有小数点
        const list = n.split('.')
        let pointRight = list[1]
        pointRight = pointRight.replace(/[0]+$/g, '')
        if (pointRight.length === 0) {
          return list[0]
        } else {
          return list[0] + '.' + pointRight
        }
      } else {
        // 无小数点
        return n
      }
    },

    // 丢掉数字的小数点左边开头的 0
    // 例如入参是 0123.45，出参是 123.45
    // 入参是 00.12 ，出参是 0.12
    throwPointLeftZero (v) {
      let n = String(v)
      if (n.indexOf('.') > -1) {
        // 有小数点
        const list = n.split('.')
        let pointLeft = list[0]
        pointLeft = pointLeft.replace(/^[0]+/g, '')
        if (pointLeft.length === 0) {
          return '0.' + list[1]
        } else {
          return pointLeft + '.' + list[1]
        }
      } else {
        // 无小数点，那么直接把左边开头的 0 扔掉
        n = n.replace(/^[0]+/g, '')
        // 如果结果为空，并且 v 不是空（比如是 0），那么返回 0
        // 如果都是空，则返回空（这里不做处理）
        if (n === '' && v !== '') {
          n = '0'
        }
        // 无小数点
        return n
      }
    }
  }
}

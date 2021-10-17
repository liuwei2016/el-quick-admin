/**
 * Created by liuwei2016 on 2021/6/10.
 
 
 * 功能说明：
 * 一个表单元素的 mixin
 */

function isEmptyArray(arr) {
  return Array.isArray(arr) && arr.length;
}
// function isFunction(f) {
//   return Object.prototype.toString.call(f) === "[Object Function]";
// }
var FormMixin = {
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
      default: ""
    }
  },
  inject: [
    "dynamicDict",
    "dynamicSelectOption",
    "changeData",
    "statusChangeFn",
    "formItemType",
    "childChangeData"
  ],
  computed: {
    // 扩展属性，直接将属性配置，传到表单组件内部（即 Element UI 上）
    // 忽略属性【key】
    bindAttrs() {
      const obj = Object.assign({}, this.item);
      const clearAttrList = [
        "key",
        "events",
        "onFocus",
        "onBlur",
        "onInput",
        "onChange",
        "type",
        "label",
        "readonly",
        "rules",
        "placeholder",
        "prepend",
        "append",
        "defaultValue",
        "optionsConfig",
        "getOptionsData"
      ];
      clearAttrList.forEach(v => {
        delete obj[v];
      });
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
      return obj;
    },
    // 挂载事件
    bindEvents() {
      const obj = Object.assign({}, this.item.events);
      return obj;
    },
    // 获取禁用状态
    getDisabled() {
      // 如果全部都被禁用了
      if (this.allDisabled) {
        return true;
      }
      if (this.formItemType === "childForm") {
        // 如果是子表单里的元素的话，采用三段匹配
        const formKey = this.childChangeData.formKey;
        const randomId = this.randomId;
        const key = this.item.key;
        const keyText = `${formKey}_${randomId}_${key}`;
        if (this.changeData.disableList.indexOf(keyText) > -1) {
          return true;
        }
      } else {
        // 如果这个 key 在禁用列表里
        if (this.changeData.disableList.indexOf(this.item.key) > -1) {
          return true;
        }
      }
      // 否则，非禁用
      return false;
    },

    val: {
      get() {
        return this.value;
      },
      set(v) {
        // console.log(`|${v}|`);
        this.$emit("input", v);
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
    // 是否采用文字模式
    getTextModel() {
      if (this.item.isText) {
        return true;
      }
      if (this.changeData.textModel) {
        return true;
      }
      return false;
    }
  },
  methods: {
    // 获取输入框的 placeholder
    getPlaceholder(formItem) {
      // todo 这里可能还要加一个全部 disable 的判断
      // 如果已禁用，那么不显示 placeholder
      if (formItem.disable) {
        return "";
      }
      // 如果有 placeholder，则直接返回
      if (formItem.placeholder) {
        return formItem.placeholder;
      }
      // 否则返回默认的
      return `请输入${formItem.label}`;
    },

    // 获取下拉框 placeholder
    getSelectPlaceholder(formItem) {
      // 如果已禁用，那么不显示 placeholder
      if (formItem.disable) {
        return "";
      }
      // 如果有 placeholder，则直接返回
      if (formItem.placeholder !== undefined && formItem.placeholder !== null) {
        return formItem.placeholder;
      }
      // 否则返回默认的
      return `请选择${formItem.label}`;
    },

    // 当取消焦点
    onFocus(item, e, val) {
      // 表单要素有 onFocus 事件，那么则触发
      if (item.onFocus) {
        item.onFocus(val, item, e);
      } else if (item.events && item.events.focus) {
        item.events.focus(val, item, e);
      }
    },

    // 当取消焦点
    onBlur(item, e, val) {
      // 表单要素有 onBlur 事件，那么则触发
      if (item.onBlur) {
        item.onBlur(val, item, e);
      } else if (item.events && item.events.blur) {
        item.events.blur(val, item, e);
      }
    },

    // 当数据改变
    onChange(item, val) {
      // 表单要素有 onChange 事件，那么则触发
      if (item.onChange) {
        item.onChange(val, item);
      } else if (item.events && item.events.change) {
        item.events.change(val, item);
      }
    },
    // 当键盘输入改变
    onInput(item, val) {
      // 表单要素有 onInput 事件，那么则触发
      if (item.limitInputRegExp) {
        const newVal = val.replace(item.limitInputRegExp, "");
        // console.log("onInput", val);
        this.$emit("input", newVal);
      }
      if (item.onInput) {
        item.onInput(val, item);
      } else if (item.events && item.events.input) {
        item.events.input(val, item);
      }
    },
    // 数值联动，部分自定义 setter 触发。
    _valueLink(v) {
      // 根据当前是普通表单还是子表单，走不同的联动逻辑
      if (this.formItemType === "childForm") {
        this._valueLinkByChildForm(v);
      } else {
        this._valueLinkByForm(v);
      }
    },
    // 如果是普通表单元素，走这个联动
    _valueLinkByForm(v) {
      console.log("_valueLinkByForm", v);
      // 如果有联动项，那么则遍历每个联动项
      if (
        this.item.valueLink &&
        this.item.valueLink.length &&
        this.item.valueLink.length > 0
      ) {
        // 遍历
        this.item.valueLink.forEach(linkItem => {
          // 如果联动项的触发值不匹配，则跳过这一条
          //linkItem.value 为 "." 或者 "[.]" //表示有值,进行的联动
          //linkItem.value 为 "" 或者 "[]" //表示没有值时,进行的联动
          // 有值匹配
          if (v && (linkItem.value === "." || linkItem.value === "[.]")) {
            console.log("设置有值时匹配联动");
          }
          //无值匹配
          else if (
            (!v || isEmptyArray(v)) &&
            (linkItem.value === "" || linkItem.value === "[]")
          ) {
            console.log("设置无值时匹配联动");
          } else {
            // 精确匹配
            if (v !== linkItem.value) {
              return;
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
              const linkKey = triggerItem.linkKey;
              // 如果没有联动 key，则跳过（正常来说，不会没有）
              if (!linkKey) {
                return;
              }
              // 如果联动值，则更新值
              if (triggerItem.enableLinkValue) {
                this.statusChangeFn.updateFormData({
                  [linkKey]: triggerItem.linkValue
                });
              }
              // 如果联动禁用/取消禁用，则更新禁用
              if (triggerItem.enableLinkDisable) {
                this.statusChangeFn.setElementDisable(
                  linkKey,
                  triggerItem.linkDisable
                );
              }
              // 如果联动隐藏/显示，则更新
              if (triggerItem.enableLinkHidden) {
                this.statusChangeFn.setElementHidden(
                  linkKey,
                  triggerItem.linkHidden
                );
              }
              // 如果联动必填/非必填，则更新
              if (triggerItem.enableLinkRequired) {
                this.statusChangeFn.setElementRequired(
                  linkKey,
                  triggerItem.linkRequired
                );
              }
            });
          }
        });
      }
    },
    // 如果是子表单的联动，走这个
    _valueLinkByChildForm(v) {
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
            return;
          }
          // 此时匹配，判断 linkList 有没有
          if (
            linkItem.linkList &&
            linkItem.linkList.length &&
            linkItem.linkList.length > 0
          ) {
            // 再遍历
            linkItem.linkList.forEach(triggerItem => {
              const linkKey = triggerItem.linkKey;
              // 如果没有联动 key，则跳过（正常来说，不会没有）
              if (!linkKey) {
                return;
              }
              // 如果联动值，则更新值
              if (triggerItem.enableLinkValue) {
                this.childChangeData.updateFormData(
                  {
                    [linkKey]: triggerItem.linkValue
                  },
                  this.randomId
                );
              }
              // 如果是子表单里的元素的话，采用三段匹配
              const formKey = this.childChangeData.formKey;
              const randomId = this.randomId;
              const key = triggerItem.linkKey;
              const keyText = `${formKey}_${randomId}_${key}`;
              // 如果联动禁用/取消禁用，则更新禁用
              if (triggerItem.enableLinkDisable) {
                this.statusChangeFn.setElementDisable(
                  keyText,
                  triggerItem.linkDisable
                );
              }
              // 如果联动隐藏/显示，则更新
              if (triggerItem.enableLinkHidden) {
                this.statusChangeFn.setElementHidden(
                  keyText,
                  triggerItem.linkHidden
                );
              }
              // 如果联动必填/非必填，则更新
              if (triggerItem.enableLinkRequired) {
                this.childChangeData.setElementRequired(
                  linkKey,
                  randomId,
                  triggerItem.linkRequired
                );
              }
            });
          }
        });
      }
    },

    // 丢掉数字的小数点右边末尾的 0
    // 例如入参是 1.2000，出参是 1.2
    // 入参是 12.0000 ，出参是 12
    throwPointRightZero(v) {
      const n = String(v);
      if (n.indexOf(".") > -1) {
        // 有小数点
        const list = n.split(".");
        let pointRight = list[1];
        pointRight = pointRight.replace(/[0]+$/g, "");
        if (pointRight.length === 0) {
          return list[0];
        } else {
          return list[0] + "." + pointRight;
        }
      } else {
        // 无小数点
        return n;
      }
    },

    // 丢掉数字的小数点左边开头的 0
    // 例如入参是 0123.45，出参是 123.45
    // 入参是 00.12 ，出参是 0.12
    throwPointLeftZero(v) {
      let n = String(v);
      if (n.indexOf(".") > -1) {
        // 有小数点
        const list = n.split(".");
        let pointLeft = list[0];
        pointLeft = pointLeft.replace(/^[0]+/g, "");
        if (pointLeft.length === 0) {
          return "0." + list[1];
        } else {
          return pointLeft + "." + list[1];
        }
      } else {
        // 无小数点，那么直接把左边开头的 0 扔掉
        n = n.replace(/^[0]+/g, "");
        // 如果结果为空，并且 v 不是空（比如是 0），那么返回 0
        // 如果都是空，则返回空（这里不做处理）
        if (n === "" && v !== "") {
          n = "0";
        }
        // 无小数点
        return n;
      }
    }
  }
};

//

var script = {
  name: "FormInput",
  mixins: [FormMixin],
  computed: {
    // 前置符号
    prepend() {
      // 兼容性处理
      if (this.item.prepend) {
        return this.item.prepend;
      } else if (this.item.prependMsg) {
        return this.item.prependMsg;
      } else if (this.item.prefixMsg) {
        return this.item.prefixMsg;
      } else {
        return "";
      }
    },
    // 后置符号
    append() {
      // 兼容性处理
      if (this.item.append) {
        return this.item.append;
      } else if (this.item.appendMsg) {
        return this.item.appendMsg;
      } else if (this.item.suffixMsg) {
        return this.item.suffixMsg;
      } else {
        return "";
      }
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-input-box form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-input",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  placeholder: _vm.getPlaceholder(_vm.item),
                  disabled: _vm.getDisabled,
                  type: "text",
                  clearable: true
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e, _vm.val)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e, _vm.val)
                  },
                  input: function(value) {
                    return _vm.onInput(_vm.item, value)
                  },
                  change: function(value) {
                    return _vm.onChange(_vm.item, value)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = typeof $$v === "string" ? $$v.trim() : $$v;
                  },
                  expression: "val"
                }
              },
              "el-input",
              _vm.bindAttrs,
              false
            ),
            [
              _vm.prepend
                ? _c("template", { slot: "prepend" }, [
                    _vm._v(_vm._s(_vm.prepend))
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.append
                ? _c("template", { slot: "append" }, [
                    _vm._v(_vm._s(_vm.append))
                  ])
                : _vm._e()
            ],
            2
          )
        : _c(
            "div",
            { staticClass: "form-input-text", style: _vm.item.textStyle || {} },
            [
              _vm.prepend
                ? _c("span", { staticClass: "prepend-msg" }, [
                    _vm._v(_vm._s(_vm.prepend))
                  ])
                : _vm._e(),
              _vm._v(" "),
              _c("span", { staticClass: "text" }, [
                _vm._v(_vm._s(_vm.val || "-"))
              ]),
              _vm._v(" "),
              _vm.append
                ? _c("span", { staticClass: "append-msg" }, [
                    _vm._v(_vm._s(_vm.append))
                  ])
                : _vm._e()
            ]
          )
    ],
    1
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = "data-v-4ac74e29";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$1 = {
  name: "FormInput",
  mixins: [FormMixin],
  data() {
    return {};
  },
  computed: {
    // 前置符号
    prepend() {
      // 兼容性处理
      if (this.item.prepend) {
        return this.item.prepend;
      } else if (this.item.prependMsg) {
        return this.item.prependMsg;
      } else {
        return "";
      }
    },
    // 后置符号
    append() {
      // 兼容性处理
      if (this.item.append) {
        return this.item.append;
      } else if (this.item.appendMsg) {
        return this.item.appendMsg;
      } else {
        return "";
      }
    }
  }
};

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-input-box form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-input",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  placeholder: _vm.getPlaceholder(_vm.item),
                  disabled: _vm.getDisabled,
                  type: "textarea",
                  autosize: _vm.item.autosize || false,
                  rows: _vm.item.autosize ? "" : 4,
                  resize: _vm.item.resize || "none"
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-input",
              _vm.item,
              false
            )
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v("\n    " + _vm._s(_vm.val || "-") + "\n  ")
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-8308fc9c_0", { source: ".form-input-box[data-v-8308fc9c] .el-input-group__prepend,\n.single-input .form-input-box[data-v-8308fc9c] .el-input-group__append {\n  padding: 0 10px;\n}\n", map: {"version":3,"sources":["form_textarea.vue"],"names":[],"mappings":"AAAA;;EAEE,eAAe;AACjB","file":"form_textarea.vue","sourcesContent":[".form-input-box /deep/ .el-input-group__prepend,\n.single-input .form-input-box /deep/ .el-input-group__append {\n  padding: 0 10px;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-8308fc9c";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$2 = {
  name: "FormDynamicSelect",
  mixins: [FormMixin],
  computed: {
    textModelValue() {
      const content =
        this.dynamicDict[this.item.parentKey] &&
        this.dynamicDict[this.item.parentKey].find(item => {
          return item[this.dynamicSelectOption.value] === this.val;
        });
      return (content && content[this.dynamicSelectOption.label]) || "";
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

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-select",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getPlaceholder(_vm.item)
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-select",
              _vm.bindAttrs,
              false
            ),
            _vm._l(_vm.dynamicDict[_vm.item.parentKey], function(option) {
              return _c("el-option", {
                key: option[_vm.dynamicSelectOption.value],
                attrs: {
                  label: option[_vm.dynamicSelectOption.label],
                  value: option[_vm.dynamicSelectOption.value]
                }
              })
            }),
            1
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  const __vue_inject_styles__$2 = undefined;
  /* scoped */
  const __vue_scope_id__$2 = "data-v-4bbc87d9";
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    undefined,
    undefined,
    undefined
  );

const superType = data => {
  const type = Object.prototype.toString.call(data).toLowerCase();
  return type.replace(/^\[object\s(\w+)\]$/, (...rest) => {
    return rest[1];
  });
};
var SelectMixin = {
  created() {
    this.getOptionsData();
  },
  methods: {
    getOptionsData(query) {
      if (
        this.item.getOptionsData &&
        superType(this.item.getOptionsData) === "function"
      ) {
        this.item.getOptionsData(query || {}).then(({ data }) => {
          // console.log("this.item.getData", data);
          if (!Array.isArray(data)) {
            return;
          }
          let arr = data;
          /**
           * 如果存在optionsConfig 则对返回的数据进行处理，
           * ! 如果是 label value 结构，可以不用设置
           */
          if (this.item.optionsConfig) {
            arr = data.map(v => {
              if (this.item.optionsConfig.label) {
                v.label = v[this.item.optionsConfig.label];
              }
              if (this.item.optionsConfig.value) {
                v.value = v[this.item.optionsConfig.value];
              }
              return v;
            });
          }
          // console.log("this.item.getData arr", arr);
          /**
           * ! 投机取巧
           * ! 不能直接更改props  this.item ,但是能更改 this.items.options
           */
          this.item.options = arr;
        });
      }
    }
  }
};

//

var script$3 = {
  name: "FormNormalSelect",
  mixins: [FormMixin, SelectMixin],
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

/* script */
const __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-select",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getSelectPlaceholder(_vm.item)
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-select",
              _vm.bindAttrs,
              false
            ),
            _vm._l(_vm.item.options, function(option) {
              return _c("el-option", {
                key: option.value,
                attrs: { label: option.label, value: option.value }
              })
            }),
            1
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  const __vue_inject_styles__$3 = undefined;
  /* scoped */
  const __vue_scope_id__$3 = "data-v-c5beb3fe";
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$4 = {
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

/* script */
const __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-tree-select",
            _vm._g(
              {
                ref: "treeSelect_" + _vm.item.key,
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getSelectPlaceholder(_vm.item),
                  selectParams: _vm.selectParams,
                  treeParams: _vm.treeParams
                },
                on: { searchFun: _vm.treeSearchFun },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              _vm.bindEvents
            )
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  const __vue_inject_styles__$4 = function (inject) {
    if (!inject) return
    inject("data-v-064fd7ec_0", { source: "\n[data-v-064fd7ec] .el-tree-select-input {\n  width: 100%;\n}\n", map: {"version":3,"sources":["form_tree_select.vue"],"names":[],"mappings":";AAAC;EACC,WAAW;AACb","file":"form_tree_select.vue","sourcesContent":[" /deep/ .el-tree-select-input {\n  width: 100%;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$4 = "data-v-064fd7ec";
  /* module identifier */
  const __vue_module_identifier__$4 = undefined;
  /* functional template */
  const __vue_is_functional_template__$4 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$4 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$5 = {
  name: "FormMutipleSelect",
  mixins: [FormMixin, SelectMixin],
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

/* script */
const __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-select",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getSelectPlaceholder(_vm.item),
                  multiple: ""
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-select",
              _vm.bindAttrs,
              false
            ),
            _vm._l(_vm.item.options, function(option) {
              return _c("el-option", {
                key: option.value,
                attrs: { label: option.label, value: option.value }
              })
            }),
            1
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  const __vue_inject_styles__$5 = function (inject) {
    if (!inject) return
    inject("data-v-e211677e_0", { source: ".form-item-box[data-v-e211677e] .el-input {\n  position: relative;\n  width: 100%;\n}\n.form-item-box[data-v-e211677e] .el-input .el-input__inner:focus {\n  border-color: #8d94a5;\n}\n.el-select-dropdown__item.selected[data-v-e211677e] {\n  color: #606266;\n  font-weight: normal;\n}\n", map: {"version":3,"sources":["form_mutiple_select.vue"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,WAAW;AACb;AACA;EACE,qBAAqB;AACvB;AACA;EACE,cAAc;EACd,mBAAmB;AACrB","file":"form_mutiple_select.vue","sourcesContent":[".form-item-box /deep/ .el-input {\n  position: relative;\n  width: 100%;\n}\n.form-item-box /deep/ .el-input .el-input__inner:focus {\n  border-color: #8d94a5;\n}\n.el-select-dropdown__item.selected {\n  color: #606266;\n  font-weight: normal;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$5 = "data-v-e211677e";
  /* module identifier */
  const __vue_module_identifier__$5 = undefined;
  /* functional template */
  const __vue_is_functional_template__$5 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$5 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$6 = {
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

/* script */
const __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-date-picker",
            _vm._b(
              {
                staticClass: "form-date-item",
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  type: "date",
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getPlaceholder(_vm.item),
                  "picker-options": _vm.item.pickerOptions
                    ? _vm.handlerDate(_vm.item.pickerOptions)
                    : function() {
                        return false
                      },
                  "value-format": "yyyy-MM-dd",
                  clearable: true
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-date-picker",
              _vm.bindAttrs,
              false
            )
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.val || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$6 = [];
__vue_render__$6._withStripped = true;

  /* style */
  const __vue_inject_styles__$6 = undefined;
  /* scoped */
  const __vue_scope_id__$6 = "data-v-50d34a6c";
  /* module identifier */
  const __vue_module_identifier__$6 = undefined;
  /* functional template */
  const __vue_is_functional_template__$6 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$6 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$7 = {
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

/* script */
const __vue_script__$7 = script$7;

/* template */
var __vue_render__$7 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-date-picker",
            _vm._b(
              {
                staticClass: "form-date-item",
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  type: "datetime",
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getPlaceholder(_vm.item),
                  "picker-options": _vm.item.pickerOptions
                    ? _vm.handlerDate(_vm.item.pickerOptions)
                    : function() {
                        return false
                      },
                  clearable: true
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-date-picker",
              _vm.bindAttrs,
              false
            )
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.val || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$7 = [];
__vue_render__$7._withStripped = true;

  /* style */
  const __vue_inject_styles__$7 = undefined;
  /* scoped */
  const __vue_scope_id__$7 = "data-v-1c52608a";
  /* module identifier */
  const __vue_module_identifier__$7 = undefined;
  /* functional template */
  const __vue_is_functional_template__$7 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$7 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
    __vue_inject_styles__$7,
    __vue_script__$7,
    __vue_scope_id__$7,
    __vue_is_functional_template__$7,
    __vue_module_identifier__$7,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$8 = {
  name: "FormHourMinute",
  mixins: [FormMixin],
  methods: {}
};

/* script */
const __vue_script__$8 = script$8;

/* template */
var __vue_render__$8 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-time-picker",
            _vm._b(
              {
                staticClass: "form-date-item",
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  type: "date",
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getPlaceholder(_vm.item),
                  format: _vm.item.format || "HH:mm",
                  "value-format": _vm.item["value-format"] || "HH:mm:00"
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-time-picker",
              _vm.bindAttrs,
              false
            )
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.val || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$8 = [];
__vue_render__$8._withStripped = true;

  /* style */
  const __vue_inject_styles__$8 = undefined;
  /* scoped */
  const __vue_scope_id__$8 = "data-v-946e68c4";
  /* module identifier */
  const __vue_module_identifier__$8 = undefined;
  /* functional template */
  const __vue_is_functional_template__$8 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$8 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
    __vue_inject_styles__$8,
    __vue_script__$8,
    __vue_scope_id__$8,
    __vue_is_functional_template__$8,
    __vue_module_identifier__$8,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$9 = {
  name: "FormDateRange",
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

/* script */
const __vue_script__$9 = script$9;

/* template */
var __vue_render__$9 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-date-picker",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  type: "daterange",
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getPlaceholder(_vm.item),
                  "value-format": "yyyy-MM-dd",
                  clearable: true
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-date-picker",
              _vm.bindAttrs,
              false
            )
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$9 = [];
__vue_render__$9._withStripped = true;

  /* style */
  const __vue_inject_styles__$9 = undefined;
  /* scoped */
  const __vue_scope_id__$9 = "data-v-530d6513";
  /* module identifier */
  const __vue_module_identifier__$9 = undefined;
  /* functional template */
  const __vue_is_functional_template__$9 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$9 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    __vue_script__$9,
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$a = {
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

/* script */
const __vue_script__$a = script$a;

/* template */
var __vue_render__$a = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-date-picker",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  type: "datetimerange",
                  disabled: _vm.getDisabled,
                  placeholder: _vm.getPlaceholder(_vm.item),
                  clearable: true,
                  "value-format": "yyyy-MM-dd HH:mm"
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = $$v;
                  },
                  expression: "val"
                }
              },
              "el-date-picker",
              _vm.bindAttrs,
              false
            )
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$a = [];
__vue_render__$a._withStripped = true;

  /* style */
  const __vue_inject_styles__$a = undefined;
  /* scoped */
  const __vue_scope_id__$a = "data-v-f244d2b4";
  /* module identifier */
  const __vue_module_identifier__$a = undefined;
  /* functional template */
  const __vue_is_functional_template__$a = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$a = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
    __vue_inject_styles__$a,
    __vue_script__$a,
    __vue_scope_id__$a,
    __vue_is_functional_template__$a,
    __vue_module_identifier__$a,
    false,
    undefined,
    undefined,
    undefined
  );

//
// const axios = require("axios");

var script$b = {
  name: "FormAutoComplete",
  mixins: [FormMixin, SelectMixin],
  methods: {
    searchAsync(queryString) {
      this.getOptionsData({
        [this.item.searchKey]: queryString
      });
    },
    querySearchAsync(queryString, cb) {
      const payload = {
        [this.item.searchKey]: queryString
      };
      if (this.item.otherSearchKeys && this.item.otherSearchKeys.length > 0) {
        this.item.otherSearchKeys.forEach(obj => {
          payload[obj.key] = obj.value;
        });
      }
      this.item.getOptionsData(payload).then(({ data }) => {
        if (data) {
          const d = data.map(item => {
            console.log("item", item);
            if (this.item.mainShowKey) {
              return {
                ...item,
                item,
                value: item[this.item.mainShowKey]
              };
            } else {
              return {
                ...item,
                item,
                value: item[this.item.autoCompleteKeys[0]]
              };
            }
          });
          console.log("ddddd", d);
          cb(d);
          if (this.item.fetchSuggestions) {
            this.item.fetchSuggestions(d, this.randomId);
          }
        } else {
          cb([]);
          if (this.item.fetchSuggestions) {
            this.item.fetchSuggestions([], this.randomId);
          }
          this.$message.error("无匹配数据");
        }
      });
    },
    // fix element-ui 本身的一个bug
    closeSelect($el) {
      // 这个问题是在清除之后，activated被设置了false，增加判断输入框是否在聚焦状态，如果是聚焦状态，下拉框也要显示出来
      try {
        $el.$children[0].clear();
        $el.$children[0].focus();
        $el.activated = true;
      } catch (error) {
        console.log(error);
      }
    },
    handleSelect(selectedItem) {
      // console.log('selectedItem', selectedItem);
      const payload = {};
      // 将需要更新的数据的值，添加到 payload 里
      this.item.autoCompleteKeys.forEach(key => {
        payload[key] = selectedItem.item[this.item.mainValueKey];
      });
      console.log("his.statusChangeFn.updateFormData", payload);
      // 再调用方法，推到 quickForm 这个组件中
      this.statusChangeFn.updateFormData(payload);
      if (this.item.onSelect) {
        this.item.onSelect(selectedItem, this.randomId);
      }
    }
  }
};

/* script */
const __vue_script__$b = script$b;

/* template */
var __vue_render__$b = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-autocomplete",
            _vm._b(
              {
                ref: "autocomplete_" + _vm.item.key,
                staticClass: "auto-complte-input",
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  placeholder: _vm.getPlaceholder(_vm.item),
                  disabled: _vm.getDisabled,
                  "value-key": "value",
                  "fetch-suggestions": _vm.querySearchAsync
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  },
                  select: _vm.handleSelect
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = typeof $$v === "string" ? $$v.trim() : $$v;
                  },
                  expression: "val"
                }
              },
              "el-autocomplete",
              _vm.bindAttrs,
              false
            ),
            [
              _c("i", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.val,
                    expression: "val"
                  }
                ],
                staticClass:
                  "el-input_icon el-icon-circle-close el-input__clear",
                attrs: { slot: "suffix" },
                on: {
                  click: function($event) {
                    return _vm.closeSelect(
                      _vm.$refs["autocomplete_" + _vm.item.key]
                    )
                  }
                },
                slot: "suffix"
              })
            ]
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.val || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$b = [];
__vue_render__$b._withStripped = true;

  /* style */
  const __vue_inject_styles__$b = undefined;
  /* scoped */
  const __vue_scope_id__$b = "data-v-6c9ae270";
  /* module identifier */
  const __vue_module_identifier__$b = undefined;
  /* functional template */
  const __vue_is_functional_template__$b = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$b = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
    __vue_inject_styles__$b,
    __vue_script__$b,
    __vue_scope_id__$b,
    __vue_is_functional_template__$b,
    __vue_module_identifier__$b,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$c = {
  name: "FormNumberInput",
  mixins: [FormMixin],
  data() {
    return {
      readonly: true,
      // 在编辑模式下，使用这个 tempVal 替代真实的 val
      // 在触发 blur 事件时，用这个更新原来的 val
      tempVal: ""
    };
  },
  computed: {
    // 千分位的数字
    dealInputValue() {
      if (this.value === "") {
        return "";
      }
      const n = String(this.value);
      const res = n.toString().replace(/\d+/, n => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, $1 => {
          return $1 + ",";
        });
      });
      return res;
    },
    // 前置符号
    prepend() {
      // 兼容性处理
      if (this.item.prepend) {
        return this.item.prepend;
      } else if (this.item.prefixMsg) {
        return this.item.prefixMsg;
      } else if (this.item.symbolBeforeMsg) {
        return this.item.symbolBeforeMsg;
      } else {
        return "";
      }
    },
    // 后置符号
    append() {
      // 兼容性处理
      if (this.item.append) {
        return this.item.append;
      } else if (this.item.suffixMsg) {
        return this.item.suffixMsg;
      } else if (this.item.symbolAfterMsg) {
        return this.item.symbolAfterMsg;
      } else {
        return "";
      }
    },
    val: {
      get() {
        if (this.value === "") {
          return "";
        }
        return this.value;
      },
      set(v) {
        if (v === "") {
          this.$emit("input", v);
          // 只有非子表单的情况下，才会冒泡上去数据变更
          if (this.formItemType !== "childForm") {
            this.statusChangeFn.valueUpdateEvent({
              [this.item.key]: n
            });
          } else {
            // 如果是子表单的话，执行内置的变更
            this.childChangeData.valueUpdateEvent();
          }
          return;
        }
        const newVal = v;
        let n = String(newVal);
        // 假如禁止输入负数，那么小于 0 则自动变为 0
        if (this.item.positive && n && Number(n) < 0) {
          n = "0";
        }

        // 这里主要目的是限制小数位数超过限制的
        if (
          (this.item.decimalLimit && this.item.decimalLimit > 0) ||
          (this.item.zeroMsg && this.item.zeroMsg > 0)
        ) {
          // 兼容性设置
          const limit = this.item.decimalLimit || this.item.zeroMsg;

          // 包含小数点，并且小数点后面有数字
          if (n.includes(".") && n.split(".").length > 1) {
            const currentLength = n.split(".")[1].length;
            if (currentLength > limit) {
              const s = n.split(".");
              n = `${s[0]}.${s[1].slice(0, limit)}`;
            }
          }
        }

        // 假如禁止输入负数，那么小于 0 则自动变为 0
        if (this.item.positive && n && Number(n) < 0) {
          n = "0";
        }
        this.$emit("input", n);

        // 只有非子表单的情况下，才会冒泡上去数据变更
        if (this.formItemType !== "childForm") {
          this.statusChangeFn.valueUpdateEvent({
            [this.item.key]: n
          });
        } else {
          // 如果是子表单的话，执行内置的变更
          this.childChangeData.valueUpdateEvent();
        }
      }
    }
  },
  methods: {
    onKeydown(e) {
      // 假如禁止输入负数，那么干掉负号
      if (this.item.positive) {
        if (e.key === "-" || e.code === "Minus") {
          e.preventDefault();
          return;
        }
      }
      // 假如只允许输入整数，那么干掉小数点
      if (this.item.onlyInt) {
        if (e.key === "." || e.code === "Period") {
          e.preventDefault();
          return;
        }
      }
    },
    onInput(item) {
      if (item.limitInputRegExp) {
        this.tempVal = this.tempVal.replace(item.limitInputRegExp, "");
        console.log("onInput", this.tempVal);
      }
    },
    getClass() {
      const c1 = `quick-form-unqiue-${this.item.key}`;
      const c2 = this.readonly ? "is-readonly" : "is-wr";
      return {
        [c1]: true,
        [c2]: true
      };
    },
    onBlur() {
      this.readonly = true;
      if (this.tempVal === "") {
        this.$emit("input", this.tempVal);

        this.statusChangeFn.valueUpdateEvent({
          [this.item.key]: this.tempVal
        });
        return;
      }

      let newVal = this.tempVal;

      // 如果需要补零
      if (this.item.zeroPadding && this.item.zeroPadding > 0) {
        const l = String(newVal).split(".");
        // 如果没有小数点（说明只有整数位），自动补零
        if (l.length === 1) {
          // 判断 l[0].length 是否为 0，为 0 则说明没填，啥事都不做
          if (l[0].length === 0) {
            newVal = "";
          } else {
            // 自动补零
            newVal += "." + "0".padEnd(this.item.zeroPadding, "0");
          }
        } else {
          // 此时说明有小数点，那么小数位数多，则去掉多余的。位数小，则补零
          const currentLength = l[1].length;
          // 小数位数少，则补零
          if (currentLength < this.item.zeroPadding) {
            newVal = l[0] + "." + l[1].padEnd(this.item.zeroPadding, "0");
          }
          // 如果大于
          if (currentLength > this.item.zeroPadding) {
            newVal = String(l[0]) + "." + l[1].slice(0, this.item.zeroPadding);
          }
        }
      }
      newVal = String(newVal);
      newVal = newVal
        .split(".")
        .map((s, index) => {
          if (index !== 0) {
            return s;
          }
          // 通过正则，匹配首位开始的所有 0（用于去除整数部分开始的 0）
          const newS = s.replace(/$0+/g, "");
          // 如果只有 0，那么最后返回 0，确保小数点前有数字
          if (newS.length === 0) {
            return "0";
          } else {
            return newS;
          }
        })
        .join(".");

      // 假如禁止输入负数，那么小于 0 则自动变为 0
      if (this.item.positive && newVal < 0) {
        newVal = 0;
      }

      this.tempVal = this.throwPointLeftZero(this.tempVal);
      this.tempVal = this.throwPointRightZero(this.tempVal);
      this.val = newVal;
    },
    onFocus() {
      const newValue = this.value;
      this.tempVal = String(newValue);
      this.readonly = false;
    }
  }
};

/* script */
const __vue_script__$c = script$c;

/* template */
var __vue_render__$c = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: _vm.getClass(),
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? [
            _c(
              "el-input",
              _vm._g(
                _vm._b(
                  {
                    staticClass: "input-wr",
                    style: _vm.item.valueBoxStyle || {},
                    attrs: {
                      placeholder: _vm.getPlaceholder(_vm.item),
                      disabled: _vm.getDisabled,
                      type: "number",
                      clearable: true
                    },
                    on: {
                      blur: function(e) {
                        return _vm.onBlur(_vm.item, e)
                      },
                      focus: function(e) {
                        return _vm.onFocus(_vm.item, e)
                      },
                      input: function(e) {
                        return _vm.onInput(_vm.item, e)
                      }
                    },
                    nativeOn: {
                      keydown: function($event) {
                        return _vm.onKeydown($event)
                      }
                    },
                    model: {
                      value: _vm.tempVal,
                      callback: function($$v) {
                        _vm.tempVal = typeof $$v === "string" ? $$v.trim() : $$v;
                      },
                      expression: "tempVal"
                    }
                  },
                  "el-input",
                  _vm.bindAttrs,
                  false
                ),
                _vm.bindEvents
              ),
              [
                _vm.prepend
                  ? _c("template", { slot: "prepend" }, [
                      _vm._v(_vm._s(_vm.prepend))
                    ])
                  : _vm._e(),
                _vm._v(" "),
                _vm.append
                  ? _c("template", { slot: "append" }, [
                      _vm._v(_vm._s(_vm.append))
                    ])
                  : _vm._e()
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "el-input",
              _vm._b(
                {
                  directives: [
                    {
                      name: "show",
                      rawName: "v-show",
                      value: false,
                      expression: "false"
                    }
                  ],
                  staticClass: "input-readonly",
                  attrs: {
                    placeholder: "" + (_vm.getPlaceholder(_vm.item) + 1),
                    disabled: _vm.getDisabled,
                    type: "input",
                    clearable: true
                  },
                  model: {
                    value: _vm.dealInputValue,
                    callback: function($$v) {
                      _vm.dealInputValue =
                        typeof $$v === "string" ? $$v.trim() : $$v;
                    },
                    expression: "dealInputValue"
                  }
                },
                "el-input",
                _vm.bindAttrs,
                false
              ),
              [
                _vm.prepend
                  ? _c("template", { slot: "prepend" }, [
                      _vm._v(_vm._s(_vm.prepend))
                    ])
                  : _vm._e(),
                _vm._v(" "),
                _vm.append
                  ? _c("template", { slot: "append" }, [
                      _vm._v(_vm._s(_vm.append))
                    ])
                  : _vm._e()
              ],
              2
            )
          ]
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(
              "\n    " +
                _vm._s(_vm.prepend) +
                "\n    " +
                _vm._s(_vm.dealInputValue || "-") +
                "\n    " +
                _vm._s(_vm.append) +
                "\n  "
            )
          ])
    ],
    2
  )
};
var __vue_staticRenderFns__$c = [];
__vue_render__$c._withStripped = true;

  /* style */
  const __vue_inject_styles__$c = undefined;
  /* scoped */
  const __vue_scope_id__$c = "data-v-571bec34";
  /* module identifier */
  const __vue_module_identifier__$c = undefined;
  /* functional template */
  const __vue_is_functional_template__$c = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$c = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$c, staticRenderFns: __vue_staticRenderFns__$c },
    __vue_inject_styles__$c,
    __vue_script__$c,
    __vue_scope_id__$c,
    __vue_is_functional_template__$c,
    __vue_module_identifier__$c,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$d = {
  name: "FormRadio",
  mixins: [FormMixin],
  data() {
    return {
      prependMsg: "",
      appendMsg: ""
    };
  },
  computed: {
    textModelValue() {
      const content =
        this.item.options &&
        this.item.options.find(item => {
          return item.value === this.val;
        });
      return (content && content.label) || "";
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
  watch: {
    item: {
      handler(n) {
        if (n.prefixMsg) {
          this.prependMsg = n.prefixMsg;
        }
        if (n.suffixMsg) {
          this.appendMsg = n.suffixMsg;
        }
      },
      immediate: true
    }
  }
};

/* script */
const __vue_script__$d = script$d;

/* template */
var __vue_render__$d = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-input-box form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-radio-group",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: { disabled: _vm.getDisabled, clearable: true },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = typeof $$v === "string" ? $$v.trim() : $$v;
                  },
                  expression: "val"
                }
              },
              "el-radio-group",
              _vm.bindAttrs,
              false
            ),
            _vm._l(_vm.item.options, function(opt) {
              return _c(
                "el-radio",
                { key: opt.value, attrs: { label: opt.value } },
                [_vm._v(_vm._s(opt.label))]
              )
            }),
            1
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$d = [];
__vue_render__$d._withStripped = true;

  /* style */
  const __vue_inject_styles__$d = function (inject) {
    if (!inject) return
    inject("data-v-b98b1fe4_0", { source: ".form-input-box[data-v-b98b1fe4] .el-input-group__prepend,\n.single-input .form-input-box[data-v-b98b1fe4] .el-input-group__append {\n  padding: 0 10px;\n}\n", map: {"version":3,"sources":["form_radio.vue"],"names":[],"mappings":"AAAA;;EAEE,eAAe;AACjB","file":"form_radio.vue","sourcesContent":[".form-input-box /deep/ .el-input-group__prepend,\n.single-input .form-input-box /deep/ .el-input-group__append {\n  padding: 0 10px;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$d = "data-v-b98b1fe4";
  /* module identifier */
  const __vue_module_identifier__$d = undefined;
  /* functional template */
  const __vue_is_functional_template__$d = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$d = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$d, staticRenderFns: __vue_staticRenderFns__$d },
    __vue_inject_styles__$d,
    __vue_script__$d,
    __vue_scope_id__$d,
    __vue_is_functional_template__$d,
    __vue_module_identifier__$d,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$e = {
  name: "Formcheckbox",
  mixins: [FormMixin],
  data() {
    return {
      prependMsg: "",
      appendMsg: ""
    };
  },
  computed: {
    textModelValue() {
      const content =
        this.item.options &&
        this.item.options.find(item => {
          return item.value === this.val;
        });
      return (content && content.label) || "";
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
  watch: {
    item: {
      handler(n) {
        if (n.prefixMsg) {
          this.prependMsg = n.prefixMsg;
        }
        if (n.suffixMsg) {
          this.appendMsg = n.suffixMsg;
        }
      },
      immediate: true
    }
  }
};

/* script */
const __vue_script__$e = script$e;

/* template */
var __vue_render__$e = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-input-box form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-checkbox-group",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: { disabled: _vm.getDisabled, clearable: true },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = typeof $$v === "string" ? $$v.trim() : $$v;
                  },
                  expression: "val"
                }
              },
              "el-checkbox-group",
              _vm.bindAttrs,
              false
            ),
            _vm._l(_vm.item.options, function(opt) {
              return _c(
                "el-checkbox",
                { key: opt.value, attrs: { label: opt.value } },
                [_vm._v(_vm._s(opt.label))]
              )
            }),
            1
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue || "-"))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$e = [];
__vue_render__$e._withStripped = true;

  /* style */
  const __vue_inject_styles__$e = function (inject) {
    if (!inject) return
    inject("data-v-55f8aa14_0", { source: ".form-input-box[data-v-55f8aa14] .el-input-group__prepend,\n.single-input .form-input-box[data-v-55f8aa14] .el-input-group__append {\n  padding: 0 10px;\n}\n", map: {"version":3,"sources":["form_checkbox.vue"],"names":[],"mappings":"AAAA;;EAEE,eAAe;AACjB","file":"form_checkbox.vue","sourcesContent":[".form-input-box /deep/ .el-input-group__prepend,\n.single-input .form-input-box /deep/ .el-input-group__append {\n  padding: 0 10px;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$e = "data-v-55f8aa14";
  /* module identifier */
  const __vue_module_identifier__$e = undefined;
  /* functional template */
  const __vue_is_functional_template__$e = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$e = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$e, staticRenderFns: __vue_staticRenderFns__$e },
    __vue_inject_styles__$e,
    __vue_script__$e,
    __vue_scope_id__$e,
    __vue_is_functional_template__$e,
    __vue_module_identifier__$e,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$f = {
  name: "FormMoneyInput",
  mixins: [FormMixin],
  data() {
    return {
      readonly: true,
      // 在编辑模式下，使用这个 tempVal 替代真实的 val
      // 在触发 blur 事件时，用这个更新原来的 val
      tempVal: ""
    };
  },
  computed: {
    // 千分位的数字
    dealInputValue() {
      if (this.value === "") {
        return "";
      }
      let n = String(this.value);
      // 先转，再处理。如果是万元，先转 把 10000 转为 1
      if (this.append === "万元") {
        n = this.turnWanToYuan(n);
        n = this.throwPointRightZero(n);
      }
      const res = n.toString().replace(/\d+/, n => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, $1 => {
          return $1 + ",";
        });
      });
      return res;
    },
    // 后置符号
    append() {
      // 兼容性处理（默认为元）
      if (this.item.append) {
        return this.item.append;
      } else if (this.item.suffixMsg) {
        return this.item.suffixMsg;
      } else {
        return "元";
      }
    },
    val: {
      // 因为单位可能是元，也可能是万元
      // 元可以直接显示，但是万元需要特殊处理后获取
      get() {
        if (this.value === "") {
          return "";
        }
        if (this.append === "万元") {
          const v = String(this.value);
          const wanyuan = this.turnWanToYuan(v);
          return this.throwPointRightZero(wanyuan);
        } else {
          return this.value;
        }
      },
      set(v) {
        if (v === "") {
          this.$emit("input", v);
          this.statusChangeFn.valueUpdateEvent({
            [this.item.key]: v
          });
          return;
        }
        // 设置时，如果是万元，需要乘以 10000 再处理。如果不是，那么直接处理
        const newVal = Number(v);
        let n = String(newVal);

        // 假如禁止输入负数，那么小于 0 则自动变为 0
        if (this.item.positive && n && Number(n) < 0) {
          n = "0";
        }
        if (this.append === "万元") {
          // 乘以 1w，确保是精确结果
          n = this.setNumberMultiplyTenThousands(n);
        }
        this.$emit("input", n);

        // 只有非子表单的情况下，才会冒泡上去数据变更
        if (this.formItemType !== "childForm") {
          this.statusChangeFn.valueUpdateEvent({
            [this.item.key]: n
          });
        } else {
          // 如果是子表单的话，执行内置的变更
          this.childChangeData.valueUpdateEvent();
        }
      }
    }
  },
  methods: {
    // 将单位为元的数字，转为单位为万元的数字。例如 12000->1.2
    // 相当于除以 10000
    turnWanToYuan(v) {
      // 0 或者空，则返回自己
      if (v === "0" || v === "") {
        return v;
      }
      // 1. 判断有没有小数点
      const pointIndex = v.indexOf(".");
      if (pointIndex > -1) {
        // 有小数点
        // 判断小数点左边是否小于 5 位。如果小于，说明总数小于万，需要补零
        const pointList = v.split(".");
        if (pointList[0].length < 5) {
          // 需要补零，因为显示的单位是万
          let s = "0.";
          for (let i = 0; i < 5 - 1 - pointList[0].length; i++) {
            s += "0";
          }
          s += pointList[0];
          // 再拼接原来小数点右边的
          s += pointList[1];

          return s;
        } else {
          // 不需要补零
          // 把小数点位置往左移动四位
          const s =
            pointList[0].slice(0, -4) +
            "." +
            pointList[0].slice(-4) +
            pointList[1];
          return s;
        }
      } else {
        // 无小数点
        if (v.length < 5) {
          // 需要左侧补零，因为显示的单位是万
          let s = "0.";
          for (let i = 0; i < 5 - 1 - v.length; i++) {
            s += "0";
          }
          s = s + v;
          return s;
        } else {
          // 不需要补零
          // 把小数点位置往左移动四位
          const s = v.slice(0, -4) + "." + v.slice(-4);
          return s;
        }
      }
    },

    // 将数字字符串乘以 1w
    // 因为有些数字乘以 1w 得出的数字并不准确。比如 1.12 * 10000 = 11200.000000000002
    setNumberMultiplyTenThousands(v) {
      const n = String(v);
      // 1、判断有没有小数点，没有小数点直接后面加 4 个 0
      if (v.indexOf(".") === -1) {
        if (n !== "0") {
          return `${n}0000`;
        } else {
          return "0";
        }
      } else {
        // debugger;
        // 2. 有小数点的，判断小数点后位数是否 > 4，
        // 2.1 小数点右边如果 <= 4（比如 1.12），那么干掉小数点，并且在数字最右边补零，1.12 -> 11200
        const pointList = v.split(".");
        if (pointList[1].length <= 4) {
          // 需要右侧补零
          let s = pointList[1];
          for (let i = 0; i < 4 - pointList[1].length; i++) {
            s += "0";
          }
          // 再拼接左右
          s = pointList[0] + s;
          return this.throwPointLeftZero(s);
        } else {
          // 2.2 小数点右边如果大于等于 4，则把小数点往右移动 4 位即可
          const s =
            pointList[0] +
            pointList[1].slice(0, 4) +
            "." +
            pointList[1].slice(4);
          return this.throwPointLeftZero(s);
        }
      }
    },

    getClass() {
      const c1 = `quick-form-unqiue-${this.item.key}`;
      const c2 = this.readonly ? "is-readonly" : "is-wr";
      return {
        [c1]: true,
        [c2]: true
      };
    },
    onKeydown(e) {
      // 假如禁止输入负数，那么干掉负号
      if (this.item.positive) {
        if (e.key === "-" || e.code === "Minus") {
          e.preventDefault();
          return;
        }
      }
    },
    onBlur() {
      this.readonly = true;
      if (this.tempVal === "") {
        this.$emit("input", this.tempVal);

        this.statusChangeFn.valueUpdateEvent({
          [this.item.key]: this.tempVal
        });
        return;
      }

      let newVal = this.tempVal;

      // 如果需要补零
      if (this.item.zeroPadding && this.item.zeroPadding > 0) {
        const l = String(newVal).split(".");
        // 如果没有小数点（说明只有整数位），自动补零
        if (l.length === 1) {
          // 判断 l[0].length 是否为 0，为 0 则说明没填，啥事都不做
          if (l[0].length === 0) {
            newVal = "";
          } else {
            // 自动补零
            newVal += "." + "0".padEnd(this.item.zeroPadding, "0");
          }
        } else {
          // 此时说明有小数点，那么小数位数多，则去掉多余的。位数小，则补零
          const currentLength = l[1].length;
          // 小数位数少，则补零
          if (currentLength < this.item.zeroPadding) {
            newVal = l[0] + "." + l[1].padEnd(this.item.zeroPadding, "0");
          }
          // 如果大于
          if (currentLength > this.item.zeroPadding) {
            newVal = String(l[0]) + "." + l[1].slice(0, this.item.zeroPadding);
          }
        }
      }
      newVal = String(newVal);
      newVal = newVal
        .split(".")
        .map((s, index) => {
          if (index !== 0) {
            return s;
          }
          // 通过正则，匹配首位开始的所有 0（用于去除整数部分开始的 0）
          const newS = s.replace(/$0+/g, "");
          // 如果只有 0，那么最后返回 0，确保小数点前有数字
          if (newS.length === 0) {
            return "0";
          } else {
            return newS;
          }
        })
        .join(".");

      // 假如禁止输入负数，那么小于 0 则自动变为 0
      if (this.item.positive && newVal < 0) {
        newVal = 0;
      }

      this.tempVal = this.throwPointLeftZero(this.tempVal);
      this.tempVal = this.throwPointRightZero(this.tempVal);
      this.val = newVal;
    },
    onFocus() {
      const newValue = this.value;
      if (this.append === "万元") {
        let n = this.turnWanToYuan(String(newValue));
        n = this.throwPointRightZero(n);
        this.tempVal = n;
      } else {
        this.tempVal = String(newValue);
      }
      this.readonly = false;
    }
  }
};

/* script */
const __vue_script__$f = script$f;

/* template */
var __vue_render__$f = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: _vm.getClass(),
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? [
            _c(
              "el-input",
              _vm._b(
                {
                  staticClass: "input-wr",
                  style: _vm.item.valueBoxStyle || {},
                  attrs: {
                    placeholder: _vm.getPlaceholder(_vm.item),
                    disabled: _vm.getDisabled,
                    type: "number",
                    clearable: true
                  },
                  on: {
                    blur: function(e) {
                      return _vm.onBlur(_vm.item, e)
                    },
                    focus: function(e) {
                      return _vm.onFocus(_vm.item, e)
                    }
                  },
                  nativeOn: {
                    keydown: function($event) {
                      return _vm.onKeydown($event)
                    }
                  },
                  model: {
                    value: _vm.tempVal,
                    callback: function($$v) {
                      _vm.tempVal = typeof $$v === "string" ? $$v.trim() : $$v;
                    },
                    expression: "tempVal"
                  }
                },
                "el-input",
                _vm.bindAttrs,
                false
              ),
              [
                _c("template", { slot: "append" }, [_vm._v(_vm._s(_vm.append))])
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "el-input",
              _vm._b(
                {
                  staticClass: "input-readonly",
                  attrs: {
                    placeholder: _vm.getPlaceholder(_vm.item),
                    disabled: _vm.getDisabled,
                    type: "input",
                    clearable: true
                  },
                  model: {
                    value: _vm.dealInputValue,
                    callback: function($$v) {
                      _vm.dealInputValue =
                        typeof $$v === "string" ? $$v.trim() : $$v;
                    },
                    expression: "dealInputValue"
                  }
                },
                "el-input",
                _vm.bindAttrs,
                false
              ),
              [
                _c("template", { slot: "append" }, [_vm._v(_vm._s(_vm.append))])
              ],
              2
            )
          ]
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(
              "\n    " +
                _vm._s(_vm.dealInputValue || "-") +
                "\n    " +
                _vm._s(_vm.append) +
                "\n  "
            )
          ])
    ],
    2
  )
};
var __vue_staticRenderFns__$f = [];
__vue_render__$f._withStripped = true;

  /* style */
  const __vue_inject_styles__$f = function (inject) {
    if (!inject) return
    inject("data-v-bdeb17b2_0", { source: ".input-wr[data-v-bdeb17b2] {\n  z-index: 100;\n}\n.input-readonly[data-v-bdeb17b2] {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n.is-wr .input-wr[data-v-bdeb17b2] {\n  opacity: 1;\n}\n.is-wr .input-readonly[data-v-bdeb17b2] {\n  display: none;\n}\n.is-readonly .input-wr[data-v-bdeb17b2] {\n  opacity: 0;\n}\n", map: {"version":3,"sources":["form_money_input.vue"],"names":[],"mappings":"AAAA;EACE,YAAY;AACd;AACA;EACE,kBAAkB;EAClB,OAAO;EACP,MAAM;AACR;AACA;EACE,UAAU;AACZ;AACA;EACE,aAAa;AACf;AACA;EACE,UAAU;AACZ","file":"form_money_input.vue","sourcesContent":[".input-wr {\n  z-index: 100;\n}\n.input-readonly {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n.is-wr .input-wr {\n  opacity: 1;\n}\n.is-wr .input-readonly {\n  display: none;\n}\n.is-readonly .input-wr {\n  opacity: 0;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$f = "data-v-bdeb17b2";
  /* module identifier */
  const __vue_module_identifier__$f = undefined;
  /* functional template */
  const __vue_is_functional_template__$f = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$f = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$f, staticRenderFns: __vue_staticRenderFns__$f },
    __vue_inject_styles__$f,
    __vue_script__$f,
    __vue_scope_id__$f,
    __vue_is_functional_template__$f,
    __vue_module_identifier__$f,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$g = {
  name: "FormRateInput",
  mixins: [FormMixin],
  data() {
    return {
      readonly: true,
      // 在编辑模式下，使用这个 tempVal 替代真实的 val
      // 在触发 blur 事件时，用这个更新原来的 val
      tempVal: ""
    };
  },
  computed: {
    // 显示文字
    dealInputValue() {
      if (this.value === "") {
        return "";
      }
      let n = String(this.value);
      // 先转，再处理。即把 0.123 转成 12.3 处理（用户看到的是 12.3）
      if (this.append === "%") {
        n = this.multiplyHundred(n);
      }
      const res = n.toString().replace(/\d+/, n => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, $1 => {
          return $1 + ",";
        });
      });
      return res;
    },
    // 后置符号
    append() {
      // 兼容性处理
      if (this.item.append) {
        return this.item.append;
      } else if (this.item.suffixMsg) {
        return this.item.suffixMsg;
      } else {
        return "%";
      }
    },
    val: {
      get() {
        if (this.value === "") {
          return "";
        }
        if (this.append === "%") {
          const v = String(this.value);
          return this.multiplyHundred(v);
        } else {
          return this.value;
        }
      },
      set(v) {
        if (v === "") {
          this.$emit("input", v);
          this.statusChangeFn.valueUpdateEvent({
            [this.item.key]: v
          });
          return;
        }
        // 设置时，如果是 %，需要除以 100 再处理。如果不是，那么直接处理
        const newVal = Number(v);
        let n = String(newVal);

        // 假如禁止输入负数，那么小于 0 则自动变为 0
        if (this.item.positive && n && Number(n) < 0) {
          n = "0";
        }
        if (this.append === "%") {
          // 除以 100，确保是精确结果
          n = this.turnHundredToDecimal(n);
        }
        this.$emit("input", n);

        // 只有非子表单的情况下，才会冒泡上去数据变更
        if (this.formItemType !== "childForm") {
          this.statusChangeFn.valueUpdateEvent({
            [this.item.key]: n
          });
        } else {
          // 如果是子表单的话，执行内置的变更
          this.childChangeData.valueUpdateEvent();
        }
      }
    }
  },
  methods: {
    // 字符串除法
    // 参数一是被除以的值
    // 参数二是小数点移动位数，必须大于 0。往左移动一位是 1，两位是 2（相当于除以 100）
    stringDivide(value, pointMove) {
      // 入参不合法
      if (typeof pointMove !== "number" && pointMove <= 0) {
        throw new Error("入参不合法。参数必须是数字，并且大于 0");
      }

      // 0 或者空，则返回自己
      if (value === "0" || value === "" || !value) {
        return value;
      }

      // 1. 判断有没有小数点
      const pointIndex = value.indexOf(".");
      if (pointIndex > -1) {
        // 有小数点
        // 判断小数点左边是否小于 pointMove + 1 位。如果小于，说明总数比较小，需要除完后补零
        const pointList = value.split(".");
        if (pointList[0].length < pointMove + 1) {
          // 需要补零
          let s = "0.";
          for (let i = 0; i < pointMove - pointList[0].length; i++) {
            s += "0";
          }
          s += pointList[0];
          // 再拼接原来小数点右边的
          s += pointList[1];

          let result = this.throwPointLeftZero(s);
          result = this.throwPointRightZero(result);
          return result;
        } else {
          // 不需要补零
          // 把小数点位置往左移动四位
          const s =
            pointList[0].slice(0, -1 * pointMove) +
            "." +
            pointList[0].slice(-1 * pointMove) +
            pointList[1];
          let result = this.throwPointLeftZero(s);
          result = this.throwPointRightZero(result);
          return result;
        }
      } else {
        // 无小数点
        if (value.length < pointMove + 1) {
          // 数字比较小，需要除完后，小数点右侧（原数字左侧）补零
          let s = "0.";
          for (let i = 0; i < pointMove - value.length; i++) {
            s += "0";
          }
          s = s + value;
          let result = this.throwPointLeftZero(s);
          result = this.throwPointRightZero(result);
          return result;
        } else {
          // 不需要补零
          // 把小数点位置往左移动四位
          const s =
            value.slice(0, -1 * pointMove) + "." + value.slice(-1 * pointMove);
          let result = this.throwPointLeftZero(s);
          result = this.throwPointRightZero(result);
          return result;
        }
      }
    },

    // 将 12.3% 转为 0.123，即
    turnHundredToDecimal(v) {
      const value = this.stringDivide(v, 2);
      return value;
    },

    // 字符串乘法
    // 参数一是被除以的值
    // 参数二是小数点移动位数，往右移动一位是 1，两位是 2（相当于乘以 100）
    stringMultiply(value, pointMove) {
      // 入参不合法
      if (typeof pointMove !== "number" && pointMove <= 0) {
        throw new Error("入参不合法。参数必须是数字，并且大于 0");
      }

      // 0 或者空，则返回自己
      if (value === "0" || value === "" || !value) {
        return value;
      }

      let n = String(value);
      // 1、判断有没有小数点，没有小数点直接后面加 4 个 0
      if (value.indexOf(".") === -1) {
        if (n !== "0") {
          for (let i = 0; i < pointMove; i++) {
            n = `${n}0`;
          }
          const result = this.throwPointLeftZero(n);
          return result;
        } else {
          return "0";
        }
      } else {
        // 2. 有小数点的，判断小数点后位数是否 > pointMove，
        // 2.1 小数点右边如果 <= pointMove（比如 1.12），那么干掉小数点，并且在数字最右边补零，1.12 -> 112
        const pointList = value.split(".");
        if (pointList[1].length <= pointMove) {
          // 需要右侧补零
          let s = pointList[1];
          for (let i = 0; i < pointMove - pointList[1].length; i++) {
            s += "0";
          }
          // 再拼接左右
          s = pointList[0] + s;
          let result = this.throwPointLeftZero(s);
          result = this.throwPointRightZero(result);
          return result;
        } else {
          // 2.2 小数点右边如果大于等于 pointMove，则把小数点往右移动 pointMove 位即可
          const s =
            pointList[0] +
            pointList[1].slice(0, pointMove) +
            "." +
            pointList[1].slice(pointMove);
          let result = this.throwPointLeftZero(s);
          result = this.throwPointRightZero(result);
          return result;
        }
      }
    },

    // 乘以 100
    multiplyHundred(v) {
      const value = this.stringMultiply(v, 2);
      return value;
    },

    getClass() {
      const c1 = `quick-form-unqiue-${this.item.key}`;
      const c2 = this.readonly ? "is-readonly" : "is-wr";
      return {
        [c1]: true,
        [c2]: true
      };
    },
    onKeydown(e) {
      // 假如禁止输入负数，那么干掉负号
      if (this.item.positive) {
        if (e.key === "-" || e.code === "Minus") {
          e.preventDefault();
          return;
        }
      }
    },
    onBlur() {
      this.readonly = true;
      if (this.tempVal === "") {
        this.$emit("input", this.tempVal);

        this.statusChangeFn.valueUpdateEvent({
          [this.item.key]: this.tempVal
        });
        return;
      }

      let newVal = this.tempVal;

      // 如果需要补零
      if (this.item.zeroPadding && this.item.zeroPadding > 0) {
        const l = String(newVal).split(".");
        // 如果没有小数点（说明只有整数位），自动补零
        if (l.length === 1) {
          // 判断 l[0].length 是否为 0，为 0 则说明没填，啥事都不做
          if (l[0].length === 0) {
            newVal = "";
          } else {
            // 自动补零
            newVal += "." + "0".padEnd(this.item.zeroPadding, "0");
          }
        } else {
          // 此时说明有小数点，那么小数位数多，则去掉多余的。位数小，则补零
          const currentLength = l[1].length;
          // 小数位数少，则补零
          if (currentLength < this.item.zeroPadding) {
            newVal = l[0] + "." + l[1].padEnd(this.item.zeroPadding, "0");
          }
          // 如果大于
          if (currentLength > this.item.zeroPadding) {
            newVal = String(l[0]) + "." + l[1].slice(0, this.item.zeroPadding);
          }
        }
      }
      // console.log(newVal);
      newVal = String(newVal);
      newVal = newVal
        .split(".")
        .map((s, index) => {
          if (index !== 0) {
            return s;
          }
          // 通过正则，匹配首位开始的所有 0（用于去除整数部分开始的 0）
          const newS = s.replace(/$0+/g, "");
          // 如果只有 0，那么最后返回 0，确保小数点前有数字
          if (newS.length === 0) {
            return "0";
          } else {
            return newS;
          }
        })
        .join(".");

      // 假如禁止输入负数，那么小于 0 则自动变为 0
      if (this.item.positive && newVal < 0) {
        newVal = 0;
      }

      this.tempVal = this.throwPointLeftZero(this.tempVal);
      this.tempVal = this.throwPointRightZero(this.tempVal);
      // console.log(newVal);
      this.val = newVal;
    },
    onFocus() {
      this.tempVal = this.multiplyHundred(String(this.value));
      this.readonly = false;
    }
  },
  watch: {
    item: {
      handler() {
        this.readonly = true;
      },
      immediate: true
    }
  }
};

/* script */
const __vue_script__$g = script$g;

/* template */
var __vue_render__$g = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: _vm.getClass(),
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? [
            _c(
              "el-input",
              _vm._b(
                {
                  staticClass: "input-wr",
                  style: _vm.item.valueBoxStyle || {},
                  attrs: {
                    placeholder: _vm.getPlaceholder(_vm.item),
                    disabled: _vm.getDisabled,
                    type: "number",
                    clearable: true
                  },
                  on: {
                    blur: function(e) {
                      return _vm.onBlur(_vm.item, e)
                    },
                    focus: function(e) {
                      return _vm.onFocus(_vm.item, e)
                    }
                  },
                  nativeOn: {
                    keydown: function($event) {
                      return _vm.onKeydown($event)
                    }
                  },
                  model: {
                    value: _vm.tempVal,
                    callback: function($$v) {
                      _vm.tempVal = typeof $$v === "string" ? $$v.trim() : $$v;
                    },
                    expression: "tempVal"
                  }
                },
                "el-input",
                _vm.bindAttrs,
                false
              ),
              [
                _c("template", { slot: "append" }, [_vm._v(_vm._s(_vm.append))])
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "el-input",
              _vm._b(
                {
                  staticClass: "input-readonly",
                  attrs: {
                    placeholder: _vm.getPlaceholder(_vm.item),
                    disabled: _vm.getDisabled,
                    type: "input",
                    clearable: true
                  },
                  model: {
                    value: _vm.dealInputValue,
                    callback: function($$v) {
                      _vm.dealInputValue =
                        typeof $$v === "string" ? $$v.trim() : $$v;
                    },
                    expression: "dealInputValue"
                  }
                },
                "el-input",
                _vm.bindAttrs,
                false
              ),
              [
                _c("template", { slot: "append" }, [_vm._v(_vm._s(_vm.append))])
              ],
              2
            )
          ]
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(
              "\n    " +
                _vm._s(_vm.dealInputValue || "-") +
                "\n    " +
                _vm._s(_vm.append) +
                "\n  "
            )
          ])
    ],
    2
  )
};
var __vue_staticRenderFns__$g = [];
__vue_render__$g._withStripped = true;

  /* style */
  const __vue_inject_styles__$g = function (inject) {
    if (!inject) return
    inject("data-v-2d455d64_0", { source: ".form-item-box[data-v-2d455d64] .el-input__inner {\n  height: 36px;\n  line-height: 36px;\n}\n.input-wr[data-v-2d455d64] {\n  z-index: 100;\n}\n.input-readonly[data-v-2d455d64] {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n.is-wr .input-wr[data-v-2d455d64] {\n  opacity: 1;\n}\n.is-wr .input-readonly[data-v-2d455d64] {\n  display: none;\n}\n.is-readonly .input-wr[data-v-2d455d64] {\n  opacity: 0;\n}\n", map: {"version":3,"sources":["form_rate_input.vue"],"names":[],"mappings":"AAAA;EACE,YAAY;EACZ,iBAAiB;AACnB;AACA;EACE,YAAY;AACd;AACA;EACE,kBAAkB;EAClB,OAAO;EACP,MAAM;AACR;AACA;EACE,UAAU;AACZ;AACA;EACE,aAAa;AACf;AACA;EACE,UAAU;AACZ","file":"form_rate_input.vue","sourcesContent":[".form-item-box /deep/ .el-input__inner {\n  height: 36px;\n  line-height: 36px;\n}\n.input-wr {\n  z-index: 100;\n}\n.input-readonly {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n.is-wr .input-wr {\n  opacity: 1;\n}\n.is-wr .input-readonly {\n  display: none;\n}\n.is-readonly .input-wr {\n  opacity: 0;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$g = "data-v-2d455d64";
  /* module identifier */
  const __vue_module_identifier__$g = undefined;
  /* functional template */
  const __vue_is_functional_template__$g = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$g = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$g, staticRenderFns: __vue_staticRenderFns__$g },
    __vue_inject_styles__$g,
    __vue_script__$g,
    __vue_scope_id__$g,
    __vue_is_functional_template__$g,
    __vue_module_identifier__$g,
    false,
    createInjector,
    undefined,
    undefined
  );

//

// 这个是已经耦合的，非通用组件
var script$h = {
  name: "FormAreaSelect",
  mixins: [FormMixin],
  data() {
    return {
      prependMsg: "",
      appendMsg: ""
    };
  },
  computed: {
    cityList() {
      const secondParentKey = this.item.secondParentKey || "10021";
      if (this.val[0]) {
        return this.dynamicDict[secondParentKey].filter(
          item => item.bparentCode === this.val[0]
        );
      }

      return [];
    },
    areaList() {
      const thirdParentKey = this.item.thirdParentKey || "10022";
      if (this.val[1]) {
        return this.dynamicDict[thirdParentKey].filter(
          item => item.bparentCode === this.val[1]
        );
      }

      return [];
    },
    areaText() {
      const firstParentKey = this.item.firstParentKey || "10020";
      const secondParentKey = this.item.secondParentKey || "10021";
      const thirdParentKey = this.item.thirdParentKey || "10022";

      return `${this.getText(firstParentKey, this.val[0])}${this.getText(
        secondParentKey,
        this.val[1]
      )}${this.getText(thirdParentKey, this.val[2])}`;
    }
  },
  methods: {
    onChange(v, index) {
      if (index === "0") {
        this.val[1] = "";
        this.val[2] = "";
      }
      if (index === "1") {
        this.val[2] = "";
      }
    },
    getText(pCode, val) {
      if (this.val[0]) {
        const t = this.dynamicDict[pCode].filter(
          item => item[this.dynamicSelectOption.value] === val
        );
        if (t.length === 0) {
          return "";
        } else {
          return t[0][this.dynamicSelectOption.label];
        }
      } else {
        return "";
      }
    }
  }
};

/* script */
const __vue_script__$h = script$h;

/* template */
var __vue_render__$h = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-input-box form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-row",
            [
              _c(
                "el-col",
                { attrs: { span: 8 } },
                [
                  _c(
                    "el-select",
                    {
                      staticClass: "select",
                      style: _vm.item.valueBoxStyle || {},
                      attrs: {
                        placeholder: "请选择",
                        disabled: _vm.getDisabled
                      },
                      on: {
                        change: function(v) {
                          return _vm.onChange(v, "0")
                        }
                      },
                      model: {
                        value: _vm.val[0],
                        callback: function($$v) {
                          _vm.$set(_vm.val, 0, $$v);
                        },
                        expression: "val[0]"
                      }
                    },
                    _vm._l(
                      _vm.dynamicDict[_vm.item.firstParentKey || "10020"],
                      function(items) {
                        return _c("el-option", {
                          key: items[_vm.dynamicSelectOption.value],
                          attrs: {
                            label: items[_vm.dynamicSelectOption.label],
                            value: items[_vm.dynamicSelectOption.value]
                          }
                        })
                      }
                    ),
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "el-col",
                { attrs: { span: 8 } },
                [
                  _c(
                    "el-select",
                    {
                      staticClass: "select",
                      style: _vm.item.valueBoxStyle || {},
                      attrs: {
                        placeholder: "请选择",
                        disabled: _vm.getDisabled
                      },
                      on: {
                        change: function(v) {
                          return _vm.onChange(v, "1")
                        }
                      },
                      model: {
                        value: _vm.val[1],
                        callback: function($$v) {
                          _vm.$set(_vm.val, 1, $$v);
                        },
                        expression: "val[1]"
                      }
                    },
                    _vm._l(_vm.cityList, function(items) {
                      return _c("el-option", {
                        key: items[_vm.dynamicSelectOption.value],
                        attrs: {
                          label: items[_vm.dynamicSelectOption.label],
                          value: items[_vm.dynamicSelectOption.value]
                        }
                      })
                    }),
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "el-col",
                { attrs: { span: 8 } },
                [
                  _c(
                    "el-select",
                    {
                      staticClass: "select",
                      style: _vm.item.valueBoxStyle || {},
                      attrs: {
                        placeholder: "请选择",
                        disabled: _vm.getDisabled
                      },
                      model: {
                        value: _vm.val[2],
                        callback: function($$v) {
                          _vm.$set(_vm.val, 2, $$v);
                        },
                        expression: "val[2]"
                      }
                    },
                    _vm._l(_vm.areaList, function(items) {
                      return _c("el-option", {
                        key: items[_vm.dynamicSelectOption.value],
                        attrs: {
                          label: items[_vm.dynamicSelectOption.label],
                          value: items[_vm.dynamicSelectOption.value]
                        }
                      })
                    }),
                    1
                  )
                ],
                1
              )
            ],
            1
          )
        : _c(
            "div",
            { staticClass: "form-input-text", style: _vm.item.textStyle || {} },
            [_vm._v("\n    " + _vm._s(_vm.areaText) + "\n  ")]
          )
    ],
    1
  )
};
var __vue_staticRenderFns__$h = [];
__vue_render__$h._withStripped = true;

  /* style */
  const __vue_inject_styles__$h = function (inject) {
    if (!inject) return
    inject("data-v-404a261c_0", { source: ".form-input-box[data-v-404a261c] .el-input {\n  position: relative;\n  width: 100%;\n  height: 36px;\n}\n.form-input-box[data-v-404a261c] .el-input .el-input__inner {\n  height: 36px;\n  line-height: 36px;\n}\n.form-input-text[data-v-404a261c] {\n  position: relative;\n  width: 100%;\n  height: 36px;\n  line-height: 36px;\n  font-size: 14px;\n  color: #12182a;\n}\n.select[data-v-404a261c] {\n  width: 100%;\n}\n", map: {"version":3,"sources":["form_area_select.vue"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;AACd;AACA;EACE,YAAY;EACZ,iBAAiB;AACnB;AACA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;EACZ,iBAAiB;EACjB,eAAe;EACf,cAAc;AAChB;AACA;EACE,WAAW;AACb","file":"form_area_select.vue","sourcesContent":[".form-input-box /deep/ .el-input {\n  position: relative;\n  width: 100%;\n  height: 36px;\n}\n.form-input-box /deep/ .el-input .el-input__inner {\n  height: 36px;\n  line-height: 36px;\n}\n.form-input-text {\n  position: relative;\n  width: 100%;\n  height: 36px;\n  line-height: 36px;\n  font-size: 14px;\n  color: #12182a;\n}\n.select {\n  width: 100%;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$h = "data-v-404a261c";
  /* module identifier */
  const __vue_module_identifier__$h = undefined;
  /* functional template */
  const __vue_is_functional_template__$h = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$h = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$h, staticRenderFns: __vue_staticRenderFns__$h },
    __vue_inject_styles__$h,
    __vue_script__$h,
    __vue_scope_id__$h,
    __vue_is_functional_template__$h,
    __vue_module_identifier__$h,
    false,
    createInjector,
    undefined,
    undefined
  );

//
// const axios = require("axios");
const axios = require("axios");

// 多级联动下拉框
var script$i = {
  name: "FormMulLinkage",
  mixins: [FormMixin],
  data() {
    return {
      hasLoaded: true
    };
  },
  watch: {
    item: {
      handler() {
        this.hasLoaded = false;
      },
      immediate: false
    },
    val: {
      handler() {
        this.hasLoaded = false;
      },
      immediate: false
    },
    "item.linkLevel": {
      handler() {
        this.initVal();
      },
      immediate: true
    }
  },
  created() {
    this.loadDict(this.item.firstParentKey);
  },
  computed: {
    val: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
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
    getTextModelValueList() {
      // 1、这里的文本值，是 val每个元素 翻译为 label 后的组合
      // 2、因为是多级联动，且是文本模式，而我们只有其 value 值
      // 3、所以我们需要先拿到字典里该项，将 value 翻译为 label 才可以。
      // 4、而为了拿到字典里该项，所以我们需要知道每一个值的父 key，然后去请求接口拿到该父 key 下的所有元素，
      //    再遍历这些元素，通过 value 匹配的方式，拿到该元素的 label
      // 5、具体来说，第一个值的父 key 是 this.item.firstParentKey；剩下每个的父 key，是他前一个值的 val
      // 而具体操作过程中，我们要先去判断这些是否已经缓存到了 this.dynamicDict 里，没有的话，我们再去请求接口拿值，可以提高效率

      // 创建父 key 列表
      const parentKeyList = [];
      if (
        !this.dynamicDict[this.item.firstParentKey] ||
        this.dynamicDict[this.item.firstParentKey].length === 0
      ) {
        parentKeyList.push(this.item.firstParentKey);
      }
      if (this.val && this.val instanceof Array) {
        this.val.forEach(v => {
          // 有值，
          if (v) {
            // 且其不在 this.dynamicDict 里，或者 this.dynamicDict[v] 里面该值为空
            // 才放到请求列表里
            if (!this.dynamicDict[v] || this.dynamicDict[v].length === 0) {
              parentKeyList.push(v);
            }
          }
        });
      }
      this.hasLoaded = true;
      // 然后去调接口获取该 父 key 下面的所有值
      this.loadDict(parentKeyList);
    },

    // 获取文本值的时候
    textModelValue() {
      // 先创建一个数组，他的长度跟 this.item.linkLevel 一样
      const text = new Array(this.item.linkLevel).fill("");
      let needLoadDict = false;
      for (let i = 0; i < this.item.linkLevel; i++) {
        // 拿到这个值
        const v = this.val[i];
        // 再去遍历 this.dynamicDict 中父 key 列表，去取值
        let pKey = "";
        if (i === 0) {
          // 第一个值的父 key 取这个
          pKey = this.item.firstParentKey;
        } else {
          // 后面值的父 key 取前一个的值
          pKey = this.val[i - 1];
        }
        // 如果父 key 有值，则说明理论上可以从 this.dynamicDict[pKey] 里找到他的值
        if (this.dynamicDict[pKey] && this.dynamicDict[pKey].length > 0) {
          let t = "";
          let isGet = false;
          this.dynamicDict[pKey].forEach(item => {
            if (item[this.dynamicSelectOption.value] === v) {
              isGet = true;
              t = item[this.dynamicSelectOption.label];
            }
          });
          // 如果没找到 label，则该值取 对应的 value
          if (!isGet) {
            t = v;
          }
          text[i] = t;
          continue;
        } else {
          // 如果父 key 没在 this.dynamicDict[pKey] 找到
          // 此时说明该去请求一下接口，但是现在的值，应该暂时显示为 value 来替换 label
          text[i] = v;
          needLoadDict = true;
        }
      }

      // 去调接口加载数据字典
      if (needLoadDict && !this.hasLoaded) {
        this.getTextModelValueList();
      }
      // 但是现在还是需要返回值的，所以返回文字内容
      return text.join("") || "-";
    },
    // 根据 item.linkLevel 更新 val 长度
    initVal() {
      this.$emit("input", new Array(this.item.linkLevel || 3).fill(""));
    },
    // 获取下拉框列表
    getOptions(i) {
      if (String(i) === "1") {
        // 第一个选项，下拉框内容的父 key 是 item.firstParentKey
        return this.dynamicDict[this.item.firstParentKey] || [];
      } else {
        // 后续的选项，下拉框的父 key ，是前一个的值
        return this.dynamicDict[this.val[i - 2]] || [];
      }
    },

    // 异步加载字典
    // todo 这里的数据字典请求接口，应该最后合并到一起，由一个专门的数据字典请求管理器去请求，减低接口重复请求的情况
    loadDict(parentCode) {
      let payload = null;
      if (this.dynamicSelectOption.queryKey) {
        if (parentCode instanceof Array) {
          payload = {
            [this.dynamicSelectOption.queryKey]: [...parentCode]
          };
        } else {
          payload = {
            [this.dynamicSelectOption.queryKey]: [parentCode]
          };
        }
      } else {
        if (parentCode instanceof Array) {
          payload = [...parentCode];
        } else {
          payload = [parentCode];
        }
      }
      this.$set(this.dynamicDict, parentCode, []);
      // console.log('nul linkage load dict');
      // 否则，根据当前的值，去请求数据字典
      axios
        .post(this.dynamicSelectOption.dictUrl, payload)
        .then(res => {
          // 兼容性处理
          let data;
          if (res.request && res.headers) {
            data = res.data;
          } else {
            data = res;
          }
          if (data.status === 200 || data.status === 0) {
            if (data.data.length > 0) {
              // 因为可能多个地方同时调这个接口的原因，为了避免重复将内容添加到里面，所以，
              // 这里在赋值之前，需要先判断一下 parentCodeList 的每个值，其对应的 dynamicDict 里的哪一个数组，是否是空的
              // 如果不是空的，则将其置为空数组
              let list;
              if (parentCode instanceof Array) {
                list = [...parentCode];
              } else {
                list = [parentCode];
              }
              list.forEach(pCode => {
                if (
                  !this.dynamicDict[pCode] ||
                  this.dynamicDict[pCode].length > 0
                ) {
                  this.$set(this.dynamicDict, pCode, []);
                }
              });

              // 加载到结果
              data.data.forEach(item => {
                const pCode = item[this.dynamicSelectOption.parentKey];
                this.dynamicDict[pCode].push(item);
              });

              // 强制更新一遍组件的内容
              this.$forceUpdate();
            }
          } else {
            this.$message.error(data.msg);
          }
        })
        .catch(e => {
          console.log(e);
          this.$message.error("数据字典加载错误，请刷新页面重试");
        });
    },

    // select 选择选项事件触发，
    // 值的索引从 0 开始，index 从 1 开始（即 val[0]对应 i=1）
    onChange(v, index) {
      // debugger;
      // 当 change 事件触发后，将其后的内容都置为空
      for (let i = index; i < this.item.linkLevel; i++) {
        this.val[i] = "";
      }
      // 如果当前是最后一个，则无需请求
      if (index === this.item.linkLevel) {
        return;
      }
      // 然后根据这个值，先判断当前数据字典里，是否有值
      if (this.dynamicDict[v] && this.dynamicDict[v].length > 0) {
        // 有值，且长度不为0，则显然不需要再去请求数据字典了
        return;
      } else {
        this.loadDict(v);
      }
    }
  }
};

/* script */
const __vue_script__$i = script$i;

/* template */
var __vue_render__$i = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-row",
            _vm._l(_vm.item.linkLevel || 3, function(i) {
              return _c(
                "el-col",
                { key: i, attrs: { span: 24 / (_vm.item.linkLevel || 3) } },
                [
                  _c(
                    "el-select",
                    {
                      staticStyle: { width: "100%" },
                      style: _vm.item.valueBoxStyle || {},
                      attrs: {
                        disabled: _vm.getDisabled,
                        placeholder: _vm.getSelectPlaceholder(_vm.item)
                      },
                      on: {
                        change: function(v) {
                          return _vm.onChange(v, i)
                        }
                      },
                      model: {
                        value: _vm.val[i - 1],
                        callback: function($$v) {
                          _vm.$set(_vm.val, i - 1, $$v);
                        },
                        expression: "val[i - 1]"
                      }
                    },
                    _vm._l(_vm.getOptions(i), function(items) {
                      return _c("el-option", {
                        key: items[_vm.dynamicSelectOption.value],
                        attrs: {
                          label: items[_vm.dynamicSelectOption.label],
                          value: items[_vm.dynamicSelectOption.value]
                        }
                      })
                    }),
                    1
                  )
                ],
                1
              )
            }),
            1
          )
        : _c("div", { style: _vm.item.textStyle || {} }, [
            _vm._v(_vm._s(_vm.textModelValue()))
          ])
    ],
    1
  )
};
var __vue_staticRenderFns__$i = [];
__vue_render__$i._withStripped = true;

  /* style */
  const __vue_inject_styles__$i = function (inject) {
    if (!inject) return
    inject("data-v-499e5bed_0", { source: ".form-item-box[data-v-499e5bed] .el-input {\n  position: relative;\n  width: 100%;\n  height: 36px;\n}\n.form-item-box[data-v-499e5bed] .el-input .el-input__inner {\n  position: absolute;\n  width: 100%;\n  height: 36px;\n  line-height: 36px;\n  padding-right: 10px;\n  padding-left: 12px;\n}\n", map: {"version":3,"sources":["form_mul_linkage.vue"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;AACd;AACA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;EACZ,iBAAiB;EACjB,mBAAmB;EACnB,kBAAkB;AACpB","file":"form_mul_linkage.vue","sourcesContent":[".form-item-box /deep/ .el-input {\n  position: relative;\n  width: 100%;\n  height: 36px;\n}\n.form-item-box /deep/ .el-input .el-input__inner {\n  position: absolute;\n  width: 100%;\n  height: 36px;\n  line-height: 36px;\n  padding-right: 10px;\n  padding-left: 12px;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$i = "data-v-499e5bed";
  /* module identifier */
  const __vue_module_identifier__$i = undefined;
  /* functional template */
  const __vue_is_functional_template__$i = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$i = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$i, staticRenderFns: __vue_staticRenderFns__$i },
    __vue_inject_styles__$i,
    __vue_script__$i,
    __vue_scope_id__$i,
    __vue_is_functional_template__$i,
    __vue_module_identifier__$i,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$j = {
  name: "FormNormalNumber",
  mixins: [FormMixin],
  computed: {
    // 前置符号
    prepend() {
      // 兼容性处理
      if (this.item.prepend) {
        return this.item.prepend;
      } else {
        return "";
      }
    },
    // 后置符号
    append() {
      // 兼容性处理
      if (this.item.append) {
        return this.item.append;
      } else {
        return "";
      }
    }
  }
};

/* script */
const __vue_script__$j = script$j;

/* template */
var __vue_render__$j = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-input-box form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.valueWrapStyle || {}
    },
    [
      !_vm.getTextModel
        ? _c(
            "el-input",
            _vm._b(
              {
                style: _vm.item.valueBoxStyle || {},
                attrs: {
                  placeholder: _vm.getPlaceholder(_vm.item),
                  disabled: _vm.getDisabled,
                  type: "number",
                  clearable: true
                },
                on: {
                  blur: function(e) {
                    return _vm.onBlur(_vm.item, e)
                  },
                  focus: function(e) {
                    return _vm.onFocus(_vm.item, e)
                  }
                },
                model: {
                  value: _vm.val,
                  callback: function($$v) {
                    _vm.val = typeof $$v === "string" ? $$v.trim() : $$v;
                  },
                  expression: "val"
                }
              },
              "el-input",
              _vm.bindAttrs,
              false
            ),
            [
              _vm.prepend
                ? _c("template", { slot: "prepend" }, [
                    _vm._v(_vm._s(_vm.prepend))
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.append
                ? _c("template", { slot: "append" }, [
                    _vm._v(_vm._s(_vm.append))
                  ])
                : _vm._e()
            ],
            2
          )
        : _c(
            "div",
            { staticClass: "form-input-text", style: _vm.item.textStyle || {} },
            [
              _vm.prepend
                ? _c("span", { staticClass: "prepend-msg" }, [
                    _vm._v(_vm._s(_vm.prepend))
                  ])
                : _vm._e(),
              _vm._v(" "),
              _c("span", { staticClass: "text" }, [
                _vm._v(_vm._s(_vm.val || "-"))
              ]),
              _vm._v(" "),
              _vm.append
                ? _c("span", { staticClass: "append-msg" }, [
                    _vm._v(_vm._s(_vm.append))
                  ])
                : _vm._e()
            ]
          )
    ],
    1
  )
};
var __vue_staticRenderFns__$j = [];
__vue_render__$j._withStripped = true;

  /* style */
  const __vue_inject_styles__$j = undefined;
  /* scoped */
  const __vue_scope_id__$j = "data-v-1bb6f0d4";
  /* module identifier */
  const __vue_module_identifier__$j = undefined;
  /* functional template */
  const __vue_is_functional_template__$j = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$j = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$j, staticRenderFns: __vue_staticRenderFns__$j },
    __vue_inject_styles__$j,
    __vue_script__$j,
    __vue_scope_id__$j,
    __vue_is_functional_template__$j,
    __vue_module_identifier__$j,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$k = {
  name: "TableReadonly",
  props: {
    item: {
      type: Object,
      default: () => {
        return {};
      }
    },
    value: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    // 表头样式
    headerStyle() {
      const obj = {};
      obj.background = "#F7F8FB";
      obj.fontFamily = "PingFangSC-Semibold";
      obj.fontSize = "14px";
      obj.color = "#12182A";
      obj.fontWeight = "600";
      return obj;
    }
  }
};

/* script */
const __vue_script__$k = script$k;

/* template */
var __vue_render__$k = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "form-item-box",
      class: "quick-form-unqiue-" + _vm.item.key,
      style: _vm.item.style || {}
    },
    [
      _c(
        "el-table",
        {
          staticStyle: { width: "100%" },
          attrs: {
            data: _vm.value,
            border: "",
            "header-cell-style": _vm.headerStyle
          }
        },
        _vm._l(_vm.item.headerList, function(tableItem, index) {
          return _c("el-table-column", {
            key: index,
            attrs: {
              prop: tableItem.prop,
              label: tableItem.label,
              align: "center"
            }
          })
        }),
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$k = [];
__vue_render__$k._withStripped = true;

  /* style */
  const __vue_inject_styles__$k = function (inject) {
    if (!inject) return
    inject("data-v-f21ba698_0", { source: ".form-item-box[data-v-f21ba698] {\n  margin-bottom: 20px;\n}\n", map: {"version":3,"sources":["table_readonly.vue"],"names":[],"mappings":"AAAA;EACE,mBAAmB;AACrB","file":"table_readonly.vue","sourcesContent":[".form-item-box {\n  margin-bottom: 20px;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$k = "data-v-f21ba698";
  /* module identifier */
  const __vue_module_identifier__$k = undefined;
  /* functional template */
  const __vue_is_functional_template__$k = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$k = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$k, staticRenderFns: __vue_staticRenderFns__$k },
    __vue_inject_styles__$k,
    __vue_script__$k,
    __vue_scope_id__$k,
    __vue_is_functional_template__$k,
    __vue_module_identifier__$k,
    false,
    createInjector,
    undefined,
    undefined
  );

/**
 * Created by liuwei2016 on 2021/10/04.
 
 
 * 功能说明：
 * 公共表单组件
 */
const superType$1 = data => {
  const type = Object.prototype.toString.call(data).toLowerCase();
  return type.replace(/^\[object\s(\w+)\]$/, (...rest) => {
    return rest[1];
  });
};

var FormMixin$1 = {
  props: {
    // 全部表单元素禁用。通常用于提交时使用
    allDisabled: {
      type: Boolean,
      default: false
    },
    // 是否给表单显示border 外框，包含区块外侧有一个 boder，以及区块标题的灰色背景
    borderForm: {
      type: Boolean,
      default: true
    },
    // 文字模式。不显示表单组件，而是只显示纯文字内容
    // 同时，纯文本模式（即值为 true 的时候），会隐藏表单要素 label 左边的星号
    textModel: {
      type: Boolean,
      default: false
    },
    // 自定义表单每个要素的列。
    // 如果是 6 则为 一行 4 列，12 则为 1 行 2 列。
    // 优先级高于表单要素本身的设置
    // 如果为 0，则使用表单要素本身的设置
    formItemCol: {
      type: [Number, String],
      default: 12
    },
    // 左右模式或者上下模式。top 为上下，left/right 为左右（指左右时，label 是左对齐或右对齐）
    labelPosition: {
      type: String,
      default: "top"
    },
    // 左右模式时，label 的宽度
    labelWidth: {
      type: String,
      default: "160px"
    }
  },
  methods: {
    // 获取区块的样式
    getBlockClass(blockItem) {
      const c = blockItem.class;
      return Object.assign({}, c, {
        "block-item": this.borderForm
      });
    },

    // 获取 label
    getFormItemLabel(formItem) {
      if (
        this.textModel &&
        (this.labelPosition === "left" || this.labelPosition === "right")
      ) {
        return formItem.label + "：";
      }
      return formItem.label;
    },

    // 获取单个要素的列宽
    getColSize(item) {
      if (item.type === "child-form") {
        return 24;
      }

      // 要素为其他类型时，优先全局 size，再次是要素本身 size，再次是默认值 12，半行
      return item.span || this.formItemCol || item.size || 12;
    },
    deepCopy(origin) {
      const valueTypes = ["object", "array"]; // 后面可以支持下 map、set 等
      if (!valueTypes.includes(superType$1(origin))) {
        return "必须传入对象"; // 若不是对象则结束
      }
      const target = Array.isArray(origin) ? [] : {}; // 判别是数组还是对象
      for (const k in origin) {
        // 循环拷贝
        // origin.hasOwnProperty(k)
        // Object.prototype.hasOwnProperty.call
        // Object.hasOwnProperty
        if (Object.prototype.hasOwnProperty.call(origin, k)) {
          // 判断属性是否在对象自身上（非原型链上的父级属性）
          if (valueTypes.includes(superType$1(origin[k]))) {
            // 复杂类型，递归
            target[k] = this.deepCopy(origin[k]);
          } else {
            target[k] = origin[k];
          }
        }
      }
      return target;
    }
  }
};

//
const axios$1 = require("axios");

var script$l = {
  name: "ChildForm",
  mixins: [FormMixin$1],
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    val: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      }
    }
  },
  inject: [
    "changeData",
    "statusChangeFn",
    "dynamicDict",
    "dynamicSelectOption"
  ],
  watch: {
    // 这个是只有当 子表单 的值变化时才会触发的
    // 以下两个示例都会触发。注意，其他情况下不会触发
    // QuickForm.$set(QuickForm.formData, 'key',[{projectName:'12'}]);
    // QuickForm.$set(QuickForm.formData.testInput, '0',{projectName:'12'});
    value(oldVal, newVal) {
      // console.log('oldVal, newVal', oldVal === newVal);
      // 这里的逻辑存在比较难处理的情况：
      // 1. 预期：当初始化，value 为空数组或者不存在的时候，这里可以自动生成一个新行
      // 2. 预期：当编辑模式下，这里的值是后续加载的，期望 fields 可以和 value 进行同步（需要重置）
      // 3. 预期：正常模式下新增、删除行，fields 会随着 value 更新（不应当重置）
      if (!this.value || this.value.length === 0) {
        // this.childFormData = [];
        this.childFormFileds = [];
        this.addChildForm();
      } else {
        if (oldVal !== newVal) {
          // 值变化了，应当重置
          this.resetChildFormFileds();
        }
        // 不变化的情况下，不应该进行处理（push 和 splice 会是这种情况）
        // 该种情况下，childFormFileds 由各自的行为进行处理
      }
    }
  },
  mounted() {
    if (this.value && this.value instanceof Array && this.value.length > 0) {
      this.value.forEach(childFormData => {
        this.addChildForm(childFormData);
      });
    } else {
      this.addChildForm();
    }
    // 动态加载需要数据字典的选项
    this.loadDynamicSelectOptions();
  },
  data() {
    return {
      // 子表单的 fileds
      childFormFileds: [],

      // 收起列表
      foldList: [],

      // 子表单是可以独立收起的
      childFormHiddenList: [],
      childFormDisableList: [],

      // 传给子表单的表单元素的
      childChangeData: {
        formKey: this.item.key,
        // 更新其他数据
        updateFormData: this.updateFormData,
        valueUpdateEvent: this.valueUpdateEvent,
        // 设置为必填
        setElementRequired: this.setElementRequired
      }
    };
  },
  provide() {
    return {
      // 子组件收到这个变量后，将知道这个元素是子表单，
      // 因此在部分逻辑上执行时，和默认表单逻辑不通
      formItemType: "childForm",
      childChangeData: this.childChangeData
    };
  },
  methods: {
    // 监听值更新
    valueUpdateEvent() {
      // const data = this.getData();
      // console.log('data', data);
      // this.$emit('input', data);
    },

    // todo 这里的数据字典请求接口，应该最后合并到一起，由一个专门的数据字典请求管理器去请求，减低接口重复请求的情况
    loadDynamicSelectOptions() {
      const parentCodeList = [];
      // console.log('loadDynamicSelectOptions');
      // console.log(JSON.stringify(Object.keys(this.dynamicDict)));
      // 遍历传入的数据
      this.childFormFileds.forEach(fields => {
        if (fields && fields instanceof Array) {
          fields.forEach(field => {
            if (field.type === "dynamic-select" && field.parentKey) {
              // 再做一次去重判断。如果该字典已经在里面了，再跳过这一个
              if (parentCodeList.indexOf(field.parentKey) === -1) {
                if (!this.dynamicDict[field.parentKey]) {
                  parentCodeList.push(field.parentKey);
                  // 初始化一个数组
                  this.$set(this.dynamicDict, field.parentKey, []);
                }
              }
            }
            // 地区选择框，三级联动
            if (field.type === "area-select") {
              const firstParentKey = field.firstParentKey || "10020";
              const secondParentKey = field.firstParentKey || "10021";
              const thirdParentKey = field.firstParentKey || "10022";
              if (parentCodeList.indexOf(firstParentKey) === -1) {
                if (!this.dynamicDict[firstParentKey]) {
                  parentCodeList.push(firstParentKey);
                  this.$set(this.dynamicDict, firstParentKey, []);
                }
              }
              if (parentCodeList.indexOf(secondParentKey) === -1) {
                if (!this.dynamicDict[secondParentKey]) {
                  parentCodeList.push(secondParentKey);
                  this.$set(this.dynamicDict, secondParentKey, []);
                }
              }
              if (parentCodeList.indexOf(thirdParentKey) === -1) {
                if (!this.dynamicDict[thirdParentKey]) {
                  parentCodeList.push(thirdParentKey);
                  this.$set(this.dynamicDict, thirdParentKey, []);
                }
              }
            }
          });
        }
      });
      if (parentCodeList.length === 0) {
        return;
      }

      // 通过父 key 拿到所有元素
      let payload = null;
      if (this.dynamicSelectOption.queryKey) {
        payload = {
          [this.dynamicSelectOption.queryKey]: parentCodeList
        };
      } else {
        payload = parentCodeList;
      }
      // console.log('QuickForm 拉取动态字典');
      axios$1
        .post(this.dynamicSelectOption.dictUrl, payload)
        .then(res => {
          // 兼容性处理
          let data;
          // 这里判断是不是 axios 的默认返回数据（未经过请求拦截器处理的）
          if (res.request && res.headers) {
            data = res.data;
          } else {
            data = res;
          }
          if (data.code === 200) {
            if (data.data.length > 0) {
              // 因为可能多个地方同时调这个接口的原因，为了避免重复将内容添加到里面，所以，
              // 这里在赋值之前，需要先判断一下 parentCodeList 的每个值，其对应的 dynamicDict 里的哪一个数组，是否是空的
              // 如果不是空的，则将其置为空数组
              parentCodeList.forEach(pCode => {
                if (this.dynamicDict[pCode].length > 0) {
                  this.$set(this.dynamicDict, pCode, []);
                }
              });

              // 加载到结果
              data.data.forEach(item => {
                // 用每个返回值的 pCode 作为 key，将该项添加到数组里。
                // 注：之所以是数组，是因为之前已经初始化过了（parentKey 为 Code）
                const pCode = item[this.dynamicSelectOption.parentKey];
                this.dynamicDict[pCode].push(item);
              });
            }
          } else {
            this.$message.error(data.msg);
          }
        })
        .catch(() => {
          this.$message.error("数据字典加载错误，请刷新页面重试");
        });
    },

    // 添加一个子表单到 childFormFileds 最后
    addChildForm(childFormData) {
      // 禁用时禁止操作
      const { childrenForm } = this.item;
      // 插入 childFormFileds
      const filed = this.deepCopy(childrenForm);
      // 给每个 field 添加一个随机 id
      const randomId = (Math.random() * 100000000).toFixed(0);
      filed.randomId = randomId;
      this.childFormFileds.push(filed);

      // 默认禁用
      const defaultDisableList = [];
      // 默认隐藏
      const defaultHiddenList = [];
      // 给 value 插入一条
      const obj = {};
      childrenForm.forEach(child => {
        if (childFormData && child.key in childFormData) {
          obj[child.key] = childFormData[child.key];
        } else {
          obj[child.key] = child.defaultValue || "";
        }
        if (child.disableDefault) {
          defaultDisableList.push(child.key);
        }
        if (child.hiddenDefault) {
          defaultHiddenList.push(child.key);
        }
      });
      this.val.push(obj);

      const formKey = this.item.key;

      defaultDisableList.forEach(disableKey => {
        const keyText = `${formKey}_${randomId}_${disableKey}`;
        // this.statusChangeFn.setElementHidden(keyText, false);
        this.statusChangeFn.setElementDisable(keyText);
      });
      defaultHiddenList.forEach(disableKey => {
        const keyText = `${formKey}_${randomId}_${disableKey}`;
        this.statusChangeFn.setElementHidden(keyText);
      });
    },

    // 表单组件是否显示
    isShow(item, randomId) {
      // 如果是子表单里的元素的话，采用三段匹配
      const formKey = this.item.key;
      // const randomId = item.randomId;
      const key = item.key;
      const keyText = `${formKey}_${randomId}_${key}`;
      // console.log('isShow', keyText);
      // 如果该要素在隐藏列表里，则不显示
      if (this.changeData.hiddenKeyList.indexOf(keyText) > -1) {
        return false;
      }
      return true;
    },

    // 对一个 block 下的要素，进行 el-row 的分行
    getFieldRow(children, randomId) {
      // 一个二维数组，每个数组要素是 el-row 的一行
      const list = [];
      if (!children) {
        return list;
      }
      children.forEach(item => {
        // 如果当前要素不显示，则直接跳过
        if (!this.isShow(item, randomId)) {
          return;
        }
        const currentSpan = this.getColSize(item);
        // 如果初始为空
        if (list.length === 0) {
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: Object.assign({}, item, {
              randomId
            })
          };
          list.push([obj]);
          return;
        }
        // 如果初始不为空，
        // 1、判断有没有打开 （当前这个的）【默认在新行第一列】开关
        // 又或者是当前是不是子表单（item.type === 'child-form'表示是子表单）
        if (item.nextRowFirst || item.type === "child-form") {
          // 如果是新行第一列，那么直接把这个添加到 list 里面
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: Object.assign({}, item, {
              randomId
            })
          };
          list.push([obj]);
          return;
        }
        // 2、判断（上一个）【默认是本行最后一列】开关是否打开
        // 先拿到最后一行
        const listLastItem = list[list.length - 1];
        // 的最后一个是否打开了这个开关
        if (listLastItem[listLastItem.length - 1].rowItem.currentRowLast) {
          // 如果打开这个开关，那么当前这个直接放到下一行的第一个
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: Object.assign({}, item, {
              randomId
            })
          };
          list.push([obj]);
          return;
        }

        // 下拉正常计算 span 来决定是否换行
        // 那么计算 list 最后一个数组里面所有加起来的 span 的值
        const lastTotalSpan = list[list.length - 1]
          .map(item => item.span)
          .reduce((lastTotal, currentItem) => {
            return lastTotal + currentItem;
          });

        // 如果已经大于等于 24 了，说明满了一行，那么直接创建新行
        // 或者是当前这个加之前的大于 24，那么说明这个放在之前那行超过 24，所以也要放到新行去
        if (lastTotalSpan >= 24 || lastTotalSpan + currentSpan > 24) {
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: Object.assign({}, item, {
              randomId
            })
          };
          list.push([obj]);
          return;
        } else {
          // 此时说明当前这个可以放到之前哪一行
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: Object.assign({}, item, {
              randomId
            })
          };
          list[list.length - 1].push(obj);
        }
      });
      return list;
    },

    // 更新数据
    updateFormData(data, randomId) {
      let index = -1;
      this.childFormFileds.forEach((item, i) => {
        if (item.randomId === randomId) {
          index = i;
        }
      });

      Object.keys(data).forEach(key => {
        // 如果 key 在值里面
        if (key in this.value[index]) {
          // 则回填这个值
          this.$set(this.value[index], key, data[key]);
        }
      });
    },

    // 设置某个要素必填
    // key：操作的 key
    // randomId：该子表单的随机 id
    // beHidden：必填，默认是 true，表示隐藏。而 false，表示取消隐藏
    setElementRequired(key, randomId, beRequired = true) {
      // 先获取
      const currentField = this.childFormFileds.filter(
        item => item.randomId === randomId
      )[0];

      // 设置必填
      if (beRequired) {
        // 先找到这个要素，如果其本身必填，则跳过。
        // 遍历传入的数据
        if (currentField && currentField instanceof Array) {
          currentField.forEach(field => {
            // 如果 key 不匹配，则跳过
            if (field.key !== key) {
              return;
            }
            // 先判断有没有 rules 这个属性，没有则添加这个属性，并且添加必填项然后返回
            if (!field.rules) {
              this.$set(field, "rules", [
                {
                  required: true,
                  message: "请输入",
                  trigger: ["blur", "change"]
                }
              ]);
              return;
            }

            // 遍历 其 rules，
            const { rules } = field;
            // 是否有 required 这条规则
            let haveRequired = false;
            // 是否已修改
            let changed = false;
            rules.forEach(rule => {
              // 如果有 required 属性
              if ("required" in rule) {
                haveRequired = true;
                // 如果值为 true，则跳过
                if (rule.required) {
                  return;
                } else {
                  // 否则修改其为 true
                  rule.required = true;
                  changed = true;
                }
              }
            });
            // 如果已修改，那么说明没必要继续操作了，跳过
            if (changed) {
              return;
            }
            // 如果没修改，并且没有必填规则
            // （注意，如果有规则，那么必然已修改。所以只存在有规则已修改、未修改有规则、未修改无规则三种情况）
            if (!haveRequired) {
              // 添加规则
              rules.push({
                required: true,
                message: "请输入",
                trigger: ["blur", "change"]
              });
            }
          });
        }
      } else {
        // 取消必填
        // 不含必填规则的话，则跳过。如果含必填规则，则添加
        if (currentField && currentField instanceof Array) {
          currentField.forEach(field => {
            // 如果 key 不匹配，则跳过
            if (field.key !== key) {
              return;
            }

            // 先判断有没有 rules 这个属性，没有则添加这个属性，并且添加必填项然后返回
            if (!field.rules) {
              return;
            }
            // 如果有，则遍历并删除
            let i = -1;
            field.rules.forEach((rule, index) => {
              if ("required" in rule) {
                i = index;
              }
            });
            if (i !== -1) {
              field.rules.splice(i, 1);
            }
          });
        }
      }
    },

    // 执行校验
    validateForm() {
      return new Promise((resolve, reject) => {
        Promise.all(this.$refs.form.map(form => this.validateItem(form)))
          .then(resolve)
          .catch(reject);
      });
    },

    // 校验单个表单
    validateItem(form) {
      return new Promise((resolve, reject) => {
        form.validate(isPass => {
          if (isPass) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },

    // 收起/展开表单
    flodChildField(randomId) {
      const i = this.foldList.indexOf(randomId);
      if (i > -1) {
        this.foldList.splice(i, 1);
      } else {
        this.foldList.push(randomId);
      }
    },

    // 某个子表单删除时调用
    deleteChildForm(randomId) {
      // 禁用时禁止操作
      if (this.allDisabled) {
        return;
      }
      let i = -1;
      this.childFormFileds.forEach((field, index) => {
        if (field.randomId === randomId) {
          i = index;
          // 还要记得删除父组件里，disableList，hiddenKeyList
          field.forEach(fieldFormItem => {
            const formKey = this.item.key;
            const key = fieldFormItem.key;
            const keyText = `${formKey}_${randomId}_${key}`;
            this.statusChangeFn.setElementHidden(keyText, false);
            this.statusChangeFn.setElementDisable(keyText, false);
          });
        }
      });

      this.childFormFileds.splice(i, 1);
      this.val.splice(i, 1);
      this.valueUpdateEvent();

      if (this.val.length === 0) {
        this.addChildForm();
      }
    },

    // 重置子表单结构
    // 注意：这会导致 禁用、隐藏的 元素消失
    resetChildFormFileds() {
      const { childrenForm } = this.item;

      this.childFormFileds = [];
      // 这里的目的是为了生成 fields
      this.value.forEach(() => {
        const filed = this.deepCopy(childrenForm);
        // 给每个 field 添加一个随机 id
        const randomId = (Math.random() * 100000000).toFixed(0);
        filed.randomId = randomId;
        this.childFormFileds.push(filed);
      });
    },

    // 重置内容（子表单数量不变）
    resetFields() {
      const { childrenForm } = this.item;
      const obj = {};

      childrenForm.forEach(child => {
        obj[child.key] = child.defaultValue || "";
      });
      this.value.forEach(item => {
        Object.keys(item).forEach(k => {
          this.$set(item, k, obj[k]);
          item[k] = obj[k];
        });
      });
    },

    getProps(rowItem) {
      return {
        item: rowItem,
        allDisabled: this.allDisabled
      };
    }
  },
  components: {
    FormInput: __vue_component__,
    FormDictSelect: __vue_component__$2,
    FormDate: __vue_component__$6,
    FormHourMinute: __vue_component__$8,
    FormDateRange: __vue_component__$9,
    FormNumberInput: __vue_component__$c,
    FormAutoComplete: __vue_component__$b,
    FormRadio: __vue_component__$d,
    FormTextarea: __vue_component__$1,
    FormNormalSelect: __vue_component__$3,
    FormMutipleSelect: __vue_component__$5,
    FormMoneyInput: __vue_component__$f,
    FormRateInput: __vue_component__$g,
    FormMulLinkage: __vue_component__$i,
    FormNormalNumberInput: __vue_component__$j
  }
};

/* script */
const __vue_script__$l = script$l;

/* template */
var __vue_render__$l = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "child-form-container" },
    [
      _vm._l(_vm.childFormFileds, function(childField, index) {
        return _c("div", { key: index, staticClass: "child-form" }, [
          _c("div", { staticClass: "child-form-head" }, [
            _vm._v(
              "\n      " +
                _vm._s(_vm.item.headerLabel) +
                _vm._s(index + 1) +
                "\n      "
            ),
            _vm.foldList.indexOf(childField.randomId) === -1
              ? _c(
                  "svg",
                  {
                    staticClass: "cfh-flod",
                    attrs: {
                      viewBox: "0 0 16 8",
                      version: "1.1",
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "16",
                      height: "8"
                    },
                    on: {
                      click: function() {
                        return _vm.flodChildField(childField.randomId)
                      }
                    }
                  },
                  [
                    _c("path", {
                      attrs: { d: "M0 0 L16 0 L8 8 Z", fill: "#777B88" }
                    })
                  ]
                )
              : _vm._e(),
            _vm._v(" "),
            _vm.foldList.indexOf(childField.randomId) > -1
              ? _c(
                  "svg",
                  {
                    staticClass: "cfh-unflod",
                    attrs: {
                      viewBox: "0 0 16 8",
                      version: "1.1",
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "16",
                      height: "8"
                    },
                    on: {
                      click: function() {
                        return _vm.flodChildField(childField.randomId)
                      }
                    }
                  },
                  [
                    _c("path", {
                      attrs: { d: "M0 8 L16 8 L8 0 Z", fill: "#777B88" }
                    })
                  ]
                )
              : _vm._e(),
            _vm._v(" "),
            !_vm.textModel
              ? _c(
                  "div",
                  {
                    staticClass: "cfh-del",
                    on: {
                      click: function() {
                        return _vm.allDisabled
                          ? ""
                          : _vm.deleteChildForm(childField.randomId)
                      }
                    }
                  },
                  [
                    _c("img", {
                      staticClass: "cfh-del-btn",
                      attrs: {
                        src:
                          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAxUlEQVR42uWSsQ0CMQxFbwYKJmAGmAI2oENsglgg9onEUFBSxLkOalo6pkCIGeB+ER0KKEeRjkhfsvxffhwlVfHF22ZGVs/k9PIu9OD1BhjnH+yUWy0TMbyvm0SOA5awAGisf7LzqzQAPXiowWJPd+ouTMj6G1m9Y9ycwICtRcfJ6LqB8hfsuKxB0oyM6Dx6qNH7OQD3xLjRQ43ePwWQhClZ1eihRi/lyj4jubAm568YNScwYD8C6v1p2JqHvp8IBmxVar0AUiAwjfTBZFwAAAAASUVORK5CYII="
                      }
                    }),
                    _vm._v(" "),
                    _c("span", { staticClass: "cfh-del-text" }, [
                      _vm._v("删除")
                    ])
                  ]
                )
              : _vm._e()
          ]),
          _vm._v(" "),
          _c(
            "div",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.foldList.indexOf(childField.randomId) === -1,
                  expression: "foldList.indexOf(childField.randomId) === -1"
                }
              ],
              staticClass: "child-form-body"
            },
            [
              _c(
                "el-form",
                {
                  ref: "form",
                  refInFor: true,
                  attrs: {
                    model: _vm.val[index],
                    "hide-required-asterisk": _vm.textModel,
                    "label-width": _vm.labelWidth || "130px",
                    "label-position": _vm.labelPosition
                      ? _vm.labelPosition
                      : "top"
                  }
                },
                [
                  _vm._l(
                    _vm.getFieldRow(childField, childField.randomId),
                    function(row, rowIndex) {
                      var _obj;
                      return [
                        _c(
                          "el-row",
                          {
                            key: rowIndex,
                            staticClass: "block-content",
                            class:
                              ((_obj = {}),
                              (_obj[childField.randomId] = true),
                              _obj),
                            attrs: { gutter: 20 }
                          },
                          [
                            _vm._l(row, function(ref) {
                              var rowItem = ref.rowItem;
                              return [
                                _c(
                                  "div",
                                  { key: rowItem.key },
                                  [
                                    _c(
                                      "el-col",
                                      {
                                        key: rowItem.key,
                                        style: rowItem.style || {},
                                        attrs: { span: _vm.getColSize(rowItem) }
                                      },
                                      [
                                        rowItem.type !== "child-form"
                                          ? _c(
                                              "el-form-item",
                                              {
                                                class: rowItem.class,
                                                style: rowItem.style,
                                                attrs: {
                                                  rules: rowItem.rules,
                                                  label: _vm.getFormItemLabel(
                                                    rowItem
                                                  ),
                                                  prop: rowItem.key
                                                }
                                              },
                                              [
                                                rowItem.type === "input"
                                                  ? _c(
                                                      "FormInput",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "date-input"
                                                  ? _c(
                                                      "FormDate",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormDate",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "hour-minute-input"
                                                  ? _c(
                                                      "FormHourMinute",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormHourMinute",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "date-range-input"
                                                  ? _c(
                                                      "FormDateRange",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormDateRange",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "dynamic-select"
                                                  ? _c(
                                                      "FormDictSelect",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormDictSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "normal-select"
                                                  ? _c(
                                                      "FormNormalSelect",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormNormalSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "mutiple-select"
                                                  ? _c(
                                                      "FormMutipleSelect",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormMutipleSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "number-input"
                                                  ? _c(
                                                      "FormNumberInput",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormNumberInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "auto-complete-input"
                                                  ? _c(
                                                      "FormAutoComplete",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormAutoComplete",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "radio"
                                                  ? _c(
                                                      "FormRadio",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormRadio",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "textarea"
                                                  ? _c(
                                                      "FormTextarea",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormTextarea",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "money-input"
                                                  ? _c(
                                                      "FormMoneyInput",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormMoneyInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "rate-input"
                                                  ? _c(
                                                      "FormRateInput",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[index][
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val[index],
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[index][rowItem.key]"
                                                          }
                                                        },
                                                        "FormRateInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "mul-linkage"
                                                  ? _c(
                                                      "FormMulLinkage",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[rowItem.key]"
                                                          }
                                                        },
                                                        "FormMulLinkage",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "normal-number"
                                                  ? _c(
                                                      "FormNormalNumberInput",
                                                      _vm._b(
                                                        {
                                                          attrs: {
                                                            "random-id":
                                                              childField.randomId
                                                          },
                                                          model: {
                                                            value:
                                                              _vm.val[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.val,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "val[rowItem.key]"
                                                          }
                                                        },
                                                        "FormNormalNumberInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e()
                                              ],
                                              1
                                            )
                                          : _vm._e()
                                      ],
                                      1
                                    )
                                  ],
                                  1
                                )
                              ]
                            })
                          ],
                          2
                        )
                      ]
                    }
                  )
                ],
                2
              )
            ],
            1
          )
        ])
      }),
      _vm._v(" "),
      !_vm.textModel
        ? _c(
            "div",
            {
              staticClass: "child-form-add-btn",
              on: {
                click: function() {
                  return _vm.allDisabled ? "" : _vm.addChildForm()
                }
              }
            },
            [_vm._v("\n    ＋ " + _vm._s(_vm.item.headerLabel) + "\n  ")]
          )
        : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__$l = [];
__vue_render__$l._withStripped = true;

  /* style */
  const __vue_inject_styles__$l = function (inject) {
    if (!inject) return
    inject("data-v-40b8082a_0", { source: ".child-form-container[data-v-40b8082a] {\n  width: 100%;\n}\n.child-form-container .child-form[data-v-40b8082a] {\n  background: #f8f9fb;\n  border-radius: 4px;\n  margin-bottom: 24px;\n}\n.child-form-container .child-form .child-form-head[data-v-40b8082a] {\n  position: relative;\n  height: 44px;\n  line-height: 44px;\n  text-align: left;\n  padding: 0 20px;\n  font-size: 14px;\n  color: #3a4566;\n  border-bottom: 1px solid #e7e8eb;\n  font-weight: 500;\n}\n.child-form-container .child-form .child-form-head .cfh-flod[data-v-40b8082a],\n.child-form-container .child-form .child-form-head .cfh-unflod[data-v-40b8082a] {\n  position: absolute;\n  top: 16px;\n  right: 20px;\n  width: 12px;\n  height: 6px;\n  cursor: pointer;\n  user-select: none;\n}\n.child-form-container .child-form .child-form-head .cfh-del[data-v-40b8082a] {\n  position: absolute;\n  top: 0;\n  right: 60px;\n  height: 40px;\n  line-height: 40px;\n  cursor: pointer;\n  user-select: none;\n}\n.child-form-container .child-form .child-form-head .cfh-del .cfh-del-btn[data-v-40b8082a] {\n  position: relative;\n  height: 16px;\n  width: 16px;\n  margin-top: 12px;\n  vertical-align: top;\n}\n.child-form-container .child-form .child-form-head .cfh-del .cfh-del-text[data-v-40b8082a] {\n  display: inline-block;\n  position: relative;\n  height: 40px;\n  line-height: 40px;\n  vertical-align: top;\n  font-size: 14px;\n  color: #949aae;\n  font-weight: 400;\n}\n.child-form-container .child-form .child-form-body[data-v-40b8082a] {\n  padding: 0 20px;\n}\n.child-form-container .child-form-add-btn[data-v-40b8082a] {\n  position: relative;\n  width: 100%;\n  height: 40px;\n  line-height: 40px;\n  background: #fbfcfd;\n  border: 1px dashed #abb3cc;\n  border-radius: 4px;\n  text-align: center;\n  font-size: 14px;\n  color: #12182a;\n  cursor: pointer;\n}\n", map: {"version":3,"sources":["child_form.vue"],"names":[],"mappings":"AAAA;EACE,WAAW;AACb;AACA;EACE,mBAAmB;EACnB,kBAAkB;EAClB,mBAAmB;AACrB;AACA;EACE,kBAAkB;EAClB,YAAY;EACZ,iBAAiB;EACjB,gBAAgB;EAChB,eAAe;EACf,eAAe;EACf,cAAc;EACd,gCAAgC;EAChC,gBAAgB;AAClB;AACA;;EAEE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,WAAW;EACX,WAAW;EACX,eAAe;EACf,iBAAiB;AACnB;AACA;EACE,kBAAkB;EAClB,MAAM;EACN,WAAW;EACX,YAAY;EACZ,iBAAiB;EACjB,eAAe;EACf,iBAAiB;AACnB;AACA;EACE,kBAAkB;EAClB,YAAY;EACZ,WAAW;EACX,gBAAgB;EAChB,mBAAmB;AACrB;AACA;EACE,qBAAqB;EACrB,kBAAkB;EAClB,YAAY;EACZ,iBAAiB;EACjB,mBAAmB;EACnB,eAAe;EACf,cAAc;EACd,gBAAgB;AAClB;AACA;EACE,eAAe;AACjB;AACA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;EACZ,iBAAiB;EACjB,mBAAmB;EACnB,0BAA0B;EAC1B,kBAAkB;EAClB,kBAAkB;EAClB,eAAe;EACf,cAAc;EACd,eAAe;AACjB","file":"child_form.vue","sourcesContent":[".child-form-container {\n  width: 100%;\n}\n.child-form-container .child-form {\n  background: #f8f9fb;\n  border-radius: 4px;\n  margin-bottom: 24px;\n}\n.child-form-container .child-form .child-form-head {\n  position: relative;\n  height: 44px;\n  line-height: 44px;\n  text-align: left;\n  padding: 0 20px;\n  font-size: 14px;\n  color: #3a4566;\n  border-bottom: 1px solid #e7e8eb;\n  font-weight: 500;\n}\n.child-form-container .child-form .child-form-head .cfh-flod,\n.child-form-container .child-form .child-form-head .cfh-unflod {\n  position: absolute;\n  top: 16px;\n  right: 20px;\n  width: 12px;\n  height: 6px;\n  cursor: pointer;\n  user-select: none;\n}\n.child-form-container .child-form .child-form-head .cfh-del {\n  position: absolute;\n  top: 0;\n  right: 60px;\n  height: 40px;\n  line-height: 40px;\n  cursor: pointer;\n  user-select: none;\n}\n.child-form-container .child-form .child-form-head .cfh-del .cfh-del-btn {\n  position: relative;\n  height: 16px;\n  width: 16px;\n  margin-top: 12px;\n  vertical-align: top;\n}\n.child-form-container .child-form .child-form-head .cfh-del .cfh-del-text {\n  display: inline-block;\n  position: relative;\n  height: 40px;\n  line-height: 40px;\n  vertical-align: top;\n  font-size: 14px;\n  color: #949aae;\n  font-weight: 400;\n}\n.child-form-container .child-form .child-form-body {\n  padding: 0 20px;\n}\n.child-form-container .child-form-add-btn {\n  position: relative;\n  width: 100%;\n  height: 40px;\n  line-height: 40px;\n  background: #fbfcfd;\n  border: 1px dashed #abb3cc;\n  border-radius: 4px;\n  text-align: center;\n  font-size: 14px;\n  color: #12182a;\n  cursor: pointer;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$l = "data-v-40b8082a";
  /* module identifier */
  const __vue_module_identifier__$l = undefined;
  /* functional template */
  const __vue_is_functional_template__$l = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$l = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$l, staticRenderFns: __vue_staticRenderFns__$l },
    __vue_inject_styles__$l,
    __vue_script__$l,
    __vue_scope_id__$l,
    __vue_is_functional_template__$l,
    __vue_module_identifier__$l,
    false,
    createInjector,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const axios$2 = require("axios");

var script$m = {
  name: "ElQuickForm",
  mixins: [FormMixin$1],
  components: {
    FormInput: __vue_component__,
    FormDictSelect: __vue_component__$2,
    FormDate: __vue_component__$6,
    FormDateTime: __vue_component__$7,
    FormHourMinute: __vue_component__$8,
    FormDateRange: __vue_component__$9,
    FormDateTimeRange: __vue_component__$a,
    FormNumberInput: __vue_component__$c,
    FormAutoComplete: __vue_component__$b,
    FormRadio: __vue_component__$d,
    FormCheckbox: __vue_component__$e,
    FormTextarea: __vue_component__$1,
    FormNormalSelect: __vue_component__$3,
    FormTreeSelect: __vue_component__$4,
    FormMutipleSelect: __vue_component__$5,
    FormMoneyInput: __vue_component__$f,
    FormRateInput: __vue_component__$g,
    FormAreaSelect: __vue_component__$h,
    FormMulLinkage: __vue_component__$i,
    FormNormalNumberInput: __vue_component__$j,
    TableReadonly: __vue_component__$k,
    ChildForm: __vue_component__$l
  },
  props: {
    mode: {
      // 表单模式 tableQuery 为查询模式 只有一个children区块， bigForm 大表单
      type: String,
      default: "tableQuery" //"dialogForm , tableQuery, bigForm"
    },
    fields: {
      type: Array,
      default: () => {
        return [];
      }
    },
    value: {
      type: Object,
      default: () => {
        return {};
      }
    },
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // 是否显示收起、展开按钮
    showFoldBtn: {
      type: Boolean,
      default: false
    },
    // item 的规则 size mini large
    formItemSize: {
      type: String,
      default: "mini"
    },
    // 是否显示 全部收起、展开按钮
    showAllFoldBtn: {
      type: Boolean,
      default: false
    },
    // 是否显示浏览模式切换按钮
    showScanTypeBtn: {
      type: Boolean,
      default: false
    },
    defaultShowRows: {
      //表格查询展示的行数
      type: Number,
      default: 3
    },
    showRowsFold: {
      //表格查询表单展示的行数
      type: Boolean,
      default: true
    }
    // 数据字典的配置
  },
  data() {
    return {
      // data: {},
      formData: {},

      currentFileds: [], // 中间态数据，依赖于 fields。当 fields 改变时，这个会跟着一起变。

      // 动态下拉列表里，所有选项。本对象的属性 key 是字典的父 key，值是数组，数组元素是对应的父 key 下所有字典
      dynamicDict: {},

      changeData: {
        // 所有动态数据，更准确的说，是会重新赋值的，需要放到 data 里，才能实现响应式。这是因为 provide 本身的特性导致的
        // 被禁用的所有元素列表。这里的数组元素是该要素的 key。
        disableList: [],
        allDisabled: this.allDisabled,

        // 隐藏的要素列表。这里的数组元素是该要素的 key。
        // 隐藏的要素，不进行校验。提交的时候，也要过滤掉
        hiddenKeyList: [],
        textModel: this.textModel
      },

      customItemList: [], //自定义的组件规则key

      foldBlockList: [], // 收起的区块（放在这个里面，该区块就只显示区块标题，不显示内容）

      scanType: "normal", // normal 默认（大表单），single（表单只显示单个区块，上方显示所有区块的按钮组）
      singleScanBlock: "", // 单个模式时，显示哪个表单
      tableQueryshowRows: 3, //表格模式下展示的行数
      allRowsLenth: 3, //所有的行数
      version: "1.1.0"
    };
  },
  computed: {
    tableQueryFoldStatus() {
      let result = false;
      if (this.tableQueryshowRows < this.allRowsLenth) {
        result = true;
      }
      return result;
    }
  },
  created() {
    this.currentFileds = this.fields;
    // this.data = this.value;
    this.initFormData();
    // 加载初始情况下，默认禁用的要素
    this.getDefaultDisableList();
    // 默认隐藏
    this.getDefaultHiddenList();
    // 获取自定义组件要素
    this.getCustomItemList();
    // 动态加载需要数据字典的选项
    this.loadDynamicSelectOptions();
    this.initStatus(); //初始状态
    this.initMode(); //初始模式配置

    // 理论上，不应该动态添加 fileds。尽量 fields 通过事件，内部控制自己是否显示
    this.$watch("fields", v => {
      console.log(
        "理论上，不应该动态添加 fileds。尽量 fields 通过事件，内部控制自己是否显示"
      );
      this.currentFileds = [];
      this.$nextTick(() => {
        this.currentFileds = v;
        this.getDefaultDisableList();
        this.getDefaultHiddenList();
        this.getCustomItemList();
        this.loadDynamicSelectOptions();
        this.initFormData();
        this.initStatus();
        this.initMode();
      });
    });

    this.$watch("data", () => {
      this.initFormData();
      console.log('this.$watch("data"', this.data);
      this.initStatus();
    });
  },
  provide() {
    return {
      dynamicSelectOption: this.dynamicSelectOption,
      dynamicDict: this.dynamicDict,
      // 状态切换函数
      statusChangeFn: {
        // 设置为禁用
        setElementDisable: this.setElementDisable,
        // 设置为隐藏
        setElementHidden: this.setElementHidden,
        // 设置为必填
        setElementRequired: this.setElementRequired,
        // 更新其他数据
        updateFormData: this.updateFormData,
        valueUpdateEvent: this.valueUpdateEvent
      },
      // 会动态变化的数据（注意，来自 props【更上级组件】的数据，不能放这个里面，只能显式的通过 props 往下面传）
      changeData: this.changeData,
      formItemType: "",
      childChangeData: {}
    };
  },
  watch: {
    textModel(n) {
      this.$set(this.changeData, "textModel", n);
    },
    formData: {
      handler: function(val) {
        this.$emit("input", val);
      },
      deep: true
    }
  },
  methods: {
    initMode() {
      //针对表单模式 进行初始设置
      if (this.mode === "tableQuery") {
        this.allRowsLenth = this.getFieldRow(
          this.currentFileds[0].children
        ).length;
        console.log(" this.allRowsLenth ", this.allRowsLenth);
        this.tableQueryshowRows = Number(this.defaultShowRows);
      }
    },
    //
    toggleShow() {
      if (this.tableQueryshowRows < this.allRowsLenth) {
        this.tableQueryshowRows = this.allRowsLenth;
      } else {
        this.tableQueryshowRows = this.defaultShowRows;
      }
    },
    // 监听值更新
    valueUpdateEvent(params) {
      this.$emit("updateValue", params);
    },

    // 初始化 formData 的值
    initFormData() {
      this.$set(this, "formData", {});
      // console.log('initFormData');
      // 用 fileds 初始化 formData 的 key
      this.fields.forEach(fields => {
        if (fields.children && fields.children instanceof Array) {
          fields.children.forEach(field => {
            // 处理初始值的问题
            // 1. 如果该值在 data 里，则直接取 data 里的值（面对场景：数值回显）
            if (field.key in this.data) {
              this.$set(this.formData, field.key, this.data[field.key]);
              // 赋值默认值的时候，触发事件通知上级
              this.valueUpdateEvent({
                [field.key]: this.data[field.key]
              });
            } else {
              // 2. 不需要回显的场景下
              // 2.1 如果该要素有默认值，则使用默认值
              if (field.defaultValue) {
                this.$set(this.formData, field.key, field.defaultValue);
                // 赋值默认值的时候，触发事件通知上级
                this.valueUpdateEvent({
                  [field.key]: field.defaultValue
                });
              } else {
                // 2.2 该要素没有默认值，使用通用默认值
                if (
                  field.type === "child-form" ||
                  field.type === "checkbox" ||
                  field.type === "mutiple-select" ||
                  field.type === "table-readonly"
                ) {
                  this.$set(this.formData, field.key, []);
                } else if (field.type === "area-select") {
                  this.$set(this.formData, field.key, ["", "", ""]);
                } else {
                  this.$set(this.formData, field.key, "");
                }
              }
            }
          });
        }
      });
    },

    // 获取初始情况下，所有默认禁用要素
    getDefaultDisableList() {
      const disableList = [];
      // 遍历传入的数据
      this.fields.forEach(fields => {
        if (fields.children && fields.children instanceof Array) {
          fields.children.forEach(field => {
            // 如果是true，则添加到禁用列表里
            if (field.disableDefault) {
              disableList.push(field.key);
            }
          });
        }
      });

      this.changeData.disableList = disableList;
    },
    // 获取初始情况下，所有自定义的组件要素
    getCustomItemList() {
      const customItemList = [];
      // 遍历传入的数据
      this.fields.forEach(fields => {
        if (fields.children && fields.children instanceof Array) {
          fields.children.forEach(field => {
            // 如果是true，则添加到禁用列表里
            if (field.type === "component") {
              customItemList.push(field.key);
            }
          });
        }
      });

      this.customItemList = customItemList;
    },

    // 默认隐藏
    getDefaultHiddenList() {
      const hiddenList = [];
      // 遍历传入的数据
      this.fields.forEach(fields => {
        if (fields.children && fields.children instanceof Array) {
          fields.children.forEach(field => {
            // 如果是true，则添加到禁用列表里
            if (field.hiddenDefault) {
              hiddenList.push(field.key);
            }
          });
        }
      });

      this.changeData.hiddenKeyList = hiddenList;
    },

    // 对一个 block 下的要素，进行 el-row 的分行
    getFieldRow(children) {
      // 一个二维数组，每个数组要素是 el-row 的一行
      const list = [];
      if (!children) {
        return list;
      }
      children.forEach(item => {
        // 如果当前要素不显示，则直接跳过
        if (!this.isShow(item)) {
          return;
        }
        const currentSpan = this.getColSize(item);
        // 如果初始为空
        if (list.length === 0) {
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: item
          };
          list.push([obj]);
          return;
        }
        // 如果初始不为空，
        // 1、判断有没有打开 （当前这个的）【默认在新行第一列】开关
        // 又或者是当前是不是子表单（item.type === 'child-form'表示是子表单）
        if (
          item.nextRowFirst ||
          item.type === "child-form" ||
          item.type === "table-readonly"
        ) {
          // 如果是新行第一列，那么直接把这个添加到 list 里面
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: item
          };
          list.push([obj]);
          return;
        }
        // 2、判断（上一个）【默认是本行最后一列】开关是否打开
        // 先拿到最后一行
        const listLastItem = list[list.length - 1];
        // 的最后一个是否打开了这个开关
        if (listLastItem[listLastItem.length - 1].rowItem.currentRowLast) {
          // 如果打开这个开关，那么当前这个直接放到下一行的第一个
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: item
          };
          list.push([obj]);
          return;
        }

        // 下拉正常计算 span 来决定是否换行
        // 那么计算 list 最后一个数组里面所有加起来的 span 的值
        const lastTotalSpan = list[list.length - 1]
          .map(item => item.span)
          .reduce((lastTotal, currentItem) => {
            return lastTotal + currentItem;
          });

        // 如果已经大于等于 24 了，说明满了一行，那么直接创建新行
        // 或者是当前这个加之前的大于 24，那么说明这个放在之前那行超过 24，所以也要放到新行去
        if (lastTotalSpan >= 24 || lastTotalSpan + currentSpan > 24) {
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: item
          };
          list.push([obj]);
          return;
        } else {
          // 此时说明当前这个可以放到之前哪一行
          const obj = {
            // 获取到他有多少 span，满 24 为一行
            span: currentSpan,
            rowItem: item
          };
          list[list.length - 1].push(obj);
        }
      });
      // console.log("getFieldRow result ", list);
      return list;
    },

    // 设置某个要素禁用
    // key：操作的 key
    // beDisable：必填，默认是 true，表示禁用。而 false，表示取消禁用
    setElementDisable(key, beDisable = true) {
      // 设置禁用
      if (beDisable) {
        // 已经禁用了，则跳过。否则则添加进去
        if (this.changeData.disableList.indexOf(key) === -1) {
          this.changeData.disableList.push(key);
        }
      } else {
        // 取消禁用
        // 未禁用则跳过。已经禁用，则继续
        const index = this.changeData.disableList.indexOf(key);
        if (index > -1) {
          this.changeData.disableList = [
            ...this.changeData.disableList.slice(0, index),
            ...this.changeData.disableList.slice(index + 1)
          ];
        }
      }
    },

    // 设置某个要素隐藏
    // key：操作的 key
    // beHidden：必填，默认是 true，表示隐藏。而 false，表示取消隐藏
    setElementHidden(key, beHidden = true) {
      // 设置隐藏
      if (beHidden) {
        // 已经禁用了，则跳过。否则则添加进去
        if (this.changeData.hiddenKeyList.indexOf(key) === -1) {
          this.changeData.hiddenKeyList.push(key);
        }
      } else {
        // 取消禁用
        // 未禁用则跳过。已经禁用，则继续
        const index = this.changeData.hiddenKeyList.indexOf(key);
        if (index > -1) {
          this.changeData.hiddenKeyList = [
            ...this.changeData.hiddenKeyList.slice(0, index),
            ...this.changeData.hiddenKeyList.slice(index + 1)
          ];
        }
      }
    },

    // 设置某个要素必填
    // key：操作的 key
    // beHidden：必填，默认是 true，表示隐藏。而 false，表示取消隐藏
    setElementRequired(key, beRequired = true) {
      // 设置必填
      if (beRequired) {
        // 先找到这个要素，如果其本身必填，则跳过。
        // 遍历传入的数据
        this.fields.forEach(fields => {
          if (fields.children && fields.children instanceof Array) {
            fields.children.forEach(field => {
              // 如果 key 不匹配，则跳过
              if (field.key !== key) {
                return;
              }
              // 先判断有没有 rules 这个属性，没有则添加这个属性，并且添加必填项然后返回
              if (!field.rules) {
                this.$set(field, "rules", [
                  {
                    required: true,
                    message: "请输入",
                    trigger: ["blur", "change"]
                  }
                ]);
                return;
              }

              // 遍历 其 rules，
              const { rules } = field;
              // 是否有 required 这条规则
              let haveRequired = false;
              // 是否已修改
              let changed = false;
              rules.forEach(rule => {
                // 如果有 required 属性
                if ("required" in rule) {
                  haveRequired = true;
                  // 如果值为 true，则跳过
                  if (rule.required) {
                    return;
                  } else {
                    // 否则修改其为 true
                    rule.required = true;
                    changed = true;
                  }
                }
              });
              // 如果已修改，那么说明没必要继续操作了，跳过
              if (changed) {
                return;
              }
              // 如果没修改，并且没有必填规则
              // （注意，如果有规则，那么必然已修改。所以只存在有规则已修改、未修改有规则、未修改无规则三种情况）
              if (!haveRequired) {
                // 添加规则
                rules.push({
                  required: true,
                  message: "请输入",
                  trigger: ["blur", "change"]
                });
              }
            });
          }
        });
      } else {
        // 取消必填
        // 不含必填规则的话，则跳过。如果含必填规则，则添加
        this.fields.forEach(fields => {
          if (fields.children && fields.children instanceof Array) {
            fields.children.forEach(field => {
              // 如果 key 不匹配，则跳过
              if (field.key !== key) {
                return;
              }

              // 先判断有没有 rules 这个属性，没有则添加这个属性，并且添加必填项然后返回
              if (!field.rules) {
                return;
              }
              // 如果有，则遍历并删除
              let i = -1;
              field.rules.forEach((rule, index) => {
                if ("required" in rule) {
                  i = index;
                }
              });
              if (i !== -1) {
                field.rules.splice(i, 1);
              }
            });
          }
        });
      }
    },

    // 初始化要素的 隐藏/显示、禁用/非禁用 状态等
    // 在父组件 data 更新的时候，调用这个方法
    initStatus() {
      // 遍历传入的数据
      this.fields.forEach(fields => {
        if (fields.children && fields.children instanceof Array) {
          fields.children.forEach(field => {
            // 如果有联动项，那么则遍历每个联动项
            if (
              field.valueLink &&
              field.valueLink.length &&
              field.valueLink.length > 0
            ) {
              const { key } = field;
              const v = this.data[key];

              // 遍历
              field.valueLink.forEach(linkItem => {
                // 如果联动项的触发值不匹配，则跳过这一条

                // 此时匹配，判断 linkList 有没有
                if (
                  linkItem.linkList &&
                  linkItem.linkList.length &&
                  linkItem.linkList.length > 0
                ) {
                  // 再遍历
                  linkItem.linkList.forEach(triggerItem => {
                    console.log("link------", v, linkItem);

                    if (v !== linkItem.value) {
                      return;
                    }
                    const linkKey = triggerItem.linkKey;
                    // 如果没有联动 key，则跳过（正常来说，不会没有）
                    if (!linkKey) {
                      return;
                    }
                    console.log("triggerItem", triggerItem);
                    // 如果联动值，则更新值
                    if (triggerItem.enableLinkValue) {
                      this.updateFormData({ [linkKey]: triggerItem.linkValue });
                    }
                    // 如果联动禁用/取消禁用，则更新禁用
                    if (triggerItem.enableLinkDisable) {
                      this.setElementDisable(linkKey, triggerItem.linkDisable);
                    }
                    // 如果联动隐藏/显示，则更新
                    if (triggerItem.enableLinkHidden) {
                      this.setElementHidden(linkKey, triggerItem.linkHidden);
                    }
                    // 如果联动必填/非必填，则更新
                    if (triggerItem.enableLinkRequired) {
                      this.setElementRequired(
                        linkKey,
                        triggerItem.linkRequired
                      );
                    }
                  });
                }
              });
            }
          });
        }
      });
    },

    // 找到 type="dynamic-select" 获取所有 parentCode，然后读取数据字典接口拉取对应的数据
    // todo 这里的数据字典请求接口，应该最后合并到一起，由一个专门的数据字典请求管理器去请求，减低接口重复请求的情况
    loadDynamicSelectOptions() {
      const parentCodeList = [];
      // 遍历传入的数据
      this.fields.forEach(fields => {
        if (fields.children && fields.children instanceof Array) {
          fields.children.forEach(field => {
            if (field.type === "dynamic-select" && field.parentKey) {
              // 再做一次去重判断。如果该字典已经在里面了，再跳过这一个
              if (parentCodeList.indexOf(field.parentKey) === -1) {
                if (
                  !(
                    this.dynamicDict[field.parentKey] &&
                    this.dynamicDict[field.parentKey].length !== 0
                  )
                ) {
                  parentCodeList.push(field.parentKey);
                  // 初始化一个数组
                  this.$set(this.dynamicDict, field.parentKey, []);
                }
              }
            }
            // 地区选择框，三级联动
            if (field.type === "area-select") {
              const firstParentKey = field.firstParentKey || "10020";
              const secondParentKey = field.firstParentKey || "10021";
              const thirdParentKey = field.firstParentKey || "10022";
              if (parentCodeList.indexOf(firstParentKey) === -1) {
                if (
                  !(
                    this.dynamicDict[firstParentKey] &&
                    this.dynamicDict[firstParentKey].length !== 0
                  )
                ) {
                  parentCodeList.push(firstParentKey);
                  this.$set(this.dynamicDict, firstParentKey, []);
                }
              }
              if (parentCodeList.indexOf(secondParentKey) === -1) {
                if (
                  !(
                    this.dynamicDict[secondParentKey] &&
                    this.dynamicDict[secondParentKey].length !== 0
                  )
                ) {
                  parentCodeList.push(secondParentKey);
                  this.$set(this.dynamicDict, secondParentKey, []);
                }
              }
              if (parentCodeList.indexOf(thirdParentKey) === -1) {
                if (
                  !(
                    this.dynamicDict[thirdParentKey] &&
                    this.dynamicDict[thirdParentKey].length !== 0
                  )
                ) {
                  parentCodeList.push(thirdParentKey);
                  this.$set(this.dynamicDict, thirdParentKey, []);
                }
              }
            }
          });
        }
      });
      if (parentCodeList.length === 0) {
        return;
      }

      // 通过父 key 拿到所有元素
      let payload = null;
      // 这里判断是不是 axios 的默认返回数据（未经过请求拦截器处理的）
      if (this.dynamicSelectOption.queryKey) {
        payload = {
          [this.dynamicSelectOption.queryKey]: parentCodeList
        };
      } else {
        payload = parentCodeList;
      }
      // console.log('QuickForm 拉取动态字典');
      console.log(payload);
      //   console.log(this.dynamicSelectOption);

      console.log(payload[this.dynamicSelectOption.queryKey]);
      //   const valueStr = payload[this.dynamicSelectOption.parentKey].join(",");
      axios$2
        // .get(this.dynamicSelectOption.dictUrl, payload)
        .get(this.dynamicSelectOption.dictUrl, {
          params: {
            [this.dynamicSelectOption.queryKey]: payload[
              this.dynamicSelectOption.queryKey
            ].join(",")
          }
        })
        .then(res => {
          // 兼容性处理
          let data;
          if (res.request && res.headers) {
            data = res.data;
          } else {
            data = res;
          }
          if (data.status === 200 || data.status === 0) {
            if (data.data.length > 0) {
              // 因为可能多个地方同时调这个接口的原因，为了避免重复将内容添加到里面，所以，
              // 这里在赋值之前，需要先判断一下 parentCodeList 的每个值，其对应的 dynamicDict 里的哪一个数组，是否是空的
              // 如果不是空的，则将其置为空数组
              parentCodeList.forEach(pCode => {
                console.log("pCode=", pCode);
                if (this.dynamicDict[pCode].length > 0) {
                  this.$set(this.dynamicDict, pCode, []);
                }
              });

              // 加载到结果
              data.data.forEach(item => {
                // 用每个返回值的 pCode 作为 key，将该项添加到数组里。
                // 注：之所以是数组，是因为之前已经初始化过了（parentKey 为 Code）
                const pCode = item[this.dynamicSelectOption.parentKey];
                this.dynamicDict[pCode].push(item);
              });
            }
          } else {
            this.$message.error(data.msg);
          }
        })
        .catch(() => {
          this.$message.error("数据字典加载错误，请刷新页面重试");
        });
    },

    // 清空校验信息,移除表单项的校验结果。
    // 传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果
    clearValidate(args) {
      this.$refs.form.clearValidate(args);
    },
    // 对部分表单字段进行校验的方法
    validateField(args) {
      this.$refs.form.validateField(args);
    },

    // 获取过滤后的数据
    getData(includeHidden = false) {
      const d = {};
      Object.keys(this.formData)
        .filter(key => {
          // 走正常逻辑
          if (
            this.changeData.hiddenKeyList.indexOf(key) > -1 &&
            !includeHidden
          ) {
            return false;
          } else {
            return true;
          }
        })
        .forEach(key => {
          // 这里分为两种情况：
          // 第一种是一级表单的元素，他在被隐藏时，key是可以直接从 hiddenKeyList 获取的
          // 第二种是子表单的元素。因为他的 key 是三段拼接起来的 key，所以要去子表单里拿到 randomId 再做一个映射
          // 某个属性是否是子表单的判断条件是：遍历 fields，判断他是否是 type === 'child-form'
          let childFormKeysList = [];
          this.fields
            .map(field => {
              const list = [];
              field.children.forEach(item => {
                if (item.type === "child-form") {
                  list.push(item.key);
                }
              });
              return list;
            })
            .filter(list => {
              return list.length > 0;
            })
            .forEach(list => {
              childFormKeysList = [...childFormKeysList, ...list];
            });
          if (childFormKeysList.indexOf(key) > -1) {
            // 说明是在子表单
            d[key] = this.$refs[key][0].childFormFileds.map(
              (childField, index) => {
                const childD = {};
                const { randomId } = childField;
                childField.forEach(childItem => {
                  const childKey = childItem.key;
                  const keyText = `${key}_${randomId}_${childKey}`;
                  if (this.changeData.hiddenKeyList.indexOf(keyText) > -1) {
                    return;
                  } else {
                    childD[childKey] = this.formData[key][index][childKey];
                  }
                });
                return childD;
              }
            );
          } else {
            // 走正常逻辑
            // 自定义组件获取值
            if (this.customItemList.includes(key)) {
              if (this.$refs[key] && this.$refs[key].setItemValue) {
                d[key] = this.$refs[key].getItemValue();
                this.$set(this.formData, key, d[key]);
              }
            } else {
              //其他默认获取值
              d[key] = this.formData[key];
            }
          }
        });

      return d;
    },

    // 校验，并获取校验后数据
    validate(fn, incluedHidden = false) {
      // 先校验父级表单的值
      // 对数据进行过滤
      const data = this.getData(incluedHidden);
      this.$refs.form.validate(valid => {
        // 判断是否需要校验子表单
        const childFormKeyList = [];
        this.fields.forEach(filed => {
          if (filed.children && filed.children.length > 0) {
            filed.children.forEach(formItem => {
              // 如果某一项是
              if (formItem.type === "child-form") {
                childFormKeyList.push(formItem.key);
              }
            });
          }
        });

        if (childFormKeyList.length === 0) {
          if (valid) {
            fn(true, data);
          } else {
            fn(false, data);
          }
        } else {
          const validateList = childFormKeyList.map(key => {
            return this.$refs[key][0].validateForm();
          });
          Promise.all(validateList)
            .then(() => {
              // 父表单校验也通过了，才算都通过
              if (valid) {
                fn(true, data);
              } else {
                // 否则即使子表单校验通过，父表单校验没通过，也是算不通过的
                fn(false, data);
              }
            })
            .catch(() => {
              fn(false, data);
            });
        }
      });
    },

    // 重置表单数据
    resetFields() {
      this.$refs.form.resetFields();
      this.fields.forEach(filed => {
        if (filed.children && filed.children.length > 0) {
          filed.children.forEach(formItem => {
            // 如果某一项是
            if (formItem.type === "child-form") {
              const a = this.$refs[formItem.key];
              if (a instanceof Array) {
                a[0].resetFields();
              } else {
                a.resetFields();
              }
            }
          });
        }
      });
    },
    // 更新指定item 的options
    getOptionsData(key, query) {
      const $item = this.$refs[key];
      if ($item && $item.getOptionsData) {
        $item.getOptionsData(query);
      }
    },
    // getItems(key) {},
    // 表单组件是否显示
    isShow(item) {
      // 如果该要素在隐藏列表里，则不显示
      if (this.changeData.hiddenKeyList.indexOf(item.key) > -1) {
        return false;
      }
      return true;
    },
    // 重置表单 请用 resetFields 代替
    resetFormData(formdata) {
      // 清除数据的fromdata 为响应式数据
      const data = JSON.parse(JSON.stringify(formdata));
      // console.log("resetFormData", formdata);
      const dataKeys = Object.keys(data);
      const formDataKeys = Object.keys(this.formData);
      const dataKeysLength = dataKeys.length;
      if (dataKeysLength !== formDataKeys.length) {
        console.log("数据字段和原有长度的不一致，无法设置");
        return false;
      }
      for (let i = 0; i < dataKeysLength; i++) {
        if (!formDataKeys.includes(dataKeys[i])) {
          console.log("数据字段和原有的不一致，无法设置");
          return false;
        }
      }
      this.formData = data;
    },

    //   Object.keys(data).forEach(key => {
    //     // 如果 key 在值里面
    //     if (key in this.formData) {
    //       // 则回填这个值
    //       this.$set(this.formData, key, data[key]);
    //     }
    //   });
    // },

    // 更新数据
    updateFormData(data) {
      Object.keys(data).forEach(key => {
        // 自定义组件设置更新值
        if (this.customItemList.includes(key)) {
          if (this.$refs[key] && this.$refs[key].setItemValue) {
            this.$refs[key].setItemValue(data[key]);
          }
        }
        // 如果 key 在值里面
        else if (key in this.formData) {
          // 则回填这个值
          this.$set(this.formData, key, data[key]);
        }
      });
    },

    // 收起/展开区块
    foldBlock(block) {
      const label = block.label;
      const index = this.foldBlockList.indexOf(label);
      if (index === -1) {
        this.foldBlockList.push(block.label);
      } else {
        this.foldBlockList.splice(index, 1);
      }
    },

    // 收起展开所有区块
    foldAllBlock() {
      const labelList = [];
      this.fields.forEach(block => {
        // 如果没有 label，则不支持收起
        if (block.label) {
          labelList.push(block.label);
        }
      });
      // 如果长度相等，说明已经全部收起了，那么就是展开
      if (this.foldBlockList.length === labelList.length) {
        this.foldBlockList = [];
      } else {
        this.foldBlockList = labelList;
      }
    },

    // 浏览模式切换
    changeScanType() {
      if (this.scanType === "normal") {
        this.scanType = "single";
        // 如果切换为单体，那么将所有隐藏的显示出来
        this.foldBlockList = [];
        this.singleScanBlock = this.fields[0].label;
      } else {
        this.scanType = "normal";
        this.singleScanBlock = "";
      }
    },

    getProps(rowItem) {
      if (!rowItem.size) {
        rowItem.size = this.formItemSize;
      }
      return {
        ref: rowItem.key,
        item: rowItem,
        allDisabled: this.allDisabled
      };
    }
  }
};

/* script */
const __vue_script__$m = script$m;

/* template */
var __vue_render__$m = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "quick-form quick-form-v2",
      class: { "border-form": _vm.borderForm }
    },
    [
      _vm.showAllFoldBtn || _vm.showScanTypeBtn
        ? _c("div", { staticClass: "scan-type" }, [
            _vm.showAllFoldBtn && _vm.scanType === "normal"
              ? _c(
                  "div",
                  {
                    staticClass: "all-fold-btn",
                    on: { click: _vm.foldAllBlock }
                  },
                  [_vm._v("\n      全部收起/展开\n    ")]
                )
              : _vm._e(),
            _vm._v(" "),
            _vm.showScanTypeBtn && _vm.scanType === "single"
              ? _c(
                  "div",
                  { staticClass: "block-btn-list" },
                  [
                    _vm._l(_vm.fields, function(block) {
                      return [
                        block.label
                          ? _c(
                              "div",
                              {
                                key: block.label,
                                staticClass: "block-btn",
                                class: {
                                  focus: _vm.singleScanBlock === block.label
                                },
                                on: {
                                  click: function() {
                                    return (_vm.singleScanBlock = block.label)
                                  }
                                }
                              },
                              [
                                _vm._v(
                                  "\n          " +
                                    _vm._s(block.label) +
                                    "\n        "
                                )
                              ]
                            )
                          : _vm._e()
                      ]
                    })
                  ],
                  2
                )
              : _vm._e(),
            _vm._v(" "),
            _vm.showScanTypeBtn
              ? _c(
                  "div",
                  {
                    staticClass: "scan-type-btn",
                    on: { click: _vm.changeScanType }
                  },
                  [_vm._v("\n      浏览模式切换\n    ")]
                )
              : _vm._e()
          ])
        : _vm._e(),
      _vm._v(" "),
      _vm.showRowsFold
        ? _c(
            "div",
            { staticClass: "table-query-fold" },
            [
              _c(
                "el-button",
                {
                  attrs: {
                    type: "text",
                    icon: _vm.tableQueryFoldStatus
                      ? "el-icon-arrow-down"
                      : "el-icon-arrow-up"
                  },
                  on: { click: _vm.toggleShow }
                },
                [
                  _vm._v(
                    _vm._s(_vm.tableQueryFoldStatus ? " 展开更多" : "收起更多")
                  )
                ]
              )
            ],
            1
          )
        : _vm._e(),
      _vm._v(" "),
      _c(
        "el-form",
        {
          ref: "form",
          attrs: {
            model: _vm.formData,
            "hide-required-asterisk": _vm.textModel,
            "label-width": _vm.labelWidth || "150px",
            "label-position": _vm.labelPosition ? _vm.labelPosition : "right"
          }
        },
        _vm._l(_vm.currentFileds, function(field) {
          return _c("div", { key: field.label }, [
            _vm.scanType === "normal" ||
            (_vm.scanType === "single" && _vm.singleScanBlock === field.label)
              ? _c(
                  "div",
                  { class: _vm.getBlockClass(field), style: field.style },
                  [
                    field.label
                      ? _c("div", { staticClass: "block-title" }, [
                          _c("div", { staticClass: "block-line" }),
                          _vm._v(" "),
                          _c(
                            "span",
                            {
                              staticClass: "block-text",
                              attrs: {
                                id: field.id || String(Math.random() * 10000)
                              }
                            },
                            [_vm._v(_vm._s(field.label))]
                          ),
                          _vm._v(" "),
                          _vm.foldBlockList.indexOf(field.label) === -1 &&
                          _vm.showFoldBtn &&
                          !_vm.textModel &&
                          _vm.scanType === "normal"
                            ? _c(
                                "span",
                                {
                                  staticClass: "block-fold-btn",
                                  on: {
                                    click: function($event) {
                                      return _vm.foldBlock(field)
                                    }
                                  }
                                },
                                [
                                  _vm._v("\n            收起 "),
                                  _c("i", { staticClass: "el-icon-arrow-up" })
                                ]
                              )
                            : _vm._e(),
                          _vm._v(" "),
                          _vm.foldBlockList.indexOf(field.label) > -1 &&
                          _vm.showFoldBtn &&
                          !_vm.textModel &&
                          _vm.scanType === "normal"
                            ? _c(
                                "span",
                                {
                                  staticClass: "block-fold-btn",
                                  on: {
                                    click: function($event) {
                                      return _vm.foldBlock(field)
                                    }
                                  }
                                },
                                [
                                  _vm._v("\n            展开 "),
                                  _c("i", { staticClass: "el-icon-arrow-down" })
                                ]
                              )
                            : _vm._e()
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    _vm._l(_vm.getFieldRow(field.children), function(
                      row,
                      rowIndex
                    ) {
                      return [
                        _c(
                          "el-row",
                          {
                            key: rowIndex,
                            staticClass: "block-content",
                            class: {
                              "block-hidden":
                                _vm.foldBlockList.indexOf(field.label) > -1 ||
                                (_vm.mode === "tableQuery" &&
                                  rowIndex + 1 > _vm.tableQueryshowRows)
                            },
                            attrs: { gutter: 20 }
                          },
                          [
                            _vm._l(row, function(ref) {
                              var rowItem = ref.rowItem;
                              return [
                                _c(
                                  "div",
                                  { key: rowItem.key },
                                  [
                                    _c(
                                      "el-col",
                                      {
                                        key: rowItem.key,
                                        style: rowItem.colStyle || {},
                                        attrs: { span: _vm.getColSize(rowItem) }
                                      },
                                      [
                                        rowItem.type !== "child-form"
                                          ? _c(
                                              "el-form-item",
                                              {
                                                class: rowItem.class,
                                                style:
                                                  rowItem.formItemstyle || {},
                                                attrs: {
                                                  rules: rowItem.rules,
                                                  label: _vm.getFormItemLabel(
                                                    rowItem
                                                  ),
                                                  prop: rowItem.key
                                                }
                                              },
                                              [
                                                rowItem.type === "input"
                                                  ? _c(
                                                      "FormInput",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "date-input"
                                                  ? _c(
                                                      "FormDate",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormDate",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "datetime-input"
                                                  ? _c(
                                                      "FormDateTime",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormDateTime",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "hour-minute-input"
                                                  ? _c(
                                                      "FormHourMinute",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormHourMinute",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "date-range-input"
                                                  ? _c(
                                                      "FormDateRange",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormDateRange",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "datetime-range-input"
                                                  ? _c(
                                                      "FormDateTimeRange",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormDateTimeRange",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "dynamic-select"
                                                  ? _c(
                                                      "FormDictSelect",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormDictSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "normal-select"
                                                  ? _c(
                                                      "FormNormalSelect",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormNormalSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "tree-select"
                                                  ? _c(
                                                      "FormTreeSelect",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormTreeSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "mutiple-select"
                                                  ? _c(
                                                      "FormMutipleSelect",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormMutipleSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "number-input"
                                                  ? _c(
                                                      "FormNumberInput",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormNumberInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type ===
                                                "auto-complete-input"
                                                  ? _c(
                                                      "FormAutoComplete",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormAutoComplete",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "radio"
                                                  ? _c(
                                                      "FormRadio",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormRadio",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "checkbox"
                                                  ? _c(
                                                      "FormCheckbox",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormCheckbox",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "textarea"
                                                  ? _c(
                                                      "FormTextarea",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormTextarea",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "money-input"
                                                  ? _c(
                                                      "FormMoneyInput",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormMoneyInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "rate-input"
                                                  ? _c(
                                                      "FormRateInput",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormRateInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "area-select"
                                                  ? _c(
                                                      "FormAreaSelect",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormAreaSelect",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "mul-linkage"
                                                  ? _c(
                                                      "FormMulLinkage",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormMulLinkage",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "normal-number"
                                                  ? _c(
                                                      "FormNormalNumberInput",
                                                      _vm._b(
                                                        {
                                                          model: {
                                                            value:
                                                              _vm.formData[
                                                                rowItem.key
                                                              ],
                                                            callback: function(
                                                              $$v
                                                            ) {
                                                              _vm.$set(
                                                                _vm.formData,
                                                                rowItem.key,
                                                                typeof $$v ===
                                                                  "string"
                                                                  ? $$v.trim()
                                                                  : $$v
                                                              );
                                                            },
                                                            expression:
                                                              "formData[rowItem.key]"
                                                          }
                                                        },
                                                        "FormNormalNumberInput",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e(),
                                                _vm._v(" "),
                                                rowItem.type === "component" &&
                                                rowItem.component
                                                  ? _c(
                                                      rowItem.component,
                                                      _vm._b(
                                                        { tag: "component" },
                                                        "component",
                                                        _vm.getProps(rowItem),
                                                        false
                                                      )
                                                    )
                                                  : _vm._e()
                                              ],
                                              1
                                            )
                                          : _vm._e(),
                                        _vm._v(" "),
                                        rowItem.type === "child-form"
                                          ? _c("ChildForm", {
                                              ref: rowItem.key,
                                              refInFor: true,
                                              attrs: {
                                                "text-model": _vm.textModel,
                                                "all-disabled": _vm.allDisabled,
                                                item: rowItem
                                              },
                                              model: {
                                                value:
                                                  _vm.formData[rowItem.key],
                                                callback: function($$v) {
                                                  _vm.$set(
                                                    _vm.formData,
                                                    rowItem.key,
                                                    typeof $$v === "string"
                                                      ? $$v.trim()
                                                      : $$v
                                                  );
                                                },
                                                expression:
                                                  "formData[rowItem.key]"
                                              }
                                            })
                                          : _vm._e(),
                                        _vm._v(" "),
                                        rowItem.type === "table-readonly"
                                          ? _c("TableReadonly", {
                                              ref: rowItem.key,
                                              refInFor: true,
                                              attrs: { item: rowItem },
                                              model: {
                                                value:
                                                  _vm.formData[rowItem.key],
                                                callback: function($$v) {
                                                  _vm.$set(
                                                    _vm.formData,
                                                    rowItem.key,
                                                    $$v
                                                  );
                                                },
                                                expression:
                                                  "formData[rowItem.key]"
                                              }
                                            })
                                          : _vm._e()
                                      ],
                                      1
                                    )
                                  ],
                                  1
                                )
                              ]
                            })
                          ],
                          2
                        )
                      ]
                    }),
                    _vm._v(" "),
                    field.divider ? _c("el-divider") : _vm._e()
                  ],
                  2
                )
              : _vm._e()
          ])
        }),
        0
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$m = [];
__vue_render__$m._withStripped = true;

  /* style */
  const __vue_inject_styles__$m = function (inject) {
    if (!inject) return
    inject("data-v-50069df4_0", { source: ".quick-form[data-v-50069df4] {\n  width: 100%;\n  position: relative;\n}\n.quick-form .table-query-fold[data-v-50069df4] {\n  position: absolute;\n  right: 0;\n  bottom: -40px;\n  z-index: 3;\n}\n.quick-form .el-input__inner[data-v-50069df4] {\n  height: 36px !important;\n  line-height: 36px !important;\n  border: 1px solid #e2e3e6 !important;\n}\n.quick-form .block-title[data-v-50069df4] {\n  position: relative;\n  height: 50px;\n  padding-top: 10px;\n  padding-bottom: 24px;\n  font-size: 16px;\n}\n.quick-form .block-title .block-line[data-v-50069df4] {\n  float: left;\n  width: 4px;\n  height: 16px;\n  background: #ee473a;\n  border-radius: 2px;\n  display: inline-block;\n}\n.quick-form .block-title .block-text[data-v-50069df4] {\n  margin-left: 10px;\n  float: left;\n  height: 16px;\n  font-size: 16px;\n  color: #21273a;\n  font-weight: 600 !important;\n  vertical-align: top;\n  line-height: 16px;\n}\n.quick-form .block-title .block-fold-btn[data-v-50069df4] {\n  float: right;\n  margin-right: 30px;\n  height: 16px;\n  line-height: 16px;\n  font-size: 14px;\n  cursor: pointer;\n  user-select: none;\n}\n.border-form .block-item[data-v-50069df4] {\n  border: 1px solid #dde0ea;\n  border-radius: 8px;\n  margin-bottom: 40px;\n  background: #fff;\n  padding-bottom: 15px;\n}\n.border-form .block-item .block-title[data-v-50069df4] {\n  height: 60px;\n  line-height: 60px;\n  background: #f8f9fb;\n  padding: 20px 0 18px 24px;\n  border-top-left-radius: 8px;\n  border-top-right-radius: 8px;\n}\n.border-form .block-item .block-title + .block-content[data-v-50069df4] {\n  padding-top: 14px;\n}\n.border-form .block-item .block-content[data-v-50069df4] {\n  padding: 0 24px;\n}\n.block-hidden[data-v-50069df4] {\n  display: none;\n}\n.el-divider[data-v-50069df4] {\n  background-color: #f4f5f8;\n}\n.scan-type[data-v-50069df4] {\n  position: relative;\n  height: 36px;\n  line-height: 36px;\n  margin-bottom: 16px;\n}\n.scan-type .all-fold-btn[data-v-50069df4] {\n  display: inline-block;\n  padding: 0 20px;\n  height: 36px;\n  background: #ee473a;\n  border: 1px solid #ee473a;\n  border-radius: 4px;\n  color: #fff;\n  cursor: pointer;\n  text-align: center;\n  font-size: 14px;\n  vertical-align: top;\n}\n.scan-type .all-fold-btn .all-fold-icon[data-v-50069df4] {\n  width: 14px;\n  height: 14px;\n  vertical-align: top;\n  margin-top: 11px;\n}\n.scan-type .block-btn-list[data-v-50069df4] {\n  float: left;\n}\n.scan-type .block-btn-list .block-btn[data-v-50069df4] {\n  border: 1px solid #dde0ea;\n  height: 36px;\n  line-height: 36px;\n  padding: 0 18px;\n  color: #3a4566;\n  display: inline-block;\n  cursor: pointer;\n  user-select: none;\n}\n.scan-type .block-btn-list .block-btn.focus[data-v-50069df4] {\n  background: #ee473a;\n  color: #fff;\n}\n.scan-type .block-btn-list .block-btn[data-v-50069df4]:first-child {\n  border-radius: 4px 0 0 4px;\n}\n.scan-type .block-btn-list .block-btn[data-v-50069df4]:last-child {\n  border-radius: 0 4px 4px 0;\n}\n.scan-type .scan-type-btn[data-v-50069df4] {\n  display: inline-block;\n  float: right;\n  padding: 0 20px;\n  height: 36px;\n  border: 1px solid #aeb3bf;\n  border-radius: 4px;\n  color: #12182a;\n  cursor: pointer;\n  text-align: center;\n  font-size: 14px;\n  vertical-align: top;\n  user-select: none;\n}\n.scan-type .scan-type-btn .scan-type-icon[data-v-50069df4] {\n  width: 14px;\n  height: 14px;\n  vertical-align: top;\n  margin-top: 11px;\n}\n.quick-form-v2[data-v-50069df4] input::-webkit-outer-spin-button,\n.quick-form-v2[data-v-50069df4] input::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n}\n.quick-form-v2[data-v-50069df4] input[type=\"number\"] {\n  -webkit-appearance: none;\n  appearance: none;\n}\n.quick-form-v2[data-v-50069df4] input[type=\"number\"] {\n  -moz-appearance: textfield;\n}\n", map: {"version":3,"sources":["quick-form.vue"],"names":[],"mappings":"AAAA;EACE,WAAW;EACX,kBAAkB;AACpB;AACA;EACE,kBAAkB;EAClB,QAAQ;EACR,aAAa;EACb,UAAU;AACZ;AACA;EACE,uBAAuB;EACvB,4BAA4B;EAC5B,oCAAoC;AACtC;AACA;EACE,kBAAkB;EAClB,YAAY;EACZ,iBAAiB;EACjB,oBAAoB;EACpB,eAAe;AACjB;AACA;EACE,WAAW;EACX,UAAU;EACV,YAAY;EACZ,mBAAmB;EACnB,kBAAkB;EAClB,qBAAqB;AACvB;AACA;EACE,iBAAiB;EACjB,WAAW;EACX,YAAY;EACZ,eAAe;EACf,cAAc;EACd,2BAA2B;EAC3B,mBAAmB;EACnB,iBAAiB;AACnB;AACA;EACE,YAAY;EACZ,kBAAkB;EAClB,YAAY;EACZ,iBAAiB;EACjB,eAAe;EACf,eAAe;EACf,iBAAiB;AACnB;AACA;EACE,yBAAyB;EACzB,kBAAkB;EAClB,mBAAmB;EACnB,gBAAgB;EAChB,oBAAoB;AACtB;AACA;EACE,YAAY;EACZ,iBAAiB;EACjB,mBAAmB;EACnB,yBAAyB;EACzB,2BAA2B;EAC3B,4BAA4B;AAC9B;AACA;EACE,iBAAiB;AACnB;AACA;EACE,eAAe;AACjB;AACA;EACE,aAAa;AACf;AACA;EACE,yBAAyB;AAC3B;AACA;EACE,kBAAkB;EAClB,YAAY;EACZ,iBAAiB;EACjB,mBAAmB;AACrB;AACA;EACE,qBAAqB;EACrB,eAAe;EACf,YAAY;EACZ,mBAAmB;EACnB,yBAAyB;EACzB,kBAAkB;EAClB,WAAW;EACX,eAAe;EACf,kBAAkB;EAClB,eAAe;EACf,mBAAmB;AACrB;AACA;EACE,WAAW;EACX,YAAY;EACZ,mBAAmB;EACnB,gBAAgB;AAClB;AACA;EACE,WAAW;AACb;AACA;EACE,yBAAyB;EACzB,YAAY;EACZ,iBAAiB;EACjB,eAAe;EACf,cAAc;EACd,qBAAqB;EACrB,eAAe;EACf,iBAAiB;AACnB;AACA;EACE,mBAAmB;EACnB,WAAW;AACb;AACA;EACE,0BAA0B;AAC5B;AACA;EACE,0BAA0B;AAC5B;AACA;EACE,qBAAqB;EACrB,YAAY;EACZ,eAAe;EACf,YAAY;EACZ,yBAAyB;EACzB,kBAAkB;EAClB,cAAc;EACd,eAAe;EACf,kBAAkB;EAClB,eAAe;EACf,mBAAmB;EACnB,iBAAiB;AACnB;AACA;EACE,WAAW;EACX,YAAY;EACZ,mBAAmB;EACnB,gBAAgB;AAClB;AACA;;EAEE,wBAAwB;AAC1B;AACA;EACE,wBAAwB;EACxB,gBAAgB;AAClB;AACA;EACE,0BAA0B;AAC5B","file":"quick-form.vue","sourcesContent":[".quick-form {\n  width: 100%;\n  position: relative;\n}\n.quick-form .table-query-fold {\n  position: absolute;\n  right: 0;\n  bottom: -40px;\n  z-index: 3;\n}\n.quick-form .el-input__inner {\n  height: 36px !important;\n  line-height: 36px !important;\n  border: 1px solid #e2e3e6 !important;\n}\n.quick-form .block-title {\n  position: relative;\n  height: 50px;\n  padding-top: 10px;\n  padding-bottom: 24px;\n  font-size: 16px;\n}\n.quick-form .block-title .block-line {\n  float: left;\n  width: 4px;\n  height: 16px;\n  background: #ee473a;\n  border-radius: 2px;\n  display: inline-block;\n}\n.quick-form .block-title .block-text {\n  margin-left: 10px;\n  float: left;\n  height: 16px;\n  font-size: 16px;\n  color: #21273a;\n  font-weight: 600 !important;\n  vertical-align: top;\n  line-height: 16px;\n}\n.quick-form .block-title .block-fold-btn {\n  float: right;\n  margin-right: 30px;\n  height: 16px;\n  line-height: 16px;\n  font-size: 14px;\n  cursor: pointer;\n  user-select: none;\n}\n.border-form .block-item {\n  border: 1px solid #dde0ea;\n  border-radius: 8px;\n  margin-bottom: 40px;\n  background: #fff;\n  padding-bottom: 15px;\n}\n.border-form .block-item .block-title {\n  height: 60px;\n  line-height: 60px;\n  background: #f8f9fb;\n  padding: 20px 0 18px 24px;\n  border-top-left-radius: 8px;\n  border-top-right-radius: 8px;\n}\n.border-form .block-item .block-title + .block-content {\n  padding-top: 14px;\n}\n.border-form .block-item .block-content {\n  padding: 0 24px;\n}\n.block-hidden {\n  display: none;\n}\n.el-divider {\n  background-color: #f4f5f8;\n}\n.scan-type {\n  position: relative;\n  height: 36px;\n  line-height: 36px;\n  margin-bottom: 16px;\n}\n.scan-type .all-fold-btn {\n  display: inline-block;\n  padding: 0 20px;\n  height: 36px;\n  background: #ee473a;\n  border: 1px solid #ee473a;\n  border-radius: 4px;\n  color: #fff;\n  cursor: pointer;\n  text-align: center;\n  font-size: 14px;\n  vertical-align: top;\n}\n.scan-type .all-fold-btn .all-fold-icon {\n  width: 14px;\n  height: 14px;\n  vertical-align: top;\n  margin-top: 11px;\n}\n.scan-type .block-btn-list {\n  float: left;\n}\n.scan-type .block-btn-list .block-btn {\n  border: 1px solid #dde0ea;\n  height: 36px;\n  line-height: 36px;\n  padding: 0 18px;\n  color: #3a4566;\n  display: inline-block;\n  cursor: pointer;\n  user-select: none;\n}\n.scan-type .block-btn-list .block-btn.focus {\n  background: #ee473a;\n  color: #fff;\n}\n.scan-type .block-btn-list .block-btn:first-child {\n  border-radius: 4px 0 0 4px;\n}\n.scan-type .block-btn-list .block-btn:last-child {\n  border-radius: 0 4px 4px 0;\n}\n.scan-type .scan-type-btn {\n  display: inline-block;\n  float: right;\n  padding: 0 20px;\n  height: 36px;\n  border: 1px solid #aeb3bf;\n  border-radius: 4px;\n  color: #12182a;\n  cursor: pointer;\n  text-align: center;\n  font-size: 14px;\n  vertical-align: top;\n  user-select: none;\n}\n.scan-type .scan-type-btn .scan-type-icon {\n  width: 14px;\n  height: 14px;\n  vertical-align: top;\n  margin-top: 11px;\n}\n.quick-form-v2 /deep/ input::-webkit-outer-spin-button,\n.quick-form-v2 /deep/ input::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n}\n.quick-form-v2 /deep/ input[type=\"number\"] {\n  -webkit-appearance: none;\n  appearance: none;\n}\n.quick-form-v2 /deep/ input[type=\"number\"] {\n  -moz-appearance: textfield;\n}\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$m = "data-v-50069df4";
  /* module identifier */
  const __vue_module_identifier__$m = undefined;
  /* functional template */
  const __vue_is_functional_template__$m = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$m = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$m, staticRenderFns: __vue_staticRenderFns__$m },
    __vue_inject_styles__$m,
    __vue_script__$m,
    __vue_scope_id__$m,
    __vue_is_functional_template__$m,
    __vue_module_identifier__$m,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__$m.install = (Vue, installOptions = {}) => {
  // 数据字典的配置
  Object.assign(
    __vue_component__$m.props,
    {
      dynamicSelectOption: {
        type: Object,
        default: () => ({
          // 这是字典接口的 url
          dictUrl: "/wkbbackend/queryByCategoryCodeList",
          // 异步请求时，请求内容是一个对象或一个数组。
          // 如果是对象，那么包含一个 key 和一个数组。
          // 如果是数组，那么只有这个数组。
          // 数组是所有字典 FormItem 的 parentKey 的集合
          queryKey: "categoryCodeList", // 这是请求时那个 key。如果为空，则请求时是一个数组，而不是一个对象
          parentKey: "categoryCode", // 这是返回结果的 parentKey。意思是，同一个 parentKey 归属于同一个下拉框选项
          value: "bdictCode", // 这是下拉框选项的值
          label: "bdictDesc" // 这是下拉框选项的 label
        })
      }
    },
    installOptions
  );

  Vue.component(__vue_component__$m.name, __vue_component__$m);
};

export default __vue_component__$m;

<template>
  <div class="">
    <el-quick-form
      label-width="120px"
      labelPosition="right"
      input-size="mini"
      :border-form="false"
      :form-item-col="8"
      ref="form"
      form-item-size="mini"
      :fields="fields"
    />
    <div class="oper-bar">
      <el-button @click="resetQuery"> 重置</el-button>
      <el-button @click="doQuery" type="primary"> 查询</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "orderQuickForm",
  data() {
    return {
      query: {},
      initQuery: {},
      fields: [
        {
          label: "",
          formConfig: {
            formItemSize: "mini",
            labelPosition: "right",
            mode: "tableQuery",
            formItemCol: 8,
            labelWidth: "120px",
            defaultShowRows: 7,
            showFoldBtn: false,
            borderForm: false
          },
          children: [
            {
              label: "客户信息",
              type: "auto-complete-input",
              rules: [],
              key: "username",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "订单编号",
              type: "input",
              rules: [],
              key: "ordersn",
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "订单类型",
              type: "mutiple-select",
              rules: [],
              key: "ordertype",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "订单状态",
              type: "mutiple-select",
              rules: [],
              key: "orderStatus",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "审核状态",
              type: "mutiple-select",
              rules: [],
              key: "checkStatus",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "下单时间",
              type: "date-range-input",
              rules: [],
              key: "ordertime",
              style: {
                maxWidth: "300px",
                overflow: "hidden"
              },
              inputStyle: {
                maxWidth: "300px"
              },
              valueBoxStyle: {
                maxWidth: "240px"
              }
            },
            {
              label: "支付状态",
              type: "mutiple-select",
              rules: [],
              key: "payStatus",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "销售顾问",
              type: "mutiple-select",
              rules: [],
              key: "adviser",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "签单人",
              type: "auto-complete-input",
              rules: [],
              key: "signMan",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "换单状态",
              type: "mutiple-select",
              rules: [],
              key: "changeOrderStatus",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "所在城市",
              type: "mutiple-select",
              rules: [],
              key: "cityIds",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "组织机构",
              type: "tree-select",
              rules: [],
              key: "orgnizations",
              options: [],
              treeParams: {
                clickParent: false,
                filterable: true,
                "check-strictly": true,
                "default-expand-all": false,
                "expand-on-click-node": false,
                props: {
                  children: "children",
                  label: "text",
                  disabled: "disabled",
                  value: "id"
                },
                data: []
              },
              defaultValue: [1],
              selectParams: {
                multiple: false,
                clearable: true,
                placeholder: "请输入"
              },
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "续单状态",
              type: "mutiple-select",
              rules: [],
              key: "nextOrderStatus",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "服务项",
              type: "mutiple-select",
              rules: [],
              key: "serviceId",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "商品类型",
              type: "mutiple-select",
              rules: [],
              key: "goodsType",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            },
            {
              label: "合同开始时间",
              type: "date-range-input",
              rules: [],
              key: "contractStartDate",
              style: {
                maxWidth: "300px",
                overflow: "hidden"
              },
              inputStyle: {
                maxWidth: "300px"
              },
              valueBoxStyle: {
                maxWidth: "240px"
              }
            },
            {
              label: "合同结束时间",
              type: "date-range-input",
              rules: [],
              key: "contractEndDate",
              style: {
                maxWidth: "300px",
                overflow: "hidden"
              },
              inputStyle: {
                maxWidth: "300px"
              },
              valueBoxStyle: {
                maxWidth: "240px"
              }
            },
            {
              label: "签约门店类型",
              type: "date-range-input",
              rules: [],
              key: "sotreType",
              style: {
                maxWidth: "300px",
                overflow: "hidden"
              },
              inputStyle: {
                maxWidth: "300px"
              },
              valueBoxStyle: {
                maxWidth: "240px"
              }
            },
            {
              label: "首次进入审核时间",
              type: "date-range-input",
              rules: [],
              key: "firstCheckDate",
              style: {
                maxWidth: "300px",
                overflow: "hidden"
              },
              inputStyle: {
                maxWidth: "300px"
              },
              valueBoxStyle: {
                maxWidth: "240px"
              }
            },
            {
              label: "最近提交时间",
              type: "date-range-input",
              rules: [],
              key: "submitDate",
              style: {
                maxWidth: "300px",
                overflow: "hidden"
              },
              inputStyle: {
                maxWidth: "300px"
              },
              valueBoxStyle: {
                maxWidth: "240px"
              }
            },
            {
              label: "是否二清订单",
              type: "normal-select",
              rules: [],
              key: "iserqinOrder",
              options: [
                {
                  label: "选项1",
                  value: 11
                },
                {
                  label: "选项2",
                  value: 22
                },
                {
                  label: "选项3",
                  value: 33
                }
              ],
              valueBoxStyle: {
                width: "100%"
              }
            }
          ]
        }
      ]
    };
  },
  methods: {
    doQuery() {
      const query = this.getQuery();
      this.$emit("doQuery", query);
    },
    resetQuery() {},
    getQuery() {
      return this.$refs.form.getData(true);
    }
  }
};
</script>

<style scoped>
.oper-bar {
  text-align: center;
}
</style>

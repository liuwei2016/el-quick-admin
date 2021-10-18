import Vue from "vue";
import App from "./App.vue";
import router from "./router";
Vue.config.productionTip = false;
// import quickTable from "el-quick-table";
import quickTable from "../../packages/quick-table/index.js";
// import QuickForm from "../../lib/el-quick-form.umd.min.js";
import quickForm from "el-quick-form";
// import agelTable from "quick-table";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import ElTreeSelect from "el-tree-select";
// const QuickForm = QuickForm.QuickForm;
import VueHighlightJS from "vue-highlightjs";
import "highlight.js/styles/atom-one-dark.css";

console.log(quickTable);

const props = {
  dynamicSelectOption: {
    type: Object,
    default: () => ({
      // 这是字典接口的 url。baseURL 指开发和生产环境下，不同的前缀。
      dictUrl: `/api/options`,
      // 异步请求时，请求内容是一个对象或一个数组。
      // 如果是对象，那么包含一个 key 和一个数组。
      // 如果是数组，那么只有这个数组。
      // 数组是所有字典 FormItem 的 parentKey 的集合
      queryKey: "search", // 这是请求时那个 key。如果为空，则请求时是一个数组，而不是一个对象
      parentKey: "parentKey", // 这是返回结果的 parentKey。意思是，同一个 parentKey 归属于同一个下拉框选项
      value: "value", // 这是下拉框选项的值
      label: "label" // 这是下拉框选项的 label
    })
  }
};
Vue.use(ElementUI);
Vue.use(ElTreeSelect);
// Vue.use(QuickForm, props);
// 引入所有组件
// import QuickForm from "../../src/index.js";
// Vue.use(QuickForm);
// Vue.use(QuickForm);
// import QuickForm from "@liuwei2016/el-quick-form";
Vue.use(quickForm, props);

const GlobalTableConfig = {
  // component name,use() 生效
  name: "quick-table",
  // 设置每个表格的配置
  table: {
    border: true,
    "highlight-current-row": true
  },
  // 设置每个表格列的配置
  column: {
    algin: "center",
    "show-overflow-tooltip": true
  },
  // 设置每个表格的分页配置
  page: {
    enable: true,
    height: 45,
    pageSize: 10,
    pageSizes: [10, 20, 30, 40],
    layout: "total, sizes, prev, pager, next, jumper"
  },
  // 设置每个表格的 query props 配置，也可对 value 进行格式化
  queryProps: {
    pageSize: "pageSize",
    currentPage: "pageNumber",
    orderColumn: "orderName",
    order: v => ["order", v == "descending" ? 1 : 0]
  },
  // 只有指定的 key 才会传递到 el-table 组件的 props，如果有额外的 prop 可在这里配置
  attributes: ["style", "class"]
};
// or
// Vue.prototype.$agelTableConfig = config;
Vue.use(quickTable, GlobalTableConfig);
// Vue.use(agelTable, {});
Vue.use(VueHighlightJS);

// // 按需引入单个组件
// import { MyButton } from '../../src/index.js'
// Vue.use(MyButton)

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");

import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/quickTable",
    name: "QuickTable",
    component: () => import("../views/quickTable/")
  },
  {
    path: "/quickTable2",
    name: "QuickTable2",
    component: () => import("../views/quickTable/table2.vue")
  },
  {
    path: "/demo/orderList",
    name: "OrderList",
    component: () => import("../views/demo/orderList")
  },
  {
    path: "/orderQuery",
    name: "OrderQuery",
    component: () => import("../views/demo/orderQuery")
  },
  {
    path: "/orderTable",
    name: "OrderTable",
    component: () => import("../views/demo/orderTable")
  },
  {
    path: "/editColumns",
    name: "editColumns",
    component: () => import("../views/demo/sortable/index.vue")
  },
  {
    path: "/quickForm",
    name: "QuickForm",
    component: () => import("../views/quickForm/")
  },
  {
    path: "/quickForm/tableQuery",
    name: "tableForm",
    component: () => import("../views/quickForm/tableQuery.vue")
  },
  {
    path: "/",
    name: "index",
    component: () => import("../views/quickForm/quickCreate.vue")
  },
  {
    path: "/quickForm/quickCreate",
    name: "quickCreate",
    component: () => import("../views/quickForm/quickCreate.vue")
  },
  {
    path: "/quickForm/quickCreatePreview",
    name: "quickCreatePreview",
    component: () => import("../views/quickForm/quickCreatePreview.vue")
  }
];
const router = new VueRouter({
  routes
});
export default router;

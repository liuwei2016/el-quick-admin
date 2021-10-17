<template>
  <div class="demo">
    <order-query @doQuery="doQuery" @resetQuery="resetQuery"></order-query>
    <order-table :tableQuery="query" ref="orderTable"></order-table>
  </div>
</template>

<script>
import OrderQuery from "./orderQuery.vue";
import OrderTable from "./orderTable.vue";
export default {
  components: {
    OrderQuery,
    OrderTable
  },
  data() {
    return {
      query: {}
    };
  },
  created() {},
  methods: {
    resetQuery(query) {
      console.log(query);
    },
    doQuery(query) {
      this.query = query;
      console.log(query);
      console.log(this.$refs.orderTable);
      this.$refs.orderTable.$refs.quickTable.reLoad();
    }
  }
};
</script>
<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>

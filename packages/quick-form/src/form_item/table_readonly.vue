<template>
  <div
    :style="item.style || {}"
    :class="`quick-form-unqiue-${item.key}`"
    class="form-item-box"
  >
    <el-table
      :data="value"
      border
      style="width: 100%"
      :header-cell-style="headerStyle"
    >
      <el-table-column
        v-for="(tableItem, index) in item.headerList"
        :key="index"
        :prop="tableItem.prop"
        :label="tableItem.label"
        align="center"
      />
    </el-table>
  </div>
</template>

<script>
export default {
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
</script>

<style scoped lang="less">
.form-item-box {
  margin-bottom: 20px;
}
</style>

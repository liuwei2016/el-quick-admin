<template>
  <div
    ref="container"
    v-loading="value.loading"
    class="quick-table"
    :style="{ height: styles.containerHeight }"
  >
    <div class="quickOper">
      快捷操作9
    </div>
    <!-- el-table -->
    <el-table
      ref="table"
      v-bind="attrs"
      :data="data"
      :height="styles.tableHeight"
      v-on="events"
      style="width:100%"
    >
      <!-- append  -->
      <template v-slot:append>
        <slot name="append" />
      </template>

      <!-- empty  -->
      <template v-slot:empty>
        <slot name="empty" />
      </template>

      <!-- columns  -->
      <template v-slot:default>
        {{ renderColumns() }}
        <slot name="columns" />
      </template>
    </el-table>

    <!-- el-pagination -->
    <el-pagination
      v-if="value.page && value.page.enable"
      ref="page"
      v-bind="value.page"
      :style="{ height: styles.pageHeight }"
      v-on="events"
    >
    </el-pagination>
  </div>
</template>

<script>
import basis from "./basic";
import columns from "./columns";
import virtualScroll from "./virtual-scroll";
import merge from "./merge";
import resize from "./resize";

export default {
  name: "quick-table",
  inheritAttrs: false,
  mixins: [basis, columns, virtualScroll, merge, resize],
  props: {
    value: {
      required: true,
      type: Object,
      default: () => new Object()
    },
    attach: {
      type: Object,
      default: () => new Object()
    }
  },
  watch: {
    attach: {
      deep: true,
      immediate: true,
      handler: function() {
        for (let key in this.attach) {
          if (this.attach[key] !== undefined) {
            this.$set(this.value, key, this.attach[key]);
          }
        }
      }
    }
  }
  // install(vue, opts = {}) {
  //   vue.prototype.$quickTableConfig = opts;
  //   vue.component(opts.name || this.name, this);
  // },
};
</script>

<style>
.quick-table {
  width: 100%;
  height: auto;
  overflow: hidden;
}

.quick-table .el-table__empty-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.quick-table .virtual-scroll-checkbox .el-checkbox__inner {
  transition: none;
}

.quick-table .virtual-scroll-checkbox .el-checkbox__inner::after {
  transition: none;
}

.agel-pagination {
  display: flex;
  align-items: center;
  padding: 0px 0px;
  justify-content: flex-end;
}
</style>

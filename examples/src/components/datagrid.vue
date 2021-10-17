<template>
  <div v-loading="isLoading">
    <el-table
      :data="data"
      v-bind="_tableProps"
      v-on="tableListeners"
      @sort-change="sortChange"
      @cell-dblclick="dblhandleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <slot></slot>
    </el-table>
    <el-pagination
      :class="{ notshowLastPage: !showLastPage }"
      v-bind="_paginationProps"
      v-on="_paginationListeners"
    />
  </div>
</template>
<script>
export default {
  props: {
    showLastPage: {
      // 是否显示最后一页分页
      type: Boolean,
      default: true
    },
    /**
     * 透传 el-table 的属性
     */
    tableProps: {
      type: Object
    },
    /**
     * 透传 el-table 的事件
     */
    tableListeners: {
      type: Object
    },

    /**
     * 透传 el-pagination 的属性
     */
    paginationProps: {
      type: Object
    },
    /**
     * 透传 el-pagination 的事件
     */
    paginationListeners: {
      type: Object
    },

    /**
     * 是否初始化加载一次数据
     */
    initLoad: {
      type: Boolean,
      default: true
    },

    /**
     * 表格数据的服务
     */
    service: {
      required: true,
      type: Function
    },
    /**
     * 表格数据的查询参数
     */
    query: {
      type: Object
    },

    /**
     * 是否监听查询参数的变化, 自动重新加载数据
     */
    watchQuery: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      isLoading: false,
      data: [],
      pagination: {
        pageSize: 10,
        pageNumber: 1,
        totalElements: 0
      }
    };
  },
  computed: {
    _tableProps: function() {
      return {
        border: true,
        stripe: true,
        ...this.tableProps
      };
    },

    _paginationProps: function() {
      return {
        layout: "total, sizes, prev, pager, next, jumper",
        "current-page": this.pagination.pageNumber,
        "page-size": this.pagination.pageSize,
        total: this.pagination.totalElements,
        ...this.paginationProps
      };
    },
    _paginationListeners: function() {
      return {
        "size-change": this.onSizeChange,
        "current-change": this.onCurrentChange,
        ...this.paginationListeners
      };
    }
  },
  watch: {
    query: {
      deep: true,
      handler: function() {
        if (this.watchQuery) {
          this.reload();
        }
      }
    }
  },
  created() {
    this.pagination = { ...this.pagination, ...this.paginationProps };
  },
  mounted: function() {
    if (this.initLoad) {
      this.loadData();
    }
  },
  methods: {
    reload: function() {
      this.pagination.pageNumber = 1;
      this.loadData();
    },
    loadData: function(parmas) {
      parmas = parmas || {};
      this.isLoading = true;
      let query = {
        rows: this.pagination.pageSize,
        page: this.pagination.pageNumber,
        ...this.query,
        ...parmas
      };
      this.service(query).then(
        res => {
          let data = res.data.data;
          // const [data] = res;
          console.log(data, 55555);
          if (data) {
            this.data = data.content || data.rows || [];
            data.totalElements = data.totalElements || data.total || 0;
            this.pagination.pageNumber = data.pageNumber || data.page;
            this.pagination.pageSize = data.pageSize || 10;
            this.pagination.totalElements = parseInt(data.totalElements, 10);
            this.$emit("dataUpdated", this.data);
          } else if (res.data && Array.isArray(res.data.rows)) {
            // 非标准输出
            console.log(res.data);
            this.data = res.data.rows;
            this.pagination.pageNumber = res.data.page || 1;
            this.pagination.totalElements =
              parseInt(res.data.total || res.data.totalElements) || 0;
          } else {
            this.data = [];
          }

          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
    },
    onSizeChange: function(pageSize) {
      this.pagination.pageSize = pageSize;
      this.loadData();
    },
    onCurrentChange: function(pageNumber) {
      this.pagination.pageNumber = pageNumber;
      this.loadData();
    },
    sortChange(obj) {
      console.log(obj);
      const { prop, order } = obj;
      console.log(prop, order);
      this.$emit("sort-change", { prop, order });
    },
    handleSelectionChange(rows) {
      this.$emit("selection-change", rows);
    },
    dblhandleCurrentChange(row) {
      this.$emit("dblhandleCurrentChange", row);
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .notshowLastPage .el-pager .number:nth-last-child(1),
::v-deep .notshowLastPage .el-pager .more {
  display: none;
}
</style>

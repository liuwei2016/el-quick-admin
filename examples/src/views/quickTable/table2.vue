<template>
  <div class="demo">
    <h1>演示关联数据</h1>

    <el-button @click="clearSelection">清空选中</el-button>
    <el-button icon="el-icon-search" @click="load">查询</el-button>

    <el-checkbox
      v-for="item in table.columns"
      v-model="item.display"
      :key="item.label"
      >{{ item.label }}</el-checkbox
    >

    <el-quick-table ref="quickTable" v-model="table">
      <template v-slot:oper="props">
        <el-button @click="del(props.row)" type="text" size="mini">
          删除
        </el-button>
        <el-button @click="del(props.row)" type="text" size="mini">
          修改
        </el-button>
        <el-button @click="del(props.row)" type="text" size="mini">
          查看记录
        </el-button>
      </template>
    </el-quick-table>
  </div>
</template>

<script>
import { getTableData } from "../../service/table";
export default {
  data() {
    let data = [];
    return {
      queryString: "",
      table: {
        data,
        page: {
          enable: true,
          //   height: 50,
          //   currentPage: 1,
          //   total: 200,
          pageSize: 10
          //   pageSizes: [10, 20, 30, 40, 50, 100, 200]
        },
        query: { name: "小虎", page: 1 },
        stripe: true,
        height: 700,
        border: true,
        "highlight-current-row": true,
        "default-sort": { prop: "name", order: "ascending" },
        request: (query, reslove, rejcet) => {
          this.queryString = JSON.stringify(query);
          console.log("getTableData", query);
          getTableData("/api/tableList", query)
            .then(res => {
              console.log(res);
              reslove({
                data: res.data.content,
                total: res.data.totalElements,
                currentPage: res.data.pageNumber
              });
            })
            .catch(rejcet);
        },
        columns: [
          {
            type: "selection",
            width: 50,
            align: "center"
          },
          {
            label: "编号",
            type: "index",
            align: "center",
            width: 50,
            display: true,
            index: index => index + 1
          },
          { label: "城市", prop: "cityName", width: 100 },
          { label: "门店名称", prop: "storeName", width: 180 },
          { label: "门店ID", prop: "storeId", width: 80 },
          { label: "门店类型", prop: "storeType", width: 100 },
          { label: "正常下户", prop: "normal", width: 100 },
          { label: "非正常下户", prop: "nonNormal", width: 100 },
          { label: "有效开始时间", prop: "effectBegin", width: 160 },
          {
            label: "操作",
            prop: "oper",
            width: 200,
            slotColumn: "oper"
          }
        ],
        on: {
          "selection-change": rows => {
            console.log(rows);
            this.$message.success("选择项发生变化");
          }
        }
      }
    };
  },
  created() {
    window.$vm = this;
  },
  mounted() {
    // this.table.getData();
  },
  methods: {
    del(row) {
      console.log("删除", row);
    },
    load() {
      this.table.getData();
    },
    clearSelection() {
      this.table.getRef().clearSelection();
    }
  }
};
</script>

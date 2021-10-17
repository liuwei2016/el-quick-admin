<template>
  <div class="demo">
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
      </template>
    </el-quick-table>
  </div>
</template>

<script>
export default {
  data() {
    let data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        date: "2016年05月01 10:20",
        name: "王小虎" + i,
        oper: i,
        indexItem: i + 1,
        sex: i % 2 == 0 ? "男" : "女",
        address: "上海市普陀区金沙江路 1518 弄",
        hasChildren: i == 0
      });
    }
    return {
      queryString: "",
      table: {
        data,
        // border: true, //默认true
        page: {
          enable: true
          //   height: 50,
          //   currentPage: 1,
          //   total: 200,
          //   pageSize: 20,
          //   pageSizes: [10, 20, 30, 40, 50, 100, 200]
        },
        query: { name: "小虎", page: 1 },
        stripe: true,
        height: 700,
        lazy: true,
        "highlight-current-row": true,
        "show-summary": true,
        "sum-text": "合计",
        "row-key": "name",
        "default-sort": { prop: "name", order: "ascending" },
        "tree-props": { children: "children", hasChildren: "hasChildren" },
        "summary-method": () => ["合", "计", "也", "还", "可", "以"],
        "row-class-name": ({ rowIndex }) => {
          return rowIndex == 0 ? "success-row" : "";
        },
        request: (query, reslove, rejcet) => {
          this.queryString = JSON.stringify(query);
          console.log(query);
          this.http(query)
            .then(res => reslove({ data: res.data, total: res.total, page: 1 }))
            .catch(rejcet);
        },
        load: (tree, treeNode, resolve) => {
          setTimeout(() => {
            resolve([
              {
                date: "2016-05-01 10:20",
                name: "王小虎",
                sex: "男",
                address: "上海市普陀区金沙江路 1517 弄"
              }
            ]);
          }, 1000);
        },

        columns: [
          {
            display: true, //默认true
            type: "selection",
            width: 50,
            align: "center",
            fixed: true
          },
          {
            label: "",
            prop: "indexItem",
            display: false
          },
          {
            label: "#",
            type: "index",
            align: "center",
            width: 50,
            display: true,
            index: index => "#" + (index + 1)
          },
          {
            display: true,
            label: "日期",
            prop: "date",
            width: 250,
            formatter: (row, column, cellValue, index) => {
              return cellValue + "__" + index;
            }
            // slotColumn: "date"
            // slotColumn: (h, { row }) => {
            //   return <el-tag>{row.date}</el-tag>;
            // }
          },
          {
            label: "配送信息",
            display: true,
            children: [
              { label: "姓名", prop: "name", width: 180, sortable: true },
              {
                label: "性别",
                prop: "sex",
                width: 80,
                filters: [
                  { text: "男", value: "男" },
                  { text: "女", value: "女" }
                ],
                "filter-method": (value, row) => {
                  return row.sex === value;
                }
              },
              { label: "地址", prop: "address", width: 400 }
            ]
          },
          {
            display: true,
            label: "操作",
            prop: "oper",
            slotColumn: "oper"

            // slotColumn: (h, { row }) => {
            //   return (
            //     <el-button type="text" size="mini">
            //       编辑 {row.indexItem}
            //     </el-button>
            //   );
            // }
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
  methods: {
    del(row) {
      console.log("删除", row);
    },
    load() {
      this.table.page.currentPage = 1;
      //   this.table.getData();
    },
    http(quey) {
      // 模拟一个 http 请求
      return new Promise(reslove => {
        setTimeout(() => {
          let data = [];
          for (let i = 0; i < quey.pageSize; i++) {
            let index = (quey.currentPage - 1) * quey.pageSize + (i + 1);
            data.push({
              indexItem: index,
              date: "2016年05月01 10:20",
              name: "王小虎" + index,
              sex: index % 2 == 0 ? "男" : "女",
              address: "上海市普陀区金沙江路 1518 弄"
            });
          }
          //  reslove(data); 如果没有分页，可直接 reslove 一个 data 数组
          reslove({ data: data, total: 100 });
        }, 1000);
      });
    },
    clearSelection() {
      this.table.getRef().clearSelection();
    }
  }
};
</script>
<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>

a<template>
  <div class="box">
    <el-row class="row">
      <el-col style="margin-bottom:24px;" :span="24">
        <el-button size="mini" class="button" @click="add">添加</el-button>
        <el-button size="mini" class="button" @click="add">添加编号</el-button>
        <el-button size="mini" class="button" @click="add">添加选择</el-button>
        <el-button size="mini" class="button" @click="add"
          >添加自定义</el-button
        >
        <el-button size="mini" type="primary" class="button" @click="add"
          >保存</el-button
        >
      </el-col>
      <el-col :span="24">
        <div class="header-columns">
          <span style="width: 60px;">排序</span>
          <span style="width: 140px;" class="span">表头名称</span>
          <span style="width: 100px;">数据key</span>
          <span style="width:60px;">列宽度</span>
          <span style="width:60px;">删除</span>
        </div>
      </el-col>
      <el-col :span="24">
        <draggable
          @start="dragging = true"
          @end="dragEnd"
          tag="ul"
          :list="list"
          class="list-group"
          handle=".handle"
        >
          <li
            class="list-group-item"
            v-for="(element, idx) in list"
            :key="element.label"
          >
            <el-button
              style="cursor:move"
              circle
              size="mini"
              icon="el-icon-sort"
              class="handle"
            ></el-button>
            <el-input
              size="mini"
              type="text"
              style="width:140px;"
              class="span"
              v-model="element.label"
              placeholder="label"
            />

            <el-input
              size="mini"
              type="text"
              style="width:100px"
              class="span"
              v-model="element.prop"
              placeholder="prop"
            />
            <el-input
              size="mini"
              type="text"
              style="width:60px"
              class="span"
              v-model="element.width"
              placeholder="宽度"
            />
            <el-button
              size="mini"
              icon="el-icon-close"
              class=" close span"
              @click="removeAt(idx)"
              circle
            ></el-button>
          </li>
        </draggable>
      </el-col>
    </el-row>
  </div>
</template>

<script>
let id = 3;
import draggable from "vuedraggable";
export default {
  props: {
    columns: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  name: "handle",
  display: "Handle",
  instruction: "Drag using the handle icon",
  order: 5,
  components: {
    draggable
  },
  data() {
    return {
      list: [
        { label: "合同开始时间", prop: "contractStartDate", width: 120 },
        { label: "John", prop: "", width: 0 },
        { label: "Joao", prop: "", width: 1 },
        { label: "Jean", prop: "", width: 2 }
      ],
      dragging: false
    };
  },
  computed: {
    draggingInfo() {
      return this.dragging ? "under drag" : "";
    }
  },
  watch: {
    list: {
      handler: function(val) {
        // console.log("change");
        // this.list = val;
        this.$emit("update:columns", val);
      },
      deep: true
    }
  },
  created() {
    // if (this.columns) {
    this.list = this.columns;
    // }
  },
  methods: {
    removeAt(idx) {
      this.list.splice(idx, 1);
    },
    add: function() {
      id++;
      this.list.push({ name: "Juan " + id, id, text: "" });
    },
    dragEnd() {
      console.log("drag end");
    }
  }
};
</script>
<style scoped>
ul,
li {
  padding: 0;
  margin: 0;
}
.box {
  padding: 20px;
}

.button {
  margin-top: 35px;
}
.handle {
  cursor: move;
}
.span {
  margin-left: 10px;
}
.header-columns {
  font-weight: bold;
  margin-left: -20px;
  margin-bottom: 10px;
}
.header-columns span {
  display: inline-block;
  font-size: 14px;
  text-align: center;
}
.list-group-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
</style>

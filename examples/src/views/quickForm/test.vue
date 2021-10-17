<template>
  <div>
    <!-- <el-switch v-model="value" active-text="按月" inactive-text="按年">
    </el-switch> -->
    <el-rate v-model="value" :colors="['#99A9BF', '#F7BA2A', '#FF9900']">
    </el-rate>
    <!-- <el-rate v-model="value" show-text> </el-rate> -->
  </div>
</template>

<script>
export default {
  created() {},
  data() {
    return {
      info: "123",
      value: null,
      iconClasses: ["icon-rate-face-1", "icon-rate-face-2", "icon-rate-face-3"]
    };
  },
  methods: {
    getItemValue() {
      console.log(this.value);
      return this.value;
    },
    setItemValue(args) {
      this.value = args.value || args;
      // this.info = "123";
    }
  }
};
</script>

<style></style>

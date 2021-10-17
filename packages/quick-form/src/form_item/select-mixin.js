const superType = data => {
  const type = Object.prototype.toString.call(data).toLowerCase();
  return type.replace(/^\[object\s(\w+)\]$/, (...rest) => {
    return rest[1];
  });
};
export default {
  created() {
    this.getOptionsData();
  },
  methods: {
    getOptionsData(query) {
      if (
        this.item.getOptionsData &&
        superType(this.item.getOptionsData) === "function"
      ) {
        this.item.getOptionsData(query || {}).then(({ data }) => {
          // console.log("this.item.getData", data);
          if (!Array.isArray(data)) {
            return;
          }
          let arr = data;
          /**
           * 如果存在optionsConfig 则对返回的数据进行处理，
           * ! 如果是 label value 结构，可以不用设置
           */
          if (this.item.optionsConfig) {
            arr = data.map(v => {
              if (this.item.optionsConfig.label) {
                v.label = v[this.item.optionsConfig.label];
              }
              if (this.item.optionsConfig.value) {
                v.value = v[this.item.optionsConfig.value];
              }
              return v;
            });
          }
          // console.log("this.item.getData arr", arr);
          /**
           * ! 投机取巧
           * ! 不能直接更改props  this.item ,但是能更改 this.items.options
           */
          this.item.options = arr;
        });
      }
    }
  }
};

import ElQuickTable from './src/quick-table.vue'

ElQuickTable.install = (Vue, installOptions = {}) => {
  Vue.prototype.$quickTableConfig = installOptions;
  Vue.component(ElQuickTable.name, ElQuickTable)
}

export default ElQuickTable

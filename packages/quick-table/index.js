import ElQuickTable from './src/quick-table.vue'

ElQuickTable.install = Vue => {
  Vue.component(ElQuickTable.name, ElQuickTable)
}

export default ElQuickTable
